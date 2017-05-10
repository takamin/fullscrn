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
