let options = {
    "scrollX": 0,
    "useCORS": true,
    "logging": false,
    "scale": 2,
    "scrollY": -1 * window.scrollY
}

clickHandlerInteract = (profileInfo, currentURL, element, objectType, objectId, pageStats, pageInfo) => {
    function filterURL(event) {
        return event.url === currentURL
    }

    function filterID(event) {
        return event.objectId === objectId && event.objectType === objectType
    }
    let textContent = objectType === "link" ? element.textContent.trim() : null
    removeBorders()
    html2canvas(element, options).then((canvas) => {
        console.log(canvas.toDataURL())
        chrome.runtime.sendMessage({
            mess: "fetch",
            body: "/pages/crops/" + profileInfo.username,
            method: "post",
            content: { widgetType: objectType, imageUrl: canvas.toDataURL(), widgetId: objectId, textContent: textContent, selectIndex: null, selector: selector(element), xpath: xpath(element), elementId: element.id }
        }, () => {
            chrome.runtime.sendMessage({
                "mess": "fetch",
                "body": "/pages/actions/" + profileInfo.username,
                "method": "get",
                "content": { url: currentURL }
            }, (response) => {
                let psObj = pageStats.filter(filterURL)[0]
                let intIds = objectType === "link" ? psObj.interactedLinks : objectType === "input" ? psObj.interactedInputs : objectType === "button" ? psObj.interactedButtons : psObj.interactedSelects
                let intPos = intIds.indexOf(objectId);
                if (intPos < 0) {
                    intIds.push(objectId);
                    objectType === "link" ? psObj.interactedLinks = intIds : objectType === "input" ? psObj.interactedInputs = intIds : objectType === "button" ? psObj.interactedButtons = intIds : psObj.interactedSelects = intIds
                }
                let pageActions = response.data
                let newEl = pageActions.filter(filterID).length === 0
                if (newEl) {
                    let newIds = objectType === "link" ? psObj.newLinks : objectType === "input" ? psObj.newInputs : objectType === "button" ? psObj.newButtons : psObj.newSelects
                    let newPos = newIds.indexOf(objectId);
                    if (newPos < 0) {
                        newIds.push(objectId);
                        objectType === "link" ? psObj.newLinks = newIds : objectType === "input" ? psObj.newInputs = newIds : objectType === "button" ? psObj.newButtons = newIds : psObj.newSelects = newIds
                    }
                }
                chrome.storage.sync.set({ pageStats: JSON.stringify(pageStats) }, () => {
                    chrome.storage.sync.get(["overlayMode"], (result) => {
                        if (result.overlayMode === "interacted") {
                            drawBorderOnInteracted()
                        } else if (result.overlayMode === "all") {
                            drawBorderOnAll()
                        }
                    })
                    if (newEl) {
                        chrome.runtime.sendMessage({
                            "mess": "fetch",
                            body: "/pages/actions",
                            method: "post",
                            content: { url: currentURL, username: profileInfo.username, objectId: objectId, objectType: objectType }
                        }, () => {
                            let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                            let interactedLinks = objectType === "link" ? pageActions.filter(filterLink).length + 1 : pageActions.filter(filterLink).length
                            let interactedInputs = objectType === "input" ? pageActions.filter(filterInput).length + 1 : pageActions.filter(filterInput).length
                            let interactedButtons = objectType === "button" ? pageActions.filter(filterButton).length + 1 : pageActions.filter(filterButton).length
                            let interactedSelects = objectType === "select" ? pageActions.filter(filterSelect).length + 1 : pageActions.filter(filterSelect).length
                            let progress = ((interactedLinks + interactedInputs + interactedButtons + interactedSelects) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects + pageInfo.totalSelectObjects)
                            innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                            innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                            let sidenavProgress = objectType === "link" ? document.getElementById("gamificationExtensionLinksProgress") : objectType === "input" ? document.getElementById("gamificationExtensionInputsProgress") : objectType === "button" ? document.getElementById("gamificationExtensionButtonsProgress") : document.getElementById("gamificationExtensionSelectsProgress")
                            let widgetProgress = objectType === "link" ? interactedLinks * 100 / pageInfo.totalLinkObjects : objectType === "input" ? interactedInputs * 100 / pageInfo.totalInputObjects : objectType === "button" ? interactedButtons * 100 / pageInfo.totalButtonObjects : interactedSelects * 100 / pageInfo.totalSelectObjects
                            if (widgetProgress > 100) {
                                widgetProgress = 100
                            }
                            let firstWord = objectType === "link" ? "Links " : objectType === "input" ? "Forms " : objectType === "button" ? "Buttons " : "Dropdown Menus "
                            sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                            sidenavProgress.textContent = firstWord + "Progress: " + widgetProgress.toFixed(2) + "%"
                            let table = document.getElementById("gamificationExtensionPageStatsTable")
                            let row = objectType === "link" ? table.rows[1] : objectType === "input" ? table.rows[2] : objectType === "button" ? table.rows[3] : table.rows[4]
                            let pageStat = pageStats.filter(filterURL)[0]
                            row.cells[1].innerHTML = objectType === "link" ? pageStat.interactedLinks.length : objectType === "input" ? pageStat.interactedInputs.length : objectType === "button" ? pageStat.interactedButtons.length : pageStat.interactedSelects.length
                            row.cells[2].innerHTML = objectType === "link" ? pageStat.newLinks.length : objectType === "input" ? pageStat.newInputs.length : objectType === "button" ? pageStat.newButtons.length : pageStat.newSelects.length
                            row.cells[3].innerHTML = objectType === "link" ? pageActions.filter(filterLink).length + 1 : objectType === "input" ? pageActions.filter(filterInput).length + 1 : objectType === "button" ? pageActions.filter(filterButton).length + 1 : pageActions.filter(filterSelect).length + 1
                            pageCoverageAchievements(progress, widgetProgress)
                            switch (objectType) {
                                case "link":
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/records/" + profileInfo.username,
                                        method: "post",
                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, linksCoverage: widgetProgress },
                                        firstTime: false
                                    })
                                    break
                                case "input":
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/records/" + profileInfo.username,
                                        method: "post",
                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, inputsCoverage: widgetProgress },
                                        firstTime: false
                                    })
                                    break
                                case "button":
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/records/" + profileInfo.username,
                                        method: "post",
                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, buttonsCoverage: widgetProgress },
                                        firstTime: false
                                    })
                                    break
                                case "select":
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        body: "/pages/records/" + profileInfo.username,
                                        method: "post",
                                        content: { username: profileInfo.username, url: currentURL, coverage: progress, selectsCoverage: widgetProgress },
                                        firstTime: false
                                    })
                                    break
                                default:
                                    break
                            }
                        })
                    }
                })
            })
        })
    })

}

