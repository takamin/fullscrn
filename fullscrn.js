(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    "use strict";

    var GLOBAL = Function("return this;")();

    var WebDLog = (function() {
        try { return require("web-dlog"); }
        catch(e) { /*ignore*/ }
        return GLOBAL.WebDLog;
    }());
    var _debugMode = false;
    var Log = WebDLog.logger().debug( _debugMode );

    /**
     * The class to be exported.
     * There is no instance method.
     * @constructor
     */
    var Fullscreen = function() {}

    /**
     * Indicates the state that Fullscreen API is available.
     *
     * This is same to 'fullscreenEnabled'
     *
     * @type {?bool}
     */
    Fullscreen.enabled = null;

    /**
     * References to the full screen element
     *
     * This is same to 'fullscreenElement'
     *
     * @type {?Element}
     */
    Fullscreen.element = null;

    /**
     * Requests to the element to be full screen.
     *
     * This is same to 'Element.requestFullscreen()'
     *
     * @param {!Element} element The element to expand.
     * @returns {undefined}
     */
    Fullscreen.request = function(element) {
        console.warn("Waiting requestFullscreen implementation.");
        element.requestFullscreen();
    };

    /**
     * Exit from full screen mode
     *
     * This is same to 'Document.exitFullscreen()'
     *
     * @returns {undefined}
     */
    Fullscreen.exit = function() {
        console.warn("Waiting exitFullscreen implementation");
        document.exitFullscreen();
    };

    /*
     * no standard properties
     */
    Fullscreen.fullscreen = null;
    Fullscreen.fullScreen = null;
    Fullscreen.isFullscreen = null;
    Fullscreen.isFullScreen = null;

    /**
     * Change debugging mode
     * @param {?bool} enabled enabled or not
     * @returns {bool|undefined}
     *      If the argument is not set,
     *      the current status is returned,
     *      otherwise undefined.
     */
    Fullscreen.debugMode = function(enabled) {
        if(enabled == null) {
            return _debugMode;
        }
        _debugMode = enabled;
        Log.debug(enabled);
    };

    try {
        module.exports = Fullscreen;
    } catch (err) { /* ignore */ }

    GLOBAL.Fullscreen = Fullscreen;


    /*
     * Search APIs
     */

    (function() {

        var d = document;
        var api = Fullscreen;
        var $ = (function() {
            try { return require("./lib/document-ready"); }
            catch(err) { /* ignore the error */ }
            return ("DocumentReady" in GLOBAL) ?
                GLOBAL.DocumentReady : (function(func) { func(); });
        }());

        var getMethod = function(cls, names) {
            for(var i = 0; i < names.length; i++) {
                var name = names[i];
                if(name in cls.prototype) {
                    Log.d("The class " + cls.name + " has a method " + name + ".");
                    return cls.prototype[name];
                }
                Log.d("The class " + cls.name + " does not have a method " + name + ".");
            }
            Log.d("The class " + cls.name + " does not have a method " + names.join(',') + " at all.");
            return null;
        };

        var getProp = function(names) {
            for(var i = 0; i < names.length; i++) {
                var name = names[i];
                if(name in d) {
                    Log.d("The document has a property " + name + ".");
                    return d[name];
                }
                Log.d("The document does not have a property " + name + ".");
            }
            Log.d("The document does not have a property " + names.join(',') + " at all.");
            return null;
        }

        $(function() {

            api.enabled = (function() {
                var value = getProp([
                    "fullscreenEnabled",
                    "fullScreenEnabled",
                    "webkitFullscreenEnabled",
                    "webkitFullScreenEnabled",
                    "mozFullScreenEnabled"
                ]);
                return (value == null) ? false : value;
            }());
            Log.d("Fullscreen.enabled:", api.enabled);

            var updateProperty = function(event) {

                Log.d("updateFullscreenElement: event.type:", event.type);

                api.element =
                (function() {
                    var value = getProp([
                        "webkitFullscreenElement",
                        "mozFullScrennElement"
                    ]);
                    Log.d("Updates Fullscreen.element to ", value);
                    return value;
                }());
                Log.d("Fullscreen.element:", api.element);


                api.fullscreen =
                api.fullScreen =
                api.isFullscreen =
                api.isFullScreen =
                (function() {
                    var value = getProp([
                        "webkitIsFullScreen",
                        "webkitIsFullscreen",
                        "mozFullScreen"
                    ]);
                    if(value == null) {
                        value = (api.element != null);
                    }
                    Log.d("Updates Fullscreen.fullscreen to ", value);
                    return value;
                }());
                Log.d("Fullscreen.isFullscreen:", api.isFullscreen);
            };
            d.addEventListener("fullscreenchange", updateProperty);
            d.addEventListener("webkitfullscreenchange", updateProperty);
            d.addEventListener("mozfullscreenchange", updateProperty);

            d.dispatchEvent(new Event("fullscreenchange"));

            api.request = (function() {
                var method = getMethod(Element, [
                    "requestFullscreen",
                    "requestFullScreen",
                    "webkitRequestFullScreen",
                    "mozRequestFullScreen"
                ]);
                if(method == null) {
                    return function() {
                        throw new Error("requestFullscreen() is not supported.");
                    };
                }
                return function(element) {
                    method.call(element);
                };
            }());


            api.exit = (function() {
                var method = getMethod(Document, [
                    "exitFullscreen",
                    "exitFullScreen",
                    "webkitCancelFullScreen",
                    "mozCancelFullScreen"
                ]);
                if(method == null) {
                    return function() {
                        throw new Error("Document.exitFullscreen() is not supported.");
                    };
                }
                return function() {
                    method.call(document);
                };
            }());


            var logFullscreenMemberOf = function(cls) {
                Object.keys(cls.prototype).forEach(function(key) {
                    if(key.match(/fullscreen/i)) {
                        Log.d("Found " + cls.name + ".prototype." + key);
                    }
                });
            };
            try { logFullscreenMemberOf(Document); } catch(err) { /* nothing */ }
            try { logFullscreenMemberOf(Element);  } catch(err) { /* nothing */ }

        });
    }());

}());

},{"./lib/document-ready":2,"web-dlog":3}],2:[function(require,module,exports){
(function() {
    "use strict";

    var WebDLog = (function() {
        try { return require("./web-dlog"); } catch(e) {/*ignore*/ }
        return GLOBAL.WebDLog; }());
    var Log = WebDLog.logger().debug(false);

    var DocumentReady = function(func) {
        if(waiting) {
            Log.d("Save a DocumentReady function to run later");
            funcList.push(func);
        } else {
            Log.d("Run a DocumentReady function immediate");
            exec(func);
        }
    };
    var waiting = true;
    var funcList = [];
    var exec = function(func) {
        try {
            Log.d("Run a DocumentReady function." + func);
            func();
        } catch(err) {
            console.error(err.message);
            console.error(err.stack);
        }
    };
    var GLOBAL = Function("return this;")();

    try {
        module.exports = DocumentReady;
    } catch (err) {
        GLOBAL.DocumentReady = DocumentReady;
    }

    (function() {
        var waitTime = 10;
        var waitTotal = 0;
        var waitLimit = 10000;
        var runAllFunc = function() {
            Log.d("Run all the saved DocumentReady functions");
            funcList.forEach(function(func) {
                exec(func);
            });
            funcList = [];
        };
        var waitDocument = function() {
            Log.d("Check the document is ready.");
            if("document" in GLOBAL) {
                Log.d("The document is available.");
                if(document.readyState === "complete" ||
                    (document.readyState !== "loading" &&
                    !document.documentElement.doScroll))
                {
                    Log.d("The DOMContentLoaded event was already fired.");
                    runAllFunc();
                    waiting = false;
                } else {
                    Log.d("Listen DOMContentLoaded event.");
                    document.addEventListener(
                        "DOMContentLoaded", function(){
                            Log.d("Handle the DOMContentLoaded.");
                            runAllFunc();
                            waiting = false;
                        });
                }
            } else if(waitTotal < waitLimit) {
                Log.d("The document is not available.");
                setTimeout(function() {
                    waitTotal += waitTime;
                    waitDocument();
                }, waitTime);
            } else {
                console.error("DocumentReady timeout");
                runAllFunc();
                waiting = false;
            }
        };
        waitDocument();
    }());

}());

},{"./web-dlog":3}],3:[function(require,module,exports){
(function() {
    "use strict";
    var GLOBAL = Function("return this;")();
    var WebDLog = function() { };
    var _logger = {
        "debug" : function() {
            console.log.apply(null, Array.from(arguments));
        },
        "ndebug" : function() { },
    }
    WebDLog.logger = function() { return new WebDLog(); };
    WebDLog.prototype.d = _logger["ndebug"];
    WebDLog.prototype.debug = function(debug) {
        if(debug == null) {
            debug = true;
        }
        this.d = _logger[debug?"debug":"ndebug"];
        return this;
    };

    try {
        module.exports = WebDLog;
    } catch (err) {
        GLOBAL.WebDLog = WebDLog;
    }
}());

},{}]},{},[1]);
