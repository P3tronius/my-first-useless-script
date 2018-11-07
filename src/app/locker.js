import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

export function lockEngineInit() {
    Vars.winLossAmountSubject.pipe(
         Rx.operators.filter(
             function (amount) {
                 return amount != undefined;
             }
         )
     ).subscribe(function (amount) {
         if (amount > Vars.maxAcceptableLossAmount) {
            Utils.log("Max loosed amount exceeded, forcing stop.");
            Vars.startOrStopCashMachine(false);
         }
     });

     // TODO: if 5 loss in 6-7 bets, PAUSE 1 min
     // TODO: if 5 win in a row, PAUSE 1 min ?
}