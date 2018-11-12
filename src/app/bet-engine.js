import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
export async function startCashMachineAlgo() {

    while (Vars.started) {
        if (Vars.enginePaused.getValue()) {
            await Utils.sleep(5000 + Math.floor(Math.random() * Math.floor(1000)));
            Vars.resetLooseStatusValue();
            Vars.enginePaused.next(false);
        }

        await Utils.sleep(1000 + Math.floor(Math.random() * Math.floor(1000)));
        if (Vars.started) {
            await calculateNextBet();
        }
    }

}

function calculateNextBet() {
    var amount = Vars.initialAmount;
    var rollUnder = 75;

    if (Vars.looseStatusValue > 20) {
        amount += amount;
        rollUnder = 75;
    }

    if (Vars.looseStatusValue > 0 && Vars.looseStatusValue < 20) {
        amount -= amount * 0.5;
        rollUnder = 75;
    }
    if (Vars.looseStatusValue < -20) {
        amount = 0.1;
        rollUnder = 96;
    }
    if (Vars.looseStatusValue < 0 && Vars.looseStatusValue > -20) {
        amount -= amount * 0.5;
        rollUnder = 75;
    }

    return placeBet(amount, rollUnder);
}


function placeBet(amount, rollUnder) {
    Utils.log(`Placing next bet: ${amount}@${rollUnder}`);
    Utils.moveRollUnderCursorTo(rollUnder);
    Utils.changeAmountTo(amount);
    return runBet();
}

async function runBet() {
    await Utils.sleep(50);
    Utils.clickOnRollButton();
    await Vars.onNewBetResultSubject.take(1).toPromise();
}