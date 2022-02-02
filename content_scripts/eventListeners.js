linkClickListener = (event, i, pageInfo) => {
    event.preventDefault()
    const goTo = event.target.href
    let els = document.body.getElementsByTagName("a");
    function filterID(event) {
        return event.objectId === (i) && event.objectType === "link"
    }
    chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats", "stack"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        let currentURL = result.currentURL
        function filterURL(event) {
            return event.url === currentURL
        }
        //els[i].style.color = getMatchingCSSRules(els[i])
        if (result.interactionMode === "interact") {
            //Ottenimento coordinate dell'oggetto cliccato, usate per fare il resize dello screenshot
            //els[i].attributeStyleMap.clear()
            setTimeout(() => {
                let coords = { x: els[i].getBoundingClientRect().x, y: els[i].getBoundingClientRect().y, height: els[i].getBoundingClientRect().height, width: els[i].getBoundingClientRect().width }
                chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "link", widgetId: i, textContent: els[i].textContent.trim(), selectIndex: null }, mess: "capture" }, (request) => {
                    let canvas = document.createElement("canvas")
                    document.body.appendChild(canvas)
                    let image = new Image()
                    image.onload = () => {
                        canvas.width = request.coords.width
                        canvas.height = request.coords.height
                        let context = canvas.getContext("2d")
                        context.drawImage(image, request.coords.x, request.coords.y, request.coords.width, request.coords.height, 0, 0, request.coords.width, request.coords.height)
                        chrome.runtime.sendMessage({
                            mess: "fetch",
                            body: "/pages/crops/" + profileInfo.username,
                            content: { widgetType: request.widgetType, imageUrl: canvas.toDataURL(), widgetId: request.widgetId, textContent: request.textContent, selectIndex: request.selectIndex, selector: selector(els[i]), xpath: xpath(els[i]), elementId: els[i].id },
                            method: "post"
                        }, () => {
                            console.log(canvas.toDataURL())
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/actions/" + profileInfo.username,
                                method: "get",
                                content: { url: currentURL }
                            }, (response3) => {
                                let pageStatsObj = JSON.parse(result.pageStats);
                                let psObj = pageStatsObj.filter(filterURL)[0]
                                let intLinkIds = psObj.interactedLinks
                                let intLinkPos = intLinkIds.indexOf(i);
                                if (intLinkPos < 0) {
                                    intLinkIds.push(i);
                                    psObj.interactedLinks = intLinkIds;
                                }
                                let pageActions = response3.data
                                let newLink = pageActions.filter(filterID).length === 0
                                if (newLink) {
                                    let newlinkIds = psObj.newLinks;
                                    let newLinkPos = newlinkIds.indexOf(i);
                                    if (newLinkPos < 0) {
                                        newlinkIds.push(i);
                                        psObj.newLinks = newlinkIds;
                                    }
                                }
                                chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) }, () => {
                                    setTimeout(() => {
                                        chrome.storage.sync.get(["overlayMode"], (result) => {
                                            if (result.overlayMode === "interacted") {
                                                drawBorderOnInteracted()
                                            } else if (result.overlayMode === "all") {
                                                drawBorderOnAll()
                                            }
                                        })
                                    }, 3000);
                                    if (newLink) {
                                        chrome.runtime.sendMessage({
                                            mess: "fetch",
                                            body: "/pages/actions",
                                            method: "post",
                                            content: { url: currentURL, username: profileInfo.username, objectId: i, objectType: "link" }
                                        }, () => {
                                            let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                            let interactedLinks = pageActions.filter(filterLink).length + 1
                                            let interactedInputs = pageActions.filter(filterInput).length
                                            let interactedButtons = pageActions.filter(filterButton).length
                                            let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                            innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                            innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                            let sidenavProgress = document.getElementById("gamificationExtensionLinksProgress")
                                            let widgetProgress = interactedLinks * 100 / pageInfo.totalLinkObjects
                                            if (widgetProgress > 100) {
                                                widgetProgress = 100
                                            }
                                            sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                            sidenavProgress.textContent = "Links Progress: " + widgetProgress.toFixed(2) + "%"
                                            let table = document.getElementById("gamificationExtensionPageStatsTable")
                                            let linksRow = table.rows[1]
                                            let pageStat = pageStatsObj.filter(filterURL)[0]
                                            linksRow.cells[1].innerHTML = pageStat.interactedLinks.length
                                            linksRow.cells[2].innerHTML = pageStat.newLinks.length
                                            linksRow.cells[3].innerHTML = pageActions.filter(filterLink).length + 1
                                            pageCoverageAchievements(progress, widgetProgress)
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/records/" + profileInfo.username,
                                                method: "post",
                                                content: { username: profileInfo.username, url: currentURL, coverage: progress, linksCoverage: widgetProgress },
                                                firstTime: false
                                            })
                                        })

                                    }
                                });
                            })
                        })
                        window.location = goTo
                        let stack = result.stack
                        stack.push(goTo)
                        chrome.storage.sync.set({ stack: stack, clickedLink: true, lastAction: "click", previousURL: currentURL, reloadCount: 0 })
                    }
                    image.src = request.dataUrl
                })
            }, 100)


        } else if (result.interactionMode === "signal") {
            event.preventDefault()
            chrome.runtime.sendMessage({
                mess: "fetch",
                body: "/pages/issues/" + profileInfo.username,
                method: "get",
                content: { url: currentURL }
            }, (response3) => {
                let pageIssues = response3.data
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
                    modalButton.addEventListener("click", (event) => {
                        chrome.runtime.sendMessage({
                            mess: "fetch",
                            body: "/pages/issues",
                            method: "post",
                            content: { url: currentURL, username: profileInfo.username, objectId: i, objectType: "link", issueText: modalForm.value }
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
                            let linkObjects = document.getElementsByTagName("a")
                            let nodes = linkObjects[issue.objectId].childNodes
                            for (let k = 0; k < nodes.length; k++) {
                                if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                    linkObjects[issue.objectId].removeChild(nodes[k])
                                }
                            }
                        })
                    })
                    document.body.appendChild(modalContainer)
                }
            })
        }
    })
}

