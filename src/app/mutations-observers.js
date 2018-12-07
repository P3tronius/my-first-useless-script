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

export function onErrorDialog() {
    if (!Vars.cpuShortage.getValue()) {
        var dialog1 = $(".el-message");
        var dialog2 = $(".el-message-box__wrapper");
        if ((dialog1[0] && /CPU/.exec(dialog1.text())) || (dialog2[0] && /CPU/.exec(dialog2.text()))) {
            Utils.log("CPU shortage, waiting to be under 90%");
            if (dialog2) {
                dialog2.detach();
                $(".v-modal").detach();
            }
            if (dialog1) {
                dialog1.detach();
            }
            Vars.cpuShortage.next(true);
            Vars.onNewBetResultSubject.next(undefined);
        }
    }
}

export function onCPUResourceChange() {
    var percent = document.querySelector(".el-progress__text").textContent;

    if (Vars.cpuShortage.getValue() && percent.length !== 4 && percent < "90%") {
        Utils.log(`CPU value at ${percent}, resuming`);
        Vars.cpuShortage.next(false);
        Vars.onNewBetResultSubject.next(undefined);
    }

}
