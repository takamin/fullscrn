Fullscrn
========

Fullscreen API.

FILES
-----

* fullscrn.js - The script to include by script tag.
In this case, 'Fullscreen' is available(see the sample below).
* fullscrn.min.js - Minified one.
* index.js - The source file of this module.
This can be import using browserify.

APIs
----

### Properties

* Fullscreen.enabled - indicates the fullscreen APIs are available.
* Fullscreen.element - references the fullscreen element or null.

### Methods

* Fullscreen.request(element) - enter full screen mode with the element.
* Fullscreen.exit(): exit full screen mode.

SAMPLE
------

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
