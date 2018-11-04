import * as UI from "./ui.js";
import * as Vars from "./variables.js";

export function log(text) {
    Vars.consoleElt.append("<p>" + text + "</p>")
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
    var xCoord = ((rect.width * value) / 100) + rect.x;
    var clickEvent = new MouseEvent("mousedown", {
        view: window,
        clientX: xCoord
    });
    rollUnderBar.dispatchEvent(clickEvent);
}

export function recalculateRollAverage() {
    Vars.setRollsAvgValue(Vars.lastRolls.reduce((a, b) => a + b, 0) / Vars.lastRolls.length);
    Vars.rollsAvgElt.text(Vars.rollsAvgValue);
}
