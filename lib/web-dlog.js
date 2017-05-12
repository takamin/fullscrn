(function() {
    "use strict";
    var GLOBAL = Function("return this;")();
    var WebDLog = function() { };
    var _logger = {
        "debug" : function() {
            console.log(Array.from(arguments).join(' '));
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
