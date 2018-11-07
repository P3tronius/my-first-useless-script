/** */
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://betdice.one/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.5.11/Rx.js
// @require      https://code.jquery.com/jquery.js
// @require      http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @downloadURL  https://raw.githubusercontent.com/Petronious/my-first-useless-script/master/build/bundle.js
// @updateURL   https://raw.githubusercontent.com/Petronious/my-first-useless-script/master/build/bundle.js
// ==/UserScript==

var consoleElt;

var rollsAvg10Value;
var rollsAvg10Elt;
var rollsAvg5Value;
var rollsAvg5Elt;
var rollUnderValue;
var rollUnderElt;
var betAmountValue;
var betAmountElt;
var looseStatusValue;
var looseStatusElt;
var nbLossesValue = 0;
var nbLossesElt;
var nbWinsValue = 0;
var nbWinsElt;
var winLossValue = 0;
var winLossValueElt;

var started = false;
var startStopElt;

var lastRolls = [];
var rollsAverage = 0;
var maxAcceptableLossAmount = 5;
var initialAmount = 0.1;

var initSubject = new Rx.Subject();
var onRollUnderChangedSubject = new Rx.Subject();
var onBetAmountChangedSubject = new Rx.Subject();
var engineStarted = new Rx.Subject(false);
var winLossAmountSubject = new Rx.Subject(undefined);

// GETTERS AND SETTERS

function setStartStopElt (value) {
    startStopElt = value;
}
function startOrStopCashMachine (value) {
    var state;
    if (value === false || value === true) {
        started = value;
    } else {
        started = !started;
    }
    engineStarted.next(started);
    startStopElt.removeClass("started").removeClass("stopped");
    startStopElt.addClass(started ? "started" : "stopped");
    $(".start-stop .value").text(started ? "STOP" : "START");
}

function setBetAmountElt (value) {
    betAmountElt = value;
}
function setBetAmountValue (value) {
    betAmountValue = value;
    betAmountElt.text(betAmountValue);
}

function setRollUnderElt (value) {
    rollUnderElt = value;
}
function setRollUnderValue (value) {
    rollUnderValue = value;
    rollUnderElt.text(rollUnderValue);
}

function setWinLossElt (value) {
    winLossValueElt = value;
    winLossValueElt.text('0 / ' + maxAcceptableLossAmount);
}
function addWinLossAmount (value) {
    var floatValue = parseFloat(value);
    winLossValue = parseFloat((winLossValue + floatValue).toFixed(4));
    winLossValueElt.text(winLossValue + ' / ' + maxAcceptableLossAmount);
    winLossAmountSubject.next(winLossValue);
}

function setLooseStatusElt (value) {
    looseStatusElt = value;
}
function setLooseStatusValue (value) {
    looseStatusValue = value;
    looseStatusElt.text(looseStatusValue);
    looseStatusElt.removeClass("green").removeClass("red");
    if (looseStatusValue < 0) {
        looseStatusElt.addClass("red");
    } else {
        looseStatusElt.addClass("green");
    }
}

function setRollsAvg5Elt (value) {
    rollsAvg5Elt = value;
}
function setRollsAvg5Value (value) {
    rollsAvg5Value = Math.round(value * 100) / 100;
    rollsAvg5Elt.text(rollsAvg5Value);
}

function setRollsAvg10Elt (value) {
    rollsAvg10Elt = value;
}
function setRollsAvg10Value (value) {
    rollsAvg10Value = Math.round(value * 100) / 100;
    rollsAvg10Elt.text(rollsAvg10Value);
}

function setNbLossesElt (value) {
    nbLossesElt = value;
    nbLossesElt.text(0);
}
function incrementNbLossesValue () {
    nbLossesValue++;
    nbLossesElt.text(nbLossesValue);
}

function setNbWinsElt (value) {
    nbWinsElt = value;
    nbWinsElt.text(0);
}
function incrementNbWinsValue () {
    nbWinsValue++;
    nbWinsElt.text(nbWinsValue);
}

