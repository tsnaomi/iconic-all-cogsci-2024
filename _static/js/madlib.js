var jsPsychMadlib = (function (jspsych) {
  "use strict";

  const info = {
    name: "madlib",
    parameters: {
      // The HTML string for the image stimulus.
      img_stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Image stimulus",
        default: undefined,
      },
      // The caption to be displayed under the image stimulus. Use the
      // "%blank%" string to indicate where the blank line should be
      // inserted.
      caption_stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Caption stimulus",
        default: "%blank%",
      },
      // Array containing the label(s) for the button(s).
      choices: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Choices",
        default: undefined,
        array: true,
      },
      // Array containing the value(s) for the button(s), if they should differ
      // from the labels passed to `choices`.
      data_choices: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Data choices",
        default: null,
        array: true,
      },
      // If set to true, then shuffle the choices (and the data choices,
      // if provided).
      shuffle: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Shuffle the choices",
        default: true,
      },
      // The correct response.
      answer: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Correct answer",
        default: undefined,
      },
      // The HTML for creating button. Can create own style. Use the
      // "%choice%" string to indicate where the label from the choices 
      // parameter should be inserted.
      button_html: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Button HTML",
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
      },
      // If set to true, then the subject must click the correct 
      // response button after feedback in order to advance to next trial.
      force_correct_button_press: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Force correct button press",
        default: false,
      },
      // How long to show the trial.
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      // How long to linger on the correct answer if feedback if shown;
      // this is in addition to any set in addition to trial duration.
      linger_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Linger duration",
        default: null,
      },
    },
  };

  class MadlibPlugin {
    constructor(jsPsych) {
      jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // display trial
      display_element.innerHTML = compose_display();
      // extract useful elements
      var btns = display_element.querySelectorAll(".jspsych-madlib-btn");
      var answer = display_element.querySelector(`[data-choice='${trial.answer}']`);
      var blank = display_element.querySelector("#jspsych-madlib-blank");
      // gather the data to store for the trial
      var trial_data = {
        rt: null,
        correct: null,
        stimulus: null,
        response: null,
        answer: null,
      };
      // start time
      var start_time = performance.now();
      // add event listeners to buttons
      btns.forEach(
        div => div.addEventListener("click", process_response)
      );
      // function to compose `display_element` HTML
      function compose_display() {
        // add and modify stimulus
        var trial_html = `
          <div id='jspsych-madlib-stimulus'>
            ${trial.img_stimulus}
            <div id="jspsych-madlib-caption" class="iconic">
              <span class="jspsych-madlib-prompt">
                ${trial.caption_stimulus}
              </span>
            </div>
          </div>`;
        trial_html =  trial_html.replace("%blank%", `</span><span id="jspsych-madlib-blank"></span><span class="jspsych-madlib-prompt">`);
        // add buttons
        trial_html += `<div id="jspsych-madlib-btngroup">`;
        if (trial.shuffle) {
          if (trial.data_choices) {
            [trial.choices, trial.data_choices] = shuffle_together(trial.choices, trial.data_choices);
          } else {
            trial.choices = jsPsych.randomization.shuffle(trial.choices);
            trial.data_choices = trial.choices;
          }
        } else if (!trial.data_choices) {
          trial.data_choices = trial.choices;
        }
        for (var i = 0; i < trial.choices.length; i++) {
          trial_html += 
            `<div class="jspsych-madlib-btn jspsych-madlib-glow" data-choice="${trial.data_choices[i]}">
              ${trial.button_html.replace(/%choice%/g, trial.choices[i])}
           </div>`;
        }
        trial_html += `</div>`;
        return trial_html;
      }
      // function to process the response
      function process_response(event) {
        // measure response time
        var rt = Math.round(performance.now() - start_time);
        // extract participant's selected button
        var choice = event.currentTarget;
        // get response
        var response = choice.getAttribute("data-choice");
        // remove glow on buttons
        btns.forEach(
          div => div.classList.remove(
            "jspsych-madlib-glow",
            "jspsych-madlib-incorrect",
            "jspsych-madlib-answer",
          )
        );
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
        // indicate whether the response is correct
        var correct = false;
        if (jsPsych.pluginAPI.compareKeys(trial.answer, response)) {
          correct = true;
        }
        // save the initial trial data (collected before feedback & correction)
        if (trial_data.response === null) {
          trial_data = {
            rt: rt,
            correct: correct,
            stimulus: trial.stimulus,
            response: response,
            answer: trial.answer,
          };
        }
        // trigger feedback
        display_feedback(choice, response, correct);
      }
      // function to handle feedback to the subject
      function display_feedback(choice, response, correct, timeout = false) {
        // disable all but the correct button (unless correct)
        btns.forEach(
          div => {
            if (correct || div.getAttribute("data-choice") != trial.answer) {
              div.querySelector("button").disabled = true;
            }
          }
        );
        // provide feedback
        if (correct) {
          // populate blank line with correct answer & add correct answer styling
          fill_blank(choice);
        } else {
          // add incorrect answer styling
          choice.classList.add("jspsych-madlib-incorrect");
          // prompt subject to pick correct response (if specified)
          if (trial.force_correct_button_press && !timeout) {
            // add pick-me animation
            answer.classList.add("jspsych-madlib-answer");
            // add event listener to the correct button (only)
            answer.addEventListener("click", process_response);
          } else {
            // populate blank line with correct answer & add correct answer styling
            fill_blank(answer);
          }
        }
        // linger on correct answer before ending the trial
        if (trial.linger_duration !== null && (correct || timeout || !trial.force_correct_button_press)) {
          jsPsych.pluginAPI.setTimeout(end_trial, trial.linger_duration);
        }
      }
      // function to fill in the blank with the correct answer
      function fill_blank(div) {
        var btn = div.querySelector("button");
        blank.innerHTML = btn.innerHTML;
        blank.classList.add("jspsych-madlib-correct");
        btn.classList.add("jspsych-madlib-hide");
        btn.style.cursor = "default";
      }
      // function to end trial when it is time
      function end_trial() {
        // clear the display
        display_element.innerHTML = "";
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      }       
      // end trial if a time limit is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(() => {
          display_feedback('', false, true);
        }, trial.trial_duration);
      }
    }
  }
  MadlibPlugin.info = info;

  return MadlibPlugin;

})(jsPsychModule);
