import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

export function lockEngineInit() {
    let unsubscriber;

    Vars.engineStarted.subscribe((started) => {
        if (started) {
            unsubscriber = Vars.winLossAmountSubject
                .pipe(
                    Rx.operators.filter((winLossAmount)  => winLossAmount !== undefined))
                .subscribe(function (winLossAmount) {
                    if (mustBeLocked(winLossAmount)) {
                        Vars.startOrStopCashMachine(false);
                    }
                });
        } else if (unsubscriber !== undefined) {
            unsubscriber.unsubscribe();
        }
    });
}

function mustBeLocked(winLossAmount) {
    if (Vars.engineStarted.getValue() === true) {
        if (winLossAmount < -Vars.maxAcceptableLosedAmount) {
            Utils.log("Max losed amount exceeded, forcing stop.");
            return true;
        }
        if (winLossAmount > Vars.maxGainBeforeStopping) {
            Utils.log("Win amount reached, stopping! :-D");
            return true;
        }
    }

    return false;
}
