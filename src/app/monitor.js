import * as Vars from "./variables.js";

export function processNewBetResult(value) {
    if (value > Vars.rollUnderValue) {
        Vars.incrementNbLossesValue();
        Vars.addWinLossAmount(0 - Vars.betAmountValue)
    } else {
        Vars.incrementNbWinsValue();
        Vars.addWinLossAmount(Vars.betAmountValue)
    }

}