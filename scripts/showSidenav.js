/**
 * Script that adds the extension menu to the page's HTML document
 * The menu is added only once, avoiding multiple additions in case of tab changes
 */
if (document.getElementById("gamificationExtensionSidenav") === null) {
    let sideDiv = document.createElement("div");
    sideDiv.style.overflowY = "scroll"
    //Creation of the arrow-shaped button that opens the menu
    let button = document.createElement("img");
    document.body.appendChild(button);
    button.id = "gamificationExtensionSidenavButton";
    button.style = "position: fixed; top: 50%; right: 0; width: 40px;";
    button.onclick = () => {
        document.getElementById("gamificationExtensionSidenav").style.width = "50%";
    };
    button.src = chrome.runtime.getURL("img/arrow_left.png")
    document.body.appendChild(sideDiv);
    sideDiv.id = "gamificationExtensionSidenav";
    sideDiv.style = "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; transition: 0.5s; overflow-y: scroll";
    //Creation of the X-shaped button used for closing the menu
    let closeButtonDiv = document.createElement("div")
    closeButtonDiv.id = "gamificationExtensionCloseButtonDiv"
    closeButtonDiv.style = "display: flex; justify-content: space-between"
    sideDiv.appendChild(closeButtonDiv)
    let closeButton = document.createElement("img");
    closeButtonDiv.appendChild(closeButton);
    closeButton.src = chrome.runtime.getURL("img/cross.png")
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.style = "bottom: 10%; right: 50%; background-color: transparent; width: 40px; height: 40px";
    closeButton.onclick = () => {
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    let homeButton = document.createElement("button")
    homeButton.id = "gamificationExtensionHomeButton"
    homeButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
    homeButton.textContent = "Return to Starting Page"
    homeButton.onclick = () => {
        chrome.storage.sync.get(["baseURL", "profileInfo", "currentURL"], (result) => {
            let profileInfo = JSON.parse(result.profileInfo)
            chrome.runtime.sendMessage({
                mess: "fetch",
                body: "/pages/crops/" + profileInfo.username,
                content: { widgetType: "back", imageUrl: null, widgetId: 0, textContent: null, selectIndex: null, selector: null, xpath: null, elementId: null },
                method: "post"
            }, () => {
                chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "post",
                    body: "/sessions/add/" + profileInfo.username,
                    content: { url: result.currentURL, action: "Change URL", content: result.baseURL }
                }, () => window.location = result.baseURL)
            })
        })
    }
    closeButtonDiv.appendChild(homeButton)
    //Creation of the button used for ending a testing session
    let endButton = document.createElement("button");
    closeButtonDiv.appendChild(endButton);
    endButton.id = "gamificationExtensionEndSessionButton";
    endButton.textContent = "End Session";
    endButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
    endButton.onclick = () => {
        //Closure and removal of the extension menu
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
        document.getElementById("gamificationExtensionSidenav").remove()
        document.getElementById("gamificationExtensionSidenavButton").remove()

        //Removal of the star-shaped easter egg, if present
        let star = document.getElementById("gamificationExtensionNewPageStar");
        if (star != null) {
            document.body.removeChild(star);
        }

        //Removal of eventual overlays present in the page (widget highlights, signaled issues)
        removeBorders();
        removeBackground()

        //Removal of the progress bar
        let topnav = document.getElementById("gamificationExtensionTopnav");
        if (topnav != null) {
            document.body.removeChild(topnav);
        }

        //Creation and display of the recap modal
        chrome.storage.sync.get(
            ["visitedPages", "newPages", "pageStats", "currentURL", "profileInfo", "pageSession"],
            (result) => {
                let profileInfo = JSON.parse(result.profileInfo)
                let visitedPages = result.visitedPages;
                let newPages = result.newPages;
                let modalContainer = document.createElement("div");
                let pageStats = JSON.parse(result.pageStats);
                chrome.runtime.sendMessage({
                    //Fetching of previous records in the page made by the user and of global user records
                    mess: "fetch",
                    body: "/pages/records/" + profileInfo.username,
                    method: "get"
                }, (response) => {
                    let records = response.data
                    chrome.runtime.sendMessage({
                        mess: "fetch",
                        method: "get",
                        body: "/users/" + profileInfo.username + "/records"
                    }, (response2) => {
                        let userRecords = response2.data
                        //Past highest scores of user obtained to be compared with scores obtained in the current session
                        let highestNewWidgets = userRecords.highestNewWidgets
                        let highestCoverage = userRecords.highestCoverage
                        let highestNewVisitedPages = userRecords.highestNewVisitedPages
                        let newWidgets = 0
                        for (let page of pageStats) { //Records are updated for each page visited during the session
                            function filterURL(event) {
                                return event.url === page.url
                            }
                            let pageRecords = records.filter(filterURL)[0]
                            //Comparison between the amount of new elements found during the current session and the record for the page
                            let highestLinks = page.newLinks.length > pageRecords.highestLinks ? page.newLinks.length : undefined
                            let highestInputs = page.newInputs.length > pageRecords.highestInputs ? page.newInputs.length : undefined
                            let highestButtons = page.newButtons.length > pageRecords.highestButtons ? page.newButtons.length : undefined
                            let highestSelects = page.newSelects.length > pageRecords.highestSelects ? page.newSelects.length : undefined
                            //Record about new widgets is updated if total of new widgets found in the page higher than previous record 
                            let highestWidgets = ((page.newLinks.length + page.newInputs.length + page.newButtons.length + page.newSelects.length) >= pageRecords.highestWidgets) ? page.newLinks.length + page.newInputs.length + page.newButtons.length + page.newSelects.length : undefined
                            //Count of new widgets found during session increased with new widgets found in the page
                            newWidgets += page.newLinks.length + page.newInputs.length + page.newButtons.length + page.newSelects.length
                            //Record about coverage updated in case page has higher coverage than previous record (even counting pages of the current session)
                            if (pageRecords.coverage > highestCoverage) {
                                highestCoverage = pageRecords.coverage
                            }
                            chrome.runtime.sendMessage({
                                //Updating the records for each page
                                mess: "fetch",
                                body: "/pages/records/" + profileInfo.username,
                                method: "post",
                                content: { username: profileInfo.username, url: page.url, highestLinks: highestLinks, highestInputs: highestInputs, highestButtons: highestButtons, highestSelects: highestSelects, highestWidgets: highestWidgets },
                                firstTime: false
                            })
                        }
                        //Records about new visited pages and new widgets found are updated if they're beaten
                        if (newPages.length > highestNewVisitedPages) {
                            highestNewVisitedPages = newPages.length
                        }
                        if (newWidgets > highestNewWidgets) {
                            highestNewWidgets = newWidgets
                        }
                        chrome.runtime.sendMessage({
                            //Updates user records
                            mess: "fetch",
                            method: "post",
                            body: "/users/" + profileInfo.username + "/records",
                            content: { username: profileInfo.username, highestNewVisitedPages: highestNewVisitedPages, highestNewWidgets: highestNewWidgets, highestCoverage: highestCoverage }
                        }, () => {
                            //Function that checks whether the user has reached one of the best three position in a leaderboard and unlocks a new avatar
                            leaderboardAvatars()
                            //Creation of the recap modal
                            modalContainer.id = "gamificationExtensionModalContainer";
                            modalContainer.style = " display: block; position: fixed;  z-index: 1;  left: 0; top: 0;width: 100%;  height: 100%;  overflow: auto; background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4); ";
                            let innerModal = document.createElement("div");
                            innerModal.id = "gamificationExtensionInnerModal";
                            innerModal.style = "background-color: rgb(211 245 230); margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; ";
                            modalContainer.appendChild(innerModal);
                            let modalSpan = document.createElement("span");
                            modalSpan.id = "gamificationExtensionModalSpan";
                            modalSpan.style = "color: #aaa; float: right; font-size: 28px; font-weight: bold;";
                            modalSpan.textContent = "X";
                            innerModal.appendChild(modalSpan);
                            let modalContent = document.createElement("p");
                            modalContent.id = "gamificationExtensionModalContent";
                            modalContent.style = "text-align: center; font-size: large; color: #2215E2"

                            let totalLinks = 0
                            let totalInputs = 0
                            let totalButtons = 0
                            let totalSelects = 0
                            let newLinks = 0
                            let newInputs = 0
                            let newButtons = 0
                            let newSelects = 0;
                            //Count of all widgets interacted with during the session and of the new ones found
                            for (let i = 0; i < pageStats.length; i++) {
                                totalLinks += pageStats[i].interactedLinks.length;
                                totalInputs += pageStats[i].interactedInputs.length;
                                totalButtons += pageStats[i].interactedButtons.length;
                                totalSelects += pageStats[i].interactedSelects.length;
                                newLinks += pageStats[i].newLinks.length;
                                newInputs += pageStats[i].newInputs.length;
                                newButtons += pageStats[i].newButtons.length;
                                newSelects += pageStats[i].newSelects.length;
                            }
                            modalContent.innerText = "Pages visited in this session: " + visitedPages.length + "\nPages encountered for the first time: " + newPages.length +
                                "\nLinks clicked in this session: " + totalLinks + "\nLinks clicked for the first time: " + newLinks +
                                "\nForms interacted with in this session: " + totalInputs + "\nForms interacted with for the first time: " + newInputs +
                                "\nButtons clicked in this session: " + totalButtons + "\nButtons clicked for the first time: " + newButtons +
                                "\nDropdown menus interacted with in this session: " + totalSelects + "\nDropdown menus interacted with for the first time: " + newSelects;
                            innerModal.appendChild(modalContent);
                            //Closure of the modal, whether done with the X-button of by clicking outside of the modal, reloads the page and removes the event listeners
                            modalSpan.onclick = () => {
                                modalContainer.style.display = "none";
                                //location.reload()
                                chrome.runtime.sendMessage({
                                    mess: "end"
                                })
                            };
                            window.onclick = (event) => {
                                if (event.target === modalContainer) {
                                    modalContainer.style.display = "none";
                                    //location.reload()
                                    chrome.runtime.sendMessage({
                                        mess: "end"
                                    })
                                }
                            };
                            document.body.appendChild(modalContainer);
                            chrome.runtime.sendMessage({
                                //Fetching information about the sequence of performed actions, to create SikuliX and Selenium scripts
                                mess: "fetch",
                                body: "/pages/crops/" + profileInfo.username,
                                method: "get"
                            }, (response3) => {
                                let ret = response3.data
                                //A new avatar is unlocked if the user has interacted with at least three different tipes of widgets
                                if (countWidgets(ret) >= 3) {
                                    countActionsAvatar()
                                }
                                chrome.storage.sync.get(["baseURL"], (result) => {
                                    let baseURL = result.baseURL
                                    //Creation of a .zip folder containing the SikuliX script (a second .zip folder) and the Selenium script
                                    let zip = new JSZip()
                                    let reports = zip.folder("reports")
                                    let scripts = reports.folder("scripts")
                                    let inner = scripts.folder("scripts.sikuli")
                                    let issueReports = reports.folder("issues")
                                    let sessionLog = reports.folder("session log")
                                    let readme = "This folder contains the various reports generated during the testing session you have just finished.\n" +
                                        "Its content are divided as follows:\n" +
                                        `   - "scripts" folder: this folder contains scripts whose purpose is to emulate as faithfully as possible the actions you have performed during the session (clicking on elements, writing into text fields, selecting values from menus and so on).\n` +
                                        `       More in detail: the "script.sikuli" folder is to be used with the SikuliX program, while the single file with ".side" extension is compatible with "Selenium IDE", a web browser extension.\n` +
                                        `   - "issues" folder: this folder contains an image for each element you have reported an issue for, together with an html file which, if opened in browser, displays a table listing information about the reported issues.\n` +
                                        `   - "session log" folder: this folder acts as a combination  of the behaviors of the two previous ones, seeing as it contains an image of each element you have either interacted with or reported an issue for, along with an html file displaying all the actions performed, in the exact sequence you have performed them.`
                                    reports.file("readme.txt", readme)
                                    //Creation, for each imageUrl corresponding to the screenshot of an interacted element, of an image file used by SikuliX
                                    for (let i = 0; i < ret.length; i++) {
                                        if (ret[i].imageUrl) {
                                            let byteString = atob(ret[i].imageUrl.split(',')[1])
                                            let mimeString = ret[i].imageUrl.split(',')[0].split(':')[1].split(';')[0]
                                            let ab = new ArrayBuffer(byteString.length);
                                            let ia = new Uint8Array(ab);
                                            for (let j = 0; j < byteString.length; j++) {
                                                ia[j] = byteString.charCodeAt(j);
                                            }
                                            let blob = new Blob([ab], { type: mimeString });
                                            inner.file(`img${i + 1}.png`, blob)
                                        }
                                    }
                                    //Creation of the Python file used by SikuliX
                                    let text = `popup("Beginning replay of past session")\n`
                                    for (let i = 0; i < ret.length; i++) {
                                        //Checking if the image is currently on screen and scrolling down until it's found if not present
                                        text += "max = 20\n"
                                        text += "wait(5)\n"
                                        if (ret[i].widgetType === "back") {
                                            text += `type("l", Key.CTRL)\ntype("a", Key.CTRL)\ntype("${baseURL}" + Key.ENTER)\n`
                                        } else {
                                            text += "while(max > 0):\n"
                                            text += `   if not exists(Pattern("img${i + 1}.png").similar(0.55), 0):\n`
                                            text += "       wheel(WHEEL_DOWN, 1)\n"
                                            text += "       max-=1\n"
                                            text += "   else:\n"
                                            text += "       max=-1\n"
                                            text += "       break\n"
                                            if (ret[i].widgetType === "input") {
                                                //If a widget is an input field the necessary content is written by the script
                                                for (let j = 0; j < i; j++) {
                                                    if (ret[j].widgetType === "input" && i > 0 && ret[i].widgetId === ret[j].widgetId) {
                                                        //Check if an input field already has an inserted value, which is replaced
                                                        text += `type(Pattern("img${i + 1}.png").similar(0.55), "a", KeyModifier.CTRL)\n`
                                                        text += `type(Pattern("img${i + 1}.png").similar(0.55), Key.BACKSPACE)\n`
                                                    }
                                                }
                                                text += `type(Pattern("img${i + 1}.png").similar(0.55), "${ret[i].textContent}"`
                                                //In case the input field is the last one of its form, and the form is submitted with the ENTER key, the script handles submission in said way
                                                if (ret[i].lastInput) {
                                                    text += ` + Key.ENTER)\n`
                                                } else {
                                                    text += `)\n`
                                                }
                                            } else if (ret[i].widgetType !== "back") {
                                                //Other widgets simply have to be clicked
                                                text += `click(Pattern("img${i + 1}.png").similar(0.55))\n`
                                                if (ret[i].widgetType === "select") {
                                                    //Selection of the adequate element in a dropdown menu is done by typing the entire string associated to the option
                                                    text += `type("${ret[i].selectIndex}")\n`
                                                }
                                            }
                                        }
                                        //Scrolling back up to the beginning of the page to start back for the next operation
                                        text += "wheel(WHEEL_UP, 20-max)\n"
                                    }
                                    text += `popup("Ending replay of past session")\n`
                                    inner.file("script.py", text)

                                    //Definition of the starting structure used by a Selenium script
                                    let seleniumFile = {
                                        id: "idProject",
                                        version: "2.0",
                                        name: "Gamification Extension - Selenium Testing Project",
                                        url: baseURL ? baseURL : "https://google.it",
                                        tests: [{
                                            id: "idTests",
                                            name: "Gamification Extension - Selenium Test",
                                            commands: []
                                        }],
                                        suites: [{
                                            id: "idSuite",
                                            name: "Default Suite",
                                            persistSession: false,
                                            parallel: false,
                                            timeout: 300,
                                            tests: ["idTests"]
                                        }],
                                        urls: [baseURL ? baseURL : "https://google.it"],
                                        plugins: []
                                    }
                                    let commands = []
                                    //Command used to open the starting URL of the session
                                    let openCommand = {
                                        id: `idCommand0`,
                                        comment: "",
                                        command: "open",
                                        target: baseURL,
                                        targets: [baseURL],
                                        value: ""
                                    }
                                    commands.push(openCommand)
                                    for (let i = 0; i < ret.length; i++) {
                                        //Creation of a new command associated to each interacted element
                                        let commandObj = {
                                            id: `idCommand${i + 1}`,
                                            comment: "",
                                            //Selection of the adequate command based on the element type (typing for forms that have a text content, selecting for a dropdown menu, clicking for links and buttons)
                                            command: ret[i].textContent && ret[i].widgetType !== "link" ? "type" : ret[i].selectIndex ? "select" : ret[i].widgetType !== "back" ? "click" : "open",
                                            target: "",
                                            targets: [],
                                            //Insertion of the value to be typed/selected by the script in relation to the element
                                            value: ret[i].textContent && ret[i].widgetType !== "link" ? ret[i].textContent : ret[i].selectIndex ? `label=${ret[i].selectIndex}` : ""
                                        }
                                        //The CSS selector is used as the main identified of the element for the script
                                        commandObj.target = ret[i].widgetType !== "back" ? `css=${ret[i].selector}` : baseURL
                                        ret[i].widgetType !== "back" ? commandObj.targets.push([`css=${ret[i].selector}`, "css:finder"]) : commandObj.targets.push(baseURL)

                                        //Other possible selectors are inserted, if they exist
                                        if (ret[i].elementId) {
                                            commandObj.targets.push([`id=${ret[i].elementId}`, "id"])
                                        }
                                        if (ret[i].widgetType === "link") {
                                            commandObj.targets.push([`linkText=${ret[i].textContent}`, "linkText"])
                                        }
                                        //Insertion of the xpath as another possible selector
                                        commandObj.targets.push([`xpath=${ret[i].xpath}`, "xpath:idRelative"])

                                        commands.push(commandObj)
                                        if (ret[i].lastInput) {
                                            //Creation of an additional command used for entering values in a form, when its last value has been inserted
                                            let sendCommand = {
                                                id: `idCommandSendKeys`,
                                                comment: "",
                                                command: "sendKeys",
                                                target: `css=${ret[i].selector}`,
                                                targets: [`css=${ret[i].selector}`, "css:finder"],
                                                value: "${KEY_ENTER}"
                                            }
                                            commands.push(sendCommand)
                                        }
                                    }
                                    seleniumFile.tests[0].commands = commands
                                    //Creation of the .side file representing the script
                                    scripts.file("gamification-extension-selenium-testing-project.side", JSON.stringify(seleniumFile))
                                    //Download of the entire .zip folder
                                    chrome.runtime.sendMessage({
                                        mess: "fetch",
                                        method: "get",
                                        body: "/pages/issues/crops/" + profileInfo.username
                                    }, (response4) => {
                                        let issues = response4.data
                                        for (let i = 0; i < issues.length; i++) {
                                            if (issues[i].imageUrl) {
                                                let byteString = atob(issues[i].imageUrl.split(',')[1])
                                                let mimeString = issues[i].imageUrl.split(',')[0].split(':')[1].split(';')[0]
                                                let ab = new ArrayBuffer(byteString.length);
                                                let ia = new Uint8Array(ab);
                                                for (let j = 0; j < byteString.length; j++) {
                                                    ia[j] = byteString.charCodeAt(j);
                                                }
                                                let blob = new Blob([ab], { type: mimeString });
                                                issueReports.file(`img${i + 1}.png`, blob)
                                            }
                                        }
                                        let htmlReport = "<!DOCTYPE html>\n" +
                                            "<html>\n" +
                                            "<head>\n" +
                                            "<title>GaTE - Issue Report</title>\n" +
                                            "</head>\n" +
                                            `<body style="background-color: rgb(211 245 230);">\n` +
                                            `<header>\n` +
                                            `<h1 style="text-align: center; color:#2215E2" id="title">Issues reported during the last session</h1>\n` +
                                            `</header>\n` +
                                            `<table>\n` +
                                            `<tr style="text-align:center">\n` +
                                            `<th>Reported Widget</th>\n` +
                                            `<th>Issue</th>\n` +
                                            `<th>Widget Type</th>\n` +
                                            `</tr>\n`
                                        for (let i = 0; i < issues.length; i++) {
                                            htmlReport += `<tr style="text-align:center">\n` +
                                                `<td><img src="./img${i + 1}.png" style="width: 200px"></img></td>\n` +
                                                `<td>${issues[i].issueText}</td>\n` +
                                                `<td>${issues[i].widgetType}</td>\n`
                                        }
                                        htmlReport += `</table>\n` +
                                            `</body>\n` +
                                            `</html>`
                                        issueReports.file("issueReports.html", htmlReport)
                                        chrome.runtime.sendMessage({
                                            mess: "fetch",
                                            method: "get",
                                            body: "/sessions/end/" + profileInfo.username
                                        }, (response5) => {
                                            let actions = response5.data
                                            for (let i = 0; i < actions.length; i++) {
                                                if (actions[i].imageUrl) {
                                                    let byteString = atob(actions[i].imageUrl.split(',')[1])
                                                    let mimeString = actions[i].imageUrl.split(',')[0].split(':')[1].split(';')[0]
                                                    let ab = new ArrayBuffer(byteString.length);
                                                    let ia = new Uint8Array(ab);
                                                    for (let j = 0; j < byteString.length; j++) {
                                                        ia[j] = byteString.charCodeAt(j);
                                                    }
                                                    let blob = new Blob([ab], { type: mimeString });
                                                    sessionLog.file(`img${i + 1}.png`, blob)
                                                }
                                            }
                                            let htmlLog = "<!DOCTYPE html>\n" +
                                                "<html>\n" +
                                                "<head>\n" +
                                                "<title>GaTE - Session Log</title>\n" +
                                                "</head>\n" +
                                                `<body style="background-color: rgb(211 245 230);">\n` +
                                                `<header>\n` +
                                                `<h1 style="text-align: center; color:#2215E2" id="title">Actions performed during the last session</h1>\n` +
                                                `</header>\n` +
                                                `<table>\n` +
                                                `<tr style="text-align:center">\n` +
                                                `<th>Widget</th>\n` +
                                                `<th>Action</th>\n` +
                                                `<th>Widget Type</th>\n` +
                                                "<th>Web Page</th>" +
                                                "<th>Content</th>" +
                                                "<th>Date and Time</th>" +
                                                `</tr>\n`
                                            for (let i = 0; i < actions.length; i++) {
                                                let content = actions[i].issueText ? actions[i].issueText : actions[i].content ? actions[i].content : ""
                                                let imgRow = actions[i].imageUrl ? `<td><img src="./img${i + 1}.png" style="width: 200px"></img></td>\n` : "<td></td>"
                                                let url = actions[i].url ? actions[i].url : ""
                                                let widgetType = actions[i].widgetType ? actions[i].widgetType : ""
                                                htmlLog += `<tr style="text-align: center">\n` +
                                                    imgRow +
                                                    `<td>${actions[i].action}</td>\n` +
                                                    `<td>${widgetType}</td>\n` +
                                                    `<td>${url}</td>\n` +
                                                    `<td>${content}</td>\n` +
                                                    `<td>${actions[i].date}</td>\n`
                                            }
                                            htmlLog += `</table>\n` +
                                                `</body>\n` +
                                                `</html>`
                                            sessionLog.file("sessionLog.html", htmlLog)
                                            zip.generateAsync({ type: "blob" }).then((blob) => {
                                                saveAs(blob, "reports.zip");
                                            });
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }
        );
        //Reset of information about current session to avoid extension elements being present in pages when not needed
        chrome.storage.sync.set({ startingURL: "", pageStats: JSON.stringify([]) });
    };
    let buttonsDiv = document.createElement("div")
    sideDiv.appendChild(buttonsDiv)
    //Creation of the button that highlights the interacted elements
    let toggleClickedElementsButton = document.createElement("button");
    buttonsDiv.appendChild(toggleClickedElementsButton);
    buttonsDiv.id = "gamificationExtensionButtonsDiv"
    buttonsDiv.style = "display: flex; justify-content: center"
    toggleClickedElementsButton.id = "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    toggleClickedElementsButton.onclick = () => {
        //Borders are removed and redrawn
        removeBorders()
        drawBorderOnInteracted()
        chrome.storage.sync.set({ overlayMode: "interacted" })
    };
    //Creation of the button that removes all overlays
    let removeOverlaysButton = document.createElement("button");
    buttonsDiv.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    removeOverlaysButton.onclick = () => {
        removeBorders()
        chrome.storage.sync.set({ overlayMode: "none" })
    };
    //Creation of the button that highlights all interactable elements
    let toggleAllElementsButton = document.createElement("button");
    buttonsDiv.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    toggleAllElementsButton.onclick = () => {
        drawBorderOnAll()
        chrome.storage.sync.set({ overlayMode: "all" })
    };
    chrome.storage.sync.get(["pageActions", "pageStats", "currentURL", "visitedPages", "startingURL", "newPages", "profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)

        function filterURL(event) {
            return event.url === result.currentURL;
        }
        chrome.runtime.sendMessage({
            //Fetching information about total amount of elements interacted with in the page
            mess: "fetch",
            body: "/pages/actions/" + profileInfo.username,
            method: "get",
            content: { url: result.currentURL }
        }, (response) => {
            let pageActions = response.data
            let pageStats = JSON.parse(result.pageStats).filter(filterURL)[0];
            let visitedPages = result.visitedPages;
            let newPages = result.newPages;
            let noStats = pageStats === undefined;
            let noNewPages = newPages === undefined;
            let noVisitedPages = visitedPages === undefined;

            //Creation of the table containing scores (for all kinds of elements: current, new and total)
            let table = document.createElement("table");
            table.id = "gamificationExtensionPageStatsTable"
            table.style = "height:100px; width:100%"
            let linksRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = linksRow.insertCell();
                cell.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white; text-align: center"
                let text = "";
                switch (i) {
                    case 0:
                        text = "Links";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedLinks.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newLinks.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterLink).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let inputsRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = inputsRow.insertCell();
                cell.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white; text-align: center"
                let text = "";
                switch (i) {
                    case 0:
                        text = "Forms";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedInputs.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newInputs.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterInput).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let buttonsRow = table.insertRow();
            for (let i = 0; i < 4; i++) {
                let cell = buttonsRow.insertCell();
                cell.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white; text-align: center"
                let text = "";
                switch (i) {
                    case 0:
                        text = "Buttons";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedButtons.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newButtons.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterButton).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let selectsRow = table.insertRow()
            for (let i = 0; i < 4; i++) {
                let cell = selectsRow.insertCell()
                cell.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white; text-align: center"
                let text = ""
                switch (i) {
                    case 0:
                        text = "Dropdown Menus";
                        break;
                    case 1:
                        text = noStats ? 0 : pageStats.interactedSelects.filter(onlyUnique).length;
                        break;
                    case 2:
                        text = noStats ? 0 : pageStats.newSelects.filter(onlyUnique).length;
                        break;
                    case 3:
                        text = pageActions.filter(filterSelect).length;
                        break;
                }
                cell.appendChild(document.createTextNode(text));
            }
            let tableHead = table.createTHead();
            let headRow = tableHead.insertRow();
            let th1 = document.createElement("th");
            th1.appendChild(document.createTextNode("Page Widgets"));
            th1.style = "text-align: center; color: #2215E2"
            let th2 = document.createElement("th");
            th2.appendChild(document.createTextNode("Current Session"));
            th2.style = "text-align: center; color: #2215E2"
            let th3 = document.createElement("th");
            th3.appendChild(document.createTextNode("New"));
            th3.style = "text-align: center; color: #2215E2"
            let th4 = document.createElement("th");
            th4.appendChild(document.createTextNode("Total"));
            th4.style = "text-align: center; color: #2215E2"
            headRow.appendChild(th1);
            headRow.appendChild(th2);
            headRow.appendChild(th3);
            headRow.appendChild(th4);
            sideDiv.appendChild(table);

            chrome.runtime.sendMessage({
                //Fetching the amount of visited pages for the page score table
                mess: "fetch",
                method: "get",
                body: "/pages/records/" + profileInfo.username,
                content: { url: result.currentURL }
            }, (response2) => {
                let records = response2.data
                let pageRecords = records.filter(filterURL)[0]
                //Creation of the table containing scores about pages (found in current session, new and total)
                let tablePages = document.createElement("table");
                tablePages.id = "gamificationExtensionPagesTable"
                tablePages.style = "width:100%"
                let pagesRow = tablePages.insertRow();
                for (let i = 0; i < 4; i++) {
                    let cell = pagesRow.insertCell();
                    cell.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white; text-align: center"
                    let text = "";
                    switch (i) {
                        case 0:
                            text = "Pages";
                            break;
                        case 1:
                            text = noVisitedPages ? 1 : visitedPages.length;
                            break;
                        case 2:
                            text = noNewPages ? 1 : newPages.length;
                            break;
                        case 3:
                            text = records.length;
                            break;
                    }
                    cell.appendChild(document.createTextNode(text));
                }
                let tHead = tablePages.createTHead();
                let hRow = tHead.insertRow();
                let t1 = document.createElement("th");
                t1.appendChild(document.createTextNode("Pages Visited"));
                t1.style = "text-align: center; color: #2215E2"
                let t2 = document.createElement("th");
                t2.appendChild(document.createTextNode("Current Session"));
                t2.style = "text-align: center; color: #2215E2"
                let t3 = document.createElement("th");
                t3.appendChild(document.createTextNode("New"));
                t3.style = "text-align: center; color: #2215E2"
                let t4 = document.createElement("th");
                t4.appendChild(document.createTextNode("Total"));
                t4.style = "text-align: center; color: #2215E2"
                hRow.appendChild(t1);
                hRow.appendChild(t2);
                hRow.appendChild(t3);
                hRow.appendChild(t4);
                sideDiv.appendChild(tablePages);
                let linksCoverage, inputsCoverage, buttonsCoverage, selectsCoverage
                if (!pageRecords) {
                    linksCoverage = 0
                    inputsCoverage = 0
                    buttonsCoverage = 0
                    selectsCoverage = 0
                } else {
                    linksCoverage = pageRecords.linksCoverage
                    inputsCoverage = pageRecords.inputsCoverage
                    buttonsCoverage = pageRecords.buttonsCoverage
                    selectsCoverage = pageRecords.selectsCoverage
                }

                chrome.runtime.sendMessage({
                    //Fetching info about current page to know about existance or not of element types
                    mess: "fetch",
                    method: "get",
                    body: "/pages",
                    content: { url: result.currentURL }
                }, (response3) => {
                    let pageInfo = response3.data[0]
                    //Creation of the progress bars related to the different types of elements (links, buttons, forms, dropdown menus)
                    let linksProgressTop = document.createElement("div");
                    sideDiv.appendChild(linksProgressTop);
                    linksProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                    let linksProgress = document.createElement("div");
                    linksProgress.id = "gamificationExtensionLinksProgress";
                    linksProgress.style =
                        `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + linksCoverage + `%; white-space:nowrap`;
                    linksProgressTop.appendChild(linksProgress);
                    linksProgress.textContent = pageInfo.totalLinkObjects > 0 ? "Links Progress: " + linksCoverage.toFixed(2) + "%" : "There are no links in this page";
                    let inputsProgressTop = document.createElement("div");
                    sideDiv.appendChild(inputsProgressTop);
                    inputsProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                    let inputsProgress = document.createElement("div");
                    inputsProgress.id = "gamificationExtensionInputsProgress";
                    inputsProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + inputsCoverage + `%; white-space:nowrap`;
                    inputsProgressTop.appendChild(inputsProgress);
                    inputsProgress.textContent = pageInfo.totalInputObjects > 0 ? "Forms Progress: " + inputsCoverage.toFixed(2) + "%" : "There are no forms in this page";
                    let buttonsProgressTop = document.createElement("div");
                    sideDiv.appendChild(buttonsProgressTop);
                    buttonsProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                    let buttonsProgress = document.createElement("div");
                    buttonsProgressTop.appendChild(buttonsProgress);
                    buttonsProgress.id = "gamificationExtensionButtonsProgress"
                    buttonsProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + buttonsCoverage + `%; white-space:nowrap`;
                    buttonsProgress.textContent = pageInfo.totalButtonObjects > 0 ? "Buttons Progress: " + buttonsCoverage.toFixed(2) + "%" : "There are no buttons in this page";
                    let selectsProgressTop = document.createElement("div");
                    sideDiv.appendChild(selectsProgressTop)
                    selectsProgressTop.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                    let selectsProgress = document.createElement("div")
                    selectsProgressTop.appendChild(selectsProgress)
                    selectsProgress.id = "gamificationExtensionSelectsProgress"
                    selectsProgress.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + selectsCoverage + `%; white-space:nowrap`;
                    selectsProgress.textContent = pageInfo.totalSelectObjects > 0 ? "Dropdown Menus Progress: " + selectsCoverage.toFixed(2) + "%" : "There are no dropdown menus in this page";

                    chrome.runtime.sendMessage({
                        //Fetching past records of the user to show them in the menu
                        mess: "fetch",
                        method: "get",
                        body: "/users/" + profileInfo.username + "/records"
                    }, (response4) => {
                        let userRecords = response4.data
                        let recordsTitle = document.createElement("h3")
                        recordsTitle.textContent = "Records"
                        recordsTitle.style = "text-align: center; color: #2215E2"
                        sideDiv.appendChild(recordsTitle)
                        let coverageRecord = document.createElement("h4")
                        coverageRecord.style.textTransform = "Inherit"
                        coverageRecord.textContent = "Highest Page Coverage: " + userRecords.highestCoverage.toFixed(2)
                        coverageRecord.style = "text-align: center; color: #315BE2"
                        sideDiv.appendChild(coverageRecord)
                        let pagesRecord = document.createElement("h4")
                        pagesRecord.style.textTransform = "Inherit"
                        pagesRecord.textContent = "Highest Number of New Pages Found in a Session: " + userRecords.highestNewVisitedPages
                        pagesRecord.style = "text-align: center; color: #315BE2"
                        sideDiv.appendChild(pagesRecord)
                        let widgetsRecord = document.createElement("h4")
                        widgetsRecord.style.textTransform = "Inherit"
                        widgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - Global: " + userRecords.highestNewWidgets
                        widgetsRecord.style = "text-align: center; color: #315BE2"
                        sideDiv.appendChild(widgetsRecord)
                        let pageWidgetsRecord = document.createElement("h4")
                        pageWidgetsRecord.style.textTransform = "Inherit"
                        let hw = pageRecords.highestWidgets ? pageRecords.highestWidgets : 0
                        pageWidgetsRecord.textContent = "Highest Number of New Widgets Found in a Session - This Page: " + hw
                        pageWidgetsRecord.style = "text-align: center; color: #315BE2"
                        sideDiv.appendChild(pageWidgetsRecord)
                    })
                })
            })
        })
    }
    );
    chrome.storage.sync.get(["interactionMode"], function (result) {
        //Creation of the two different buttons used to switch between interaction mode and issue reporting mode
        let interactionModeDiv = document.createElement("div")
        interactionModeDiv.id = "gamificationExtensionInteractionModeDiv"
        interactionModeDiv.style = "display: flex; flex-direction: column; align-items: center;"
        sideDiv.appendChild(interactionModeDiv)
        let interactionMode = result.interactionMode
        let currentModeText = document.createElement("h3")
        let currentText = interactionMode === "interact" ? "Current Mode: Page Interaction" : "Current Mode: Signal Issues"
        currentModeText.textContent = currentText
        currentModeText.style = "text-align: center; color: #2215E2"
        interactionModeDiv.appendChild(currentModeText)
        let enterSignalModeButton = document.createElement("button")
        enterSignalModeButton.id = "GamificationExtensionSignalModeButton"
        interactionModeDiv.appendChild(enterSignalModeButton)
        enterSignalModeButton.textContent = "Signal Issues"
        enterSignalModeButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
        enterSignalModeButton.style.display = interactionMode !== "signal" ? "flex" : "none"
        let enterInteractModeButton = document.createElement("button")
        enterInteractModeButton.id = "GamificationExtensionInteractModeButton"
        interactionModeDiv.appendChild(enterInteractModeButton)
        enterInteractModeButton.textContent = "Interact with Page"
        enterInteractModeButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
        enterInteractModeButton.style.display = interactionMode !== "interact" ? "flex" : "none"
        enterSignalModeButton.onclick = () => {
            //Removes highlights on widgets, draws issue backgrounds and hides buttons that show/hide borders on widgets
            chrome.storage.sync.set({ interactionMode: "signal" })
            enterSignalModeButton.style.display = "none"
            enterInteractModeButton.style.display = "flex"
            currentModeText.textContent = "Current Mode: Signal Issues"
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "none"
            removeBorders()
            drawBackground()
        }
        enterInteractModeButton.onclick = () => {
            //Removes issue backgrounds, draws highlights and shows buttons
            chrome.storage.sync.set({ interactionMode: "interact" })
            enterSignalModeButton.style.display = "flex"
            enterInteractModeButton.style.display = "none"
            currentModeText.textContent = "Current Mode: Page Interaction"
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "flex"
            removeBackground()
            drawBorders()
        }
        //Buttons for changing how widgets are highlighted aren't shown if the menu is created while in signaling mode
        if (interactionMode === "signal") {
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "none"
        }
    })
}