import * as Vars from "./variables.js";

export function log(text) {
    Vars.consoleElt.append("<p>" + text + "<span style='float: right; color: whitesmoke'>"
        + new Date().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit', second: '2-digit', hour12: false})
        + "</span></p>");
    Vars.consoleElt.scrollTop(Vars.consoleElt[0].scrollHeight);
}

export function logLastBetWinStatus(winOrLoss, rollResult) {
    var lastChild = $(".console-text p:last-child")[0];
    var text = lastChild.textContent;
    var winText = " Win";
    var lostText = " Lost";
    var textToAdd = `${winOrLoss ? winText : lostText} [${rollResult}]`;
    var classToAdd = winOrLoss ? "won" : "lost";

    if (text.startsWith("Placing")) {
        var html = lastChild.innerHTML.split('<');
        html[0] += textToAdd;
        lastChild.innerHTML = html[0] + '<' + html[1] + '<' + html[2];
        lastChild.classList.add(classToAdd);
    } else {
        var idx = 1;
        var element = $(`.console-text p:nth-last-child(${idx})`)[0];
        while (element !== undefined) {
            text = element.textContent;
            if (text.startsWith("Placing")) {
                var html = $(`.console-text p:nth-last-child(${idx})`)[0].innerHTML.split('<');
                html[0] += textToAdd;
                $(`.console-text p:nth-last-child(${idx})`)[0].innerHTML = html[0] + '<' + html[1] + '<' + html[2];
                $(`.console-text p:nth-last-child(${idx})`)[0].classList.add(classToAdd);
                break;
            }
            idx++;
            element = $(`.console-text p:nth-last-child(${idx})`)[0];
        }
    }
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
    var last5Rolls = Vars.lastRolls.slice(Math.max(Vars.lastRolls.length - 5, 0));
    Vars.setRollsAvg5Value(last5Rolls.map((x) => x.roll).reduce((a, b) => a + b, 0) / last5Rolls.length);
}

export async function resumeWhenUIStuck() {
    while (true) {
        await sleep(300000);
        var lastConsoleTime = $(".console-text p:last-child() span")[0].textContent.split(":")[1];
        var currentTime = new Date().toLocaleTimeString(navigator.language, {minute:'2-digit', hour12: false});

        if (Vars.engineStarted.getValue() === true && (parseInt(currentTime) > (parseInt(lastConsoleTime) + 6))) {
            log("Forcing resume, UI seems to be stuck for more than 5 minutes");
            $(".v-modal").detach();
            clickOnRollButton();
        }
    }
}