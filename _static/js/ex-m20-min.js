var m20 = (function() {

  // store jsPsych experiment blocks
  var EXPERIMENT = {
    demo: [],
    block1: {},
    block2: {},
    block3: {},
    block4: {},
  };

  // ==========================================================================
  // Define internal helper variables; the capitalized ones get updated
  // ==========================================================================

  // noun-initial or noun-final
  var CONDITION;

  // store trial data associated with each block
  var DATA = {
    demo: [],
    block1: [],
    block2: [],
    block3: [],
    block4: [],
  };

  // store one- & two-modifier NPs + their keyboards
  var TRIALS = [];

  // whether or not the first key order is scope-isomorphic
  var FIRST_ORDER = "";

  // set global linger duration
  var linger = 900; // used in field!
  linger = 600; // speed up for CogSci demo!

  // lexical information
  var nouns = ["ball", "feather", "mug"];
  var noun_icons = ["B", "F", "M"];

  var foils = {b: "r", r: "b", "2": "3", "3": "2"};

  var lookup = {
    // icon2word
    B: "ball", F: "feather", M: "mug",
    b: "black", r: "red", "2": "two", "3": "three",
    // word2icon
    ball: "B", feather: "F", mug: "M",
    black: "b", red: "r", two: "2", three: "3",
  };

  var icon2pos = {
    "2": "num", "3": "num", b: "adj", r: "adj",
  };

  // ==========================================================================
  // Define internal helper functions to generate trials
  // ==========================================================================

  // funciton to generate trials
  function get_trials() {
    var nicons = jsPsych.randomization.shuffle(noun_icons);
    var [N1, N2, N3] = nicons;
    var [a1, a2] = jsPsych.randomization.shuffle(['r', 'b']);
    var [n1, n2] = jsPsych.randomization.shuffle(['2', '3']);
    var an;
    var na;

    // modifier training
    var one_mods = [
      [N1, a1],
      // [N2, a1],
      [N3, a1],
      [N1, a2],
      [N2, a2],
      // [N3, a2],
      // [N1, n1],
      [N2, n1],
      [N3, n1],
      [N1, n2],
      // [N2, n2],
      [N3, n2],
    ];

    TRIALS.push(...one_mods);

    // one-modifier productions (NP & keys)
    one_mods = [
      [[N2, a1], [N2, a1, a2]],
      [[N1, n1], [N1, n1, n2]],
      [[N3, a2], [a2, a1, N3]],
      [[N2, n2], [n1, n2, N2]],
    ];

    // shuffle trials
    one_mods = jsPsych.randomization.shuffle(one_mods);

    // add to global trials
    TRIALS.push(...one_mods);

    // scope-isomorphism of critical keyboards
    if (CONDITION == "noun-initial") {
      an = "iso";
      na = "non_iso";
    } else { // noun-final
      an = "non_iso";
      na = "iso";
    }

    // two-modifier productions (NP, keys, & key order)
    var two_mods = [
      [[N1, [a1, n1]], [a1, a2, n1, n2], an],
      [[N1, [a1, n2]], [n1, n2, a1, a2], na],
      [[N1, [a2, n1]], [a2, a1, n1, n2], an],
      [[N1, [a2, n2]], [n2, n1, a2, a1], na],
      [[N2, [a1, n1]], [n1, n2, a1, a2], na],
      [[N2, [a1, n2]], [a1, a2, n2, n1], an],
      [[N2, [a2, n2]], [n2, n1, a1, a2], na],
      [[N2, [a2, n2]], [a2, a1, n2, n1], an],
      [[N3, [a1, n1]], [a2, a1, n1, n2], an],
      [[N3, [a1, n2]], [n1, n2, a2, a1], na],
      [[N3, [a2, n2]], [a1, a2, n2, n1], an],
      [[N3, [a2, n2]], [n2, n1, a2, a1], na],
    ];


    // bin the trials by whether or not their keyboards are scope-isomorphic
    var binned = {iso: [], non_iso: []};

    two_mods.forEach(trial => {
      if (trial[2] == "iso") {
        binned.iso.push(trial);
      } else {
        binned.non_iso.push(trial);
      }
    });

    // shuffle the trials within each bin
    binned.iso = jsPsych.randomization.shuffle(binned.iso);
    binned.non_iso = jsPsych.randomization.shuffle(binned.non_iso);

    // determine whether the first keyboard will be scope-isomorphic
    if (jsPsych.randomization.shuffle([true, false])[0]) {
      FIRST_ORDER = "iso";
    } else {
      FIRST_ORDER = "non_iso";
    }

    // curate a semi-randomized list of trials that alternates between
    // scope-isomorphic & non-isomorphic keyboards
    two_mods = [];
    var curr_order_iso = FIRST_ORDER == "iso";

    for (let i = 0; i < 12; i++) {
      if (curr_order_iso) {
        two_mods.push(binned.iso.pop());
      } else {
        two_mods.push(binned.non_iso.pop());
      }
      curr_order_iso = !curr_order_iso;
    }

    // add to global trials
    TRIALS.push(...two_mods);

    // reverse trial order for popping
    TRIALS.reverse();
  }

  // ==========================================================================
  // Define internal helper functions to format simuli
  // ==========================================================================

  // function to linearize NPs according to the condition
  var linearize;

  // function to reverse pronominal NP orders
  function noun_final(arr) {
    return [...arr].reverse().join("");
  }

  // function to preserve noun-initial NP orders
  function noun_initial(arr) {
    return arr.join("");
  }

  // function to map icons to filename
  function icons2fn(arr) {
    return arr.slice().reverse().map(i => lookup[i]).join("-");
  }

  // function to generate image stimulus
  function stim_img(str) {
    return `<img src="../_static/stimuli/${str}.png" />`;
  }

  // function to generate span stimulus
  function stim_span(str) {
    return `<span class="iconic">${encode_red(str)}</span>`;
  }

  // function to generate text stimulus
  function stim_txt(str) {
    return encode_red(str);
  }

  // function to generate madlib caption stimulus
  function stim_madlib_caption(arr) {
    // noun-initial
    if (CONDITION == "noun-initial") {
      return `${arr[0]} %blank%`;
    }

    // noun-final
    return `%blank% ${arr[0]}`;
  }

  // ==========================================================================
  // Define functions to generate each experiment block
  // ==========================================================================

  // 4 trials
  function demo() {

    // DEMO -------------------------------------------------------------------
    // Demo & practice:
    // Exposure to task types via 4 trials: 1 icon-selection trial, 1 picture-
    // selection trial, 1 madlib trial, & 1 produciton trial.
    // ------------------------------------------------------------------------

    // icon selection (mug)
    DATA.demo.push({
      type: jsPsychSelection,
      stimulus: stim_img("mug"),
      choices: noun_icons,
      answer: "M",
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      noun: "mug",
      subtype: "icon selection",
      css_classes: ["icon-selection", "demo"],
    });

    // picture selection (ball)
    DATA.demo.push({
      type: jsPsychSelection,
      stimulus: stim_span("B"),
      choices: nouns.map(c => stim_img(c)),
      data_choices: nouns.map(c => lookup[c]),
      answer: "B",
      button_html: null,
      noun: "ball",
      subtype: "picture selection",
      css_classes: ["picture-selection", "demo"],
    });

    // madlib (feather)
    DATA.demo.push({
      type: jsPsychMadlib,
      img_stimulus: stim_img("feather"),
      choices: noun_icons.map(stim_txt),
      data_choices: noun_icons,
      answer: "F",
      button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
      noun: "feather",
      css_classes: ["demo", ],
    });

    // production (ball)
    DATA.demo.push({
      type: jsPsychProduction,
      stimulus: stim_img("ball"),
      keys: jsPsych.randomization.shuffle(noun_icons),
      answer: "B",
      noun: "ball",
      css_classes: ["demo", "jspsych-production"],
    });

    // create demo trials
    var demo_trials = {
      type: jsPsych.timelineVariable("type"),
      stimulus: jsPsych.timelineVariable("stimulus"),
      img_stimulus: jsPsych.timelineVariable("img_stimulus"),
      caption_stimulus: jsPsych.timelineVariable("caption_stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      keys: jsPsych.timelineVariable("keys"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: jsPsych.timelineVariable("button_html"),
      show_feedback: true,
      force_correct_button_press: true,
      force_correct_production: true,
      prompt_before: false,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      css_classes: jsPsych.timelineVariable("css_classes"),
      data: {
        block: 0,
        n_mod: 0,
        group: null,
        noun: jsPsych.timelineVariable("noun"),
        subtype: jsPsych.timelineVariable("subtype"),
      },
    };

    // create demo block
    EXPERIMENT.demo = {
      timeline: [demo_trials, ],
      timeline_variables: DATA.demo,
      randomize_order: false,
    };
  }

  // 3 trials
  function block1() {

    // BLOCK 1 ----------------------------------------------------------------
    // Noun learning:
    // Exposure to nouns through 3 icon-selection trials. Each noun appears
    // once.
    // ------------------------------------------------------------------------

    var nicons = jsPsych.randomization.shuffle(noun_icons);
    var noun, nicon;

    for (let i = 0; i < nicons.length; i++) {
      nicon = nicons[i];
      noun = lookup[nicon];

      // icon selection
      DATA.block1.push({
        stimulus: stim_img(noun),
        choices: noun_icons,
        answer: nicon,
        button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
        noun: noun,
        subtype: "icon selection",
      });
    }

    // create block 1 trials
    var block1_trials = {
      type: jsPsychSelection,
      stimulus: jsPsych.timelineVariable("stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: jsPsych.timelineVariable("button_html"),
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: ["icon-selection", ],
      data: {
        block: 1,
        n_mod: 0,
        group: null,
        noun: jsPsych.timelineVariable("noun"),
        subtype: jsPsych.timelineVariable("subtype"),
      },
    };

    // create block 1
    EXPERIMENT.block1 = {
      timeline: [block1_trials, ],
      timeline_variables: DATA.block1,
      randomize_order: true,
    };
  }

  // 8 trials
  function block2() {

    // BLOCK 2 ----------------------------------------------------------------
    // Modifier learning:
    // Exposure to modifiers through 4 picture-selection trials & 4 madlib
    // trials, totaling 8 trials. Each modifier appears twice (once per trial
    // type). Two nouns appear three times and one noun twice.
    // ------------------------------------------------------------------------

    var icons;
    var nicon;
    var micon;
    var choices;

    for (let i = 0; i < 4; i++) {
      // picture selection
      icons = TRIALS.pop();
      [nicon, micon] = icons;
      choices = [icons, [nicon, foils[micon]]];
      DATA.block2.push({
        type: jsPsychSelection,
        stimulus: stim_span(linearize(icons)),
        choices: choices.map(c => stim_img(icons2fn(c))),
        data_choices: choices.map(c => c[1]),
        answer: micon,
        button_html: null,
        group: icon2pos[micon],
        noun: lookup[nicon],
        subtype: "picture selection",
        css_classes: ["picture-selection", ],
      });

      // madlib
      icons = TRIALS.pop();
      [nicon, micon] = icons;
      choices = [micon, foils[micon]];
      DATA.block2.push({
        type: jsPsychMadlib,
        img_stimulus: stim_img(icons2fn(icons)),
        caption_stimulus: stim_madlib_caption(icons),
        choices: choices.map(stim_txt),
        data_choices: choices,
        answer: micon,
        button_html: `<button class="jspsych-btn iconic">%choice%</button>`,
        group: icon2pos[micon],
        noun: lookup[nicon],
      });
    }

    // create block 2 trials
    var block2_trials = {
      type: jsPsych.timelineVariable("type"),
      stimulus: jsPsych.timelineVariable("stimulus"),
      img_stimulus: jsPsych.timelineVariable("img_stimulus"),
      caption_stimulus: jsPsych.timelineVariable("caption_stimulus"),
      choices: jsPsych.timelineVariable("choices"),
      data_choices: jsPsych.timelineVariable("data_choices"),
      answer: jsPsych.timelineVariable("answer"),
      button_html: jsPsych.timelineVariable("button_html"),
      force_correct_button_press: true,
      linger_duration: linger,
      css_classes: jsPsych.timelineVariable("css_classes"),
      data: {
        block: 2,
        n_mod: 1,
        group: jsPsych.timelineVariable("group"),
        noun: jsPsych.timelineVariable("noun"),
        subtype: jsPsych.timelineVariable("subtype"),
      },
    };

    // create block 2
    EXPERIMENT.block2 = {
      timeline: [block2_trials, ],
      timeline_variables: DATA.block2,
      randomize_order: true,
    };
  }

  // 4 trials
  function block3() {

    // BLOCK 3 ----------------------------------------------------------------
    // One-modifier NP practice:
    // Practice with the production task format via 4 non-critical one-modifier
    // NPs. Each modifier is questioned once. Two nouns appear once and one
    // noun twice. (The one noun that appears twice is the noun that only
    // appeared twice in the previous block.)
    // ------------------------------------------------------------------------

    var icons;
    var nicon, micon;
    var keys, key_order;

    // production (non-critical one-modifier NPs)
    for (let i = 0; i < 4; i++) {
      [icons, keys] = TRIALS.pop();
      [nicon, micon] = icons;
      DATA.block3.push({
        stimulus: stim_img(icons2fn(icons)),
        keys: keys,
        key_order: key_order,
        answer: linearize(icons),
        group: icon2pos[micon],
        noun: lookup[nicon],
      });
    }

    // create block 3 trials
    var block3_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: true,
      force_correct_production: true,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      css_classes: ["jspsych-production", ],
      data: {
        block: 3,
        n_mod: 1,
        group: jsPsych.timelineVariable("group"),
        noun: jsPsych.timelineVariable("noun"),
        key_order: jsPsych.timelineVariable("key_order"),
      },
    };

    // create block 3
    EXPERIMENT.block3 = {
      timeline: [block3_trials, ],
      timeline_variables: DATA.block3,
      randomize_order: false, // pre-shuffled
    };
  }

  // 12 trials
  function block4() {

    // BLOCK 4 ----------------------------------------------------------------
    // Two-modifier NP productions:
    // Twelve critical two-modifier NP production trials. Each two-modifier NP
    // is seen exactly once (3 nouns x 4 modifier-pairs = 12).
    // ------------------------------------------------------------------------

    var icons;
    var nicon, micons;
    var keys, key_order;
    var answer;

    // where the noun should appear before or after the modifiers
    var prompt_before = CONDITION == "noun-initial";

    // production (critical two-modifier NPs)
    for (let i = 0; i < 12; i++) {
      [icons, keys, key_order] = TRIALS.pop();
      [nicon, micons] = icons;
      answer = [
        linearize(micons),
        linearize([...micons].reverse()),
      ];
      DATA.block4.push({
        stimulus: stim_img(icons2fn(icons.flat())),
        keys: keys,
        key_order: key_order,
        prompt: nicon,
        answer: answer,
        noun: lookup[nicon],
      });
    }

    // create block 4 trials
    var block4_trials = {
      type: jsPsychProduction,
      stimulus: jsPsych.timelineVariable("stimulus"),
      keys: jsPsych.timelineVariable("keys"),
      prompt: jsPsych.timelineVariable("prompt"),
      prompt_before: prompt_before,
      answer: jsPsych.timelineVariable("answer"),
      show_feedback: false,
      force_correct_production: false,
      mark_correct: true,
      include_spacebar: false,
      include_counter: false,
      fill_in_the_blanks: true,
      linger_duration: linger,
      on_finish: is_isomorphic,
      css_classes: ["jspsych-production", ],
      data: {
        block: 4,
        n_mod: 2,
        group: 'adj-num',
        noun: jsPsych.timelineVariable("noun"),
        key_order: jsPsych.timelineVariable("key_order"),
        first_order: FIRST_ORDER,
      },
    };

    // create block 4
    EXPERIMENT.block4 = {
      timeline: [block4_trials, ],
      timeline_variables: DATA.block4,
      randomize_order: false,
    };
  }

  // ==========================================================================
  // Define core function to generate blocked trials
  // ==========================================================================

  function generate(condition) {

    // set global condition
    CONDITION = condition;

    // set linearization function based on condition
    linearize = CONDITION == "noun-initial" ? noun_initial : noun_final;

    // generate NPs & keyboards
    get_trials();

    // generate blocks
    demo();
    block1();
    block2();
    block3();
    block4();

    // return trial blocks
    return EXPERIMENT;
  }

  // return core generate function
  return generate;
})();
