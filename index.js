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
     * @returns {Promise} a Promise that will be resolved
     * when the operation completes
     */
    Fullscreen.request = function(element) {
        console.warn("Waiting requestFullscreen implementation.");
        return element.requestFullscreen();
    };

    /**
     * Exit from full screen mode
     *
     * This is same to 'Document.exitFullscreen()'
     *
     * @returns {Promise} a Promise that will be resolved
     * when the operation completes
     */
    Fullscreen.exit = function() {
        console.warn("Waiting exitFullscreen implementation");
        return document.exitFullscreen();
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

        var getPropName = function(names) {
            for(var i = 0; i < names.length; i++) {
                var name = names[i];
                if(name in d) {
                    Log.d("The document has a property " + name + ".");
                    return name;
                }
                Log.d("The document does not have a property " + name + ".");
            }
            Log.d("The document does not have a property " + names.join(',') + " at all.");
            return null;
        };

        $(function() {

            var callbackChange = null;

            //
            // Debug print members matching /fullscreen/i
            //
            var logFullscreenMemberOf = function(cls) {
                Object.keys(cls.prototype).forEach(function(key) {
                    if(key.match(/fullscreen/i)) {
                        Log.d("Found " + cls.name + ".prototype." + key);
                    }
                });
            };
            try { logFullscreenMemberOf(Document); } catch(err) { /* nothing */ }
            try { logFullscreenMemberOf(Element);  } catch(err) { /* nothing */ }

            //
            // Determine fullscreenEnabled
            //
            api.enabled = (function() {
                var name = getPropName([
                    "fullscreenEnabled",
                    "webkitFullscreenEnabled",
                    "webkitFullScreenEnabled",
                    "mozFullScreenEnabled"
                ]);
                var value = (name==null)? false : d[name];
                return value;
            }());
            Log.d("Fullscreen.enabled:", api.enabled);

            // Inject Document.fullscreenEnabled
            if(!("fullscreenEnabled" in document)) {
                d.fullscreenEnabled = api.enabled;
            }


            //
            // Updates Document.fullscreenElement and
            // Document.fullscreen by listening fullscreenchage event.
            //
            (function() {
                var injectElement = !("fullscreenElement" in d);
                var injectFullscreen = !("fullscreen" in d);
                var nameFullscreenElement = getPropName([
                    "fullscreenElement",
                    "webkitFullscreenElement",
                    "mozFullScreenElement"
                ]);
                var nameFullscreen = getPropName([
                    "fullscreen",
                    "webkitIsFullScreen",
                    "webkitIsFullscreen",
                    "mozFullScreen"
                ]);

                /**
                 * The function to update `Document.fullscreenElement`.
                 * This is invoked from the `fullscreenchange` event handler
                 * @returns {undefined}
                 */
                var updateProperty = function() {
                    api.element =
                    (function() {
                        var value = (nameFullscreenElement == null) ?
                            null : d[nameFullscreenElement];
                        Log.d("Updates Fullscreen.element to " + value);
                        return value;
                    }());
                    Log.d("Fullscreen.element: " + api.element);
                    if(injectElement) {
                        d.fullscreenElement = api.element;
                        Log.d("Document.fullscreenElement:" + d.fullscreenElement);
                    }

                    /*
                     * These members are available, but not standard.
                     */
                    api.fullscreen =
                    api.fullScreen =
                    api.isFullscreen =
                    api.isFullScreen =
                    (function() {
                        var value = (nameFullscreen == null)?
                            (api.element != null): d[nameFullscreen];
                        Log.d("Updates Fullscreen.fullscreen to ", value);
                        return value;
                    }());
                    Log.d("Fullscreen.fullscreen:", api.fullscreen);
                    if(injectFullscreen) {
                        d.fullscreen = api.fullscreen;
                        Log.d("Document.fullscreen:", d.fullscreen);
                    }
                };

                updateProperty(); // Initialize the properties

                (function() {
                    var standardType = "fullscreenchange";
                    var implementedType = null;

                    /**
                     * fullscreenchange event handler
                     * @param {Event} event a notified event
                     * @returns {undefined}
                     */
                    var onfullscreenchange = function(event) {

                        if(implementedType == null) {
                            implementedType = event.type;
                            Log.d("implemented", standardType + ":", implementedType);
                        } else if(event.type != implementedType) {
                            return;
                        }

                        updateProperty();

                        if(implementedType != standardType) {
                            Log.d("Route event", event.type, "to", standardType);
                            d.dispatchEvent(new Event(standardType));
                        }

                        if(callbackChange != null) {
                            callbackChange(null, true);
                            callbackChange = null;
                        }
                    };
                    d.addEventListener(standardType, onfullscreenchange);
                    d.addEventListener("webkitfullscreenchange", onfullscreenchange);
                    d.addEventListener("mozfullscreenchange", onfullscreenchange);
                }());
            }());

            //
            // Route prefixed fullscreenerror event to standard
            //
            (function() {
                var standardType = "fullscreenerror";
                var implementedType = null;
                /**
                 * fullscreenerror event handler
                 * @param {Event} event a notified event
                 * @returns {undefined}
                 */
                var onfullscreenerror = function(event) {

                    if(implementedType == null) {
                        implementedType = event.type;
                        Log.d("implemented", standardType + ":", implementedType);
                    } else if(event.type != implementedType) {
                        return;
                    }
                    if(implementedType != standardType) {
                        Log.d("Route event", event.type, "to", standardType);
                        d.dispatchEvent(new Event(standardType));
                    }

                    if(callbackChange != null) {
                        callbackChange(new Error("fullscreen API error"), false);
                        callbackChange = null;
                    }
                };
                d.addEventListener(standardType, onfullscreenerror);
                d.addEventListener("webkitfullscreenerror", onfullscreenerror);
                d.addEventListener("mozfullscreenerror", onfullscreenerror);
            }());

            var runFullscreenRequest = function(requestPromise) {
                /* globals Promise */
                return new Promise(function(resolve, reject) {
                    try {
                        if(callbackChange != null) {
                            Log.d("an unresolved request exists");
                            reject(new Error("an unresolved request exists"));
                        } else {
                            callbackChange = function(err, data) {
                                if(err) {
                                    Log.d("Promise rejected.");
                                    reject(err);
                                } else {
                                    Log.d("Promise resolved.");
                                    resolve(data);
                                }
                            };
                            var promise = requestPromise();
                            if(promise != null) {
                                Log.d("API returns Promise");
                                promise.then(function(){
                                    Log.d("Promise that API returns resolved.");
                                    resolve();
                                }).catch(function(err) {
                                    Log.d("Promise that API returns rejected.");
                                    reject(err);
                                });
                            }
                        }
                    } catch(err) {
                        reject(err);
                    }
                });
            };
            //
            // Fullscreen.request()
            //
            api.request = (function() {
                var method = getMethod(Element, [
                    "webkitRequestFullScreen",
                    "mozRequestFullScreen",
                    "requestFullScreen",
                    "requestFullscreen"
                ]);
                if(method == null) {
                    return function() {
                        throw new Error("requestFullscreen() is not supported.");
                    };
                }
                return function(element) {
                    Log.d("Fullscreen.request:", element);
                    return runFullscreenRequest(function() {
                        return method.call(element);
                    });
                };
            }());

            //
            // Inject `Element.requestFullscreen`
            //
            if(!("requestFullscreen" in Element.prototype)) {
                Log.d("Inject Element.requestFullscreen()");
                Element.prototype.requestFullscreen = function() {
                    Log.d("This is an injected Element.requestFullscreen()");
                    return api.request(this);
                };
            }

            //
            // Fullscreen.exit()
            //
            api.exit = (function() {
                var method = getMethod(Document, [
                    "webkitCancelFullScreen",
                    "mozCancelFullScreen",
                    "exitFullScreen",
                    "exitFullscreen"
                ]);
                if(method == null) {
                    return function() {
                        throw new Error("Document.exitFullscreen() is not supported.");
                    };
                }
                return function() {
                    Log.d("Fullscreen.exit:", api.element);
                    if(api.element == null) {
                        return new Promise(function(resolve, reject) {
                            reject(new Error("Fullscreen.element not exists"));
                            //resolve();
                        });
                    }
                    return runFullscreenRequest(function() {
                        return method.call(d);
                    });
                };
            }());

            //
            // Inject `Document.exitFullscreen`
            //
            if(!("exitFullscreen" in Document.prototype)) {
                Log.d("Inject Document.exitFullscreen()");
                Document.prototype.exitFullscreen = function() {
                    Log.d("This is an injected Document.exitFullscreen()");
                    return api.exit();
                };
            }

        });
    }());

}());
