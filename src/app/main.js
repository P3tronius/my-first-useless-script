import * as Init from "./init.js";
import * as Chart from "./chart.js";
import * as UI from "./ui.js";
import * as BetEngine from "./bet-engine.js";
import * as Vars from "./variables.js";
import * as Utils from "./utils.js";
import * as Locker from "./locker.js";

(function() {
    'use strict';

    UI.createUI();
    Chart.createChart();
    Init.waitForGameToInit();

    Vars.engineStarted.pipe(
        Rx.operators.filter(
            function (state) {
                return state !== undefined;
            }
        )).subscribe(function (state) {
            if (!state) {
            } else {
                Utils.log("Cash Machine algo STARTED.");
                BetEngine.startCashMachineAlgo().then(
                () => {
                    Utils.log("Cash Machine algo STOPPED.");
                });
            }
        });

    Locker.lockEngineInit();
})();
