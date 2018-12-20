import * as Vars from "./variables.js";
import * as Utils from "./utils.js";
import * as MutationsObs from "./mutations-observers";

var amount;
var rollUnder;
var running = false;

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
export async function startCashMachineAlgo() {
    new MutationObserver(MutationsObs.onErrorDialog).observe(document.querySelector("body"), { childList: true, subtree: true});

    if (running) {
        Utils.log("Engine already started, not starting again");
        return;
    }
    while (Vars.engineStarted.getValue() === true) {
        running = true;
        if (Vars.enginePaused.getValue() > 0) {
            await Utils.sleep(Vars.enginePaused.getValue() + Math.floor(Math.random() * Math.floor(1000)));
            Vars.resetLooseStatusValue();
            Vars.enginePaused.next(0);
        }

        if (Vars.engineStarted.getValue() === true) {
            calculateNextBet();
            amount = Math.round(amount * 1000) / 1000;
            await placeBet();
            await waitIfNeeded();
            await Utils.sleep(2000 + Math.floor(Math.random() * Math.floor(1000)));
        }
    }
    Utils.log("Exiting startCashMachineAlgo()");
    running = false;
    resetCashMachine();
}

function resetCashMachine() {
    Vars.resetLooseStatusValue();
    Vars.resetVariables();
    Vars.enginePaused.next(0);
}

function calculateNextBet() {
    amount = Vars.initialAmount;
    rollUnder = 76;

    var lastBetRoll = Vars.lastRolls.length > 0 ? Vars.lastRolls[Vars.lastRolls.length - 1].roll : 50;
    var last1RollWin = Vars.lastRolls.length > 0 ? Vars.lastRolls[Vars.lastRolls.length - 1].win : true;
    var last2RollWin = Vars.lastRolls.length > 1 ? Vars.lastRolls[Vars.lastRolls.length - 2].win : true;
    var last3RollWin = Vars.lastRolls.length > 2 ? Vars.lastRolls[Vars.lastRolls.length - 3].win : true;
    var last4RollWin = Vars.lastRolls.length > 3 ? Vars.lastRolls[Vars.lastRolls.length - 4].win : true;

    var last2RollsWined = last1RollWin && last2RollWin;
    var last3RollsWined = last1RollWin && last2RollWin && last3RollWin;
    var last3RollsLoosed = !last1RollWin && !last2RollWin && !last3RollWin;
    var last4RollsLoosed = !last1RollWin && !last2RollWin && !last3RollWin && !last4RollWin;
    var last4RollsWined = last1RollWin && last2RollWin && last3RollWin && last4RollWin;


    if (last4RollsLoosed) {
        amount = 4;
        rollUnder = 50;
        return;
    }
    if (last3RollsLoosed) {
        amount = 2;
        rollUnder = 76;
        return;
    }
    if (last4RollsWined) {
        amount = 0.125;
        return;
    }
    if (last3RollsWined) {
        amount = 0.1;
        return;
    }
    if (last2RollsWined) {
        amount = 0.5;
        return;
    }
    if (Vars.rollsAvg10Value > 75) {
        amount = 1;
        rollUnder = 76;
        return;
    }
    if (Vars.rollsAvg5Value < 60) {
        amount = 0.125;
        rollUnder = 96;
        return;
    }
    amount = 0.25;
    rollUnder = 76;
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
        Utils.log("Pause for 3s (2 rolls > 75)");
        Vars.enginePaused.next(3000);
    }
    if (Vars.rollsAvg5Value > 70) {
        Utils.log("Pause for 3s (average 5 > 70)");
        Vars.enginePaused.next(3000);
    }
    var nbLosses = 0;
    Vars.lastRolls.forEach(function (elt) {
        if (elt.roll > 75) {
            nbLosses++;
        }
    });
    if (nbLosses > 4) {
        Utils.log("At least 5 rolls above 75 in last 10, pausing for 5s");
        Vars.enginePaused.next(5000);
    }
}