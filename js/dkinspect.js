/*!
 * BASE on CSSViewer, CSSViewer 기반으로 작성되었습니다.
 * CSSViewer, A Google Chrome Extension for fellow web developers, web designers, and hobbyists.
 *
 * https://github.com/miled/cssviewer
 * https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce
 *
 * Copyright (c) 2006, 2008 Nicolas Huon
 *
 * This source code is licensed under the GNU General Public License,
 * Version 2. See the file COPYING for more details.
 */
var opt = {};
chrome.storage.local.get("ccshow", function(cba) {
chrome.storage.local.get("resolutions", function(cbb) {
chrome.storage.local.get("monitors", function(cbc) {
chrome.storage.local.get("linkmode", function(cbd) {
chrome.storage.local.get("bgmode", function(cbe) {
chrome.storage.local.get("linetype", function(cbf) {
chrome.storage.local.get("colortype", function(cbg) {
chrome.storage.local.get("trackingmode", function(cbh) {
chrome.storage.local.get("bordersize", function(cbi) {
	
    var std_res = cbb.resolutions.split("x");
    var diagonal = Math.sqrt(Math.pow(parseInt(std_res[0]), 2) + Math.pow(parseInt(std_res[1]), 2)).toFixed(2);
    var std_px = 25.4 / (diagonal / cbc.monitors); // mm 기준

    opt["ccshow"] = cba.ccshow;
    opt["stdpx"] = std_px;
    opt["linkmode"] = cbd.linkmode;
    opt["bgmode"] = cbe.bgmode;
    opt["linetype"] = cbf.linetype;
    opt["colortype"] = "#"+cbg.colortype;
    opt["trackingmode"] = cbh.trackingmode;
    opt["bordersize"] = cbi.bordersize ? cbi.bordersize : 2;


    // CSS Properties
    var dkInspect_pColorBg = new Array(
        "color",
        "background-color",
        "contrast"
    );

    var dkInspect_pLength = new Array(
        "h",
        "w",
        "diagonal"
    );

    var dkInspect_pBox = new Array(
        "height",
        "width",
        "border",
        "border-top",
        "border-right",
        "border-bottom",
        "border-left",
        "margin",
        "padding",
        "max-height",
        "min-height",
        "max-width",
        "min-width"
    );

    // CSS Property categories
    var dkInspect_categories = {
        "pLength": dkInspect_pLength,
        "pBox": dkInspect_pBox,
        "pColorBg": dkInspect_pColorBg
    };

    var dkInspect_categoriesTitle = {
        "pLength": "Length",
        "pBox": "Box",
        "pColorBg": "Color Contrast"
    };

    // Hexadecimal
    var dkInspect_hexa = new Array(
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"
    );

    /*
     ** Utils
     */

    function GetCurrentDocument() {
        return window.document;
    }

    function DecToHex(nb) {
        var nbHexa = "";

        nbHexa += dkInspect_hexa[Math.floor(nb / 16)];
        nb = nb % 16;
        nbHexa += dkInspect_hexa[nb];

        return nbHexa;
    }

    function RGBToHex(str) {
        var start = str.search(/\(/) + 1;
        var end = str.search(/\)/);

        str = str.slice(start, end);

        var hexValues = str.split(", ");
        var hexStr = "#";

        for (var i = 0; i < hexValues.length; i++) {
            hexStr += DecToHex(hexValues[i]);
        }

        if (hexStr == "#00000000") {
            hexStr = "#FFFFFF";
        }

        hexStr = "<span style='border: 1px solid #000000 !important;width: 8px !important;height: 8px !important;display: inline-block !important;background-color:" + hexStr + " !important;'></span> " + hexStr;

        return hexStr;
    }

    function RGBToHexStr(str) {
        var start = str.search(/\(/) + 1;
        var end = str.search(/\)/);

        str = str.slice(start, end);

        var hexValues = str.split(", ");
        var hexStr = "";

        for (var i = 0; i < hexValues.length; i++) {
            hexStr += DecToHex(hexValues[i]);
        }

        if (hexStr == "00000000") {
            hexStr = "FFFFFF";
        }

        return hexStr;
    }

    function RemoveExtraFloat(nb) {
        nb = nb.substr(0, nb.length - 2);

        return Math.round(nb) + "px";
    }

    function getL(color) {
        if (color.length == 3) {
            var R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
            var G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
            var B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
            update = true;
        } else if (color.length == 6) {
            var R = getsRGB(color.substring(0, 2));
            var G = getsRGB(color.substring(2, 4));
            var B = getsRGB(color.substring(4, 6));
            update = true;
        } else {
            update = false;
        }
        if (update == true) {
            var L = (0.2126 * R + 0.7152 * G + 0.0722 * B);
            return L;
        } else {
            return false;
        }

    }

    function getRGB(color) {
        try {
            var color = parseInt(color, 16);
        } catch (err) {
            var color = false;
        }
        return color;
    }

    function getsRGB(color) {
        color = getRGB(color);
        if (color !== false) {
            color = color / 255;
            color = (color <= 0.03928) ? color / 12.92 : Math.pow(((color + 0.055) / 1.055), 2.4);
            return color;
        } else {
            return false;
        }
    }
    /*
     * CSSFunc
     */

    function GetCSSProperty(element, property) {
        return element.getPropertyValue(property);
    }

    function SetCSSProperty(element, property) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_" + property);

        li.lastChild.innerHTML = " : " + element.getPropertyValue(property);
    }

    function SetCSSPropertyIf(element, property, condition) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_" + property);

        if (condition) {
            li.lastChild.innerHTML = " : " + element.getPropertyValue(property);
            li.style.display = "block";

            return 1;
        } else {
            li.style.display = "none";

            return 0;
        }
    }

    function getLeft(e) {
    //  console.log(this);
        var boundingRect = e.getBoundingClientRect(),
            left = boundingRect.left || 0,
            documentOffsetLeft = document.body.ownerDocument.defaultView.pageXOffset,
            offsetLeft = document.body.getBoundingClientRect().left + window.pageXOffset - document.documentElement.clientLeft;
        return left + documentOffsetLeft - offsetLeft
    }

    function getTop(e) {
        var boundingRect = e.getBoundingClientRect(),
            top = boundingRect.top || 0,
            documentOffsetTop = document.body.ownerDocument.defaultView.pageYOffset,
            offsetTop = document.body.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop;
        return top + documentOffsetTop - offsetTop
    }

    function getWidth(e) {
        var boundingRect = e.getBoundingClientRect();
        return boundingRect.width || 0
    }

    function getHeight(e) {
        var boundingRect = e.getBoundingClientRect();
        return boundingRect.height || 0
    }

    function SetCSSDiagonal(element, opt, e, w_condition, h_condition) {
        var document = GetCurrentDocument();
        var li_h = document.getElementById("dkInspect_h");
        var li_w = document.getElementById("dkInspect_w");
        var li_d = document.getElementById("dkInspect_diagonal");

        var h_px, w_px, std_px = opt.stdpx;
        if (w_condition && h_condition) {
            h_px = (parseFloat(element.getPropertyValue("height")) + parseFloat(element.getPropertyValue("padding-top")) + parseFloat(element.getPropertyValue("padding-bottom")) + parseFloat(element.getPropertyValue("border-top")) + parseFloat(element.getPropertyValue("border-bottom"))).toFixed(1);
            w_px = (parseFloat(element.getPropertyValue("width")) + parseFloat(element.getPropertyValue("padding-left")) + parseFloat(element.getPropertyValue("padding-right"))+ parseFloat(element.getPropertyValue("border-left")) + parseFloat(element.getPropertyValue("border-right"))).toFixed(1);
        } else {
            h_px = getWidth(e).toFixed(1);
            w_px = getHeight(e).toFixed(1);
        }

        if (h_px && w_px) {
            var h = (h_px * std_px).toFixed(1);
            var w = (w_px * std_px).toFixed(1);
            var d = (Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))).toFixed(1);
            var d_px = (Math.sqrt(Math.pow(h_px, 2) + Math.pow(w_px, 2))).toFixed(1);

            li_h.lastChild.innerHTML = " : " + h + "mm" + " (" + h_px + "px)";
            li_w.lastChild.innerHTML = " : " + w + "mm" + " (" + w_px + "px)";
            li_d.lastChild.innerHTML = " : " + d + "mm" + " (" + d_px + "px)";

            li_h.style.display = "block";
            li_w.style.display = "block";
            li_d.style.display = "block";

            return 1;
        } else {
            li_d.style.display = "none";
            return 0;
        }
    }

    function SetCSSColorContrast(element, condition) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_contrast");

        var foreground_color = RGBToHexStr(GetCSSProperty(element, "color"));
        var background_color = RGBToHexStr(GetCSSProperty(element, "background-color"));

        var L1 = getL(foreground_color);
        var L2 = getL(background_color);

        var ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

        if (condition) {
            li.lastChild.innerHTML = " : " + (Math.round(ratio * 100) / 100) + ":1";
            li.style.display = "block";
            return 1;
        } else {
            li.style.display = "none";
            return 0;
        }
    }

    function SetCSSPropertyValue(element, property, value) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_" + property);

        li.lastChild.innerHTML = " : " + value;
        li.style.display = "block";
    }

    function SetCSSPropertyValueIf(element, property, value, condition) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_" + property);

        if (condition) {
            li.lastChild.innerHTML = " : " + value;
            li.style.display = "block";

            return 1;
        } else {
            li.style.display = "none";

            return 0;
        }
    }

    function HideCSSProperty(property) {
        var document = GetCurrentDocument();
        var li = document.getElementById("dkInspect_" + property);

        li.style.display = "none";
    }

    function HideCSSCategory(category) {
        var document = GetCurrentDocument();
        var div = document.getElementById("dkInspect_" + category);

        div.style.display = "none";
    }

    function ShowCSSCategory(category) {
        var document = GetCurrentDocument();
        var div = document.getElementById("dkInspect_" + category);

        div.style.display = "block";
    }

    function UpdateColorBg(element) {
        // Color
        SetCSSPropertyValue(element, "color", RGBToHex(GetCSSProperty(element, "color")));
        // Background
        SetCSSPropertyValueIf(element, "background-color", RGBToHex(GetCSSProperty(element, "background-color")), GetCSSProperty(element, "background-color") != "transparent");
        //contrast
        SetCSSColorContrast(element, GetCSSProperty(element, "background-color") != "transparent");
    }

    function UpdateLength(element, opt, e) {
        SetCSSDiagonal(element, opt, e, RemoveExtraFloat(GetCSSProperty(element, "height")) != "NaNpx", RemoveExtraFloat(GetCSSProperty(element, "width")) != "NaNpx");
    }

    function UpdateBox(element) {
        // Width/Height
        SetCSSPropertyIf(element, "height", RemoveExtraFloat(GetCSSProperty(element, "height")) != "auto");
        SetCSSPropertyIf(element, "width", RemoveExtraFloat(GetCSSProperty(element, "width")) != "auto");

        // Border
        var borderTop = RemoveExtraFloat(GetCSSProperty(element, "border-top-width")) + " " + GetCSSProperty(element, "border-top-style") + " " + RGBToHex(GetCSSProperty(element, "border-top-color"));
        var borderBottom = RemoveExtraFloat(GetCSSProperty(element, "border-bottom-width")) + " " + GetCSSProperty(element, "border-bottom-style") + " " + RGBToHex(GetCSSProperty(element, "border-bottom-color"));
        var borderRight = RemoveExtraFloat(GetCSSProperty(element, "border-right-width")) + " " + GetCSSProperty(element, "border-right-style") + " " + RGBToHex(GetCSSProperty(element, "border-right-color"));
        var borderLeft = RemoveExtraFloat(GetCSSProperty(element, "border-left-width")) + " " + GetCSSProperty(element, "border-left-style") + " " + RGBToHex(GetCSSProperty(element, "border-left-color"));

        if (borderTop == borderBottom && borderBottom == borderRight && borderRight == borderLeft && GetCSSProperty(element, "border-top-style") != "none") {
            SetCSSPropertyValue(element, "border", borderTop);

            HideCSSProperty("border-top");
            HideCSSProperty("border-bottom");
            HideCSSProperty("border-right");
            HideCSSProperty("border-left");
        } else {
            SetCSSPropertyValueIf(element, "border-top", borderTop, GetCSSProperty(element, "border-top-style") != "none");
            SetCSSPropertyValueIf(element, "border-bottom", borderBottom, GetCSSProperty(element, "border-bottom-style") != "none");
            SetCSSPropertyValueIf(element, "border-right", borderRight, GetCSSProperty(element, "border-right-style") != "none");
            SetCSSPropertyValueIf(element, "border-left", borderLeft, GetCSSProperty(element, "border-left-style") != "none");

            HideCSSProperty("border");
        }

        // Margin
        var marginTop = RemoveExtraFloat(GetCSSProperty(element, "margin-top"));
        var marginBottom = RemoveExtraFloat(GetCSSProperty(element, "margin-bottom"));
        var marginRight = RemoveExtraFloat(GetCSSProperty(element, "margin-right"));
        var marginLeft = RemoveExtraFloat(GetCSSProperty(element, "margin-left"));
        var margin = (marginTop == "0px" ? "0" : marginTop) + " " + (marginRight == "0px" ? "0" : marginRight) + " " + (marginBottom == "0px" ? "0" : marginBottom) + " " + (marginLeft == "0px" ? "0" : marginLeft);

        SetCSSPropertyValueIf(element, "margin", margin, margin != "0 0 0 0");

        // padding
        var paddingTop = RemoveExtraFloat(GetCSSProperty(element, "padding-top"));
        var paddingBottom = RemoveExtraFloat(GetCSSProperty(element, "padding-bottom"));
        var paddingRight = RemoveExtraFloat(GetCSSProperty(element, "padding-right"));
        var paddingLeft = RemoveExtraFloat(GetCSSProperty(element, "padding-left"));
        var padding = (paddingTop == "0px" ? "0" : paddingTop) + " " + (paddingRight == "0px" ? "0" : paddingRight) + " " + (paddingBottom == "0px" ? "0" : paddingBottom) + " " + (paddingLeft == "0px" ? "0" : paddingLeft);

        SetCSSPropertyValueIf(element, "padding", padding, padding != "0 0 0 0");

        // Max/Min Width/Height
        SetCSSPropertyIf(element, "min-height", GetCSSProperty(element, "min-height") != "0px");
        SetCSSPropertyIf(element, "max-height", GetCSSProperty(element, "max-height") != "none");
        SetCSSPropertyIf(element, "min-width", GetCSSProperty(element, "min-width") != "0px");
        SetCSSPropertyIf(element, "max-width", GetCSSProperty(element, "max-width") != "none");
    }

    /*
     ** Event Handlers
     */

    function dkInspectMouseOver(e) {
        // Block
        var document = GetCurrentDocument();
        var block = document.getElementById("dkInspect_block");
        var trackingEl = document.getElementById("dkInspect_tracking");

        if (!block) {
            return;
        }
        if (this.tagName.toLowerCase() != "body") {
        	if(opt.trackingmode){
                if (e.target.id !== "dkInspect_tracking"){
                    // Outline element
                    trackingEl.style.width = parseInt(getWidth(this)) + "px";
                    trackingEl.style.height = parseInt(getHeight(this)) + "px";

                    trackingEl.style.left = parseInt(getLeft(this)) + "px";
                    trackingEl.style.top = parseInt(getTop(this)) + "px";
                    trackingEl.style.display = "block";
                }
        	}else{
        		 this.style.setProperty("outline-width", opt.bordersize + "px", "important");
                 this.style.setProperty("outline-color", opt.colortype, "important");
                 this.style.setProperty("outline-style", opt.linetype, "important");
                 this.style.setProperty("outline-offset", "-" + opt.bordersize + "px", "important");
            }
        }

        if(opt.trackingmode){
            if (this.id !== "dkInspect_tracking") {
                if (this.tagName.toLowerCase() == "a" || this.tagName.toLowerCase() == "button" || this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "area") {
                    var tit = "&lt;" + this.tagName;
                    if (this.type) {
                        tit += " [" + this.type + "]";
                    }
                    tit += "&gt;" + (this.id == "" ? "" : " #" + this.id) + (this.className == "" ? "" : " ." + this.className);
                    block.firstChild.innerHTML = tit;

                    // Updating CSS properties
                    var element = document.defaultView.getComputedStyle(this, null);
                    UpdateLength(element, opt, this);
                    UpdateBox(element);

                    if (opt.ccshow == 1) {
                        UpdateColorBg(element);
                    } else {
                        HideCSSCategory("pColorBg");
                    }

                    block.style.display = "block";
                } else {
                    block.style.display = "none";
                }

                if(this.parentElement.nodeName.toLowerCase() === "a" || this.parentElement.nodeName.toLowerCase() == "button" || this.parentElement.nodeName.toLowerCase() == "input"){
                    var tit = "&lt;" + this.parentElement.nodeName;
                    if (this.parentElement.type) {
                        tit += " [" + this.parentElement.type + "]";
                    }
                    tit += "&gt;" + (this.parentElement.id == "" ? "" : " #" + this.parentElement.id) + (this.parentElement.className == "" ? "" : " ." + this.parentElement.className);
                    block.firstChild.innerHTML = tit;

                    // Updating CSS properties
                    var element = document.defaultView.getComputedStyle(this.parentElement, null);
                    UpdateLength(element, opt, this.parentElement);
                    UpdateBox(element);

                    if (opt.ccshow == 1) {
                        UpdateColorBg(element);
                    } else {
                        HideCSSCategory("pColorBg");
                    }
                    block.style.display = "block";
                    trackingEl.style.display = "block";
                }
            }
            
        } else if (opt.linkmode == 1) {
            if (this.tagName.toLowerCase() == "a" || this.tagName.toLowerCase() == "button" || this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "area") {
                var tit = "&lt;" + this.tagName;
                if (this.type) {
                    tit += " [" + this.type + "]";
                }
                tit += "&gt;" + (this.id == "" ? "" : " #" + this.id) + (this.className == "" ? "" : " ." + this.className);
                block.firstChild.innerHTML = tit;

                // Updating CSS properties
                var element = document.defaultView.getComputedStyle(this, null);
                UpdateLength(element, opt, this);
                UpdateBox(element);

                if (opt.ccshow == 1) {
                    UpdateColorBg(element);
                } else {
                    HideCSSCategory("pColorBg");
                }

                block.style.display = "block";
            } else if (this.parentElement.nodeName.toLowerCase() === "a" || this.parentElement.nodeName.toLowerCase() == "button" || this.parentElement.nodeName.toLowerCase() == "input"){
                var tit = "&lt;" + this.parentElement.nodeName;
                if (this.parentElement.type) {
                    tit += " [" + this.parentElement.type + "]";
                }
                tit += "&gt;" + (this.parentElement.id == "" ? "" : " #" + this.parentElement.id) + (this.parentElement.className == "" ? "" : " ." + this.parentElement.className);
                block.firstChild.innerHTML = tit;

                // Updating CSS properties
                var element = document.defaultView.getComputedStyle(this.parentElement, null);
                UpdateLength(element, opt, this.parentElement);
                UpdateBox(element);

                if (opt.ccshow == 1) {
                    UpdateColorBg(element);
                } else {
                    HideCSSCategory("pColorBg");
                }
                block.style.display = "block";
            } else {
                block.style.display = "none";
            }
        } else {
            var tit = "&lt;" + this.tagName;
            if (this.type) {
                tit += " [" + this.type + "]";
                }
                tit += "&gt;" + (this.id == "" ? "" : " #" + this.id) + (this.className == "" ? "" : " ." + this.className);
                block.firstChild.innerHTML = tit;

                // Updating CSS properties
                var element = document.defaultView.getComputedStyle(this, null);
                UpdateLength(element, opt, this);
                UpdateBox(element);

                if (opt.ccshow == 1) {
                    UpdateColorBg(element);
                } else {
                    HideCSSCategory("pColorBg");
                }
            block.style.display = "block";
        }
        
        dkInspectRemoveElement("dkInspectInsertMessage");
        e.stopPropagation();
    }

    function dkInspectMouseOut(e) {
    	if(opt.trackingmode){
            var trackingEl = document.getElementById("dkInspect_tracking");
             if (this.id === "dkInspect_tracking") {
               trackingEl.style.display = "block";
            } else {
               if(trackingEl) trackingEl.style.display = "none";
            }
    	} else {
    		this.style.outlineWidth = '';
	        this.style.outlineColor = '';
	        this.style.outlineStyle = '';
	        this.style.outlineOffset = '';
    	}
        e.stopPropagation();
    }

    function dkInspectMouseMove(e) {
        var document = GetCurrentDocument();
        var block = document.getElementById("dkInspect_block");
        var trackingEl = document.getElementById("dkInspect_tracking");
        if (!block) {
            return;
        }
        if(opt.trackingmode){ 
            if (this.tagName.toLowerCase() == "a" || this.tagName.toLowerCase() == "button" || this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "area") {
                trackingEl.style.display = "block";
            } else {
                if (this.id === "dkInspect_tracking") {
                    trackingEl.style.display = "block";
                } else if (this.parentElement.nodeName.toLowerCase() === "a" || this.parentElement.nodeName.toLowerCase() == "button" || this.parentElement.nodeName.toLowerCase() == "input") {
                    trackingEl.style.display = "block";
                } else {
                    trackingEl.style.display = "none";
                }                
            }
        } else if (opt.linkmode == 1) {
            if (this.tagName.toLowerCase() == "a" || this.tagName.toLowerCase() == "button" || this.tagName.toLowerCase() == "input" || this.tagName.toLowerCase() == "area") {
                block.style.display = "block";
            } else if (this.parentElement.nodeName.toLowerCase() === "a" || this.parentElement.nodeName.toLowerCase() == "button" || this.parentElement.nodeName.toLowerCase() == "input") {
                block.style.display = "block";
            } else {
                this.style.outlineWidth = '';
                this.style.outlineColor = '';
                this.style.outlineStyle = '';
                this.style.outlineOffset = '';
            }
        } else {
            block.style.display = "block";
        }
        
        
        if(this.tagName.toLowerCase() == "body" || this.tagName.toLowerCase() == "frame"){
        	if(opt.trackingmode) {
                trackingEl.style.display = "none";
            }
        }

        var pageWidth = window.innerWidth;
        var pageHeight = window.innerHeight;
        var blockWidth = 332;
        var blockHeight = document.defaultView.getComputedStyle(block, null).getPropertyValue("height");

        blockHeight = blockHeight.substr(0, blockHeight.length - 2) * 1;

        if ((e.pageX + blockWidth) > pageWidth) {
            if ((e.pageX - blockWidth - 10) > 0)
                block.style.left = e.pageX - blockWidth - 40 + "px";
            else
                block.style.left = 0 + "px";
        } else
            block.style.left = (e.pageX + 20) + "px";

        if ((e.pageY + blockHeight) > pageHeight) {
            if ((e.pageY - blockHeight - 10) > 0)
                block.style.top = e.pageY - blockHeight - 20 + "px";
            else
                block.style.top = 0 + "px";
        } else
            block.style.top = (e.pageY + 20) + "px";

        // adapt block top to screen offset
        inView = dkInspectIsElementInViewport(block);

        if (!inView) block.style.top = (window.pageYOffset + 20) + "px";

        e.stopPropagation();
    }

    function dkInspectIsElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
   

    /*
     * dkInspect Class
     */
    function dkInspect() {
        // Create a block to display informations
        this.CreateBlock = function() {
            var document = GetCurrentDocument();
            var block;

            if (document) {
                // Create a div block
                block = document.createElement("div");
                block.id = "dkInspect_block";

                // Insert a title for CSS selector
                var header = document.createElement("h1");

                header.appendChild(document.createTextNode(""));
                block.appendChild(header);

                // Insert all properties
                var center = document.createElement("div");

                center.id = "dkInspect_center";

                for (var cat in dkInspect_categories) {
                    var div = document.createElement("div");

                    div.id = "dkInspect_" + cat;
                    div.className = "dkInspect_category";

                    var h2 = document.createElement("h2");

                    h2.appendChild(document.createTextNode(dkInspect_categoriesTitle[cat]));

                    var ul = document.createElement("ul");
                    var properties = dkInspect_categories[cat];

                    for (var i = 0; i < properties.length; i++) {
                        var li = document.createElement("li");

                        li.id = "dkInspect_" + properties[i];

                        var spanName = document.createElement("span");

                        spanName.className = "dkInspect_property";

                        var spanValue = document.createElement("span");

                        spanName.appendChild(document.createTextNode(properties[i]));
                        li.appendChild(spanName);
                        li.appendChild(spanValue);
                        ul.appendChild(li);
                    }
                    div.appendChild(h2);
                    div.appendChild(ul);
                    center.appendChild(div);
                }

                block.appendChild(center);

                // Insert a footer
                //var footer = document.createElement("div");
                //footer.id = "dkInspect_footer";
                //footer.appendChild( document.createTextNode("dkInspect 1.6") );
                //block.appendChild(footer);
            }
            dkInspectInsertMessage("이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.");

            return block;
        }

        // Get all elements within the given element
        this.GetAllElements = function(element) {
            var elements = new Array();

            if (element && element.hasChildNodes()) {
                elements.push(element);

                var childs = element.childNodes;

                for (var i = 0; i < childs.length; i++) {
                    if (childs[i].hasChildNodes()) {
                        elements = elements.concat(this.GetAllElements(childs[i]));
                    } else if (childs[i].nodeType == 1) {
                        elements.push(childs[i]);
                    }
                }
            }
            return elements;
        }

        // Add event listeners for all elements in the current document
        this.AddEventListeners = function() {
            var document = GetCurrentDocument();
            var elements = this.GetAllElements(document.body);
            if (window.frames.document.body.nodeName == "FRAMESET"){
              	 var frameEl =window.frames.document.body.getElementsByTagName('frame')[0].src;
              	 alert("크롬 브라우저에서는 FRAMESET의 진단이 불가능 합니다.");
              	 dkInspectRemoveElement("dkInspectInsertMessage");
              	 return false;
           } else {
	            for (var i = 0; i < elements.length; i++) {
	                elements[i].addEventListener("mouseover", dkInspectMouseOver, false);
	                elements[i].addEventListener("mouseout", dkInspectMouseOut, false);
	                elements[i].addEventListener("mousemove", dkInspectMouseMove, false);
	            }
	
	            if(window.frames.length>0){
	            	for (var k = 0; k < window.frames.length; k++) {
	                       var frameEl = window.frames[k].document.body;
	                       var frameEls = this.GetAllElements(frameEl);
	                  //     console.log(frameEls);
	                       for (var j = 0; j < frameEls.length; j++) {
		                       frameEls[j].addEventListener("mouseover", dkInspectMouseOver, false);
		                       frameEls[j].addEventListener("mouseout", dkInspectMouseOut, false);
		                       frameEls[j].addEventListener("mousemove", dkInspectMouseMove, false);
	                     }
	            	   }
	            }
            }
        }

        // Remove event listeners for all elements in the current document
        this.RemoveEventListeners = function() {
            var document = GetCurrentDocument();
            var elements = this.GetAllElements(document.body);

            for (var i = 0; i < elements.length; i++) {
                elements[i].removeEventListener("mouseover", dkInspectMouseOver, false);
                elements[i].removeEventListener("mouseout", dkInspectMouseOut, false);
                elements[i].removeEventListener("mousemove", dkInspectMouseMove, false);
            }

            if(window.frames.length>0){
              for (var k = 0; k < window.frames.length; k++) {
                var frameEl = window.frames[k].document.body;
                if(frameEl){
                  var frameEls = this.GetAllElements(frameEl);
                    for (var j = 0; j < frameEls.length; j++) {
                      frameEls[j].removeEventListener("mouseover", dkInspectMouseOver, false);
                      frameEls[j].removeEventListener("mouseout", dkInspectMouseOut, false);
                      frameEls[j].removeEventListener("mousemove", dkInspectMouseMove, false);
                    }
                  }
              }
            }
        }
    }
    var tracking = {
            generate: function() {
                var document = GetCurrentDocument();
                var trackingEl;

                if (document) {
                    // Create a div block
                    trackingEl = document.createElement("div");
                    trackingEl.id = "dkInspect_tracking";
                    this.setColor(trackingEl, opt.colortype);
                    trackingEl.style.setProperty("outline-style", opt.linetype, "important");
                }
                return trackingEl;
            },
            setColor: function(e, hex) {
                if (e) {
                    e.style.setProperty("outline-color", hex, "important");
                    if (opt.bgmode) {
                    e.style.setProperty("background-color", this.hexToRGB(hex, .2), "important");
                    }
                }
            },
            hexToRGB: function(hex, alpha) {
                alpha = alpha || 1;
                var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                    return r + r + g + g + b + b
                });
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
                    r = parseInt(result[1], 16),
                    g = parseInt(result[2], 16),
                    b = parseInt(result[3], 16);
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")"
            }
        }
        /*
         * Check if dkInspect is enabled
         */
    dkInspect.prototype.IsEnabled = function() {
        var document = GetCurrentDocument();

        if (document.getElementById("dkInspect_block")) {
            return true;
        }
        return false;
    }

    /*
     * Enable dkInspect
     */
    dkInspect.prototype.Enable = function() {
        var document = GetCurrentDocument();
        var block = document.getElementById("dkInspect_block");

        if (!block) {
            if (!document.getElementsByTagName("BODY")[0]){
              var body = document.createElement("BODY");
              document.documentElement.appendChild(body);
            }
              block = this.CreateBlock();
              document.getElementsByTagName("BODY")[0].appendChild(block);
              
              
              if(opt.trackingmode){
                  trackingEl = tracking.generate();
	              document.getElementsByTagName("BODY")[0].appendChild(trackingEl);
              }
            console.log("enabled dkInspect");
            dkInspect.AddEventListeners();
            return true;
        }

        return false;
    }

    /*
     * Disable dkInspect
     */
    dkInspect.prototype.Disable = function() {
        var document = GetCurrentDocument();
        var block = document.getElementById("dkInspect_block");
        var trackingEl = document.getElementById("dkInspect_tracking");

        if (block) {
	        document.getElementsByTagName("BODY")[0].removeChild(block);
	        if(opt.trackingmode){
	           document.getElementsByTagName("BODY")[0].removeChild(trackingEl);
	        }
          
	        this.RemoveEventListeners();
	        console.log("disabled dkInspect");
	        return true;
        }

        return false;
    }

    /*
     * Display the notification message
     */
    function dkInspectInsertMessage(msg) {
        var oNewP = document.createElement("p");
        var oText = document.createTextNode(msg);

        oNewP.appendChild(oText);
        oNewP.id = "dkInspectInsertMessage";
        oNewP.style.backgroundColor = "#3c77eb";
        oNewP.style.color = "#ffffff";
        oNewP.style.position = "fixed";
        oNewP.style.top = "10px";
        oNewP.style.left = "10px";
        oNewP.style.zIndex = "99999999";
        oNewP.style.padding = "5px";
        oNewP.style.fontSize = "14px";
        oNewP.style.fontWeight = "bold";


        document.getElementsByTagName("BODY")[0].appendChild(oNewP);
    }

    /*
     * Removes and element from the dom, used to remove the notification message
     */
    function dkInspectRemoveElement(divid) {
        var n = document.getElementById(divid);

        if (n) {
            document.getElementsByTagName("BODY")[0].removeChild(n);
        }
    }

    var dkInspectPause = false;
    var shortcut = {
        initialize: function() {
            chrome.extension.sendMessage({
                cmd: "pause"
            }, function(response) {
                window.addEventListener('keyup', function(e) {
                    if (e.which == response) {
                        if (dkInspectPause) {
                            shortcut.resume();
                        } else {
                            shortcut.pause();
                        }
                    }
                }, false);
            });
        },
        pause: function() {
            var document = GetCurrentDocument();
            var block = document.getElementById("dkInspect_block");

            if (block) {
                dkInspect.RemoveEventListeners();
                dkInspectPause = true;
                dkInspectInsertMessage("일시정지");
                setTimeout(function() {
                    dkInspectRemoveElement("dkInspectInsertMessage")
                }, 3000);
                return true;
            }

            return false;
        },
        resume: function() {
            var document = GetCurrentDocument();
            var block = document.getElementById("dkInspect_block");

            if (block) {
                dkInspect.AddEventListeners();
                dkInspectPause = false;
                dkInspectInsertMessage("재개");
                setTimeout(function() {
                    dkInspectRemoveElement("dkInspectInsertMessage")
                }, 3000);
                return true;
            }

            return false;
        }
    };
    /*
     * dkInspect entry-point
     */
    dkInspect = new dkInspect();
    shortcut.initialize();

    if (dkInspect.IsEnabled()) {
        dkInspect.Disable();
    } else {
        dkInspect.Enable();
    }
        
});
});
});
});
});
});
});
});
});