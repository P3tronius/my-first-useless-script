import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

export function lockEngineInit() {
    Vars.winLossAmountSubject.pipe(
         Rx.operators.filter(
             function (amount) {
                 return amount !== undefined;
             }
         )
     ).subscribe(function (amount) {
         if (mustBeLocked(amount)) {
            Vars.startOrStopCashMachine(false);
         }
     });

    // if 4 loss in 5 bets, pause
     // TODO: if 5 loss in 7 bets, PAUSE 1 min
     // TODO: if 5 win in a row, PAUSE 1 min ?
}

function mustBeLocked(amount) {
    if (Vars.started && amount > Vars.maxAcceptableLosedAmount) {
        Utils.log("Max losed amount exceeded, forcing stop.");
        return true;
    }
    if (Vars.looseStatusValue > 30) {
        Utils.log("Too many luck, pausing for a while");
        Vars.enginePaused.next(true);
    }
    if (Vars.looseStatusValue < -20) {
        Utils.log("Too many loose, pausing for a while");
        Vars.enginePaused.next(true);
    }
    var nbLosses = 0;
    Vars.lastRolls.forEach(function (elt) {
        if (elt.roll > 75) {
            nbLosses++;
        }
    });
    if (nbLosses > 5) {
        Utils.log("Too many losses in a row, pausing for a while");
        Vars.enginePaused.next(true);
    }
    return false;
}
