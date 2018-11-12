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
var maxAcceptableLosedAmount = 5;
var initialAmount = 0.1;

var initSubject = new Rx.Subject();
var onRollUnderChangedSubject = new Rx.Subject();
var onBetAmountChangedSubject = new Rx.Subject();
var onNewBetResultSubject = new Rx.Subject();
var engineStarted = new Rx.BehaviorSubject(false);
var enginePaused = new Rx.BehaviorSubject(false);

var winLossAmountSubject = new Rx.Subject(undefined);

// GETTERS AND SETTERS

function setStartStopElt (value) {
    startStopElt = value;
}
function startOrStopCashMachine (value) {
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
    winLossValueElt.text('0');
}
function addWinLossAmount (value) {
    var floatValue = parseFloat(value);
    winLossValue = parseFloat((winLossValue + floatValue).toFixed(4));
    winLossValueElt.text(winLossValue);
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

function resetLooseStatusValue () {
    looseStatusValue = 0;
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
    maxAcceptableLosedAmount = v;
    winLossValueElt.text(winLossValue + '/' + maxAcceptableLosedAmount);
    winLossAmountSubject.next(winLossValue);
}

function setInitialAmount ($event) {
    if ($event.target) {
        initialAmount = parseFloat($event.target.value);
    }
}

function addNewRollResult(rollResult, isWin) {
    onNewBetResultSubject.next({roll: rollResult, win: isWin});
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
    lastRolls.slice(Math.max(lastRolls.length - 4, 0)).forEach(function (elt, idx) {
        var res = elt.roll;
        if (res > 69) {
            total += 10 * idx;
        } else if (res > 50) {
           total += 5 * idx;
        } else if (res > 25) {
            total -= 5 * idx;
        } else {
            total -= 10 * idx;
        }
    });
    var totalLessThan75 = 0;
    lastRolls.forEach(function (elt) {
        if (elt.roll < 75) {
            totalLessThan75++;
        }
    });

    total += totalLessThan75 * 5;

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

function onRollUnderMutate() {
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

function onNewRollResult() {
    var rollResultElt = document.querySelector(".leve2-roll em");

    if (rollResultElt) {
        var rollResult = document.querySelector(".leve2-roll em").textContent;
        processNewBetResult(parseInt(rollResult));
    }
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

var scripts = "<link href=\"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/le-frog/jquery-ui.min.css\" rel=\"stylesheet\" type=\"text/css\">\n<script src=\"https://canvasjs.com/assets/script/canvasjs.min.js\"></script>";

var css = "<style type=\"text/css\">\n    .cashmachine-wrapper { padding: 0 !important; color: #67c23a; font-size: 12px; line-height: 1; background-color: #1c233f; width: 510px; overflow: scroll; height: 100px;}\n    .console-text {  max-height: 160px; height: 160px; overflow-y: auto; }\n    .console-text p { margin: 0; padding: 0; color: green; }\n    .test-btn { float: right; margin-right: 20px; }\n    .avg-value { color: black; font-size: 16px; padding-left: 10px; }\n    .ui-dialog-titlebar { padding: 3px !important; line-height: 0.6; }\n    .ui-dialog-title { font-size: 10px; padding: 0; margin: 0; height: 7px; overflow: initial !important; }\n    .ui-button-icon-only.ui-dialog-titlebar-close { height: 11px; width: 11px; top: 10px; }\n    .ui-widget-content { border: 1px solid #41455d; background: #1c233f; color: #ffffff; }\n    #chartContainer { height: 170px; padding: 0; }\n\n    .start-stop {\n        cursor: pointer;\n    }\n    .start-stop.started {\n        background-color: green;\n    }\n    .start-stop.stopped {\n        background-color: gray;\n    }\n\n    .monitor {\n        padding-left: 1px;\n        display: flex;\n    }\n\n    .cell {\n        width: 20%;\n        height: 50px;\n        border: 1px solid brown;\n        text-align: center;\n        display: grid;\n    }\n\n    .cell .value.red {\n        color: red;\n    }\n\n    .cell .value.green {\n        color: green;\n    }\n\n\n    input.max-loss, input.initial-amount {\n        color: black;\n        text-align: end;\n        width: 50px;\n        height: 20px;\n    }\n\n    .inputs {\n        padding-bottom: 3px;\n        padding-top: 3px;\n    }\n\n    .last-rolls table {\n        width: 100%;\n        text-align: center;\n        height: 20px;\n    }\n\n    .roll-result {\n        border: 1px solid antiquewhite;\n        color: black;\n        width: 10%;\n    }\n\n    .roll-result.empty {\n        background-color: darkgray;\n    }\n    .roll-result.win {\n        background-color: green;\n    }\n    .roll-result.loss {\n        background-color: red;\n    }\n\n</style>";

var ui = "<div class=\"cashmachine-wrapper\">\n    <div class=\"monitor line1\">\n        <div class=\"cell start-stop stopped\">\n            <span class=\"header\"></span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell bet-amount\">\n            <span class=\"header\">Bet Amount</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell roll-under\">\n            <span class=\"header\">Roll Under</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell win-loss\">\n            <span class=\"header\">Win/Loss Amount</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell loose-status\">\n            <span class=\"header\">Loose Status</span>\n            <span class=\"value\"></span>\n        </div>\n    </div>\n    <div class=\"monitor line2\">\n        <div class=\"cell\">\n            <input type=\"button\" value=\"Test\" class=\"test-btn\" style=\"width: 100%;\">\n        </div>\n        <div class=\"cell avg-5\">\n            <span class=\"header\">Avg 5</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell avg-10\">\n            <span class=\"header\">Avg 10</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell nb-losses\">\n            <span class=\"header\">Nb Losses</span>\n            <span class=\"value\"></span>\n        </div>\n        <div class=\"cell nb-wins\">\n            <span class=\"header\">Nb Wins</span>\n            <span class=\"value\"></span>\n        </div>\n    </div>\n    <div class=\"inputs\">\n        <span>Initial amount:</span>\n        <input class=\"initial-amount\" type=\"number\">\n        <span>Max loss amount:</span>\n        <input class=\"max-loss\" type=\"number\">\n    </div>\n    <div class=\"console-text\"></div>\n    <div class=\"last-rolls\">\n        <table>\n            <tbody>\n                <tr>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                    <td class=\"roll-result empty\"></td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n    <div id=\"chartContainer\"></div>\n</div>";

function createUI () {

    let head = $("head");
    head.append(scripts);
    head.append(css);
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

    let cashmachine = $(".cashmachine-wrapper");
    cashmachine.dialog(opt).dialog("open");

    // alternative way to position a dialog
    cashmachine.parent().css({
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

    document.querySelector(".max-loss").value = maxAcceptableLosedAmount;
    document.querySelector(".initial-amount").value = initialAmount;

}

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
async function startCashMachineAlgo() {

    while (started) {
        if (enginePaused.getValue()) {
            await sleep(5000 + Math.floor(Math.random() * Math.floor(1000)));
            resetLooseStatusValue();
            enginePaused.next(false);
        }

        await sleep(1000 + Math.floor(Math.random() * Math.floor(1000)));
        if (started) {
            await calculateNextBet();
        }
    }

}

function calculateNextBet() {
    var amount = initialAmount;
    var rollUnder = 75;

    if (looseStatusValue > 20) {
        amount += amount;
        rollUnder = 75;
    }

    if (looseStatusValue > 0 && looseStatusValue < 20) {
        amount -= amount * 0.5;
        rollUnder = 75;
    }
    if (looseStatusValue < -20) {
        amount = 0.1;
        rollUnder = 96;
    }
    if (looseStatusValue < 0 && looseStatusValue > -20) {
        amount -= amount * 0.5;
        rollUnder = 75;
    }

    return placeBet(amount, rollUnder);
}


function placeBet(amount, rollUnder) {
    log(`Placing next bet: ${amount}@${rollUnder}`);
    moveRollUnderCursorTo(rollUnder);
    changeAmountTo(amount);
    return runBet();
}

async function runBet() {
    await sleep(50);
    clickOnRollButton();
    await onNewBetResultSubject.take(1).toPromise();
}

function lockEngineInit() {
    winLossAmountSubject.pipe(
         Rx.operators.filter(
             function (amount) {
                 return amount !== undefined;
             }
         )
     ).subscribe(function (amount) {
         if (mustBeLocked(amount)) {
            startOrStopCashMachine(false);
         }
     });

    // if 4 loss in 5 bets, pause
     // TODO: if 5 loss in 7 bets, PAUSE 1 min
     // TODO: if 5 win in a row, PAUSE 1 min ?
}

function mustBeLocked(amount) {
    if (started && amount > maxAcceptableLosedAmount) {
        log("Max losed amount exceeded, forcing stop.");
        return true;
    }
    if (looseStatusValue > 30) {
        log("Too many luck, pausing for a while");
        enginePaused.next(true);
    }
    if (looseStatusValue < -20) {
        log("Too many loose, pausing for a while");
        enginePaused.next(true);
    }
    var nbLosses = 0;
    lastRolls.forEach(function (elt) {
        if (elt.roll > 75) {
            nbLosses++;
        }
    });
    if (nbLosses > 5) {
        log("Too many losses in a row, pausing for a while");
        enginePaused.next(true);
    }
    return false;
}

(function() {
    'use strict';

    createUI();
    createChart();
    waitForGameToInit();

    engineStarted.pipe(
        Rx.operators.filter(
            function (state) {
                return state !== undefined;
            }
        )).subscribe(function (state) {
            if (!state) {
            } else {
                log("Cash Machine algo STARTED.");
                startCashMachineAlgo().then(
                () => {
                    log("Cash Machine algo STOPPED.");
                });
            }
        });

    lockEngineInit();
})();
