import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

export function processNewBetResult(rollResult) {
    var win = false;
    var tooltipAmount = $(".notification-comp p");
    var tooltipBetAmount = $(".notification-comp h5");


    if (rollResult >= Vars.rollUnderValue) {
        Vars.incrementNbLossesValue();

        var amountLost = parseFloat(tooltipAmount.text().substr(tooltipAmount.text().indexOf("lost ") + 4, 6));

        Vars.addWinLossAmount(0 - amountLost);
    } else {
        win = true;
        Vars.incrementNbWinsValue();

        var amountWinned = parseFloat(tooltipAmount.text().substr(tooltipAmount.text().indexOf("win ") + 4, 6));
        var amountBet = parseFloat(tooltipBetAmount.text().substr(tooltipBetAmount.text().indexOf("bet ") + 4, 6));

        Vars.addWinLossAmount((amountWinned - amountBet).toFixed(4));
    }
    Vars.addNewRollResult(parseInt(rollResult), win);
    Utils.recalculateRollAverages();
    Vars.setLooseStatusValue(recalculateNextBetValue());
    Utils.logLastBetWinStatus(win);
}

function recalculateNextBetValue() {
   return recalculateNextBetValueAgressive();
   // return recalculateNextBetValue ();
}

function recalculateNextBetValueAgressive() {
    var total = 0;

    var n10 = Vars.lastRolls[Vars.lastRolls.length - 1];
    var n9 = Vars.lastRolls[Vars.lastRolls.length - 2];
    var n8 = Vars.lastRolls[Vars.lastRolls.length - 3];
    var n7 = Vars.lastRolls[Vars.lastRolls.length - 4];
    var n6 = Vars.lastRolls[Vars.lastRolls.length - 5];
    var n5 = Vars.lastRolls[Vars.lastRolls.length - 6];
    var n4 = Vars.lastRolls[Vars.lastRolls.length - 7];
    var n3 = Vars.lastRolls[Vars.lastRolls.length - 8];
    var n2 = Vars.lastRolls[Vars.lastRolls.length - 9];
    var n1 = Vars.lastRolls[Vars.lastRolls.length - 10];

    n10 = n10 !== undefined ? n10.roll : undefined;
    n9 = n9 !== undefined ? n9.roll : undefined;
    n8 = n8 !== undefined ? n8.roll : undefined;
    n7 = n7 !== undefined ? n7.roll : undefined;

    if (n10 >= 75) {
        total += 1;
    } else if (n10 >= 50) {
        total += 0.5;
    } else if (n10 >= 25) {
        total -= 0.5;
    } else if (n10 >= 0) {
        total -= 1;
    }

    if (n9 >= 75) {
        total += 0.8;
    } else if (n9 >= 50) {
        total += 0.4;
    } else if (n9 >= 25) {
        total -= 0.4;
    } else if (n9 >= 0) {
        total -= 0.8;
    }

    if (n8 >= 75) {
        total += 0.6;
    } else if (n8 >= 50) {
        total += 0.3;
    } else if (n8 >= 25) {
        total -= 0.3;
    } else if (n8 >= 25) {
        total -= 0.6;
    }

    if (n7 >= 75) {
        total += 0.5;
    } else if (n7 >= 50) {
        total += 0.2;
    } else if (n7 >= 25) {
        total -= 0.2;
    } else if (n7 >= 25) {
        total -= 0.5;
    }

    return total;
}