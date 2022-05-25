isTagInvalid = (tag) => {
    return (
        tag === "a" ||
        tag === "input" ||
        tag === "button" ||
        tag === "select" ||
        tag === "table" ||
        tag === "body"
    )
}

isElementOfExtension = (id, path) => {
    return (id.indexOf("gamificationExtension") >= 0 || path.indexOf("gamificationExtension") >= 0)
}

window.addEventListener("click", (event) => {
    chrome.storage.sync.get(["interactionMode", "profileInfo", "currentURL"], (result) => {
        let profileInfo = JSON.parse(result.profileInfo)
        let tag = event.target.tagName.toLowerCase()
        let id = event.target.id
        let els = document.getElementsByTagName(tag)
        for (let i = 0; i < els.length; i++) {
            if (els[i] === event.target) {
                if (!isElementOfExtension(id, xpath(event.target))) {
                    if (!isTagInvalid(tag)) {
                        filterId = (ev) => {
                            return ev.objectId === i && ev.objectType === tag
                        }
                        if (result.interactionMode === "interact") {
                            removeBorders()
                            html2canvas(event.target, options).then((canvas) => {
                                //console.log(canvas.toDataURL())
                                chrome.runtime.sendMessage({
                                    "mess": "fetch",
                                    "body": "/pages/crops/" + profileInfo.username,
                                    "method": "post",
                                    "content": { widgetType: tag, imageUrl: canvas.toDataURL(), widgetId: i, textContent: null, selectIndex: null, selector: selector(event.target), xpath: xpath(event.target), elementId: id }
                                }, () => {
                                    chrome.runtime.sendMessage({
                                        "mess": "fetch",
                                        "body": "/pages/actions/" + profileInfo.username,
                                        "method": "get",
                                        "content": { url: result.currentURL }
                                    }, (response) => {
                                        chrome.storage.sync.get(["overlayMode"], (result) => {
                                            if (result.overlayMode === "interacted") {
                                                drawBorderOnInteracted()
                                            } else if (result.overlayMode === "all") {
                                                drawBorderOnAll()
                                            }
                                        })
                                        let pageActions = response.data
                                        let newEl = pageActions.filter(filterId).length === 0
                                        if (newEl) {
                                            chrome.runtime.sendMessage({
                                                "mess": "fetch",
                                                body: "/pages/actions",
                                                method: "post",
                                                content: { url: result.currentURL, username: profileInfo.username, objectId: i, objectType: tag }
                                            }, () => {
                                                //update sidenav counter
                                            })
                                        }
                                    })
                                })
                            })
                        } else if (result.interactionMode === "signal") {
                            console.log(event.target)
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/issues/" + profileInfo.username,
                                method: "get",
                                content: { url: result.currentURL }
                            }, (response) => {
                                if (response.data.filter(filterId).length === 0) {
                                    let modalContainer = document.createElement("div")
                                    modalContainer.id = "gamificationExtensionIssueModal"
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
                                    /*window.onclick = (event) => {
                                        if (event.target === modalContainer) {
                                            modalContainer.style.display = "none";
                                        }
                                    };*/
                                    let modalButton = document.createElement("button")
                                    modalButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
                                    innerModal.appendChild(modalButton)
                                    modalButton.textContent = "Submit Issue"
                                    modalButton.id = "gamificationExtensionIssueModalButton"
                                    modalButton.addEventListener("click", () => {
                                        if (modalForm.value) {
                                            chrome.runtime.sendMessage({
                                                mess: "fetch",
                                                body: "/pages/issues",
                                                method: "post",
                                                content: { url: result.currentURL, username: profileInfo.username, objectId: i, objectType: tag, issueText: modalForm.value }
                                            }, () => {
                                                drawBackground()
                                                countIssuesAchievement()
                                                modalContainer.style.display = "none";
                                                document.body.removeChild(modalContainer)
                                            })
                                        } else {
                                            alert("Please write an issue before submitting")
                                        }
                                    })
                                    document.body.appendChild(modalContainer)
                                } else {
                                    let issue = response.data.filter(filterId)[0]
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
                                            let objects = issue.objectType === "link" ? document.getElementsByTagName("a") : document.getElementsByTagName(issue.objectType)
                                            let nodes = objects[issue.objectId].childNodes
                                            objects[issue.objectId].style = "background-image: none"
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

                    }
                }
            }
        }

    })
})