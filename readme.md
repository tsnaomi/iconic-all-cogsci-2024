# Iconic artificial language learning in the field

Yay! You've found the experiment code for the paper [Iconic artificial language learning in the field: An experiment with San Martín Peras Mixtec speakers](https://escholarship.org/uc/item/9ds5n1qs) (Shapiro, Hedding, & Steinert-Threlkeld 2024), slated for presentation at *CogSci 2024*.

This experiment was built to be conducted on a full-sized iPad while offline in the field. For instructions on configuring the experiment for offline usage, see [here](https://tsnaomi.github.io/iconic-all-cogsci-2024).

To try out the experiment, head [here](https://tsnaomi.github.io/iconic-all-cogsci-2024/field-ex). Upon completing the experiment, you will be given the opportunity to download your responses as a JSON file. No responses are stored on the site.

## Under the hood

### Experiment logic

We implemented the experiment in [jsPsych](https://www.jspsych.org) using *custom* plug-ins that can be found in the `_static/js` folder (`selection.js`, `madlib.js`, and `production.js`.)

### Visual stimuli

The visual stimuli are located in `_static/stimuli`. They are reconstructions of the stimuli from [Martin et al. (2020)](https://doi.org/10.5334/gjgl.1085). We re-created the stimuli such that the depicted elements are larger and thus easier to view from an iPad. The stimuli are composed of assets from [Flaticon](https://www.flaticon.com/) and [Freepik](https://www.freepik.com/).

### Iconic artificial language

<img src=_static/images/_readme-iconic-table.png alt="Iconic artifical language from Shapiro, Hedding, & Steinert-Threlkeld (2024)" width=400/>

We implemented the iconic artificial language as an `Iconic` font, located in `_static/fonts`. The font was created by uploading pictographs as SVG files to [IcoMoon](https://icomoon.io/). The noun pictographs adapt icons from Flaticon.

Here is the character-to-pictograph mapping:

| Character | Pictograph |
| --------- | ---------- |
| B         | ball       |
| F         | feather    |
| M         | mug ~ cup  |
| 2         | two        |
| 3         | three      |
| r         | red \*     |
| b         | black      |

To render the font, we wrapped all iconic text in an `.iconic` CSS class:

```html
<!-- html for "two black feathers" -->
<span class="iconic">2bF</span>
```

```css
/* css */

/* load font */
@font-face {
  font-family: 'Iconic';
  src:  url('../fonts/Iconic.eot?v25ufn');
  src:  url('../fonts/Iconic.eot?v25ufn#iefix') format('embedded-opentype'),
    url('../fonts/Iconic.woff2?v25ufn') format('woff2'),
    url('../fonts/Iconic.ttf?v25ufn') format('truetype'),
    url('../fonts/Iconic.woff?v25ufn') format('woff'),
    url('../fonts/Iconic.svg?v25ufn#Iconic') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

/* class to invoke font */
.iconic {
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'Iconic' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;

  /* better font rendering */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

\* Rendering the *red* pictograph involves a little extra CSS. We additionally wrapped the character in the following class:


```html
<!-- html for "two red feathers" -->
<span class="iconic">2<span class="iconic-red">r</span>F</span>
```

```css
/* css */
.iconic-red {
  color: #ea1943; /* red color */
  -webkit-text-stroke-width: 0.1rem;
  -webkit-text-stroke-color: black;
}
```

### Other visuals

All other graphics on the site, such as the experiment-final tree, come from Flaticon. The experiment interface additionally uses icons from [Google's Material Symbols & Icons](https://fonts.google.com/icons), which we cast in a `Functions` font using IcoMoon.

### Misc.

The site uses a service worker script by Google (`service-worker.js`) to cache resources for offline usage.

The index page was generated using [Quarto](https://quarto.org/).
