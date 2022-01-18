function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function removeBorders() {
    let linksToRemove = document.body.getElementsByTagName("a");
    for (let i = 0; i < linksToRemove.length; i++) {
        //rimuove i border a ogni oggetto interagibile
        linksToRemove[i].style = "border:0; border-style:solid;";
    }

    let inputsToRemove = document.body.getElementsByTagName("input");
    for (let i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "border:0; border-style:solid;";
    }

    let buttonsToRemove = document.body.getElementsByTagName("button");
    for (let i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
            buttonsToRemove[i].style = "border:0; border-style:solid;";
    }

    let selectsToRemove = document.body.getElementsByTagName("select")
    for (let i = 0; i < selectsToRemove.length; i++) {
        selectsToRemove[i].style = "border:0; border-style:solid;";
    }
}

function removeBackground() {
    let linksToRemove = document.body.getElementsByTagName("a")
    for (let i = 0; i < linksToRemove.length; i++) {
        linksToRemove[i].style = "background-image: none"
    }

    let inputsToRemove = document.body.getElementsByTagName("input");
    for (let i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "background-image: none";
    }

    let buttonsToRemove = document.body.getElementsByTagName("button");
    for (let i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
            buttonsToRemove[i].style = "border:0; border-style:solid;";
    }

    let selectsToRemove = document.body.getElementsByTagName("select")
    for (let i = 0; i < selectsToRemove.length; i++) {
        selectsToRemove[i].style = "background-image: none"
    }
}

function isButtonOfExtension(button) {
    return (
        button.id === "gamificationExtensionRemoveOverlaysButton" ||
        button.id === "gamificationExtensionSidenavButton" ||
        button.id === "gamificationExtensionSidenavCloseButton" ||
        button.id === "gamificationExtensionEndSessionButton" ||
        button.id === "gamificationExtensionToggleClickedElementsButton" ||
        button.id === "gamificationExtensionRemoveOverlaysButton" ||
        button.id === "gamificationExtensionToggleAllElementsButton" ||
        button.id === "GamificationExtensionSignalModeButton" ||
        button.id === "GamificationExtensionInteractModeButton" ||
        button.id === "GamificationExtensionSessionModeButton"
    );
}

function drawBorderOnAll() {
    let links = document.body.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
        links[i].style = "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
    }

    let inputs = document.body.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].style = "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
    }

    let buttons = document.body.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        if (!isButtonOfExtension(buttons[i])) {
            buttons[i].style = "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
        }
    }

    let selects = document.body.getElementsByTagName("select")
    for (let i = 0; i < selects.length; i++) {
        selects[i].style = "border:3px solid; border-color:yellow; padding: 1em;";
    }
}

function drawBorderOnInteracted() {
    chrome.storage.sync.get(["currentURL", "profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            body: "/pages/actions/" + profileInfo.username,
            method: "get",
            content: { url: result.currentURL }
        }, (response) => {
            let pageActions = response.data
            let links = document.body.getElementsByTagName("a");
            let inputs = document.body.getElementsByTagName("input");
            let buttons = document.body.getElementsByTagName("button");
            let selects = document.body.getElementsByTagName("select")
            for (action of pageActions) {
                switch (action.objectType) {
                    case "button":
                        buttons[action.objectId].style = "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
                        break;
                    case "input":
                        inputs[action.objectId].style = "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
                        break;
                    case "link":
                        links[action.objectId].style = "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
                        break
                    case "select":
                        selects[action.objectId].style = "border:3px; border-style:solid; border-color:yellow; padding: 1em;";
                        break
                }
            }
        })
    });
}

