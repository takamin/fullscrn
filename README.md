Fullscrn
========

Fullscreen API.
This module injects APIs to the DOM.
So, you don't have to consider about the prefix such as 'moz' or 'webkit'.

The implementation follows the standard specification at
[Fullscreen API - WHATWG](https://fullscreen.spec.whatwg.org/).
But it's not so certainly.
So the methods do not returns a `promise` object.

FILES
-----

* fullscrn.js - The script to include by script tag.
* fullscrn.min.js - Minified one.
* index.js - The source file of this module.
This can be import using browserify.


APIs Injected to DOM
--------------------

### Properties

* Document.fullscreenEnabled - The full screen API's availability.
* Document.fullscreenElement - Indicates the full sized element.
* Document.fullscreen - The equivalent value to (Document.fullscreenElement != null).

### Methods

* Element.requestFullscreen()
* Document.exitFullscreen()

### Events

* Document.fullscreenchange
* Document.fullscreenerror

### SAMPLE

__[sample/injected.html](sample/injected.html)__

```html
<body onload="main();">
    <button type="button"
        onclick="requestFull();">Fullscreen</button>
    <button type="button" id="exitButton"
         style="display:none;"
         onclick="exitFull();">Exit</button>
    <script src="../fullscrn.js"></script>
    <script>
        Fullscreen.debugMode(true);// Enables debug log

        var exitButton = null;

        function main() {
            exitButton = document.getElementById("exitButton");

            // Handle change event
            document.addEventListener("fullscreenchange",
                function() { console.log("FULLSCREEN CHANGE"); });

            // Handle error event
            document.addEventListener("fullscreenerror",
                function() { console.log("FULLSCREEN ERROR"); });

            // This should be error
            exitButton.requestFullscreen();

        }

        // Request fullscreen
        function requestFull() {
            exitButton.style.display = "block";
            exitButton.requestFullscreen();
        }

        // Exit fullscreen
        function exitFull() {
            exitButton.style.display = "none";
            document.exitFullscreen();
        }

    </script>
</body>

```


Exported APIs (according to the convention of Node.js)
------------------------------------------------------

If this module was included by script tag, the global object 'Fullscreen'
is available (see the `sample/sample.html` below).

### Properties

* Fullscreen.enabled - indicates the fullscreen APIs are available.
* Fullscreen.element - references the fullscreen element or null.

### Methods

* Fullscreen.request(element) - enter full screen mode with the element.
* Fullscreen.exit(): exit full screen mode.


### SAMPLE

__[sample/sample.html](sample/sample.html)__

```html
<body>
    <button type="button"
        onclick="requestFull();">Fullscreen</button>
    <button type="button" id="exitButton"
         style="display:none;"
         onclick="exitFull();">Exit</button>
    <script src="../fullscrn.js"></script>
    <script>
        function exitButton() {
            return document.getElementById("exitButton");
        }
        function requestFull() {
            var btn = exitButton();
            btn.style.display = "block";
            Fullscreen.request(btn);
        }
        function exitFull() {
            var btn = exitButton();
            btn.style.display = "none";
            Fullscreen.exit();
        }
    </script>
</body>
```

LICENSE
-------

This software is released under the MIT License, see [LICENSE](LICENSE)
