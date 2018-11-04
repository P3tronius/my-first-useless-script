import * as Init from "./init.js";
import * as Chart from "./chart.js";
import * as UI from "./ui.js";

(function() {
    'use strict';

    UI.createUI();
    Chart.createChart();
    Init.waitForGameToInit();

})();
