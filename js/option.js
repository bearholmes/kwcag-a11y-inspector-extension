/*jshint browser: true */
/*global chrome */

var $ = function() {
    return document.getElementById(arguments[0]);
};

function loadEvent() {
    chrome.storage.local.get('monitors', function(result) {
        var monitors = result.monitors;
        if (monitors) {
            $(monitors).selected = true;
        }
    });
    chrome.storage.local.get('resolutions', function(result) {
        var resolutions = result.resolutions;
        if (resolutions) {
            $(resolutions).selected = true;
        }
    });
    chrome.storage.local.get('ccshow', function(result) {
        var ccshow = result.ccshow;

        if (ccshow == 1) {
            $("ccShowOn").checked  = true;
        } else {
        	  $("ccShowOff").checked  = true;
        }
    });
    chrome.storage.local.get('linkmode', function(result) {
        var linkmode = result.linkmode;

        if (linkmode == 1) {
            $("linkModeOn").checked  = true;
        } else {
          	$("linkModeOff").checked  = true;
        }
    });
    chrome.storage.local.get('bgmode', function(result) {
        var bgmode = result.bgmode;

        if (bgmode == 1) {
            $("bgModeOn").checked  = true;
        } else {
          	$("bgModeOff").checked  = true;
        }
    });
    chrome.storage.local.get('linetype', function(result) {
        var linetype = result.linetype;

        if (linetype == "solid") {
            $("linetype1").checked  = true;
        } else if (linetype == "dashed") {
            $("linetype2").checked  = true;
        } else if (linetype == "dotted") {
            $("linetype3").checked  = true;
        }
    });
    chrome.storage.local.get('colortype', function(result) {
        var colortype = result.colortype;
        $("colorType").value  = colortype;
    });
    chrome.storage.local.get('trackingmode', function(result) {
        var trackingmode = result.trackingmode;

        if (trackingmode == "true") {
            $("trackingModeOn").checked  = true;
        } else {
            $("trackingModeOff").checked  = true;
        }
    });
    chrome.storage.local.get('bordersize', function(result) {
        var bordersize = result.bordersize;
        $("bordersize").value = bordersize;
    });
}

function resRegEvent() {
    var monitor = $("moniStd").value;
    var resolution = $("resStd").value;

    var cc_sw = 0;
    if ($("ccShowOn").checked) cc_sw = 1;

    var lm_sw = 0;
    if ($("linkModeOn").checked) lm_sw = 1;

    var bg_sw = false;
    if ($("bgModeOn").checked) bg_sw = true;

    var linetype = "dashed";
    if($("linetype1").checked){
      linetype = "solid";
    } else if ($("linetype2").checked){
      linetype = "dashed";
    } else if ($("linetype3").checked){
      linetype = "dotted";
    }
    var colortype = $("colorType").value;
    
    var trackingmode = false;
    if($("trackingModeOn").checked) trackingmode = true;

    var bordersize = $("bordersize").value;

    chrome.storage.local.set({
        'monitors': monitor,
        'resolutions': resolution,
        'ccshow': cc_sw,
        'linkmode': lm_sw,
        'bgmode': bg_sw,
        'linetype': linetype,
        'colortype': colortype,
        'trackingmode': trackingmode,
        'bordersize' : bordersize
    });

    $("resStatus").innerText = "저장완료!";
    setTimeout(function(){
      $("resStatus").innerText ="";
    }, 8000);
}

window.addEventListener('DOMContentLoaded', function() {
    $("resBtn").addEventListener('click', resRegEvent, false);
    loadEvent();
});
