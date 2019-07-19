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