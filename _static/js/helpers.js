function encode_red(text) {
  return text.replace(/r/g, `<span class="iconic-red">r</span>`);
}

function decode_red(text) {
  return text.replace(`<span class="iconic-red">r</span>`, /r/g);
}

function random_indices(len) {
  return jsPsych.randomization.shuffle([...Array(len).keys()]);
}

function shuffle_together(x, y) {
  var _x = [];
  var _y = [];
  random_indices(x.length).forEach(i => {
    _x.push(x[i]);
    _y.push(y[i]);
  });
  return [_x, _y];
}

function is_isomorphic(data = {}) {
  if (data.correct) {
    var answers = data.answer.split(' ~ ');
    if (answers.length == 4) {
      data.isomorphic = answers.slice(0, 2).includes(data.response);
    } else {
      data.isomorphic = answers[0] == data.response;
    }
  }
}

function score_items(block, n_attr, data = {}) {
  // store the scores on the critical items & non-critical items
  var trials = jsPsych.data.get().filter({correct: true});
  var blocks_ = [];
  if (Number.isInteger(block)) {
    blocks_.push({block: block});
  } else {
    for (let i = 0; i < block.length; i++) {
      blocks_.push({block: block[i]});
    }
  }
  trials = trials.filter(blocks_);
  data.critical_score = trials.filter({[n_attr]: 2}).count();
  data.non_critical_score = trials.filter({[n_attr]: 1}).count();
  // calculate & store the percentage of isomorphic responses out of
  // the correct critical responses
  data.percent_isomorphic = trials.filter({isomorphic: true}).count();
  data.percent_isomorphic /= data.critical_score;
  data.percent_isomorphic *= 100;
}
