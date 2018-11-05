import * as Vars from "./variables.js";

export function processNewBetResult(value) {
    if (value >= Vars.rollUnderValue) {
        Vars.incrementNbLossesValue();
        Vars.addWinLossAmount(0 - parseFloat(Vars.betAmountValue));
    } else {
        Vars.incrementNbWinsValue();
        Vars.addWinLossAmount(parseFloat(Vars.betAmountValue));
    }

}