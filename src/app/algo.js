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
    Utils.log("Placing next bet:");
    placeBet(1, 96);

    Vars.startOrStopCashMachine(false);
}


function placeBet(amount, rollUnder) {
    Utils.moveRollUnderCursorTo(rollUnder);
    Utils.changeAmountTo(amount);
    Utils.log("amount:" + `${$("")}`)
    Utils.clickOnRollButton();
 }