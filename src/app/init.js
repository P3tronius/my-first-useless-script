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
                Utils.changeAmountTo(0.1);
                Vars.startOrStopCashMachine(false);
                Utils.log('Initialization finished');
            }
        });

    Vars.onRollUnderChangedSubject.pipe(Rx.operators.debounceTime(500)).subscribe(
        function (value) {
            Vars.setRollUnderValue(value);
        }
    );

    Vars.onBetAmountChangedSubject.pipe(Rx.operators.auditTime(50)).subscribe(
        function (value) {
            Vars.setBetAmountValue(value);
        }
    );

    Vars.setLooseStatusValue(0);
    Vars.setRollsAvg5Value(0);
    Vars.setRollsAvg10Value(0);
}

function testButtonClicked() {
    Utils.changeAmountTo(0.5);
}