clickHandlerSignal = (profileInfo, currentURL, objectType, objectId) => {
    function filterID(event) {
        return event.objectId === objectId && event.objectType === objectType
    }

    chrome.runtime.sendMessage({
        mess: "fetch",
        body: "/pages/issues/" + profileInfo.username,
        method: "get",
        content: { url: currentURL }
    }, (response) => {
        let pageIssues = response.data
        if (pageIssues.filter(filterID).length === 0) {
            let modalContainer = document.createElement("div")
            modalContainer.style = " display: block; position: fixed;  z-index: 1;  left: 0; top: 0;width: 100%;  height: 100%;  overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4); ";
            let innerModal = document.createElement("div");
            innerModal.style = "background-color: rgb(211 245 230); margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; ";
            modalContainer.appendChild(innerModal);
            let modalSpan = document.createElement("span");
            modalSpan.style = "color: #aaa; float: right; font-size: 28px; font-weight: bold;";
            modalSpan.textContent = "X";
            innerModal.appendChild(modalSpan);
            let modalContent = document.createElement("p")
            modalContent.innerText = `Which is the issue you wish to report for this element?`
            innerModal.appendChild(modalContent);
            let modalForm = document.createElement("input")
            modalForm.type = "text"
            innerModal.appendChild(modalForm)
            modalContent.style = "text-align: center; color: #2215E2; font-size: x-large"
            modalSpan.onclick = () => { modalContainer.style.display = "none"; };
            window.onclick = (event) => {
                if (event.target === modalContainer) {
                    modalContainer.style.display = "none";
                }
            };
            let modalButton = document.createElement("button")
            modalButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
            innerModal.appendChild(modalButton)
            modalButton.textContent = "Submit Issue"
            modalButton.id = "gamificationExtensionIssueModalButton"
            modalButton.addEventListener("click", () => {
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    body: "/pages/issues",
                    method: "post",
                    content: { url: currentURL, username: profileInfo.username, objectId: objectId, objectType: objectType, issueText: modalForm.value }
                }, () => {
                    drawBackground()
                    countIssuesAchievement()
                    modalContainer.style.display = "none";
                    document.body.removeChild(modalContainer)
                })
            })
            document.body.appendChild(modalContainer)
        } else {
            let issue = pageIssues.filter(filterID)[0]
            let modalContainer = document.createElement("div")
            modalContainer.style = " display: block; position: fixed;  z-index: 1;  left: 0; top: 0;width: 100%;  height: 100%;  overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4); ";
            let innerModal = document.createElement("div");
            innerModal.style = "background-color: rgb(211 245 230); margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; ";
            modalContainer.appendChild(innerModal);
            let modalSpan = document.createElement("span");
            modalSpan.style = "color: #aaa; float: right; font-size: 28px; font-weight: bold;";
            modalSpan.textContent = "X";
            innerModal.appendChild(modalSpan);
            let modalContent = document.createElement("p")
            modalContent.innerText = `Current issue for this element: ${issue.issueText}`
            innerModal.appendChild(modalContent);
            modalContent.style = "text-align: center; color: #2215E2; font-size: x-large"
            modalSpan.onclick = () => { modalContainer.style.display = "none"; };
            window.onclick = (event) => {
                if (event.target === modalContainer) {
                    modalContainer.style.display = "none";
                }
            };
            let modalButton = document.createElement("button")
            modalButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
            if (issue.username === profileInfo.username) {
                innerModal.appendChild(modalButton)
            }
            modalButton.textContent = "Mark as Solved"
            modalButton.id = "gamificationExtensionIssueModalButton"
            modalButton.addEventListener("click", (event) => {
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "delete",
                    body: "/pages/issues/" + profileInfo.username,
                    content: issue
                }, () => {
                    removeBackground()
                    drawBackground()
                    solveIssueAchievement()
                    modalContainer.style.display = "none";
                    document.body.removeChild(modalContainer)
                    let objects = objectType === "link" ? document.getElementsByTagName("a") : document.getElementsByName(objectType)
                    let nodes = objects[issue.objectId].childNodes
                    for (let k = 0; k < nodes.length; k++) {
                        if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                            objects[issue.objectId].removeChild(nodes[k])
                        }
                    }
                })
            })
            document.body.appendChild(modalContainer)
        }
    })
}

