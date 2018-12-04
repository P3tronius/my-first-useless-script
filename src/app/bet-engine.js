import * as Vars from "./variables.js";
import * as Utils from "./utils.js";
import * as MutationsObs from "./mutations-observers";

var amount;
var rollUnder;

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
export async function startCashMachineAlgo() {
    new MutationObserver(MutationsObs.onErrorDialog).observe(document.querySelector("body"), { childList: true, subtree: true});

    while (Vars.engineStarted.getValue() === true) {
        if (Vars.enginePaused.getValue() > 0) {
            await Utils.sleep(Vars.enginePaused.getValue() + Math.floor(Math.random() * Math.floor(1000)));
            Vars.resetLooseStatusValue();
            Vars.enginePaused.next(0);
        }

        if (Vars.engineStarted.getValue() === true) {
            calculateNextBet();
            await placeBet();
            await waitIfNeeded();
            await Utils.sleep(2000 + Math.floor(Math.random() * Math.floor(1000)));
        }
    }
    Utils.log("Exiting while loop");
}

function calculateNextBet() {
    amount = Vars.initialAmount;
    rollUnder = 75;

    var lastBetRoll = Vars.lastRolls.length > 0 ? Vars.lastRolls[Vars.lastRolls.length - 1].roll : 50;
    var last1RollWin = Vars.lastRolls.length > 0 ? Vars.lastRolls[Vars.lastRolls.length - 1].win : true;
    var last2RollWin = Vars.lastRolls.length > 1 ? Vars.lastRolls[Vars.lastRolls.length - 2].win : true;
    var last3RollWin = Vars.lastRolls.length > 2 ? Vars.lastRolls[Vars.lastRolls.length - 3].win : true;

    var last3RollsWined = last1RollWin && last2RollWin && last3RollWin;
    var last3RollsLoosed = !last1RollWin && !last2RollWin && !last3RollWin;

    if (lastBetRoll > 75) {
        amount = Vars.initialAmount * (last3RollsLoosed ? 4 : 2);
        rollUnder = 75;
    } else if (lastBetRoll > 50) {
        amount = Vars.initialAmount * (last3RollsWined ? 0.5 : 1);
        rollUnder = 75;
    } else {
        amount = Vars.initialAmount * (last3RollsWined ? 0.1 : 1);
        rollUnder = last3RollsWined ? 96 : 75;
    }
    amount = Math.round(amount * 1000) / 1000;
}


function placeBet() {
    Utils.log(`Placing next bet: ${amount}@${rollUnder}`);
    Utils.moveRollUnderCursorTo(rollUnder);
    Utils.changeAmountTo(amount);
    Vars.setLastBetAmountValue(amount);
    return runBet();
}

async function runBet() {
    await Utils.sleep(50);
    Utils.clickOnRollButton();
    await Vars.onNewBetResultSubject.take(1).toPromise();
}

function waitIfNeeded() {
    var n10 = Vars.lastRolls[Vars.lastRolls.length - 1];
    var n9 = Vars.lastRolls[Vars.lastRolls.length - 2];
    var n8 = Vars.lastRolls[Vars.lastRolls.length - 3];
    var n7 = Vars.lastRolls[Vars.lastRolls.length - 4];

    if (n10 && n10.roll > 75 && n9 && n9.roll > 75) {
        Utils.log("Pause for 10s (2 rolls > 75)");
        Vars.enginePaused.next(10000);
    }
    if (Vars.rollsAvg5Value > 70) {
        Utils.log("Pause for 10s (average 5 > 70)");
        Vars.enginePaused.next(10000);
    }
    var nbLosses = 0;
    Vars.lastRolls.forEach(function (elt) {
        if (elt.roll > 75) {
            nbLosses++;
        }
    });
    if (nbLosses > 4) {
        Utils.log("At least 5 rolls above 75 in last 10, pausing for 30s");
        Vars.enginePaused.next(30000);
    }
}