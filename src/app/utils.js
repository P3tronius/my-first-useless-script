import * as UI from "./ui.js";
import * as Vars from "./variables.js";

export function log(text) {
    Vars.consoleElt.append("<p>" + text + "</p>")
    Vars.consoleElt.scrollTop(Vars.consoleElt[0].scrollHeight);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function changeAmountTo(value) {
    var inputField = document.querySelector(".tokens-icon.first input");

    var inputEvent = new InputEvent("input", {
        bubbles: true,
        composed: true,
        inputType: "insertText",
    });

    inputField.value = value;
    inputField.dispatchEvent(inputEvent);
}

export function moveRollUnderCursorTo(value) {
    var rollUnderBar = document.querySelector(".leve1");
    var rect = rollUnderBar.getBoundingClientRect();
    var xCoord = ((rect.width * (value + 0.5)) / 100) + rect.x;
    var clickEvent = new MouseEvent("mousedown", {
        view: window,
        clientX: xCoord
    });
    rollUnderBar.dispatchEvent(clickEvent);
    Vars.onRollUnderChangedSubject.next(value);
}

export function clickOnRollButton() {
    $(".btn-bar button").click();
}

export function recalculateRollAverages() {
    Vars.setRollsAvg10Value(Vars.lastRolls.map((x) => x.roll).reduce((a, b) => a + b, 0) / Vars.lastRolls.length);
    var last5Rolls = Vars.lastRolls.slice(Math.max(Vars.lastRolls.length - 5, 0))
    Vars.setRollsAvg5Value(last5Rolls.map((x) => x.roll).reduce((a, b) => a + b, 0) / last5Rolls.length);
}