inputClickListener = (event, pageInfo) => {
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
                function filterURL(event) {
                    return event.url === currentURL
                }
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
                    let coords = { x: 0, y: 0, height: 0, width: 0 }
                    if (els[j].type === "radio" || els[j].type === "checkbox") {
                        coords.x = els[j].parentElement.getBoundingClientRect().x
                        coords.y = els[j].parentElement.getBoundingClientRect().y
                        coords.height = els[j].parentElement.getBoundingClientRect().height
                        coords.width = els[j].parentElement.getBoundingClientRect().width
                    } else {
                        coords.x = els[j].getBoundingClientRect().x
                        coords.y = els[j].getBoundingClientRect().y
                        coords.height = els[j].getBoundingClientRect().height
                        coords.width = els[j].getBoundingClientRect().width
                    }
                    chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "input", widgetId: j, textContent: null, selectIndex: null }, mess: "capture" }, (request) => {
                        let canvas = document.createElement("canvas")
                        document.body.appendChild(canvas)
                        let image = new Image()
                        image.onload = () => {
                            canvas.width = request.coords.width
                            canvas.height = request.coords.height
                            let context = canvas.getContext("2d")
                            context.drawImage(image, request.coords.x, request.coords.y, request.coords.width, request.coords.height, 0, 0, request.coords.width, request.coords.height)
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/crops/" + profileInfo.username,
                                content: { widgetType: request.widgetType, imageUrl: canvas.toDataURL(), widgetId: request.widgetId, textContent: request.textContent, selectIndex: request.selectIndex, selector: selector(els[j]), xpath: xpath(els[j]), elementId: els[j].id },
                                method: "post"
                            }, () => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/actions/" + profileInfo.username,
                                    method: "get",
                                    content: { url: currentURL }
                                }, (response3) => {
                                    let pageStatsObj = JSON.parse(result.pageStats);
                                    let psObj = pageStatsObj.filter(filterURL)[0]
                                    let intInputIds = psObj.interactedInputs
                                    let intInputPos = intInputIds.indexOf(j);
                                    if (intInputPos < 0) {
                                        intInputIds.push(j);
                                        psObj.interactedInputs = intInputIds;
                                    }
                                    let pageActions = response3.data
                                    let newInput = pageActions.filter(filterID).length === 0
                                    if (newInput) {
                                        let newInputIds = psObj.newInputs;
                                        let newInputPos = newInputIds.indexOf(j);
                                        if (newInputPos < 0) {
                                            newInputIds.push(j);
                                            psObj.newInputs = newInputIds;
                                        }
                                    }
                                    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) }, () => {
                                        setTimeout(() => {
                                            chrome.storage.sync.get(["overlayMode"], (result) => {
                                                if (result.overlayMode === "interacted") {
                                                    drawBorderOnInteracted()
                                                } else if (result.overlayMode === "all") {
                                                    drawBorderOnAll()
                                                }
                                            })
                                        }, 3000);
                                        if (newInput) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/actions",
                                                method: "post",
                                                content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "input" }
                                            }, () => {
                                                let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                let interactedLinks = pageActions.filter(filterLink).length
                                                let interactedInputs = pageActions.filter(filterInput).length + 1
                                                let interactedButtons = pageActions.filter(filterButton).length
                                                let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                                innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                let sidenavProgress = document.getElementById("gamificationExtensionInputsProgress")
                                                let widgetProgress = interactedInputs * 100 / pageInfo.totalInputObjects
                                                if (widgetProgress > 100) {
                                                    widgetProgress = 100
                                                }
                                                sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                sidenavProgress.textContent = "Forms Progress: " + widgetProgress.toFixed(2) + "%"
                                                let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                let inputsRow = table.rows[2]
                                                let pageStat = pageStatsObj.filter(filterURL)[0]
                                                inputsRow.cells[1].innerHTML = pageStat.interactedInputs.length
                                                inputsRow.cells[2].innerHTML = pageStat.newInputs.length
                                                inputsRow.cells[3].innerHTML = pageActions.filter(filterInput).length + 1
                                                pageCoverageAchievements(progress, widgetProgress)
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/records/" + profileInfo.username,
                                                    method: "post",
                                                    content: { username: profileInfo.username, url: currentURL, coverage: progress, inputsCoverage: widgetProgress },
                                                    firstTime: false
                                                })
                                            })
                                        }
                                    })
                                })
                            })
                        }
                        image.src = request.dataUrl
                    })
                } else if (result.interactionMode === "signal") {
                    event.preventDefault()
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/issues/" + profileInfo.username,
                        method: "get",
                        content: { url: currentURL }
                    }, (response3) => {
                        let pageIssues = response3.data
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
                            modalButton.addEventListener("click", (event) => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/issues",
                                    method: "post",
                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "input", issueText: modalForm.value }
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
                                    let inputs = document.body.getElementsByTagName("input");
                                    let nodes = inputs[issue.objectId].childNodes
                                    for (let k = 0; k < nodes.length; k++) {
                                        if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                            inputs[issue.objectId].removeChild(nodes[k])
                                        }
                                    }
                                })
                            })
                            document.body.appendChild(modalContainer)
                        }
                    })
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
                function filterURL(event) {
                    return event.url === currentURL
                }
                if (result.interactionMode === "interact") {
                    els[j].attributeStyleMap.clear()
                    let coords = { x: els[j].getBoundingClientRect().x, y: els[j].getBoundingClientRect().y, height: els[j].getBoundingClientRect().height, width: els[j].getBoundingClientRect().width }
                    chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "button", widgetId: j, textContent: null, selectIndex: null }, mess: "capture" }, (request) => {
                        let canvas = document.createElement("canvas")
                        document.body.appendChild(canvas)
                        let image = new Image()
                        image.onload = () => {
                            canvas.width = request.coords.width
                            canvas.height = request.coords.height
                            let context = canvas.getContext("2d")
                            context.drawImage(image, request.coords.x, request.coords.y, request.coords.width, request.coords.height, 0, 0, request.coords.width, request.coords.height)
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/crops/" + profileInfo.username,
                                content: { widgetType: request.widgetType, imageUrl: canvas.toDataURL(), widgetId: request.widgetId, textContent: request.textContent, selectIndex: request.selectIndex, selector: selector(els[j]), xpath: xpath(els[j]), elementId: els[j].id },
                                method: "post"
                            }, () => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/actions/" + profileInfo.username,
                                    method: "get",
                                    content: { url: currentURL }
                                }, (response3) => {
                                    let pageStatsObj = JSON.parse(result.pageStats);
                                    let psObj = pageStatsObj.filter(filterURL)[0]
                                    let intButtonIds = psObj.interactedButtons
                                    let intButtonPos = intButtonIds.indexOf(j);
                                    if (intButtonPos < 0) {
                                        intButtonIds.push(j);
                                        psObj.interactedButtons = intButtonIds;
                                    }
                                    let pageActions = response3.data
                                    let newButton = pageActions.filter(filterID).length === 0
                                    if (newButton) {
                                        let newButtonIds = psObj.newButtons;
                                        let newButtonPos = newButtonIds.indexOf(j);
                                        if (newButtonPos < 0) {
                                            newButtonIds.push(j);
                                            psObj.newButtons = newButtonIds;
                                        }
                                    }
                                    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) }, () => {
                                        setTimeout(() => {
                                            chrome.storage.sync.get(["overlayMode"], (result) => {
                                                if (result.overlayMode === "interacted") {
                                                    drawBorderOnInteracted()
                                                } else if (result.overlayMode === "all") {
                                                    drawBorderOnAll()
                                                }
                                            })
                                        }, 3000);
                                        if (newButton) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/actions",
                                                method: "post",
                                                content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "button" }
                                            }, () => {
                                                let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                let interactedLinks = pageActions.filter(filterLink).length
                                                let interactedInputs = pageActions.filter(filterInput).length
                                                let interactedButtons = pageActions.filter(filterButton).length + 1
                                                let progress = ((interactedLinks + interactedInputs + interactedButtons) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects)
                                                innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                let sidenavProgress = document.getElementById("gamificationExtensionButtonsProgress")
                                                let widgetProgress = interactedButtons * 100 / pageInfo.totalButtonObjects
                                                if (widgetProgress > 100) {
                                                    widgetProgress = 100
                                                }
                                                sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                sidenavProgress.textContent = "Buttons Progress: " + widgetProgress.toFixed(2) + "%"
                                                let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                let buttonsRow = table.rows[3]
                                                let pageStat = pageStatsObj.filter(filterURL)[0]
                                                buttonsRow.cells[1].innerHTML = pageStat.interactedButtons.length
                                                buttonsRow.cells[2].innerHTML = pageStat.newButtons.length
                                                buttonsRow.cells[3].innerHTML = pageActions.filter(filterButton).length + 1
                                                pageCoverageAchievements(progress, widgetProgress)
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/records/" + profileInfo.username,
                                                    method: "post",
                                                    content: { username: profileInfo.username, url: currentURL, coverage: progress, buttonsCoverage: widgetProgress },
                                                    firstTime: false
                                                })
                                            })
                                        }
                                    })
                                })
                            })
                        }
                        image.src = request.dataUrl
                    })
                } else if (result.interactionMode === "signal") {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/issues/" + profileInfo.username,
                        method: "get",
                        content: { url: currentURL }
                    }, (response3) => {
                        let pageIssues = response3.data
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
                            modalButton.addEventListener("click", (event) => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/issues",
                                    method: "post",
                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "button", issueText: modalForm.value }
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
                            if (issue.username === profileInfo.username) {
                                innerModal.appendChild(modalButton)
                            }
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
                                    let buttonObjects = document.getElementsByTagName("button")
                                    let nodes = buttonObjects[issue.objectId].childNodes
                                    for (let k = 0; k < nodes.length; k++) {
                                        if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                            buttonObjects[issue.objectId].removeChild(nodes[k])
                                        }
                                    }
                                })
                            })
                            document.body.appendChild(modalContainer)
                        }
                    })
                }
            })
        }
    }
}

