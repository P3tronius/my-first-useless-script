export var consoleElt;
export var rollsAvgValue;
export var rollsAvgElt;
export var rollUnderValue;
export var lastRolls = [];
export var rollsAverage = 0;

export var initSubject = new Rx.Subject();

export var onRollUnderChangedSubject = new Rx.Subject();
export var onBetAmountChangedSubject = new Rx.Subject();

export function setRollUnderValue (value) {
    rollUnderValue = value;
}

export function setRollsAvgElt (value) {
    rollsAvgValueElt = value;
}

export function setRollsAvgValue (value) {
    rollsAvgValue = value;
}

export function setConsoleElt (value) {
    consoleElt = value;
}