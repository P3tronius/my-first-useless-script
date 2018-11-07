import * as Vars from "./variables.js";
import * as Utils from "./utils.js";

// checks the status of the engine on each iteration (i.e. will stop before next bet if engine stopped)
export async function startCashMachineAlgo() {

    while (Vars.started) {
        await Utils.sleep(1000 + Math.floor(Math.random() * Math.floor(1000)));
         if (Vars.started) {
            calculateNextBet();
        }
    }

}

function calculateNextBet() {
    placeBet(0.1, 96);

    Vars.startOrStopCashMachine(false);
}


function placeBet(amount, rollUnder) {
    Utils.log(`Placing next bet: ${amount}@${rollUnder}`);
    Utils.moveRollUnderCursorTo(rollUnder);
    Utils.changeAmountTo(amount);
    setTimeout(function () {
        Utils.log("amount:" + `${document.querySelector(".tokens-icon.first input").value}`)
        Utils.clickOnRollButton();
    }, 50);
 }