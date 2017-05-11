Fullscrn
========

Fullscreen API.

APIs
----

### Properties

* FullScrn.enabled - indicates the fullscreen APIs are available.
* FullScrn.element - references the fullscreen element or null.

### Methods

* FullScrn.request(element) - enter full screen mode with the element.
* FullScrn.exit(): exit full screen mode,

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
            FullscreenAPI.request(btn);
        }
        function exitFull() {
            var btn = exitButton();
            btn.style.display = "none";
            FullscreenAPI.exit();
        }
    </script>
</body>
```

LICENSE
-------

This software is released under the MIT License, see [LICENSE](LICENSE)
