(function() {
    "use strict";
    const debug = require("debug")("fullscrn");
    const DocumentReady = require("./lib/document-ready");

    /**
     * The class to be exported.
     * There is no instance method.
     * @constructor
     */
    const Fullscreen = function() {}

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

    try {
        module.exports = Fullscreen;
    } catch (err) { /* ignore */ }
    const GLOBAL = Function("return this;")();
    GLOBAL.Fullscreen = Fullscreen;

    /**
     * Find first instance method specified by the list of name from the class.
     * @param {Function} cls A class constructor function
     * @param {Array<string>} names An array of method names
     * @returns {Function} The instance method declared in the class. 
     */
    const getMethod = function(cls, names) {
        for(let i = 0; i < names.length; i++) {
            const name = names[i];
            if(name in cls.prototype) {
                debug("The class " + cls.name + " has a method " + name + ".");
                return cls.prototype[name];
            }
            debug("The class " + cls.name + " does not have a method " + name + ".");
        }
        debug("The class " + cls.name + " does not have a method " + names.join(',') + " at all.");
        return null;
    };

    // short cut for the HTML document
    const d = document;

    /**
     * Find a property from document.
     * @param {Array<string>} names An array of property name to search
     * @returns {string} A property name in document
     */
    const getPropName = function(names) {
        for(let i = 0; i < names.length; i++) {
            const name = names[i];
            if(name in d) {
                debug("The document has a property " + name + ".");
                return name;
            }
            debug("The document does not have a property " + name + ".");
        }
        debug("The document does not have a property " + names.join(',') + " at all.");
        return null;
    };

    /*
     * Search APIs
     */
    DocumentReady(function() {

        let callbackChange = null;

        //
        // Debug print members matching /fullscreen/i
        //
        const logFullscreenMemberOf = function(cls) {
            Object.keys(cls.prototype).forEach(function(key) {
                if(key.match(/fullscreen/i)) {
                    debug("Found " + cls.name + ".prototype." + key);
                }
            });
        };
        try { logFullscreenMemberOf(Document); } catch(err) { /* nothing */ }
        try { logFullscreenMemberOf(Element);  } catch(err) { /* nothing */ }

        //
        // Determine fullscreenEnabled
        //
        {
            const name = getPropName([
                "fullscreenEnabled",
                "webkitFullscreenEnabled",
                "webkitFullScreenEnabled",
                "mozFullScreenEnabled"
            ]);
            Fullscreen.enabled = (name==null) ? false : d[name];
            debug("Fullscreen.enabled:", Fullscreen.enabled);

            // Inject Document.fullscreenEnabled
            if(!("fullscreenEnabled" in document)) {
                d.fullscreenEnabled = Fullscreen.enabled;
            }
        }

        //
        // Updates Document.fullscreenElement and
        // Document.fullscreen by listening fullscreenchage event.
        //
        {
            const injectElement = !("fullscreenElement" in d);
            const injectFullscreen = !("fullscreen" in d);
            const nameFullscreenElement = getPropName([
                "fullscreenElement",
                "webkitFullscreenElement",
                "mozFullScreenElement"
            ]);
            const nameFullscreen = getPropName([
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
            const updateProperty = function() {
                {
                    const value = (nameFullscreenElement == null) ?
                        null : d[nameFullscreenElement];
                    debug("Updates Fullscreen.element to " + value);
                    Fullscreen.element = value;
                }
                debug("Fullscreen.element: " + Fullscreen.element);
                if(injectElement) {
                    d.fullscreenElement = Fullscreen.element;
                    debug("Document.fullscreenElement:" + d.fullscreenElement);
                }

                /*
                 * These members are available, but not standard.
                 */
                {
                    const value = (nameFullscreen == null)?
                        (Fullscreen.element != null): d[nameFullscreen];
                    debug("Updates Fullscreen.fullscreen to ", value);
                    Fullscreen.fullscreen =
                    Fullscreen.fullScreen =
                    Fullscreen.isFullscreen =
                    Fullscreen.isFullScreen = value;
                }
                debug("Fullscreen.fullscreen:", Fullscreen.fullscreen);
                if(injectFullscreen) {
                    d.fullscreen = Fullscreen.fullscreen;
                    debug("Document.fullscreen:", d.fullscreen);
                }
            };

            updateProperty(); // Initialize the properties

            {
                const standardType = "fullscreenchange";
                let implementedType = null;

                /**
                 * fullscreenchange event handler
                 * @param {Event} event a notified event
                 * @returns {undefined}
                 */
                const onfullscreenchange = function(event) {

                    if(implementedType == null) {
                        implementedType = event.type;
                        debug("implemented", standardType + ":", implementedType);
                    } else if(event.type != implementedType) {
                        return;
                    }

                    updateProperty();

                    if(implementedType != standardType) {
                        debug("Route event", event.type, "to", standardType);
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
            }
        }

        //
        // Route prefixed fullscreenerror event to standard
        //
        {
            const standardType = "fullscreenerror";
            let implementedType = null;
            /**
             * fullscreenerror event handler
             * @param {Event} event a notified event
             * @returns {undefined}
             */
            const onfullscreenerror = function(event) {

                if(implementedType == null) {
                    implementedType = event.type;
                    debug("implemented", standardType + ":", implementedType);
                } else if(event.type != implementedType) {
                    return;
                }
                if(implementedType != standardType) {
                    debug("Route event", event.type, "to", standardType);
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
        }

        const runFullscreenRequest = function(requestPromise) {
            return new Promise(function(resolve, reject) {
                try {
                    if(callbackChange != null) {
                        debug("an unresolved request exists");
                        reject(new Error("an unresolved request exists"));
                    } else {
                        callbackChange = function(err, data) {
                            if(err) {
                                debug("Promise rejected.");
                                reject(err);
                            } else {
                                debug("Promise resolved.");
                                resolve(data);
                            }
                        };
                        const promise = requestPromise();
                        if(promise != null) {
                            debug("API returns Promise");
                            promise.then(function(){
                                debug("Promise that API returns resolved.");
                                resolve();
                            }).catch(function(err) {
                                debug("Promise that API returns rejected.");
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
        {
            const method = getMethod(Element, [
                "webkitRequestFullScreen",
                "mozRequestFullScreen",
                "requestFullScreen",
                "requestFullscreen"
            ]);
            if(method == null) {
                Fullscreen.request = function() {
                    throw new Error("requestFullscreen() is not supported.");
                };
            } else {
                Fullscreen.request = function(element) {
                    debug("Fullscreen.request:", element);
                    return runFullscreenRequest(function() {
                        return method.call(element);
                    });
                };
            }

            //
            // Inject `Element.requestFullscreen`
            //
            if(!("requestFullscreen" in Element.prototype)) {
                debug("Inject Element.requestFullscreen()");
                Element.prototype.requestFullscreen = function() {
                    debug("This is an injected Element.requestFullscreen()");
                    return Fullscreen.request(this);
                };
            }
        }

        //
        // Fullscreen.exit()
        //
        {
            const method = getMethod(Document, [
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
            Fullscreen.exit = function() {
                debug("Fullscreen.exit:", Fullscreen.element);
                if(Fullscreen.element == null) {
                    return new Promise(function(resolve, reject) {
                        reject(new Error("Fullscreen.element not exists"));
                        //resolve();
                    });
                }
                return runFullscreenRequest(function() {
                    return method.call(d);
                });
            };
            //
            // Inject `Document.exitFullscreen`
            //
            if(!("exitFullscreen" in Document.prototype)) {
                debug("Inject Document.exitFullscreen()");
                Document.prototype.exitFullscreen = function() {
                    debug("This is an injected Document.exitFullscreen()");
                    return Fullscreen.exit();
                };
            }
        }
    });
}());
