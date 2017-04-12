(function() {
    "use strict";
    Object.keys(Document.prototype).forEach(function(key) {
        if(key.match(/fullscreen/i)) {
            console.log("Document.prototype." + key);
        }
    });
    Object.keys(Element.prototype).forEach(function(key) {
        if(key.match(/fullscreen/i)) {
            console.log("Element.prototype." + key);
        }
    });

    function getFullscreenElement() {
        if(document.webkitFullscreenElement) {
            return document.webkitFullscreenElement;
        } else if(document.mozFullScrenElement) {
            return document.mozFullScrennElement();
        }
        return null;
    }

    function requestFullscreen(element) {
        if(element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
    }

    function exitFullscreen() {
        if(document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if(document.mozCancelFullScrenn) {
            document.mozCancelFullScrenn();
        }
    }

    module.exports = {
        getFullscreenElement: getFullscreenElement,
        requestFullscreen: requestFullscreen,
        exitFullscreen: exitFullscreen,
    };
}());