linkClickListener = (event, i, pageInfo) => {
    event.preventDefault()
    let els = document.body.getElementsByTagName("a");
    let goTo = event.target.href ? event.target.href : els[i].href
    chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats", "stack"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        let currentURL = result.currentURL
        if (result.interactionMode === "interact") {
            clickHandlerInteract(profileInfo, currentURL, els[i], "link", i, JSON.parse(result.pageStats), pageInfo)
            setTimeout(() => {
                window.location = goTo
                /*
                let stack = result.stack
                stack.push(goTo)
                chrome.storage.sync.set({ stack: stack, clickedLink: true, lastAction: "click", previousURL: currentURL, reloadCount: 0 })
            */}, 500)
        } else if (result.interactionMode === "signal") {
            event.preventDefault()
            clickHandlerSignal(profileInfo, currentURL, "link", i)
        }
    })
}

inputClickListener = (event, pageInfo) => {
    event.preventDefault()
    let els = document.body.getElementsByTagName("input");
    let found = false;
    for (let j = 0; j < els.length && !found; j++) {
        function filterID(event) {
            return event.objectId === (j) && event.objectType === "input"
        }
        if (els[j].id === event.target.id) {
            found = true
            chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats"], (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                let currentURL = result.currentURL
                if (result.interactionMode === "interact") {
                    if (els[j].value !== "") {
                        let allInputs = document.body.getElementsByTagName("input")
                        for (let k = 0; k < allInputs.length; k++) {
                            if (els[j].id === allInputs[k].id) {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/crops/" + profileInfo.username,
                                    method: "patch",
                                    content: { textContent: els[j].value, widgetId: k, submit: false }
                                })
                            }
                        }
                    }
                    removeBorders()
                    clickHandlerInteract(profileInfo, currentURL, els[j], "input", j, JSON.parse(result.pageStats), pageInfo)
                } else if (result.interactionMode === "signal") {
                    event.preventDefault()
                    clickHandlerSignal(profileInfo, currentURL, "input", j)
                }
            })
        }
    }
}