selectClickListener = (event, pageInfo) => {
    let els = document.body.getElementsByTagName("select")
    let found = false
    for (let j = 0; j < els.length && !found; j++) {
        function filterID(event) {
            return event.objectId === (j) && event.objectType === "select"
        }
        if (event.target.id === els[j].id) {
            found = true
            chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL", "pageStats"], (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                let currentURL = result.currentURL
                function filterURL(event) {
                    return event.url === currentURL
                }
                if (result.interactionMode === "interact") {
                    els[j].attributeStyleMap.clear()
                    let coords = { x: els[j].getBoundingClientRect().x, y: els[j].getBoundingClientRect().y, height: els[j].getBoundingClientRect().height, width: els[j].getBoundingClientRect().width }
                    chrome.runtime.sendMessage({ obj: { coords: coords, widgetType: "select", widgetId: j, textContent: null, selectIndex: null }, mess: "capture" }, (request) => {
                        let canvas = document.createElement("canvas")
                        document.body.appendChild(canvas)
                        let image = new Image()
                        image.onload = () => {
                            canvas.width = request.coords.width
                            canvas.height = request.coords.height
                            let context = canvas.getContext("2d")
                            context.drawImage(image, request.coords.x, request.coords.y, request.coords.width, request.coords.height, 0, 0, request.coords.width, request.coords.height)
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/crops/" + profileInfo.username,
                                content: { widgetType: request.widgetType, imageUrl: canvas.toDataURL(), widgetId: request.widgetId, textContent: request.textContent, selectIndex: null, selector: selector(els[j]), xpath: xpath(els[j]), elementId: els[j].id },
                                method: "post"
                            }, () => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/actions/" + profileInfo.username,
                                    method: "get",
                                    content: { url: currentURL }
                                }, (response3) => {

                                    let pageStatsObj = JSON.parse(result.pageStats);
                                    let psObj = pageStatsObj.filter(filterURL)[0]
                                    let intSelectIds = psObj.interactedSelects
                                    let intSelectPos = intSelectIds.indexOf(j);
                                    if (intSelectPos < 0) {
                                        intSelectIds.push(j);
                                        psObj.interactedSelects = intSelectIds;
                                    }
                                    let pageActions = response3.data
                                    let newSelect = pageActions.filter(filterID).length === 0
                                    if (newSelect) {
                                        let newSelectIds = psObj.newSelects;
                                        let newSelectPos = newSelectIds.indexOf(j);
                                        if (newSelectPos < 0) {
                                            newSelectIds.push(j);
                                            psObj.newSelects = newSelectIds;
                                        }
                                    }
                                    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) }, () => {
                                        setTimeout(() => {
                                            chrome.storage.sync.get(["overlayMode"], (result) => {
                                                if (result.overlayMode === "interacted") {
                                                    drawBorderOnInteracted()
                                                } else if (result.overlayMode === "all") {
                                                    drawBorderOnAll()
                                                }
                                            })
                                        }, 3000);
                                        if (newSelect) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/actions",
                                                method: "post",
                                                content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "select" }
                                            }, () => {
                                                let innerDiv = document.getElementById("gamificationExtensionTopnavInner");
                                                let interactedLinks = pageActions.filter(filterLink).length
                                                let interactedInputs = pageActions.filter(filterInput).length
                                                let interactedButtons = pageActions.filter(filterButton).length
                                                let interactedSelects = pageActions.filter(filterSelect).length + 1
                                                let progress = ((interactedLinks + interactedInputs + interactedButtons + interactedSelects) * 100) / (pageInfo.totalLinkObjects + pageInfo.totalInputObjects + pageInfo.totalButtonObjects + pageInfo.totalSelectObjects)
                                                innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                                                innerDiv.textContent = "Progress: " + progress.toFixed(2) + "%";
                                                let sidenavProgress = document.getElementById("gamificationExtensionSelectsProgress")
                                                let widgetProgress = interactedSelects * 100 / pageInfo.totalSelectObjects
                                                if (widgetProgress > 100) {
                                                    widgetProgress = 100
                                                }
                                                sidenavProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + widgetProgress + `%; white-space:nowrap`;
                                                sidenavProgress.textContent = "Dropdown Menus Progress: " + widgetProgress.toFixed(2) + "%"
                                                let table = document.getElementById("gamificationExtensionPageStatsTable")
                                                let buttonsRow = table.rows[4]
                                                let pageStat = pageStatsObj.filter(filterURL)[0]
                                                buttonsRow.cells[1].innerHTML = pageStat.interactedSelects.length
                                                buttonsRow.cells[2].innerHTML = pageStat.newSelects.length
                                                buttonsRow.cells[3].innerHTML = pageActions.filter(filterSelect).length + 1
                                                pageCoverageAchievements(progress, widgetProgress)
                                                chrome.runtime.sendMessage({
                                                    mess: "fetch",
                                                    body: "/pages/records/" + profileInfo.username,
                                                    method: "post",
                                                    content: { username: profileInfo.username, url: currentURL, coverage: progress, selectsCoverage: widgetProgress },
                                                    firstTime: false
                                                })
                                            })
                                        }
                                    })
                                })
                            })
                        }
                        image.src = request.dataUrl
                    })
                } else if (result.interactionMode === "signal") {
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        body: "/pages/issues/" + profileInfo.username,
                        method: "get",
                        content: { url: currentURL }
                    }, (response3) => {
                        let pageIssues = response3.data
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
                            modalButton.addEventListener("click", (event) => {
                                chrome.runtime.sendMessage({
                                    mess: "fetch",
                                    body: "/pages/issues",
                                    method: "post",
                                    content: { url: currentURL, username: profileInfo.username, objectId: j, objectType: "select", issueText: modalForm.value }
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
                                    let selectObjects = document.body.getElementsByTagName("select")
                                    let nodes = selectObjects[issue.objectId].childNodes
                                    for (let k = 0; k < nodes.length; k++) {
                                        if (nodes[k].id && nodes[k].id.indexOf("gamificationExtensionTooltipIssue") >= 0) {
                                            selectObjects[issue.objectId].removeChild(nodes[k])
                                        }
                                    }
                                })
                            })
                            document.body.appendChild(modalContainer)
                        }
                    })
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