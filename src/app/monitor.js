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
    Vars.lastRolls.slice(Math.max(Vars.lastRolls.length - 4, 0)).forEach(function (elt, idx) {
        var res = elt.roll;
        if (res > 69) {
            total += 10 * idx;
        } else if (res > 50) {
           total += 5 * idx;
        } else if (res > 25) {
            total -= 5 * idx;
        } else {
            total -= 10 * idx;
        }
    });
    var totalLessThan75 = 0;
    Vars.lastRolls.forEach(function (elt) {
        if (elt.roll < 75) {
            totalLessThan75++;
        }
    });

    total += totalLessThan75 * 5;

    return total;
}