buttonClickListener = (event, pageInfo) => {
    let els = document.body.getElementsByTagName("button");
    let found = false;
    for (let j = 0; j < els.length && !found; j++) {
        function filterID(event) {
            return event.objectId === (j) && event.objectType === "button"
        }
        if (els[j].id === event.target.id) {
            found = true
            chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats"], (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                let currentURL = result.currentURL
                if (result.interactionMode === "interact") {
                    removeBorders()
                    clickHandlerInteract(profileInfo, currentURL, els[j], "button", j, JSON.parse(result.pageStats), pageInfo)
                } else if (result.interactionMode === "signal") {
                    event.preventDefault()
                    clickHandlerSignal(profileInfo, currentURL, "button", j)
                }
            })
        }
    }
}

selectClickListener = (event, pageInfo) => {
    let els = document.body.getElementsByTagName("select")
    let found = false
    for (let j = 0; j < els.length && !found; j++) {
        if (event.target.id === els[j].id) {
            found = true
            chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats"], (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                let currentURL = result.currentURL
                if (result.interactionMode === "interact") {
                    clickHandlerInteract(profileInfo, currentURL, els[j], "select", j, JSON.parse(result.pageStats), pageInfo)
                } else if (result.interactionMode === "signal") {
                    event.preventDefault()
                    clickHandlerSignal(profileInfo, currentURL, "select", j)
                }
            })
        }
    }
}

selectChangeListener = (event) => {
    let els = document.body.getElementsByTagName("select")
    let found = false
    for (let j = 0; j < els.length && !found; j++) {
        if (event.target.id === els[j].id) {
            found = true
            chrome.storage.sync.get(["interactionMode", "profileInfo"], (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                if (result.interactionMode === "interact") {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/crops/" + profileInfo.username,
                        method: "patch",
                        content: { selectIndex: els[j].options[els[j].selectedIndex].text, widgetId: j, submit: false }
                    })
                }
            })
        }
    }
}

formSubmitListener = (event, i) => {
    chrome.storage.sync.get(["profileInfo"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        let formObjects = document.getElementsByTagName("form")
        let inputs = formObjects[i].getElementsByTagName("input")
        let allInputs = document.body.getElementsByTagName("input")
        let j
        for (j = 0; j < inputs.length; j++) {
            if (inputs[j].type !== "hidden") {
                let textContent = inputs[j].value
                for (let k = 0; k < allInputs.length; k++) {
                    if (inputs[j].id === allInputs[k].id) {
                        chrome.runtime.sendMessage({
                            mess: "fetch",
                            body: "/pages/crops/" + profileInfo.username,
                            method: "patch",
                            content: { textContent: textContent, widgetId: k, submit: true }
                        })
                    }
                }
            }
        }
        //registrare un'ultima azione: invio nell'ultimo input testuale o clic sul submitter
        if (event.submitter === null) {
            let lastId = 0
            for (j = 0; j < inputs.length; j++) {
                if (inputs[j].type !== "hidden") {
                    lastId = j
                }
            }
            for (let k = 0; k < allInputs.length; k++) {
                if (inputs[lastId].id === allInputs[k].id) {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/crops/" + profileInfo.username,
                        method: "patch",
                        content: { widgetId: k, lastInput: true, submit: true }
                    })
                }
            }
        }
    })
}