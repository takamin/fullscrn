Fullscrn
========

<img src="https://github.com/takamin/fullscrn/blob/gh-pages/images/logo.png?raw=true"
width="100%" style="max-width:900px"/>

Fullscreen API.
This module injects APIs to the DOM.
So, you don't have to consider about the prefix such as 'moz' or 'webkit'.

The implementation follows the standard specification at
[Fullscreen API - WHATWG](https://fullscreen.spec.whatwg.org/).

FILES
-----

* fullscrn.js - The script to include by script tag.
* fullscrn.min.js - Minified one.
* index.js - The source file of this module.
This can be import using browserify.


APIs Injected to DOM
--------------------

### Properties

* __Document.fullscreenEnabled__ -
The full screen API's availability.
* __Document.fullscreenElement__ -
Indicates the full sized element.
* __Document.fullscreen__ -
The equivalent value to (Document.fullscreenElement != null).

### Methods

These methods returns promise.

* __Element.requestFullscreen()__ -
Requests the fullscreen mode with the element.
* __Document.exitFullscreen()__ -
Cancels the fullscreen mode of the element that
is set to fullscreen at the time.

### Events

Use `document.addEventListener` to handle events while
this module does not supoort the event handlers -
`Document.onfullscreenchange` and onfullscreenerror.

* __Document `"fullscreenchange"`__
* __Document `"fullscreenerror"`__

### SAMPLE

__[sample/injected.html](sample/injected.html)__

```html
<body onload="main();">
    <button type="button" onclick="request1();"
    >Full&gt;&gt;</button>
    <span id="panel">
        <button type="button" onclick="request2();"
        >Full&gt;&gt;</button>
        <button type="button" id="exitButton"
        onclick="exit();">&lt;&lt;Exit</button>
    </span>
    <script src="../fullscrn.js"></script>
    <script>
        var panel = document.getElementById("panel");
        var exitButton = document.getElementById("exitButton");
        Fullscreen.debugMode(true);// Enables debug log
        function main() {
            // Handle change event
            document.addEventListener("fullscreenchange",
                function() {
                    var fse = document.fullscreenElement;
                    console.log("FULLSCREEN CHANGE: " +
                        ((fse == null)? "(null)": "#" + fse.id));
                });

            // Handle error event
            document.addEventListener("fullscreenerror",
                function() { console.log("FULLSCREEN ERROR"); });

            request1(); // This should be error
        }
        function request1() {
            panel.requestFullscreen().then(function(){
                console.log("request1 done.");
            }).catch(function(err) {
                console.error(err.message);
            });
        }
        function request2() {
            exitButton.requestFullscreen().then(function(){
                console.log("request2 done.");
            }).catch(function(err) {
                console.error(err.message);
            });
        }
        function exit() {
            document.exitFullscreen()
            .then(function(){
                console.log("exit done.");
            }).catch(function(err) {
                console.error(err.message);
            });
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

* Fullscreen.request(element) - enter full screen mode with the element and returns a promise.
* Fullscreen.exit(): exit full screen mode and returns a promise.


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