function setMaxAcceptableLossAmount (value) {
    var v = value;
    if (value.target) {
        v = parseFloat(value.target.value);
    }
    maxAcceptableLossAmount = v;
    winLossValueElt.text(winLossValue + '/' + maxAcceptableLossAmount);
    winLossAmountSubject.next(winLossValue);
}

function setInitialAmount ($event) {
    if ($event.target) {
        initialAmount = parseFloat($event.target.value);
    }
}

function addNewRollResult(rollResult, isWin) {
    if (lastRolls.length === 10) {
        lastRolls.shift();
    }

    lastRolls.push({roll: rollResult, win: isWin});
    lastRolls.forEach(function (roll, idx) {
        var elt = $($(".roll-result")[idx]);
        elt.text(roll.roll);
        elt.removeClass("win").removeClass("loss");
        if (roll.win) {
            elt.addClass("win");
        } else {
            elt.addClass("loss");
        }
    });
}

function setConsoleElt (value) {
    consoleElt = value;
}

var scripts = "<link href=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/le-frog/jquery-ui.min.css\" rel=\"stylesheet\" type=\"text/css\">\r\n<script src=\"https://canvasjs.com/assets/script/canvasjs.min.js\"></script>";

var css = "<style type=\"text/css\">\r\n    .cashmachine-wrapper { padding: 0 !important; color: #67c23a; font-size: 12px; line-height: 1; background-color: #1c233f; width: 510px; overflow: scroll; height: 100px;}\r\n    .console-text {  max-height: 160px; height: 160px; overflow-y: auto; }\r\n    .console-text p { margin: 0; padding: 0; color: green; }\r\n    .test-btn { float: right; margin-right: 20px; }\r\n    .avg-value { color: black; font-size: 16px; padding-left: 10px; }\r\n    .ui-dialog-titlebar { padding: 3px !important; line-height: 0.6; }\r\n    .ui-dialog-title { font-size: 10px; padding: 0; margin: 0; height: 7px; overflow: initial !important; }\r\n    .ui-button-icon-only.ui-dialog-titlebar-close { height: 11px; width: 11px; top: 10px; }\r\n    .ui-widget-content { border: 1px solid #41455d; background: #1c233f; color: #ffffff; }\r\n    #chartContainer { height: 170px; padding: 0; }\r\n\r\n    .start-stop {\r\n        cursor: pointer;\r\n    }\r\n    .start-stop.started {\r\n        background-color: green;\r\n    }\r\n    .start-stop.stopped {\r\n        background-color: gray;\r\n    }\r\n\r\n    .monitor {\r\n        padding-left: 1px;\r\n        display: flex;\r\n    }\r\n\r\n    .cell {\r\n        width: 20%;\r\n        height: 50px;\r\n        border: 1px solid brown;\r\n        text-align: center;\r\n        display: grid;\r\n    }\r\n\r\n    .cell .value.red {\r\n        color: red;\r\n    }\r\n\r\n    .cell .value.green {\r\n        color: green;\r\n    }\r\n\r\n\r\n    input.max-loss, input.initial-amount {\r\n        color: black;\r\n        text-align: end;\r\n        width: 50px;\r\n        height: 20px;\r\n    }\r\n\r\n    .inputs {\r\n        padding-bottom: 3px;\r\n        padding-top: 3px;\r\n    }\r\n\r\n    .last-rolls table {\r\n        width: 100%;\r\n        text-align: center;\r\n        height: 20px;\r\n    }\r\n\r\n    .roll-result {\r\n        border: 1px solid antiquewhite;\r\n        color: black;\r\n        width: 10%;\r\n    }\r\n\r\n    .roll-result.empty {\r\n        background-color: darkgray;\r\n    }\r\n    .roll-result.win {\r\n        background-color: green;\r\n    }\r\n    .roll-result.loss {\r\n        background-color: red;\r\n    }\r\n\r\n</style>";

