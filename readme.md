PIK6
====

HTML5 presentation framework (MIT license)

[http://pik6.peterkroener.de][1]

[http://github.com/SirPepe/Pik6][2]

![Screenshot](https://github.com/SirPepe/Pik6/raw/master/screenshot.png)

Features
--------

  * 100% HTML5, CSS and JavaScript (MooTools)
  * Programmable slides, easy to embed content from the web
  * Great performance in modern browsers even with hundreds of slides
  * **Multiple presentation views and a presenter mode** (using HTML5 Shared Web Workers)

Drawbacks
--------

  * Requires a modern browser and a web server to run from
  * Includes **no fancy stuff** by default. You'll have to build yuor super-awesome 3D slide transitions by yourself.
  * All drawbacks common to HTML slides (no PDF export, images hard to use)

How to use
----------

   1. Copy the html file in `/presentations/Template` to `/presentations/yourslidestitle`. Edit/add slides (`<div class="pik-slide">`).
   2. Open the presentation framework (`index.html`) in Firefox, Safari, Opera or Chrome (modern IE versions might work too, but who knows)
   3. Use the "browse" function to load your presentation into the frame
   4. For multiple presentation views simply open more instances of `index.html` in new browser windows (Chrome 8+, Opera 11+ or Safari 5+ required)
   5. Use the menu at the bottom of `index.html` to open the presenter view or point your browser to `presenter.html` (Chrome 8+, Opera 11+ or Safari 5+ required)
   6. Navigate slides using the arrow keys. Hide the presentation using the F5 or ESC key

See [the slides about PIK6][1] for more details.

  [1]: http://pik6.peterkroener.de
  [2]: http://github.com/SirPepe/Pik6