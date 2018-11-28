import * as Utils from "./utils";

export var consoleElt;

export var rollsAvg10Value;
var rollsAvg10Elt;
export var rollsAvg5Value;
var rollsAvg5Elt;
export var rollUnderValue;
var rollUnderElt;
export var betAmountValue;
var betAmountElt;
export var nextBetGuessValue;
var nextBetGuessElt;
export var nbLossesValue = 0;
var nbLossesElt;
export var nbWinsValue = 0;
var nbWinsElt;
export var winLossValue = 0;
var winLossValueElt;

var startStopElt;

export var lastRolls = [];
export var maxAcceptableLosedAmount = 5;
export var initialAmount = 1;
export var maxGainBeforeStopping = 10;
export var initSubject = new Rx.Subject();
export var onRollUnderChangedSubject = new Rx.Subject();
export var onBetAmountChangedSubject = new Rx.Subject();
export var onNewBetResultSubject = new Rx.Subject();
export var engineStarted = new Rx.BehaviorSubject(false);
export var enginePaused = new Rx.BehaviorSubject(0);

export var winLossAmountSubject = new Rx.Subject(undefined);

// GETTERS AND SETTERS

export function setStartStopElt (value) {
    startStopElt = value;
}
export function startOrStopCashMachine (value) {
    var started = engineStarted.getValue();
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
    winLossValueElt.text('0');
}
export function addWinLossAmount (value) {
    var floatValue = parseFloat(value);
    winLossValue = parseFloat((winLossValue + floatValue).toFixed(4));
    winLossValueElt.text(winLossValue);
    winLossAmountSubject.next(winLossValue);
}

export function setNextBetGuessElt (value) {
    nextBetGuessElt = value;
}
export function setLooseStatusValue (value) {
    nextBetGuessValue = value;
    nextBetGuessElt.text(nextBetGuessValue);
    nextBetGuessElt.removeClass("green").removeClass("red");
    if (nextBetGuessValue < 0) {
        nextBetGuessElt.addClass("red");
    } else {
        nextBetGuessElt.addClass("green");
    }
}

export function resetLooseStatusValue () {
    nextBetGuessValue = 0;
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

export function setMaxAcceptableLossAmount (value) {
    var v = value;
    if (value.target) {
        v = parseFloat(value.target.value);
    }
    maxAcceptableLosedAmount = v;
    Utils.log(`Updated maxAcceptableLosedAmount to ${maxAcceptableLosedAmount}`);
}

export function setMaxGainBeforeStopping(value) {
    var v = value;
    if (value.target) {
        v = parseFloat(value.target.value);
    }
    maxGainBeforeStopping = v;
}

export function setInitialAmount ($event) {
    if ($event.target) {
        initialAmount = parseFloat($event.target.value);
        Utils.log(`Initial amount changed to ${initialAmount}`);
    }
}

export function addNewRollResult(rollResult, isWin) {
    onNewBetResultSubject.next({roll: rollResult, win: isWin});
    if (lastRolls.length === 10) {
        lastRolls.shift();
    }

    lastRolls.push({roll: rollResult, win: isWin});
    lastRolls.forEach(function (roll, idx) {
        var elt = $($(".roll-result")[idx]);
        elt.text(roll.roll);
        elt.removeClass("win").removeClass("win-high").removeClass("loss");
        if (roll.win) {
            elt.addClass("win");
            if (roll.roll >= 75) {
                elt.addClass("win-high");
            }
        } else {
            elt.addClass("loss");
        }
    });
}

export function setConsoleElt (value) {
    consoleElt = value;
}
