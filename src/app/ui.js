import * as Vars from "./variables.js";
import * as scripts from "../resources/scripts.html";
import * as css from "../resources/css.html";
import * as html from "../resources/ui.html";

export function createUI () {
    $("head").append(scripts.default);
    $("head").append(css.default);
    $("body").append(html.default);


    Vars.setConsoleElt($(".console-text"));
    Vars.setRollsAvgElt($(".avg-value"));

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

    $(".console-wrapper").dialog(opt).dialog("open");

    // alternative way to position a dialog
    $(".console-wrapper").parent().css({
        position: "fixed",
        top: "144px",
        left: "810px"
    });

    var opt = {
        width:      500,
        minWidth:   400,
        minHeight:  200,
        modal:      false,
        autoOpen:   false,
        resizable: false,
        zIndex:     1,
        title:      'Numbers repartion chart'
    };

}
