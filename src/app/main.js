import * as Init from "./init.js";
import * as Chart from "./chart.js";
import * as UI from "./ui.js";
import * as Algo from "./algo.js";
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
                return state != undefined;
            }
        )).subscribe(function (state) {
            if (!state) {
                Utils.log("Cash Machine algo STOPPED.");
            } else {
                Utils.log("Cash Machine algo STARTED.");
                Algo.startCashMachineAlgo();
            }
        });

    Locker.lockEngineInit();
})();