function drawBackground() {
    chrome.storage.sync.get(["signaledIssues", "currentURL", "profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/pages/issues/" + profileInfo.username,
            content: { url: result.currentURL }
        }, (response) => {
            let pageIssues = response.data
            let links = document.body.getElementsByTagName("a");
            let inputs = document.body.getElementsByTagName("input");
            let buttons = document.body.getElementsByTagName("button");
            let selects = document.body.getElementsByTagName("select")
            for (issue of pageIssues) {
                switch (action.objectType) {
                    case "button":
                        buttons[action.objectId].style = "border:3px; border-style:solid; border-color:rgb(243 0 0); padding: 1em;";
                        break;
                    case "input":
                        inputs[action.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        break;
                    case "link":
                        links[action.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        break
                    case "select":
                        selects[action.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        break
                }
            }
        })
    })
}

function drawBorders() {
    chrome.storage.sync.get(["overlayMode", "interactionMode"], function (result) {
        if (result.interactionMode === "interact") {
            if (result.overlayMode === "interacted") {
                drawBorderOnInteracted()
            } else if (result.overlayMode === "all") {
                drawBorderOnAll()
            }
        } else if (result.interactionMode === "signal") {
            drawBackground()
        }
    })
}

function unlockAchievement(achievement, array, username) {
    function filterText(event) {
        return event.text === achievement.text
    }
    if (array.filter(filterText).length === 0) {
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "post",
            body: "/users/" + username + "/achievements",
            content: { text: achievement.text }
        }, () => { chrome.runtime.sendMessage({ obj: achievement.obj, mess: "notification" }) })
    }
}

function countAchievements(achievements, avatars, username) {
    if (achievements.length === 3) {
        unlockAvatar("Heart Avatar", avatars, "./img/heart_avatar.png", username)
    }
}

function unlockAvatar(avatar, array, path, username) {
    function filterName(event) {
        return event.name === avatar
    }
    if (array.filter(filterName).length === 0) {
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "post",
            body: "/users/" + username + "/avatars",
            content: { name: avatar }
        }, () => {
            let notification = {
                title: "New Avatar Unlocked!",
                message: "Unlocked " + avatar,
                path: path
            }
            chrome.runtime.sendMessage({ obj: notification, mess: "notification" })
        })

    }
}

function pageCoverageAchievements(progress, widgetProgress) {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/achievements"
        }, (response) => {
            let achievements = response.data
            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/users/" + profileInfo.username + "/avatars"
            }, (response2) => {
                let avatars = response2.data
                if (progress >= 25) {
                    let ach = {
                        text: "Obtained 25% page coverage!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 25% page coverage!",
                            path: "./img/achievement_bronze.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (progress >= 50) {
                    let ach = {
                        text: "Obtained 50% page coverage!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 50% page coverage!",
                            path: "./img/achievement_silver.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (progress === 100) {
                    let ach = {
                        text: "Obtained 100% page coverage!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 100% page coverage!",
                            path: "./img/achievement_gold.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress >= 25) {
                    let ach = {
                        text: "Obtained 25% coverage for a type of widgets!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 25% coverage for a type of widgets!",
                            path: "./img/achievement_bronze.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress >= 50) {
                    let ach = {
                        text: "Obtained 50% coverage for a type of widgets!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 50% coverage for a type of widgets!",
                            path: "./img/achievement_silver.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress === 100) {
                    let ach = {
                        text: "Obtained 100% coverage for a type of widgets!",
                        obj: {
                            title: "New Achievement!",
                            message: "Obtained 100% coverage for a type of widgets!",
                            path: "./img/achievement_gold.png"
                        }
                    }
                    unlockAchievement(ach, achievements, profileInfo.username)
                    unlockAvatar("Star Avatar", avatars, "./img/star_avatar.png", profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
            })

        })
    })
}

function xpath(el) {
    if (typeof el == "string") return document.evaluate(el, document, null, 0, null)
    if (!el || el.nodeType != 1) return ''
    if (el.id && el.tagName.toLowerCase() === "div") return "//div[@id='" + el.id + "']"
    let sames = [].filter.call(el.parentNode.children, function (x) { return x.tagName == el.tagName })
    return xpath(el.parentNode) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '[' + ([].indexOf.call(sames, el) + 1) + ']' : '')
}

function selector(el) {
    let names = []
    while (el.parentNode) {
        if (el.id) {
            names.unshift('#' + el.id);
            break;
        } else {
            if (el === el.ownerDocument.documentElement) {
                names.unshift(el.tagName)
            } else {
                let c, e
                for (c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                names.unshift(el.tagName + ":nth-child(" + c + ")")
            }
            el = el.parentNode
        }
    }
    return names.join(" > ")
}