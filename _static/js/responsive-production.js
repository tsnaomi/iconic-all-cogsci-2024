(function() {

  // ==========================================================================
  // SPECIFIC TO PRODUCTION TRIALS
  // ==========================================================================

  // function to convert rem to pixels
  function rem_to_pixels(rem) {
      return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  // function to resize production image stimulus by picking the optimal height
  function resize_production_stimulus() {

    // grab the production task stimulus (if present)
    var stim = document.getElementById("jspsych-production-stimulus");

    if (stim) {
        // get the maximum height based on the viewport
        var MAX_HEIGHT = 0.45 * window.innerHeight;

        // grab the other production task elements
        var answer = document.getElementById("jspsych-production-answer");
        var line = document.getElementById("jspsych-production-line-container");
        var keyboard = document.getElementById("jspsych-production-keyboard");
        var proceed = document.getElementById("jspsych-production-submit");

        // grab the `--production-bottom-spacing` CSS variable string
        var spacing = getComputedStyle(document.documentElement)
          .getPropertyValue('--production-bottom-spacing');

        // convert `--production-bottom-spacing` into a float (unit: pixels)
        if (spacing.includes("rem")) {
          spacing = rem_to_pixels(parseFloat(spacing));
        } else {
          spacing = parseFloat(spacing);
        }

        // tally the number of gaps (spaces between elements)
        var gap_cnt = answer.offsetHeight ? 4 : 3;

        // calculate the maximum height based on the other elements
        var max_height = (0.9 * window.innerHeight) -
          answer.offsetHeight -
          line.offsetHeight -
          keyboard.offsetHeight -
          proceed.offsetHeight -
          (gap_cnt * spacing);

        // take the minimum height between `MAX_HEIGHT` and `max_height`
        max_height = Math.min(MAX_HEIGHT, max_height);

        // set the stimulus image height to the calculated height
        stim.querySelector("img").style.maxHeight = `${max_height}px`;
    }
  }

  // create a mutation observer instance to call `resize_production_stimulus()`
  var observer = new MutationObserver(resize_production_stimulus);

  // specify which mutations to observe
  var config = { attributes: false, childList: true, subtree: true, characterData: true };

  // start observing the <body>; whenever the <body> changes (e.g., at the
  // start of a new trial), `resize_production_stimulus()` will be called
  observer.observe(document.body, config);

  // create an event listener that calls `resize_production_stimulus()`
  // whenever the window is resized
  window.addEventListener("resize", async function(event) {
    resize_production_stimulus();
  });

})();
