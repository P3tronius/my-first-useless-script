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
}