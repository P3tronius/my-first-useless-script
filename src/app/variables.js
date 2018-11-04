export var consoleElt;

export var rollsAvg10Value;
var rollsAvg10Elt;
export var rollsAvg5Value;
var rollsAvg5Elt;
export var rollUnderValue;
var rollUnderElt;
export var betAmountValue;
var betAmountElt;
export var looseStatusValue;
var looseStatusElt;
export var nbLossesValue = 0;
var nbLossesElt;
export var nbWinsValue = 0;
var nbWinsElt;
export var winLossValue = 0;
var winLossValueElt;

export var started;
var startStopElt;

export var lastRolls = [];
export var rollsAverage = 0;

export var initSubject = new Rx.Subject();

export var onRollUnderChangedSubject = new Rx.Subject();
export var onBetAmountChangedSubject = new Rx.Subject();

// GETTERS AND SETTERS

export function setStartStopElt (value) {
    startStopElt = value;
}
export function startOrStopCashMachine (value) {
    var state;
    if (value === false || value === true) {
        started = value;
    } else {
        started = !started;
    }
    startStopElt.removeClass("started").removeClass("stopped");
    startStopElt.addClass(started ? "started" : "stopped");
    $(".start-stop .value").text(started ? "STOP" : "START");
}

export function setBetAmountElt (value) {
    betAmountElt = value;
}
export function setBetAmountValue (value) {
    betAmountValue = value;
    betAmountElt.text(betAmountValue);
}

export function setRollUnderElt (value) {
    rollUnderElt = value;
}
export function setRollUnderValue (value) {
    rollUnderValue = value;
    rollUnderElt.text(rollUnderValue);
}

export function setWinLossElt (value) {
    winLossValueElt = value;
    winLossValueElt.text(0);
}
export function addWinLossAmount (value) {
    winLossValue = Math.round((winLossValue + value) * 100) / 100;
    winLossValueElt.text(winLossValue);
}

export function setLooseStatusElt (value) {
    looseStatusElt = value;
}
export function setLooseStatusValue (value) {
    looseStatusValue = value;
    looseStatusElt.text(looseStatusValue);
}

export function setRollsAvg5Elt (value) {
    rollsAvg5Elt = value;
}
export function setRollsAvg5Value (value) {
    rollsAvg5Value = Math.round(value * 100) / 100;
    rollsAvg5Elt.text(rollsAvg5Value);
}

export function setRollsAvg10Elt (value) {
    rollsAvg10Elt = value;
}
export function setRollsAvg10Value (value) {
    rollsAvg10Value = Math.round(value * 100) / 100;
    rollsAvg10Elt.text(rollsAvg10Value);
}

export function setNbLossesElt (value) {
    nbLossesElt = value;
    nbLossesElt.text(0);
}
export function incrementNbLossesValue () {
    nbLossesValue++;
    nbLossesElt.text(nbLossesValue);
}

export function setNbWinsElt (value) {
    nbWinsElt = value;
    nbWinsElt.text(0);
}
export function incrementNbWinsValue () {
    nbWinsValue++;
    nbWinsElt.text(nbWinsValue);
}

export function setConsoleElt (value) {
    consoleElt = value;
}
