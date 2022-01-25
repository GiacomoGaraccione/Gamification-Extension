function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function filterLink(event) {
    return event.objectType === "link"
}
function filterInput(event) {
    return event.objectType === "input"
}
function filterButton(event) {
    return event.objectType === "button"
}
function filterSelect(event) {
    return event.objectType === "select"
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
        let nodes = linksToRemove[i].childNodes
        for (let k = 0; k < nodes.length; k++) {
            if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                linksToRemove[i].removeChild(nodes[k])
            }
        }
    }

    let inputsToRemove = document.body.getElementsByTagName("input");
    for (let i = 0; i < inputsToRemove.length; i++) {
        inputsToRemove[i].style = "background-image: none";
        let nodes = inputsToRemove[i].childNodes
        for (let k = 0; k < nodes.length; k++) {
            if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                inputsToRemove[i].removeChild(nodes[k])
            }
        }
    }

    let buttonsToRemove = document.body.getElementsByTagName("button");
    for (let i = 0; i < buttonsToRemove.length; i++) {
        if (!isButtonOfExtension(buttonsToRemove[i]))
            buttonsToRemove[i].style = "border:0; border-style:solid;";
        let nodes = buttonsToRemove[i].childNodes
        for (let k = 0; k < nodes.length; k++) {
            if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                buttonsToRemove[i].removeChild(nodes[k])
            }
        }
    }

    let selectsToRemove = document.body.getElementsByTagName("select")
    for (let i = 0; i < selectsToRemove.length; i++) {
        selectsToRemove[i].style = "background-image: none"
        let nodes = selectsToRemove[i].childNodes
        for (let k = 0; k < nodes.length; k++) {
            if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                selectsToRemove[i].removeChild(nodes[k])
            }
        }
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
        button.id === "GamificationExtensionSessionModeButton" ||
        button.id === "gamificationExtensionIssueModalButton"
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
            for (let i = 0; i < pageIssues.length; i++) {
                let issue = pageIssues[i]
                let tooltip = document.createElement("span")
                tooltip.textContent = issue.issueText
                tooltip.id = "gamificationExtensionTooltipIssue" + i
                tooltip.style = "visibility: hidden; width: 120px; background-color: rgb(211 245 230);; color: #2215E2; text-align: center; padding: 5px 0; border-radius: 6px; z-index: 1; display: none"
                switch (issue.objectType) {
                    case "button":
                        buttons[issue.objectId].style = "border:3px; border-style:solid; border-color:rgb(243 0 0); padding: 1em;";
                        let buttonChildren = buttons[issue.objectId].childNodes
                        let foundB = false
                        for (let j = 0; j < buttonChildren.length && !foundB; j++) {
                            if (buttonChildren[j].id && buttonChildren[j].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                foundB = true
                            }
                        }
                        if (!foundB) {
                            buttons[issue.objectId].appendChild(tooltip)
                            buttons[issue.objectId].addEventListener("mouseover", () => {
                                tooltip.style.display = "inline"
                                tooltip.style.visibility = "visible"
                            })
                            buttons[issue.objectId].addEventListener("mouseout", () => {
                                tooltip.style.display = "none"
                            })
                        }
                        break;
                    case "input":
                        inputs[issue.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        let inputChildren = inputs[issue.objectId].childNodes
                        let foundI = false
                        for (let j = 0; j < inputChildren.length && !foundI; j++) {
                            if (inputChildren[j].id && inputChildren[j].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                foundI = true
                            }
                        }
                        if (!foundI) {
                            inputs[issue.objectId].appendChild(tooltip)
                            inputs[issue.objectId].addEventListener("mouseover", () => {
                                tooltip.style.display = "inline"
                                tooltip.style.visibility = "visible"
                            })
                            inputs[issue.objectId].addEventListener("mouseout", () => {
                                tooltip.style.display = "none"
                            })
                        }
                        break;
                    case "link":
                        links[issue.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        let linkChildren = links[issue.objectId].childNodes
                        let foundL = false
                        for (let j = 0; j < linkChildren.length && !foundL; j++) {
                            if (linkChildren[j].id && linkChildren[j].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                foundL = true
                            }
                        }
                        if (!foundL) {
                            links[issue.objectId].appendChild(tooltip)
                            links[issue.objectId].addEventListener("mouseover", () => {
                                tooltip.style.display = "inline"
                                tooltip.style.visibility = "visible"
                            })
                            links[issue.objectId].addEventListener("mouseout", () => {
                                tooltip.style.display = "none"
                            })
                        }
                        break
                    case "select":
                        selects[issue.objectId].style = "background-image: linear-gradient(to right top, rgb(255, 255, 255) 0%, rgb(243 0 0) 100%)"
                        let selectChildren = selects[issue.objectId].childNodes
                        let foundS = false
                        for (let j = 0; j < selectChildren.length && !foundS; j++) {
                            if (selectChildren[j].id && selectChildren[j].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                foundS = true
                            }
                        }
                        if (!foundS) {
                            selects[issue.objectId].appendChild(tooltip)
                            selects[issue.objectId].addEventListener("mouseover", () => {
                                tooltip.style.display = "inline"
                                tooltip.style.visibility = "visible"
                            })
                            selects[issue.objectId].addEventListener("mouseout", () => {
                                tooltip.style.display = "none"
                            })
                        }
                        break
                }
            }
        })
    })
}

