/** */
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://betdice.one/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.5.11/Rx.js
// @require      https://code.jquery.com/jquery.js
// @require      http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// ==/UserScript==

var consoleElt;
var rollsAvgValue;
var rollsAvgElt;
var rollUnderValue;
var lastRolls = [];
var rollsAverage = 0;

var initSubject = new Rx.Subject();

var onRollUnderChangedSubject = new Rx.Subject();
var onBetAmountChangedSubject = new Rx.Subject();

function setRollUnderValue (value) {
    rollUnderValue = value;
}

function setRollsAvgElt (value) {
    rollsAvgValueElt = value;
}

function setRollsAvgValue (value) {
    rollsAvgValue = value;
}

function setConsoleElt (value) {
    consoleElt = value;
}

var scripts = "<link href=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/le-frog/jquery-ui.min.css\" rel=\"stylesheet\" type=\"text/css\">\r\n<script src=\"https://canvasjs.com/assets/script/canvasjs.min.js\"></script>";

var css = "<style type=\"text/css\">\r\n      .console-wrapper { padding: 0 !important; color: #67c23a; font-size: 12px; line-height: 1; background-color: steelblue; width: 510px; overflow: scroll; height: 100px;}\r\n      .console-text {  max-height: 160px; height: 160px; overflow-y: auto; }\r\n      .console-text p { margin: 0; padding: 0; }\r\n      .test-btn { float: right; margin-right: 20px; }\r\n      .rolls-average { color: #e6a23c; font-size: 12px; line-height: 1; background-color: steelblue; width: 500px;}\r\n      .rolls-avg-title { color: blue; padding-left: 10px; }\r\n      .avg-value { color: black; font-size: 16px; padding-left: 10px; }\r\n      .ui-dialog-titlebar { padding: 3px !important; line-height: 0.6; }\r\n      .ui-dialog-title { font-size: 10px; padding: 0; margin: 0; height: 7px; overflow: initial !important; }\r\n      .ui-button-icon-only.ui-dialog-titlebar-close { height: 11px; width: 11px; top: 10px; }\r\n      .ui-widget-content { border: 1px solid blue; background: steelblue; color: #67c23a; }\r\n      #chartContainer { height: 170px; padding: 0; }\r\n</style>";

var ui = "<div class=\"console-wrapper\">\r\n    <div class=\"console-text\"></div>\r\n    <div class=\"rolls-average\">\r\n        <span class=\"rolls-avg-title\">Last 10 rolls average:</span>\r\n        <span class=\"avg-value\">0</span>\r\n        <input type=\"button\" value=\"Test\" class=\"test-btn\">\r\n    </div>\r\n    <div id=\"chartContainer\"></div>\r\n</div>";

function createUI () {
    $("head").append(scripts);
    $("head").append(css);
    $("body").append(ui);


    setConsoleElt($(".console-text"));
    setRollsAvgElt($(".avg-value"));

    var opt = {
        width:      500,
        minWidth:   400,
        minHeight:  200,
        modal:      false,
        autoOpen:   false,
        resizable: true,
        zIndex:     1,
        title:      'BetDice CashMachine'
    };

    $(".console-wrapper").dialog(opt).dialog("open");

    // alternative way to position a dialog
    $(".console-wrapper").parent().css({
        position: "fixed",
        top: "144px",
        left: "810px"
    });

    var opt = {
        width:      500,
        minWidth:   400,
        minHeight:  200,
        modal:      false,
        autoOpen:   false,
        resizable: false,
        zIndex:     1,
        title:      'Numbers repartion chart'
    };

}

