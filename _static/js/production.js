var jsPsychProduction = (function (jspsych) {
  "use strict";

  const info = {
    name: "production",
    parameters: {
      // The HTML string to be displayed.
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Stimulus",
        default: undefined,
      },
      // Array containing keyboard keys.
      keys: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Keyboard keys",
        default: undefined,
        array: true,
      },
      // If set to true, then shuffle the keyboard keys.
      shuffle: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Shuffle the keyboard keys",
        default: false,
      },
      // Optional prompt to appear before/after the cursor.
      prompt: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Optional prompt",
        default: "",
      },
      // Whether the prompt should appear before (false -> after) the
      // production.
      prompt_before: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Prompt location",
        default: true,
      },
      // The correct response(s).
      answer: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Correct answer(s)",
        default: null,
        array: true,
      },
      // Required answer length if no answers are given.
      answer_length: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Answer length",
        default: 0,
      },
      // The minimum number of characters the participant is required to enter
      // before advancing if neither `force_correct_production` or 
      // `include_counter` are specified
      min_char: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Minimum characters",
        default: 0,
      },
      // If set to true, then the participant will be shown the correct answer
      // giving a response.
      show_feedback: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Show feedback",
        default: false,
      },
      // Show only the first correct answer during feedback.
      first_answer_only: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Show feedback",
        default: false,
      },
      // If set to true, then the participant must click the correct
      // response button after feedback in order to advance to next trial.
      force_correct_production: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Force correct production",
        default: false,
      },
      // Whether to mark the response as correct, regardless of the response.
      mark_correct: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Mark correct",
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
      // If set to true, the keyboard will include a spacebar.
      include_spacebar: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Include spacebar",
        default: true,
      },
      // If set to true, the trial will include a character counter to
      // indicate to the participants how many characters they need to type.
      include_counter: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Include character counter",
        default: false,
      },
      // If set to true, the trial will provide "blanks" to indicate how many
      // characters the participant needs to type. Overrides `include_counter`.
      fill_in_the_blanks: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Fill-in-the-blanks style.",
        default: false,
      },
      // TODO: encode_red() as callback.
    },
  };

  class ProductionPlugin {
    constructor(jsPsych) {
      jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // format single answers
      if (typeof trial.answer == "string") {
        trial.answer = [trial.answer, ];
      }
      // calculate answer and prompt lengths
      var prompt_length = trial.prompt.length;
      var answer_length = trial.answer_length || trial.answer[0].length;
      // create production blanks
      var blank = `<span class="jspsych-production-blank"></span>`;
      // display trial
      display_element.innerHTML = compose_display();
      // extract useful elements
      var prompt = display_element.querySelector("#jspsych-production-prompt");
      var line = display_element.querySelector("#jspsych-production-line");
      var blanks = display_element.querySelector("#jspsych-production-blanks");
      var keyboard = display_element.querySelector("#jspsych-production-keyboard");
      var keys = keyboard.querySelectorAll(".jspsych-production-key");
      var space = keyboard.querySelector("#jspsych-production-space-key");
      var backspace = keyboard.querySelector("#jspsych-production-backspace-key");
      var submit = display_element.querySelector("#jspsych-production-submit");
      var answer = display_element.querySelector("#jspsych-production-answer");
      var count = display_element.querySelector("#jspsych-production-count");
      // gather the data to store for the trial
      var trial_data = {
          rt: null,
          correct: null,
          stimulus: null,
          response: null,
          answer: null,
          keys: null,
      };
      // start time
      var start_time = performance.now();
      // add event listeners to the keys
      keys.forEach(
        div => div.addEventListener("click", typewriter)
      );
      // add delete, enter, & space keybindings
      document.addEventListener("keydown", bind_keys);
      // add event listener to the submit button
      display_element.querySelector("#jspsych-production-submit").addEventListener("click", process_response);
      // function to compose `display_element` HTML
      function compose_display() {
        // add stimulus
        var trial_html = `<div id="jspsych-production-stimulus">` + trial.stimulus + `</div>`;
        // add feedback div (even if it isn't used)
        trial_html += `<div id="jspsych-production-answer" class="iconic"></div>`;
        // create production line
        var production_line;
        if (trial.fill_in_the_blanks) {
          // fill-in-the-blanks
          production_line =
            `<span id="jspsych-production-line" class="iconic"></span>` +
            `<span id="jspsych-production-blanks">${blank.repeat(answer_length)}</span>`;
        } else {
          // production line with cursor
          production_line = `<span id="jspsych-production-line" class="iconic blink-caret"></span>`;
        }
        // add production container
        trial_html += `<div id="jspsych-production-line-container">`;
        if (trial.prompt) {
          if (trial.prompt_before) {
            trial_html += `<span id="jspsych-production-prompt" class="iconic jspsych-production-prompt-before">${trial.prompt}</span>${production_line}`;
          } else {
            trial_html += `${production_line}<span id="jspsych-production-prompt" class="iconic jspsych-production-prompt-after">${trial.prompt}</span>`;
          }
        } else {
          trial_html += production_line;
        }
        trial_html += `</div>`;
        // add keyboard
        var keyboard_html = ``;
        if (trial.shuffle) {
          trial.keys = jspsych.randomization.shuffle(keys);
        }
        for (var i = 0; i < trial.keys.length; i++) {
          var key = trial.keys[i];
          keyboard_html += `<button class="jspsych-production-key jspsych-production-key-input" data-key="${key}">${encode_red(key)}</button>`;
        }
        if (trial.include_spacebar) {
          trial_html += `
            <div id="jspsych-production-keyboard" class="jspsych-production-keyboard-glow">
              <div id="jspsych-production-keyboard-top" class="iconic">
                ${keyboard_html}
              </div>
              <div id="jspsych-production-keyboard-bottom">
                <button class="jspsych-production-key jspsych-production-key-input" id="jspsych-production-space-key" data-key="&nbsp;">
                  <span class="function">s</span>
                </button>
                <button class="jspsych-production-key" id="jspsych-production-backspace-key" data-key="_delete">
                  <span class="function">b</span>
                </button>
              </div>
            </div>`;
        } else {
          trial_html += `
            <div id="jspsych-production-keyboard" class="iconic jspsych-production-keyboard-glow">
              <div id="jspsych-production-keyboard-top" class="iconic">
                ${keyboard_html}
                <button class="jspsych-production-key" id="jspsych-production-backspace-key" data-key="_delete">
                  <span class="function">b</span>
                </button>
              </div>
            </div>`;
        }
        // add submit button
        if (trial.include_counter || trial.fill_in_the_blanks || trial.min_char) {
          trial_html += `
            <button id="jspsych-production-submit" disabled>
              <span class="function">c</span>
            </button>`;
        } else {
          trial_html += `
            <button id="jspsych-production-submit">
              <span class="function">c</span>
            </button>`;
        }
        // add character counter
        if (trial.include_counter && answer_length) {
          trial_html += `
            <div id="jspsych-production-counter">
              <span id="jspsych-production-count">${prompt_length}</span>/${prompt_length + answer_length}
            </div>`;
        } else {
          trial.include_counter = false;
        }
        return trial_html;
      }
      // function to type response (pre-submit)
      function typewriter(event, key = null) {
        // get character if none was passed in
        if (key === null) {
          key = event.currentTarget.getAttribute("data-key");
        }
        // get current production line
        var text = line.textContent.replace(/\s+/g, " ").trim();
        // update & encode production line
        if (key === "_delete") {
          // delete most recently pressed key
          text = text.slice(0, -1);
        } else {
          // add the most recently pressed key
          text += key;
        }
        // if fill-in-the blanks...
        if (trial.fill_in_the_blanks) {
          // tally missing characters
          var chars_left = Math.max(answer_length - text.length, 0);
          // update blanks (if necessary)
          blanks.innerHTML = blank.repeat(chars_left);
          if (chars_left) {
            // enable input keys
            display_element.querySelectorAll(".jspsych-production-key-input")
              .forEach(btn => btn.disabled = false);
          } else {
            // lop off any additional characters (unlikely)
            text = text.slice(0, answer_length);
            // disable input keys
            display_element.querySelectorAll(".jspsych-production-key-input")
              .forEach(btn => btn.disabled = true);
          }
        //   blanks.innerHTML = blank.repeat(Math.max(answer_length - text.length, 0));
        // update the character counter (if necessary)
        } else if (trial.include_counter) {
          count.innerHTML = prompt_length + text.length;
        }
        // encode & display text
        line.innerHTML = encode_red(text);
        // if `trial.include_counter` or `trial.fill_in_the_blanks` is true, 
        // only enable the submit button if the correct number of characters 
        // has been entered
        if (trial.include_counter || trial.fill_in_the_blanks) {
          if (text.length == answer_length) {
            // enable submit
            submit.disabled = false;
          } else {
            // disable submit
            submit.disabled = true;
          }
        // otherwise, if both are false, enable the submit button if the 
        // minimum input has been entered
        } else if (text.length >= trial.min_char) {
          // enable submit
          submit.disabled = false;
        } else {
          // disable submit
          submit.disabled = true;
        }
        // remove keyboard glow once the participant begins to use the keyboard
        // & remove blinking caret if any input has been entered
        if (text.length > 0) {
          keyboard.classList.remove("jspsych-production-keyboard-glow");
          line.classList.remove("blink-caret");
        } else if (!trial.fill_in_the_blanks) {
          line.classList.add("blink-caret");
        }
      }
      // function to bind delete, enter, & space keys
      function bind_keys(event) {
        // backspace
        if (event.keyCode == 8 || (event.keyCode == 90 && (event.ctrlKey || event.metaKey))) {
          event.preventDefault();
          backspace.click();
        // enter
        } else if (event.keyCode == 13) {
          event.preventDefault();
        // space bar
        } else if (event.keyCode == 32) {
          event.preventDefault();
          if (trial.include_spacebar) {
            space.click();
          }
        } 
      }
      // function to process the response
      function process_response() {
        // measure response time
        var rt = Math.round(performance.now() - start_time);
        // extract participant's production & remove extraneous whitespace
        var response = line.textContent.replace(/\s+/g, " ").trim();
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
        // indicate whether the response is correct
        var correct;
        if (trial.answer) {
          correct = trial.answer.includes(response);
        }
        // save the initial trial data (collected before feedback & correction)
        if (trial_data.response === null) {
          trial_data = {
            rt: rt,
            correct: correct,
            stimulus: trial.stimulus,
            response: response,
            answer: trial.answer.join(" ~ "),
            keys: trial.keys.join(""),
          };
        }
        // display feedback; otherwise, end trial
        if (trial.answer && (trial.show_feedback || trial.force_correct_production || trial.mark_correct)) {
          display_feedback(response, correct);
        } else {
          end_trial();
        }
      }
      // function to handle feedback to the participant
      function display_feedback(response, correct, timeout = false) {
        // provide feedback
        if (correct || trial.mark_correct) {
          // add correct answer styling
          line.classList.add("jspsych-production-correct");
          try {
            prompt.classList.add("jspsych-production-correct");
          } catch (e) {}
          // hide answer
          try {
            answer.innerHTML = "";
          } catch (e) {}
        } else {
          // display correct answer
          if (trial.show_feedback) {
            var incorrect_answer;
            var display_answer;
            // prompt-initial
            if (trial.prompt_before) {
              incorrect_answer = trial.prompt + encode_red(response);
              if (trial.first_answer_only) {
                // show first answer only
                display_answer = encode_red(trial.prompt + trial.answer[0]);
              } else {
                // show all possible answers
                display_answer = encode_red(trial.prompt + trial.answer.join(`_` + trial.prompt));
                display_answer = display_answer.replace("_", `<span class="function">r</span>`);
              }
            // prompt-final
            } else {
              incorrect_answer = encode_red(response) + trial.prompt;
              if (trial.first_answer_only) {
                // show first answer only
                display_answer = encode_red(trial.answer[0] + trial.prompt);
              } else {
                // show all possible answers
                display_answer = encode_red(trial.answer.join(trial.prompt + `_`) + trial.prompt);
                display_answer = display_answer.replace("_", `<span class="function">r</span>`);
              }
            }
            answer.innerHTML =
              `<span id="jspsych-production-incorrect">${incorrect_answer}</span>` +
              `<span id="jspsych-production-correct-container">` +
                `<span class="function">a</span>` +
                `<span id="jspsych-production-correct">${display_answer}</span>` +
              `</span>`;
          }
          // clear the production line, re-add the blinking caret or blanks,
          // re-enable keyboard, & reset the character counter
          if (trial.force_correct_production) {
            line.innerHTML = "";
            if (trial.fill_in_the_blanks) {
              blanks.innerHTML = blank.repeat(answer_length);
              display_element.querySelectorAll(".jspsych-production-key-input")
                .forEach(btn => btn.disabled = false);
            } else {
              line.classList.add("blink-caret");
            }
            if (trial.include_counter) {
              count.innerHTML = prompt_length;
            }
          }
          // disable submit
          submit.disabled = true;
        }
        // disable all trial buttons (keyboard & submit) if the answer is
        // correct, if the trial has timed out, or if the participant isn't
        // forced to correct their production
        if (correct || timeout || !trial.force_correct_production) {
          display_element.querySelectorAll("button").forEach(
            btn => btn.disabled = true
          );
        }
        // linger on correct answer before ending the trial
        if (trial.linger_duration != null && (correct || timeout || !trial.force_correct_production)) {
          jsPsych.pluginAPI.setTimeout(end_trial, trial.linger_duration);
        }
      }
      // function to end trial when it is time
      function end_trial() {
        // remove keybindings
        document.removeEventListener("keydown", bind_keys);
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
  ProductionPlugin.info = info;

  return ProductionPlugin;

})(jsPsychModule);