function drawBorders() {
    chrome.storage.sync.get(["overlayMode", "interactionMode"], (result) => {
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

function createAchievement(text, title, message, path) {
    return { text: text, obj: { title: title, message: message, path: path } }
}

function pageAchievements() {
    filterCoverage = (event) => {
        return event.coverage >= 50
    }

    chrome.storage.sync.get(["profileInfo"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/pages/records/" + profileInfo.username
        }, (response) => {
            let pages = response.data
            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/users/" + profileInfo.username + "/achievements"
            }, (response2) => {
                let achievements = response2.data
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "get",
                    body: "/users/" + profileInfo.username + "/avatars"
                }, (response3) => {
                    let avatars = response3.data
                    if (pages.length >= 5) {
                        let ach = createAchievement("Visited 5 different pages!", "New Achievement!", "Visited 5 different pages!", "./img/achievement_bronze.png")
                        unlockAchievement(ach, achievements, profileInfo.username)
                        countAchievements(achievements, avatars, profileInfo.username)
                    }
                    //achievement sul numero di pagine con una certa coverage
                    if (pages.filter(filterCoverage).length >= 5) {
                        let ach = createAchievement("Obtained 50% coverage on 5 pages!", "New Achievement!", "Obtained 50% coverage on 5 pages!", "./img/achievement_silver.png")
                        unlockAchievement(ach, achievements, profileInfo.username)
                        countAchievements(achievements, avatars, profileInfo.username)
                    }
                })
            })
        })
    })
}

