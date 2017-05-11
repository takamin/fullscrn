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
    var FullscreenAPI = function() {}

    /**
     * Indicates the state that Fullscreen API is available.
     *
     * This is same to 'fullscreenEnabled'
     *
     * @type {?bool}
     */
    FullscreenAPI.enabled = null;

    /**
     * References to the full screen element
     *
     * This is same to 'fullscreenElement'
     *
     * @type {?Element}
     */
    FullscreenAPI.element = null;

    /**
     * Requests to the element to be full screen.
     *
     * This is same to 'Element.requestFullscreen()'
     *
     * @param {!Element} element The element to expand.
     * @returns {undefined}
     */
    FullscreenAPI.request = function(element) {
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
    FullscreenAPI.exit = function() {
        console.warn("Waiting exitFullscreen implementation");
        document.exitFullscreen();
    };

    /*
     * no standard properties
     */
    FullscreenAPI.fullscreen = null;
    FullscreenAPI.fullScreen = null;
    FullscreenAPI.isFullscreen = null;
    FullscreenAPI.isFullScreen = null;

    /**
     * Change debugging mode
     * @param {?bool} enabled enabled or not
     * @returns {bool|undefined}
     *      If the argument is not set,
     *      the current status is returned,
     *      otherwise undefined.
     */
    FullscreenAPI.debugMode = function(enabled) {
        if(enabled == null) {
            return _debugMode;
        }
        _debugMode = enabled;
        Log.debug(enabled);
    };

    try {
        module.exports = FullscreenAPI;
    } catch (err) { /* ignore */ }

    GLOBAL.FullscreenAPI = FullscreenAPI;


    /*
     * Search APIs
     */

    (function() {

        var d = document;
        var api = FullscreenAPI;
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
            Log.d("FullScreenAPI.enabled:", api.enabled);

            var updateProperty = function(event) {

                Log.d("updateFullscreenElement: event.type:", event.type);

                api.element =
                (function() {
                    var value = getProp([
                        "webkitFullscreenElement",
                        "mozFullScrennElement"
                    ]);
                    Log.d("Updates FullscreenAPI.element to ", value);
                    return value;
                }());
                Log.d("FullScreenAPI.element:", api.element);


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
                    Log.d("Updates FullscreenAPI.fullscreen to ", value);
                    return value;
                }());
                Log.d("FullScreenAPI.isFullscreen:", api.isFullscreen);
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
                    "webkitCancelFullScreen",
                    "mozCancelFullScrenn"
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