var ui = "<div class=\"cashmachine-wrapper\">\r\n    <div class=\"monitor line1\">\r\n        <div class=\"cell start-stop stopped\">\r\n            <span class=\"header\"></span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell bet-amount\">\r\n            <span class=\"header\">Bet Amount</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell roll-under\">\r\n            <span class=\"header\">Roll Under</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell win-loss\">\r\n            <span class=\"header\">Win/Loss Amount</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell loose-status\">\r\n            <span class=\"header\">Loose Status</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n    </div>\r\n    <div class=\"monitor line2\">\r\n        <div class=\"cell\">\r\n            <input type=\"button\" value=\"Test\" class=\"test-btn\" style=\"width: 100%;\">\r\n        </div>\r\n        <div class=\"cell avg-5\">\r\n            <span class=\"header\">Avg 5</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell avg-10\">\r\n            <span class=\"header\">Avg 10</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell nb-losses\">\r\n            <span class=\"header\">Nb Losses</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n        <div class=\"cell nb-wins\">\r\n            <span class=\"header\">Nb Wins</span>\r\n            <span class=\"value\"></span>\r\n        </div>\r\n    </div>\r\n    <div class=\"inputs\">\r\n        <span>Initial amount:</span>\r\n        <input class=\"initial-amount\" type=\"number\">\r\n        <span>Max loss amount:</span>\r\n        <input class=\"max-loss\" type=\"number\">\r\n    </div>\r\n    <div class=\"console-text\"></div>\r\n    <div class=\"last-rolls\">\r\n        <table>\r\n            <tbody>\r\n                <tr>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                    <td class=\"roll-result empty\"></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n    <div id=\"chartContainer\"></div>\r\n</div>";

function createUI () {
    $("head").append(scripts);
    $("head").append(css);
    $("body").append(ui);

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

    $(".cashmachine-wrapper").dialog(opt).dialog("open");

    // alternative way to position a dialog
    $(".cashmachine-wrapper").parent().css({
        position: "fixed",
        top: "0px",
        right: "110px",
        left: "initial"
    });


    setConsoleElt($(".console-text"));
    setRollsAvg10Elt($(".avg-10 .value"));
    setRollsAvg5Elt($(".avg-5 .value"));
    setBetAmountElt($(".bet-amount .value"));
    setRollUnderElt($(".roll-under .value"));
    setWinLossElt($(".win-loss .value"));
    setLooseStatusElt($(".loose-status .value"));
    setNbLossesElt($(".nb-losses .value"));
    setNbWinsElt($(".nb-wins .value"));
    setStartStopElt($(".start-stop"));

    document.querySelector(".start-stop").addEventListener("click", startOrStopCashMachine);
    document.querySelector(".max-loss").addEventListener("change", setMaxAcceptableLossAmount);
    document.querySelector(".initial-amount").addEventListener("change", setInitialAmount);

    document.querySelector(".max-loss").value = maxAcceptableLossAmount;
    document.querySelector(".initial-amount").value = initialAmount;

}

function log(text) {
    consoleElt.append("<p>" + text + "</p>");
    consoleElt.scrollTop(consoleElt[0].scrollHeight);
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
    var xCoord = ((rect.width * (value + 0.5)) / 100) + rect.x;
    var clickEvent = new MouseEvent("mousedown", {
        view: window,
        clientX: xCoord
    });
    rollUnderBar.dispatchEvent(clickEvent);
    onRollUnderChangedSubject.next(value);
}

function clickOnRollButton() {
    $(".btn-bar button").click();
}

function recalculateRollAverages() {
    setRollsAvg10Value(lastRolls.map((x) => x.roll).reduce((a, b) => a + b, 0) / lastRolls.length);
    var last5Rolls = lastRolls.slice(Math.max(lastRolls.length - 5, 0));
    setRollsAvg5Value(last5Rolls.map((x) => x.roll).reduce((a, b) => a + b, 0) / last5Rolls.length);
}

function processNewBetResult(rollResult) {
    var win = false;
    if (rollResult >= rollUnderValue) {
        incrementNbLossesValue();
        addWinLossAmount(0 - parseFloat(betAmountValue));
    } else {
        win = true;
        incrementNbWinsValue();
        var winTooltip = $(".notification-comp.success p");
        addWinLossAmount((parseFloat(winTooltip.text().substr(winTooltip.text().indexOf("win ") + 4, 6)) - parseFloat(betAmountValue)).toFixed(4));
    }
    addNewRollResult(parseInt(rollResult), win);
    recalculateRollAverages();
    setLooseStatusValue(recalculateLooseStatus());
}

