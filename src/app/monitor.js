import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

export function processNewBetResult(rollResult) {
    var win = false;
    if (rollResult >= Vars.rollUnderValue) {
        Vars.incrementNbLossesValue();
        Vars.addWinLossAmount(0 - parseFloat(Vars.betAmountValue));
    } else {
        win = true;
        Vars.incrementNbWinsValue();
        var winTooltip = $(".notification-comp.success p");
        Vars.addWinLossAmount((parseFloat(winTooltip.text().substr(winTooltip.text().indexOf("win ") + 4, 6)) - parseFloat(Vars.betAmountValue)).toFixed(4));
    }
    Vars.addNewRollResult(parseInt(rollResult), win);
    Utils.recalculateRollAverages();
    Vars.setLooseStatusValue(recalculateLooseStatus());
}

function recalculateLooseStatus() {
    var total = 0;
    Vars.lastRolls.slice().reverse().forEach(function (elt, idx) {
        var res = elt.roll;
        if (res > 70) {
            total += 10 * (idx + 1);
        } else if (res > 50) {
           total += 5 * (idx + 1);
        } else if (res > 25) {
            total -= 5 * (idx + 1);
        } else {
            total -= 10 * (idx + 1);
        }
    });
    return total;
}