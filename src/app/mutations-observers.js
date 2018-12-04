import * as Utils from "./utils.js";
import * as Vars from "./variables.js";
import * as Monitor from "./monitor.js";

export function onBodyMutate(mutations, observer) {
    var loginElt = document.querySelector(".user-dashboard");
    if (loginElt) {
        var userNameTag = loginElt.querySelector(".dropdown-toggle.avatar-a");
        if (userNameTag) {
            var userName = userNameTag.children[1].textContent;
            userName = userName.length > 12 ? userName.substr(1, 12) : userName;
            Utils.log(`Welcome ${userName} !`);
            setTimeout(function () {
                Vars.initSubject.next(true);
            }, 3000);
            observer.disconnect();
        }
    }
}

export function onRollUnderMutate() {
    var rollUnderEtl = document.querySelector(".content.min50");
    if (rollUnderEtl) {
        var value = rollUnderEtl.textContent.trim();
        Vars.onRollUnderChangedSubject.next(value);
    }
}

export function watchBetAmountChanges() {
    var descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    var originalSet = descriptor.set;

    descriptor.set = function(val) {
        Vars.onBetAmountChangedSubject.next(val);
        originalSet.apply(this,arguments);
    };

    Object.defineProperty(HTMLInputElement.prototype, "value", descriptor);
}

export function onNewRollResult() {
    var rollResultElt = document.querySelector(".leve2-roll em");

    if (rollResultElt) {
        var rollResult = document.querySelector(".leve2-roll em").textContent;
        Monitor.processNewBetResult(parseInt(rollResult));
    }
}

export function onErrorDialog(mutations, observer) {
    var dialog = $(".el-message");
    if (dialog && /CPU/.exec(dialog.text())) {
        Utils.log("CPU shortage, pausing for 10 minutes.");
        Vars.enginePaused.next(600000);
        dialog.detach();
        observer.disconnect();
    }
}