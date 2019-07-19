(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./lib/document-ready":2,"debug":3}],2:[function(require,module,exports){
"use strict";

const debug = require("debug")("fullscrn");
const GLOBAL = Function("return this;")();

const WaitTime = 10;
const WaitTimeout = 10000;

class DocWatcher {
    constructor() {
        this.waiting = true;
        this.funcList = [];
        this.wait();
    }
    wait(waitTotal) {
        waitTotal = waitTotal || 0;
        debug("Check the document is ready.");
        if("document" in GLOBAL) {
            debug("The document is available.");
            if(document.readyState === "complete" ||
                (document.readyState !== "loading" &&
                !document.documentElement.doScroll))
            {
                debug("The DOMContentLoaded event was already fired.");
                this.runAllFunc();
                this.waiting = false;
            } else {
                debug("Listen DOMContentLoaded event.");
                document.addEventListener(
                    "DOMContentLoaded", () => {
                        debug("Handle the DOMContentLoaded.");
                        this.runAllFunc();
                        this.waiting = false;
                    });
            }
        } else if(waitTotal < WaitTimeout) {
            debug("The document is not available.");
            setTimeout(() => {
                this.wait(waitTotal + WaitTime);
            }, WaitTime);
        } else {
            console.error("DocumentReady timeout");
            this.runAllFunc();
            this.waiting = false;
        }
    }
    runAllFunc() {
        debug("Run all the saved DocumentReady functions");
        this.funcList.forEach(func => {
            DocWatcher.exec(func);
        });
        this.funcList.length = 0;// clear array
    }
    ready(func) {
        if(this.waiting) {
            debug("Save a DocumentReady function to run later");
            this.funcList.push(func);
        } else {
            debug("Run a DocumentReady function immediate");
            DocWatcher.exec(func);
        }
    }
    static exec(func) {
        try {
            debug("Run a DocumentReady function." + func);
            func();
        } catch(err) {
            console.error(err.message);
            console.error(err.stack);
        }
    }
}

const docWatcher = new DocWatcher();

function DocumentReady(func) {
    docWatcher.ready(func);
}

try {
    module.exports = DocumentReady;
} catch (err) {
    GLOBAL.DocumentReady = DocumentReady;
}
},{"debug":3}],3:[function(require,module,exports){
(function (process){
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = require('./common')(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};

}).call(this,require('_process'))
},{"./common":4,"_process":6}],4:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;

},{"ms":5}],5:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
