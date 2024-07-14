var ex = (function() {

  // store non-task jsPsych experiment trials
  var EXPERIMENT = {};

  function generate() {

    // silent score
    EXPERIMENT.silent_score = function(block, n_attr) {
      return {
        type: jsPsychCallFunction,
        func: function() {},
        on_finish: function(data = {}) {
          score_items(block, n_attr, data);
        },
      };
    };

    // handoff (cue participant with a tree to return the iPad)
    EXPERIMENT.handoff = {
      type: jsPsychHtmlButtonResponse,
      stimulus: "",
      choices: [`<img src="../_static/images/tree.svg" />`, ],
      button_html: '<button id="tree">%choice%</button>',
    };

    // display completion page (incl. participant ID, condition, & download button)
    EXPERIMENT.complete = function(ex, id, cond) {
      return {
        type: jsPsychHtmlButtonResponse,
        stimulus: `
          <div id="participant">
            ${id}
            <span class="cond">~ ${cond}</span>
          </div>`,
        choices: [],
        on_start: function(trial) {
          var results = jsPsych.data.get().json();
          var file = new File([results, ], `${ex}-${id}.json`, {type: 'application/json', });
          trial.stimulus += `
            <div id="download-results">
              <a download=${file.name} href=${URL.createObjectURL(file)}>
                <span class="function">d</span>
              </a>
            </div>`;
        }
      };
    };

    // return non-task trials
    return EXPERIMENT;
  }

  // return core generate function
  return generate;
})();
