(function() {
    "use strict";

    var debug = require("debug")("fullscrn");

    var DocumentReady = function(func) {
        if(waiting) {
            debug("Save a DocumentReady function to run later");
            funcList.push(func);
        } else {
            debug("Run a DocumentReady function immediate");
            exec(func);
        }
    };
    var waiting = true;
    var funcList = [];
    var exec = function(func) {
        try {
            debug("Run a DocumentReady function." + func);
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
            debug("Run all the saved DocumentReady functions");
            funcList.forEach(function(func) {
                exec(func);
            });
            funcList = [];
        };
        var waitDocument = function() {
            debug("Check the document is ready.");
            if("document" in GLOBAL) {
                debug("The document is available.");
                if(document.readyState === "complete" ||
                    (document.readyState !== "loading" &&
                    !document.documentElement.doScroll))
                {
                    debug("The DOMContentLoaded event was already fired.");
                    runAllFunc();
                    waiting = false;
                } else {
                    debug("Listen DOMContentLoaded event.");
                    document.addEventListener(
                        "DOMContentLoaded", function(){
                            debug("Handle the DOMContentLoaded.");
                            runAllFunc();
                            waiting = false;
                        });
                }
            } else if(waitTotal < waitLimit) {
                debug("The document is not available.");
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