function recalculateLooseStatus() {
    var total = 0;
    lastRolls.slice().reverse().forEach(function (elt, idx) {
        var res = elt.roll;
        if (res > 70) {
            total += 10 * (idx + 1);
        } else if (res > 50) {
           total += 5 * (idx + 1);
        } else if (res > 25) {
            total -= 5 * (idx + 1);
        } else {
            total -= 10 * (idx + 1);
        }
    });
    return total;
}

function onBodyMutate(mutations, observer) {
    var loginElt = document.querySelector(".user-dashboard");
    if (loginElt) {
        var userNameTag = loginElt.querySelector(".dropdown-toggle.avatar-a");
        if (userNameTag) {
            var userName = userNameTag.children[1].textContent;
            userName = userName.length > 12 ? userName.substr(1, 12) : userName;
            log(`Welcome ${userName} !`);
            setTimeout(function () {
                initSubject.next(true);
            }, 3000);
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
    var rollResultElt = document.querySelector(".leve2-roll em");

    if (rollResultElt) {
        var rollResult = document.querySelector(".leve2-roll em").textContent;
        processNewBetResult(parseInt(rollResult));
    }
}

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
async function startCashMachineAlgo() {

    while (started) {
        await sleep(1000 + Math.floor(Math.random() * Math.floor(1000)));
         if (started) {
            calculateNextBet();
        }
    }

}

function calculateNextBet() {
    placeBet(0.1, 96);

    startOrStopCashMachine(false);
}


function placeBet(amount, rollUnder) {
    log(`Placing next bet: ${amount}@${rollUnder}`);
    moveRollUnderCursorTo(rollUnder);
    changeAmountTo(amount);
    setTimeout(function () {
        log("amount:" + `${document.querySelector(".tokens-icon.first input").value}`);
        clickOnRollButton();
    }, 50);
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
                changeAmountTo(0.1);
                startOrStopCashMachine(false);
                log('Initialization finished');
            }
        });

    onRollUnderChangedSubject.pipe(Rx.operators.debounceTime(500)).subscribe(
        function (value) {
            setRollUnderValue(value);
        }
    );

    onBetAmountChangedSubject.pipe(Rx.operators.auditTime(50)).subscribe(
        function (value) {
            setBetAmountValue(value);
        }
    );

    setLooseStatusValue(0);
    setRollsAvg5Value(0);
    setRollsAvg10Value(0);
}

function testButtonClicked() {
    changeAmountTo(0.5);
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
            wait = false;
        }
    }
}

function addNewValueToChart(value) {
    var dps = chart.options.data[0].dataPoints;
    var newValue = dps[value - 1].y + 1;
    var label = dps[value - 1].label;
    dps[value - 1] = {label: label, y: newValue};
    chart.options.data[0].dataPoints = dps;
    chart.render();
}

function onTableResultsMutate() {
    var rollValue = document.querySelector(".table-list tbody tr td:nth-child(5)").textContent;
    addNewValueToChart(rollValue);
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

function lockEngineInit() {
    winLossAmountSubject.pipe(
         Rx.operators.filter(
             function (amount) {
                 return amount != undefined;
             }
         )
     ).subscribe(function (amount) {
         if (amount > maxAcceptableLossAmount) {
            log("Max loosed amount exceeded, forcing stop.");
            startOrStopCashMachine(false);
         }
     });
}

(function() {
    'use strict';

    createUI();
    createChart();
    waitForGameToInit();

    engineStarted.pipe(
        Rx.operators.filter(
            function (state) {
                return state != undefined;
            }
        )).subscribe(function (state) {
            if (!state) {
                log("Cash Machine algo STOPPED.");
            } else {
                log("Cash Machine algo STARTED.");
                startCashMachineAlgo();
            }
        });

    lockEngineInit();
})();
