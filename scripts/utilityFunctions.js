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
}

//TODO: Rivedere in base alla nuova gestione (valutare se eventualmente rimuovere)
function downloadFile() {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    chrome.storage.sync.get(["pastPages", "visitedPages", "pageActions"], function (result) {
        var pageActions = JSON.parse(result.pageActions);
        for (var i = 0; i < pageActions.length; i++) {
            var pages = pageActions[i].pages
            for (var j = 0; j < pages.length; j++) {
                var filteredLinkIds = pages[i].idsOfLinkObjects.filter(onlyUnique);
                pages[i].idsOfLinkObjects = filteredLinkIds;
                var filteredInputIds = pages[i].idsOfInputObjects.filter(onlyUnique);
                pages[i].idsOfInputObjects = filteredInputIds;
                var filteredButtonIds = pages[i].idsOfButtonObjects.filter(onlyUnique);
                pages[i].idsOfButtonObjects = filteredButtonIds;
            }
        }
        var blob = new Blob([JSON.stringify(pageActions)], {
            type: "text/plain;charset=UTF-8",
        });
        var url = window.URL.createObjectURL(blob);
        var obj = {
            url: url,
            filename: "gamification-extension-session-records.txt",
        };
        chrome.runtime.sendMessage({ obj: obj, mess: "download" });
    }
    );
}

//TODO: rivedere in base alla nuova gestione (valutare se eventualmente rimuovere)
function downloadUserProfile() {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        var blob = new Blob([result.profileInfo], {
            type: "text/plain;charset=UTF-8",
        })

        var url = window.URL.createObjectURL(blob);
        var obj = {
            url: url,
            filename: "gamification-extension-profile-" + profileInfo.username + ".txt",
        };
        chrome.runtime.sendMessage({ obj: obj, mess: "download" });
    })
}

//TODO: rivedere in base alla nuova gestione (valutare se eventualmente rimuovere)
function downloadSignaledIssues() {
    chrome.storage.sync.get(["signaledIssues"], function (result) {
        var blob = new Blob([result.signaledIssues], {
            type: "text/plain;charset=UTF-8",
        })

        var url = window.URL.createObjectURL(blob)
        var obj = {
            url: url,
            filename: "gamification-extension-signaled-issues.txt"
        }
        chrome.runtime.sendMessage({ obj: obj, mess: "download" })
    })
}

function downloadSessionImage() {
    chrome.storage.sync.get(["widgetCrops"], function (result) {
        var widgetCrops = JSON.parse(result.widgetCrops)
        var height = 0
        var width = 0
        widgetCrops.forEach((el) => {
            height += el.height;
            if (el.width > width) {
                width = el.width
            }
        })
        var can = createCanvas(width, height)
        var ctx = can.getContext("2d")

        async function combine(images) {
            const imgs = await Promise.all(images.map((imageObj) => {
                return new Promise(function (resolve) {
                    var img = new Image();
                    img.onload = function () { resolve(img); };
                    img.src = imageObj.imageUrl;
                });
            }));
            for (var i = 0; i < images.length; i++) {
                ctx.drawImage(imgs[i], 0, images[i].offY, images[i].width, images[i].height)
            }
            chrome.runtime.sendMessage({ mess: "img", url: can.toDataURL() })
        }
        combine(widgetCrops)
    })
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

function cancelPreviousSessionElement() {
    chrome.storage.sync.get(["previousSession", "sessionPosition", "currentURL"], function (result) {
        var elementToCancel = JSON.parse(result.previousSession)[result.sessionPosition - 1]
        var elements = elementToCancel.type !== "link" ? document.getElementsByTagName(elementToCancel.type) : document.getElementsByTagName("a")
        for (var i = 0; i < elements.length; i++) {
            if (elementToCancel.url === result.currentURL) {
                if (i === elementToCancel.id) {
                    if (elementToCancel.type === "button" && !isButtonOfExtension(elements[i])) {
                        elements[i].style = "border:0; border-style:solid;"
                    } else if (elementToCancel.type === "input" || elementToCancel.type === "input") {
                        elements[i - 1].style = "border:0; border-style:solid;"

                    }
                }
            }
        }
    })
}

function drawNextSessionElement() {
    chrome.storage.sync.get(["previousSession", "sessionPosition", "currentURL"], function (result) {
        var elementToShow = JSON.parse(result.previousSession)[result.sessionPosition]
        if (result.sessionPosition >= JSON.parse(result.previousSession).length) {
            alert("Replay ended")
        } else {
            var elements = elementToShow.type !== "link" ? document.getElementsByTagName(elementToShow.type) : document.getElementsByTagName("a")
            for (var i = 0; i < elements.length; i++) {
                if (elementToShow.url === result.currentURL) {
                    if (i === elementToShow.id) {
                        if (elementToShow.type === "button" && !isButtonOfExtension(elements[i])) {
                            elements[i].style = "border:3px; border-style:solid; border-color:#FFD700; padding: 1em;";
                        } else if (elementToShow.type === "input" || elementToShow.type === "link") {
                            elements[i - 1].style = "border:3px; border-style:solid; border-color:#FFD700; padding: 1em;";

                        }
                    }
                }
            }
        }
    })
}

function drawBorderOnAll() {
    var links = document.body.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        links[i].style =
            "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
    }

    var inputs = document.body.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].style =
            "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
    }

    var buttons = document.body.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        if (!isButtonOfExtension(buttons[i])) {
            buttons[i].style =
                "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
        }
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
        } else if (result.interactionMode === "session") {
            drawNextSessionElement()
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
        var profileInfo = JSON.parse(result.profileInfo)
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
                    var ach = {
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
                    var ach = {
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
                    var ach = {
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
                    var ach = {
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
                    var ach = {
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