import * as MutationsObs from "./mutations-observers.js";
import * as Utils from "./utils.js";
import * as Algo from "./algo.js";
import * as Vars from "./variables.js";

export function waitForGameToInit() {
    new MutationObserver(MutationsObs.onBodyMutate).observe(document.querySelector("body"), { childList: true });

    Vars.initSubject.subscribe(
        function (state) {
            if (state) {
                document.querySelector(".test-btn").addEventListener("click", testButtonClicked);
                new MutationObserver(MutationsObs.onRollUnderMutate).observe(document.querySelector(".content.min50"), { subtree: true, characterData: true});
                new MutationObserver(MutationsObs.onNewRollResult).observe(document.querySelector(".my-progress > .leve1"), { childList: true, subtree: true });

                MutationsObs.watchBetAmountChanges();
                Utils.moveRollUnderCursorTo(76);
                Utils.changeAmountTo("0.1");
                Utils.log('Initialization finished');
                Algo.startCashMachineAlgo();
            }
        });

    Vars.onRollUnderChangedSubject.pipe(Rx.operators.debounceTime(500)).subscribe(
        function (value) {
            Utils.log("Roll Under changed to " + value);
            Vars.setRollUnderValue(value);
        }
    );

    Vars.onBetAmountChangedSubject.pipe(Rx.operators.auditTime(50)).subscribe(
        function (value) {
            Utils.log("Bet Amount changed to " + value);
        }
    );

}

function testButtonClicked() {

}
