function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function removeBorders() {
    var linksToRemove = document.body.getElementsByTagName("a");
    for (var i = 0; i < linksToRemove.length; i++) {
        //rimuove i border a ogni oggetto interagibile
        linksToRemove[i].style = "border:0; border-style:solid;";
    }

    var inputsToRemove = document.body.getElementsByTagName("input");
    for (var i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "border:0; border-style:solid;";
    }

    var buttonsToRemove = document.body.getElementsByTagName("button");
    for (var i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
            buttonsToRemove[i].style = "border:0; border-style:solid;";
    }
}

function removeBackground() {
    var linksToRemove = document.body.getElementsByTagName("a")
    for (var i = 0; i < linksToRemove.length; i++) {
        linksToRemove[i].style = "background-image: none"
    }

    var inputsToRemove = document.body.getElementsByTagName("input");
    for (var i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "background-image: none";
    }

    var buttonsToRemove = document.body.getElementsByTagName("button");
    for (var i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
            buttonsToRemove[i].style = "background-image: none";
    }
}

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

    chrome.storage.sync.get(["pageActions", "currentURL", "profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        function filterUser(event) {
            return event.username === profileInfo.username
        }

        function filterURL(event) {
            return event.url === result.currentURL
        }
        var retrievedObj = JSON.parse(result.pageActions);
        var pageActions = retrievedObj.filter(filterUser)[0]
        var pageActionsUser = pageActions.pages.filter(filterURL)[0]
        var links = document.body.getElementsByTagName("a");
        var inputs = document.body.getElementsByTagName("input");
        var buttons = document.body.getElementsByTagName("button");
        var idsOfLinkObjects = pageActionsUser.idsOfLinkObjects
        for (var j = 0; j < links.length; j++) {
            if (idsOfLinkObjects.indexOf(j - 1) >= 0) {
                links[j - 1].style = "border:3px; border-style:solid; border-color:#FF0000; padding: 1em;";
            }
        }
        var idsOfInputObjects = pageActionsUser.idsOfInputObjects;
        for (var j = 0; j < inputs.length; j++) {
            if (idsOfInputObjects.indexOf(j - 1) >= 0) {
                inputs[j - 1].style = "border:3px; border-style:solid; border-color:#00FF00; padding: 1em;";
            }
        }
        var idsOfButtonObjects = pageActionsUser.idsOfButtonObjects;
        for (var j = 0; j < buttons.length; j++) {
            if (idsOfButtonObjects.indexOf(j) >= 0 && !isButtonOfExtension(buttons[j])) {
                buttons[j].style = "border:3px; border-style:solid; border-color:#0000FF; padding: 1em;";
            }
        }
    });
}

function drawBackground() {
    chrome.storage.sync.get(["signaledIssues", "currentURL", "profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        function filterUser(event) {
            return event.username === profileInfo.username
        }

        function filterURL(event) {
            return event.url === result.currentURL
        }
        var signaledIssues = JSON.parse(result.signaledIssues)
        var issues = signaledIssues.filter(filterUser)[0].pages.filter(filterURL)[0]
        var links = document.body.getElementsByTagName("a")
        var inputs = document.body.getElementsByTagName("input")
        var buttons = document.body.getElementsByTagName("button")

        var signaledLinks = issues.signaledLinks
        for (var j = 0; j < links.length; j++) {
            if (signaledLinks.indexOf(j) >= 0) {
                links[j].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
            }
        }

        var signaledInputs = issues.signaledInputs
        for (var j = 0; j < inputs.length; j++) {
            if (signaledInputs.indexOf(j) >= 0) {
                inputs[j].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
            }
        }

        var signaledButtons = issues.signaledButtons
        for (var j = 0; j < buttons.length; j++) {
            if (signaledButtons.indexOf(j) >= 0 && !isButtonOfExtension(buttons[j])) {
                buttons[j].style = "border:3px; border-style:solid; border-color:rgb(243 0 0); padding: 1em;";
                //buttons[j].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
            }
        }
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

function unlockAchievement(achievement, array) {
    function filterText(event) {
        return event.text === achievement.text
    }
    if (array.filter(filterText).length === 0) {
        var obj = {
            text: achievement.text,
            path: "." + achievement.obj.path
        }
        array.push(obj)
        chrome.runtime.sendMessage({ obj: achievement.obj, mess: "notification" })
    }
}

function countAchievements(achievements, avatars) {
    if (achievements.length === 3) {
        unlockAvatar("Heart Avatar", avatars, "./img/heart_avatar.png", "../img/heart_avatar.png")
    }
}

function unlockAvatar(avatar, array, path, url) {
    function filterName(event) {
        return event.name === avatar
    }
    if (array.filter(filterName).length === 0) {
        var unlocked = {
            name: avatar,
            url: url
        }
        var notification = {
            title: "New Avatar Unlocked!",
            message: "Unlocked " + avatar,
            path: path
        }
        array.push(unlocked)
        chrome.runtime.sendMessage({ obj: notification, mess: "notification" })
    }
}

function pageCoverageAchievements(progress, widgetProgress) {
    chrome.storage.sync.get(["profileInfo"], function (result) {
        var profileInfo = JSON.parse(result.profileInfo)
        if (progress >= 25) {
            var ach = {
                text: "Obtained 25% page coverage!",
                obj: {
                    title: "New Achievement!",
                    message: "Obtained 25% page coverage!",
                    path: "./img/achievement_bronze.png"
                }
            }
            unlockAchievement(ach, profileInfo.achievements)
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
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
            unlockAchievement(ach, profileInfo.achievements)
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
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
            unlockAchievement(ach, profileInfo.achievements)
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
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
            unlockAchievement(ach, profileInfo.achievements)
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
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
            unlockAchievement(ach, profileInfo.achievements)
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
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
            unlockAchievement(ach, profileInfo.achievements)
            unlockAvatar("Star Avatar", profileInfo.availableAvatars, "./img/star_avatar.png", "../img/star_avatar.png")
            countAchievements(profileInfo.achievements, profileInfo.availableAvatars)
        }
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
    })
}