function pageCoverageAchievements(progress, widgetProgress) {
    chrome.storage.sync.get(["profileInfo"], (result) => {
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
                    let ach = createAchievement("Obtained 25% page coverage!", "New Achievement!", "Obtained 25% page coverage!", "./img/achievement_bronze.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (progress >= 50) {
                    let ach = createAchievement("Obtained 50% page coverage!", "New Achievement!", "Obtained 50% page coverage!", "./img/achievement_silver.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (progress === 100) {
                    let ach = createAchievement("Obtained 100% page coverage!", "New Achievement!", "Obtained 100% page coverage!", "./img/achievement_gold.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress >= 25) {
                    let ach = createAchievement("Obtained 25% coverage for a type of widgets!", "New Achievement!", "Obtained 25% coverage for a type of widgets!", "./img/achievement_bronze.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress >= 50) {
                    let ach = createAchievement("Obtained 50% coverage for a type of widgets!", "New Achievement!", "Obtained 50% coverage for a type of widgets!", "./img/achievement_silver.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
                if (widgetProgress === 100) {
                    let ach = createAchievement("Obtained 100% coverage for a type of widgets!", "New Achievement!", "Obtained 100% coverage for a type of widgets!", "./img/achievement_gold.png")
                    unlockAchievement(ach, achievements, profileInfo.username)
                    unlockAvatar("Star Avatar", avatars, "./img/star_avatar.png", profileInfo.username)
                    countAchievements(achievements, avatars, profileInfo.username)
                }
            })

        })
    })
}

function countWidgets(widgetCrops) {
    links = (event) => {
        return event.widgetType === "link"
    }
    inputs = (event) => {
        return event.widgetType === "input"
    }
    buttons = (event) => {
        return event.widgetType === "button"
    }
    selects = (event) => {
        return event.widgetType === "select"
    }
    let linkInt = widgetCrops.filter(links).length > 0 ? 1 : 0
    let inputInt = widgetCrops.filter(inputs).length > 0 ? 1 : 0
    let buttonInt = widgetCrops.filter(buttons).length > 0 ? 1 : 0
    let selectInt = widgetCrops.filter(selects).length > 0 ? 1 : 0
    return linkInt + inputInt + buttonInt + selectInt
}

function countActionsAvatar() {
    chrome.storage.sync.get(["profileInfo"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/avatars"
        }, (response) => {
            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/users/" + profileInfo.username + "/achievements"
            }, (response2) => {
                let ach = createAchievement("Found 3 or more different types of widgets in a session!", "New Achievement!", "Found 3 or more different types of widgets in a session!", "./img/achievement_bronze.png")
                unlockAchievement(ach, response2.data, profileInfo.username)
                unlockAvatar("Crowned Avatar", response.data, "./img/crown_avatar.png", profileInfo.username)
                countAchievements(response2.data, response.data, profileInfo.username)
            })
        })
    })
}

function countIssuesAchievement() {
    chrome.storage.sync.get(["profileInfo", "currentURL"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/issues"
        }, (response) => {
            if (response.data.length >= 5) {
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "get",
                    body: "/users/" + profileInfo.username + "/achievements"
                }, (response2) => {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        method: "get",
                        body: "/users/" + profileInfo.username + "/avatars"
                    }, (response3) => {
                        let ach = createAchievement("Signaled five different issues!", "New Achievement!", "Signaled five different issues!", "./img/achievement_bronze.png")
                        unlockAchievement(ach, response2.data, profileInfo.username)
                        countAchievements(response2.data, response3.data, profileInfo.username)
                    })
                })
            }

        })
    })
}

function solveIssueAchievement() {
    chrome.storage.sync.get(["profileInfo"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/achievements"
        }, (response) => {
            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/users/" + profileInfo.username + "/avatars"
            }, (response2) => {
                let ach = createAchievement("Marked an issue as solved!", "New Achievement", "Marked an issue as solved!", "./img/achievement_silver.png")
                unlockAchievement(ach, response.data, profileInfo.username)
                unlockAvatar("Wizard Avatar", response2.data, "./img/wizard_avatar.png", profileInfo.username)
                countAchievements(response.data, response2.data, profileInfo.username)
            })

        })
    })
}

function checkPosition(leaderboard, username, avatars) {
    if (leaderboard[0].username === username) {
        unlockAvatar("Golden Avatar", avatars, "./img/medal_avatar_gold.png", username)
        return true
    } else if (leaderboard[1].username === username) {
        unlockAvatar("Silver Avatar", avatars, "./img/medal_avatar_silver.png", username)
        return true
    } else if (leaderboard[2].username === username) {
        unlockAvatar("Bronze Avatar", avatars, "./img/medal_avatar_bronze.png", username)
        return true
    }
    return false
}

function leaderboardAvatars() {
    chrome.storage.sync.get(["profileInfo"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/avatars"
        }, (response) => {
            chrome.runtime.sendMessage({
                mess: "fetch",
                method: "get",
                body: "/users/records/pages"
            }, (response2) => {
                if (!checkPosition(response2.data, profileInfo.username, response.data)) {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        method: "get",
                        body: "/users/records/widgets"
                    }, (response3) => {
                        if (!checkPosition(response3.data, profileInfo.username, response.data)) {
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                method: "get",
                                body: "/users/records/coverage"
                            }, (response4) => {
                                checkPosition(response4.data, profileInfo.username, response.data)
                            })
                        }

                    })
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