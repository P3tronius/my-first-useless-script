import * as Vars from "./variables.js";
import * as scripts from "../resources/scripts.html";
import * as css from "../resources/css.html";
import * as html from "../resources/ui.html";

export function createUI () {

    let head = $("head");
    head.append(scripts.default);
    head.append(css.default);
    $("body").append(html.default);

    var opt = {
        width:      500,
        minWidth:   400,
        minHeight:  200,
        modal:      false,
        autoOpen:   false,
        resizable: true,
        zIndex:     1,
        title:      'BetDice CashMachine'
    };

    let cashmachine = $(".cashmachine-wrapper");
    cashmachine.dialog(opt).dialog("open");

    // alternative way to position a dialog
    cashmachine.parent().css({
        position: "fixed",
        top: "0px",
        right: "110px",
        left: "initial"
    });


    Vars.setConsoleElt($(".console-text"));
    Vars.setRollsAvg10Elt($(".avg-10 .value"));
    Vars.setRollsAvg5Elt($(".avg-5 .value"));
    Vars.setBetAmountElt($(".bet-amount .value"));
    Vars.setRollUnderElt($(".roll-under .value"));
    Vars.setWinLossElt($(".win-loss .value"));
    Vars.setLooseStatusElt($(".loose-status .value"));
    Vars.setNbLossesElt($(".nb-losses .value"));
    Vars.setNbWinsElt($(".nb-wins .value"));
    Vars.setStartStopElt($(".start-stop"));

    document.querySelector(".start-stop").addEventListener("click", Vars.startOrStopCashMachine);
    document.querySelector(".max-loss").addEventListener("change", Vars.setMaxAcceptableLossAmount);
    document.querySelector(".initial-amount").addEventListener("change", Vars.setInitialAmount);

    document.querySelector(".max-loss").value = Vars.maxAcceptableLosedAmount;
    document.querySelector(".initial-amount").value = Vars.initialAmount;

}
