/// <reference path="namespace.js" />
/// <reference path="constants.js" />
/// <reference path="../lib/angular.js" />
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }
        for (; from < len; from++) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp */) {
        "use strict";
        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function") {
            throw new TypeError();
        }
        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}
/**
  Utility namespace.
@namespace
*/
ng.utils = {
    /**
        visualLength function. Measures the represented data and returns the width in pixels of how wide it would be. 
        Consumed by the double-click event and configureColumnWidths function to see how wide to set the width of the column.
    @param node - the HTML element which contents will be measured.
    */
    visualLength: function(node) {
        var elem = document.getElementById('testDataLength');
        if (!elem) {
            elem = document.createElement('SPAN');
            elem.id = "testDataLength";
            elem.style.visibility = "hidden";
            document.body.appendChild(elem);
        }
        $(elem).css('font', $(node).css('font'));
        elem.innerHTML = $(node).text();
        return elem.offsetWidth;
    },
    forIn: function(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(obj[prop], prop);
            }
        }
    },
    /**
        evalProperty function. returns the value specified by an arbitrary json object path "node.subNode.value" against the specified object.
    @param entity - object to evaluate.
    @param path - arbitrary json object path
    */
    evalProperty: function(entity, path) {
        var propPath = path.split('.'), i = 0;
        var tempProp = entity[propPath[i]], links = propPath.length;
        i++;
        while (tempProp && i < links) {
            tempProp = tempProp[propPath[i]];
            i++;
        }
        return tempProp;
    },
    endsWith: function(str, suffix) {
        if (!str || !suffix || typeof str != "string") {
            return false;
        }
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    isNullOrUndefined: function(obj) {
        if (obj === undefined || obj === null) {
            return true;
        }
        return false;
    },
    getElementsByClassName: function(cl) {
        var retnode = [];
        var myclass = new RegExp('\\b' + cl + '\\b');
        var elem = document.getElementsByTagName('*');
        for (var i = 0; i < elem.length; i++) {
            var classes = elem[i].className;
            if (myclass.test(classes)) {
                retnode.push(elem[i]);
            }
        }
        return retnode;
    },
    /**
        newId function. returns a new grid id based on the unix timestamp in milliseconds. 
        used for setting the classes and identifying the grid when multiple grids are present
    */
    newId: (function() {
        var seedId = new Date().getTime();
        return function() {
            return seedId += 1;
        };
    })(),
    /**
        seti18n function. sets the i18n compatable labels based on the selected language pack. 
        Specified language pack must be included for it to work.
        @param $scope - current grid $scope
        @param language - the language key (en, fr, zh-cn, etc..)
    */
    seti18n: function($scope, language) {
        var $langPack = window.ngGrid.i18n[language];s
        for (var label in $langPack) {
            $scope.i18n[label] = $langPack[label];
        }
    },
    
    // we copy KO's ie detection here bc it isn't exported in the min versions of KO
    // Detect IE versions for workarounds (uses IE conditionals, not UA string, for robustness) 
    ieVersion: (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');
        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
        iElems[0]);
        return version > 4 ? version : undefined;
    })()
};

$.extend(ng.utils, {
    //IE detection
    isIe: (function() {
        return ng.utils.ieVersion !== undefined;
    })()
});