function log(text) {
    consoleElt.append("<p>" + text + "</p>");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function changeAmountTo(value) {
    var inputField = document.querySelector(".tokens-icon.first input");

    var inputEvent = new InputEvent("input", {
        bubbles: true,
        composed: true,
        inputType: "insertText",
    });

    inputField.value = value;
    inputField.dispatchEvent(inputEvent);
}

function moveRollUnderCursorTo(value) {
    var rollUnderBar = document.querySelector(".leve1");
    var rect = rollUnderBar.getBoundingClientRect();
    var xCoord = ((rect.width * value) / 100) + rect.x;
    var clickEvent = new MouseEvent("mousedown", {
        view: window,
        clientX: xCoord
    });
    rollUnderBar.dispatchEvent(clickEvent);
}

function recalculateRollAverage() {
    setRollsAvgValue(lastRolls.reduce((a, b) => a + b, 0) / lastRolls.length);
    rollsAvgElt.text(rollsAvgValue);
}

var userName;

function onBodyMutate(mutations, observer) {
    var loginElt = document.querySelector(".user-dashboard");
    if (loginElt) {
        var userNameTag = loginElt.querySelector(".dropdown-toggle.avatar-a");
        if (userNameTag) {
            var userName = userNameTag.children[1].textContent;
            userName = userName.length > 12 ? userName.substr(1, 12) : userName;
            log(`Welcome ${userName} !`);
            initSubject.next(true);
            observer.disconnect();
        }
    }
}

function onRollUnderMutate(mutations, observer) {
    var rollUnderEtl = document.querySelector(".content.min50");
    if (rollUnderEtl) {
        var value = rollUnderEtl.textContent.trim();
        onRollUnderChangedSubject.next(value);
    }
}

function watchBetAmountChanges() {
    var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    var originalSet = descriptor.set;

    descriptor.set = function(val) {
        onBetAmountChangedSubject.next(val);
        originalSet.apply(this,arguments);
    };

    Object.defineProperty(HTMLInputElement.prototype, "value", descriptor);
}

function onNewRollResult(mutations, observer) {
    var rollResult = document.querySelector(".leve2-roll em").textContent;

    if (lastRolls.length === 10) {
        lastRolls.shift();
    }
    lastRolls.push(parseInt(rollResult));
    recalculateRollAverage();
}

function startCashMachineAlgo() {
    // TODO. ahahah
}

function waitForGameToInit() {
    new MutationObserver(onBodyMutate).observe(document.querySelector("body"), { childList: true });

    initSubject.subscribe(
        function (state) {
            if (state) {
                document.querySelector(".test-btn").addEventListener("click", testButtonClicked);
                new MutationObserver(onRollUnderMutate).observe(document.querySelector(".content.min50"), { subtree: true, characterData: true});
                new MutationObserver(onNewRollResult).observe(document.querySelector(".my-progress > .leve1"), { childList: true, subtree: true });

                watchBetAmountChanges();
                moveRollUnderCursorTo(76);
                changeAmountTo("0.1");
                log('Initialization finished');
                startCashMachineAlgo();
            }
        });

    onRollUnderChangedSubject.pipe(Rx.operators.debounceTime(500)).subscribe(
        function (value) {
            log("Roll Under changed to " + value);
            setRollUnderValue(value);
        }
    );

    onBetAmountChangedSubject.pipe(Rx.operators.auditTime(50)).subscribe(
        function (value) {
            log("Bet Amount changed to " + value);
        }
    );

}

function testButtonClicked() {

}

var chart;

function createChart() {
    setTimeout(function () {
        resetChart();
        new MutationObserver(onTableTabMutate).observe(document.querySelector(".table-list .tabs"), { attributes: true, subtree: true });
    }, 3000);
}

async function resetChart() {
    setupChartPoints();
    var wait = true;
    while (wait) {
        await sleep(500);
        if (document.querySelector(".table-list tbody tr td:nth-child(5)")) {
            new MutationObserver(onTableResultsMutate).observe(document.querySelector(".table-list tbody tr td:nth-child(5)"), { characterData: true, subtree: true, childList: true });
            var rollValue = document.querySelector(".table-list tbody tr td:nth-child(5)").textContent;
            updateChart(rollValue);
            chart.render();
            wait = false;
        }
    }
}

function updateChart(value) {
    var dps = chart.options.data[0].dataPoints;
    var newValue = dps[value - 1].y + 1;
    var label = dps[value - 1].label;
    dps[value - 1] = {label: label, y: newValue};
    chart.options.data[0].dataPoints = dps;
    chart.render();
}

function onTableResultsMutate() {
    var rollValue = document.querySelector(".table-list tbody tr td:nth-child(5)").textContent;
    updateChart(rollValue);
}

function onTableTabMutate() {
    resetChart();
}


function setupChartPoints() {
    chart = new CanvasJS.Chart("chartContainer", {
            theme: "dark1",
            data: [{
                type: "column",
                indexLabel: "{y}",
                dataPoints: [
                    { label: "1", y: 0 },
                    { label: "2", y: 0 },
                    { label: "3", y: 0 },
                    { label: "4", y: 0 },
                    { label: "5", y: 0 },
                    { label: "6", y: 0 },
                    { label: "7", y: 0 },
                    { label: "8", y: 0 },
                    { label: "9", y: 0 },
                    { label: "10", y: 0 },
                    { label: "11", y: 0 },
                    { label: "12", y: 0 },
                    { label: "13", y: 0 },
                    { label: "14", y: 0 },
                    { label: "15", y: 0 },
                    { label: "16", y: 0 },
                    { label: "17", y: 0 },
                    { label: "18", y: 0 },
                    { label: "19", y: 0 },
                    { label: "20", y: 0 },
                    { label: "21", y: 0 },
                    { label: "22", y: 0 },
                    { label: "23", y: 0 },
                    { label: "24", y: 0 },
                    { label: "25", y: 0 },
                    { label: "26", y: 0 },
                    { label: "27", y: 0 },
                    { label: "28", y: 0 },
                    { label: "29", y: 0 },
                    { label: "30", y: 0 },
                    { label: "31", y: 0 },
                    { label: "32", y: 0 },
                    { label: "33", y: 0 },
                    { label: "34", y: 0 },
                    { label: "35", y: 0 },
                    { label: "36", y: 0 },
                    { label: "37", y: 0 },
                    { label: "38", y: 0 },
                    { label: "39", y: 0 },
                    { label: "40", y: 0 },
                    { label: "41", y: 0 },
                    { label: "42", y: 0 },
                    { label: "43", y: 0 },
                    { label: "44", y: 0 },
                    { label: "45", y: 0 },
                    { label: "46", y: 0 },
                    { label: "47", y: 0 },
                    { label: "48", y: 0 },
                    { label: "49", y: 0 },
                    { label: "50", y: 0 },
                    { label: "51", y: 0 },
                    { label: "52", y: 0 },
                    { label: "53", y: 0 },
                    { label: "54", y: 0 },
                    { label: "55", y: 0 },
                    { label: "56", y: 0 },
                    { label: "57", y: 0 },
                    { label: "58", y: 0 },
                    { label: "59", y: 0 },
                    { label: "60", y: 0 },
                    { label: "61", y: 0 },
                    { label: "62", y: 0 },
                    { label: "63", y: 0 },
                    { label: "64", y: 0 },
                    { label: "65", y: 0 },
                    { label: "66", y: 0 },
                    { label: "67", y: 0 },
                    { label: "68", y: 0 },
                    { label: "69", y: 0 },
                    { label: "70", y: 0 },
                    { label: "71", y: 0 },
                    { label: "72", y: 0 },
                    { label: "73", y: 0 },
                    { label: "74", y: 0 },
                    { label: "75", y: 0 },
                    { label: "76", y: 0 },
                    { label: "77", y: 0 },
                    { label: "78", y: 0 },
                    { label: "79", y: 0 },
                    { label: "80", y: 0 },
                    { label: "81", y: 0 },
                    { label: "82", y: 0 },
                    { label: "83", y: 0 },
                    { label: "84", y: 0 },
                    { label: "85", y: 0 },
                    { label: "86", y: 0 },
                    { label: "87", y: 0 },
                    { label: "88", y: 0 },
                    { label: "89", y: 0 },
                    { label: "90", y: 0 },
                    { label: "91", y: 0 },
                    { label: "92", y: 0 },
                    { label: "93", y: 0 },
                    { label: "94", y: 0 },
                    { label: "95", y: 0 },
                    { label: "96", y: 0 },
                    { label: "97", y: 0 },
                    { label: "98", y: 0 },
                    { label: "99", y: 0 },
                    { label: "100", y: 0 }
                ]
            }]
        });
}

(function() {
    'use strict';

    createUI();
    createChart();
    waitForGameToInit();

})();
