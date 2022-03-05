if (document.getElementById("gamificationExtensionSidenav") === null) {
    let sideDiv = document.createElement("div");
    sideDiv.style.overflowY = "scroll"
    let button = document.createElement("img");
    document.body.appendChild(button);
    button.id = "gamificationExtensionSidenavButton";
    button.style = "position: fixed; top: 50%; right: 0; width: 40;";
    //button.textContent = "Open Menu";
    button.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "50%";
    };
    button.src = chrome.runtime.getURL("img/arrow_left.png")
    document.body.appendChild(sideDiv);
    sideDiv.id = "gamificationExtensionSidenav";
    sideDiv.style = "height: 100%; width: 0; position: fixed; z-index: 1; top: 0; right: 0; background-color: rgb(211 245 230); overflow-x: hidden; transition: 0.5s; overflow-y: scroll";
    let closeButtonDiv = document.createElement("div")
    closeButtonDiv.id = "gamificationExtensionCloseButtonDiv"
    closeButtonDiv.style = "display: flex; justify-content: space-between"
    sideDiv.appendChild(closeButtonDiv)
    let closeButton = document.createElement("img");
    closeButtonDiv.appendChild(closeButton);
    closeButton.src = chrome.runtime.getURL("img/cross.png")
    closeButton.id = "gamificationExtensionSidenavCloseButton";
    closeButton.textContent = "Close Menu";
    closeButton.style = "bottom: 10%; right: 50%; background-color: transparent; width: 40; height: 40";
    closeButton.onclick = function () {
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
    };
    let endButton = document.createElement("button");
    closeButtonDiv.appendChild(endButton);
    endButton.id = "gamificationExtensionEndSessionButton";
    endButton.textContent = "End Session";
    endButton.style = "bottom: 10%; right: 50%; background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;";
    endButton.onclick = function () {
        //chiusura della sidenav
        document.getElementById("gamificationExtensionSidenav").style.width = "0";
        document.getElementById("gamificationExtensionSidenav").remove()
        document.getElementById("gamificationExtensionSidenavButton").remove()

        //rimozione della stella se la pagina è una vista per la prima volta
        let star = document.getElementById("gamificationExtensionNewPageStar");
        if (star != null) {
            document.body.removeChild(star);
        }
        removeBorders();
        removeBackground()
        let topnav = document.getElementById("gamificationExtensionTopnav");
        if (topnav != null) {
            document.body.removeChild(topnav);
        }

        //mostrare modal di riepilogo
        chrome.storage.sync.get(
            ["visitedPages", "newPages", "pageStats", "currentURL", "profileInfo", "pageSession"],
            function (result) {
                let profileInfo = JSON.parse(result.profileInfo)
                let visitedPages = result.visitedPages;
                let newPages = result.newPages;
                let modalContainer = document.createElement("div");
                let pageStats = JSON.parse(result.pageStats);
                chrome.runtime.sendMessage({
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
                        let highestNewWidgets = userRecords.highestNewWidgets
                        let highestCoverage = userRecords.highestCoverage
                        let highestNewVisitedPages = userRecords.highestNewVisitedPages
                        for (let page of pageStats) {
                            function filterURL(event) {
                                return event.url === page.url
                            }
                            let pageRecords = records.filter(filterURL)[0]
                            let highestLinks = page.newLinks.length > pageRecords.highestLinks ? page.newLinks.length : undefined
                            let highestInputs = page.newInputs.length > pageRecords.highestInputs ? page.newInputs.length : undefined
                            let highestButtons = page.newButtons.length > pageRecords.highestButtons ? page.newButtons.length : undefined
                            let highestSelects = page.newSelects.length > pageRecords.highestSelects ? page.newSelects.length : undefined
                            let highestWidgets = ((page.newLinks.length + page.newInputs.length + page.newButtons.length + page.newSelects.length) >= pageRecords.highestWidgets) ? page.newLinks.length + page.newInputs.length + page.newButtons.length + page.newSelects.length : undefined
                            if (highestWidgets && highestWidgets > highestNewWidgets) {
                                highestNewWidgets = highestWidgets
                            }
                            if (pageRecords.coverage > highestCoverage) {
                                highestCoverage = pageRecords.coverage
                            }
                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/records/" + profileInfo.username,
                                method: "post",
                                content: { username: profileInfo.username, url: page.url, highestLinks: highestLinks, highestInputs: highestInputs, highestButtons: highestButtons, highestSelects: highestSelects, highestWidgets: highestWidgets },
                                firstTime: false
                            })
                        }
                        if (newPages.length > highestNewVisitedPages) {
                            highestNewVisitedPages = newPages.length
                        }
                        chrome.runtime.sendMessage({
                            mess: "fetch",
                            method: "post",
                            body: "/users/" + profileInfo.username + "/records",
                            content: { username: profileInfo.username, highestNewVisitedPages: highestNewVisitedPages, highestNewWidgets: highestNewWidgets, highestCoverage: highestCoverage }
                        }, () => {
                            leaderboardAvatars()
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
                            modalSpan.onclick = () => {
                                modalContainer.style.display = "none";
                                location.reload()
                            };
                            window.onclick = (event) => {
                                if (event.target === modalContainer) {
                                    modalContainer.style.display = "none";
                                    location.reload()
                                }
                            };
                            document.body.appendChild(modalContainer);

                            chrome.runtime.sendMessage({
                                mess: "fetch",
                                body: "/pages/crops/" + profileInfo.username,
                                method: "get"
                            }, (response3) => {
                                let ret = response3.data
                                if (countWidgets(ret) >= 3) {
                                    countActionsAvatar()
                                }
                                chrome.storage.sync.get(["baseURL"], (result) => {
                                    let baseURL = result.baseURL
                                    let zip = new JSZip()
                                    let folder = zip.folder("scripts")
                                    let inner = folder.folder("script.sikuli")
                                    for (let i = 0; i < ret.length; i++) {
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
                                    let text = `popup("Beginning replay of past session")\n`
                                    for (let i = 0; i < ret.length; i++) {
                                        text += "max = 20\n"
                                        text += "wait(5)"
                                        text += "while(max > 0):\n"
                                        text += `   if not exists(Pattern("img${i + 1}.png").similar(0.55), 0):\n`
                                        text += "       wheel(WHEEL_DOWN, 1)\n"
                                        text += "       max-=1\n"
                                        text += "   else:\n"
                                        text += "       max=-1\n"
                                        text += "       break\n"
                                        if (ret[i].widgetType === "input") {
                                            for (let j = 0; j < i; j++) {
                                                if (ret[j].widgetType === "input" && i > 0 && ret[i].widgetId === ret[j].widgetId) {
                                                    text += `type(Pattern("img${i + 1}.png").similar(0.55), "a", KeyModifier.CTRL)\n`
                                                    text += `type(Pattern("img${i + 1}.png").similar(0.55), Key.BACKSPACE)\n`
                                                }
                                            }
                                            text += `type(Pattern("img${i + 1}.png").similar(0.55), "${ret[i].textContent}"`
                                            if (ret[i].lastInput) {
                                                text += ` + Key.ENTER)\n`
                                            } else {
                                                text += `)\n`
                                            }
                                        } else {
                                            text += `click(Pattern("img${i + 1}.png").similar(0.55))\n`
                                            if (ret[i].widgetType === "select") {
                                                text += `type("${ret[i].selectIndex}")\n`
                                            }
                                        }
                                        text += "wheel(WHEEL_UP, 20-max)\n"
                                    }
                                    text += `popup("Ending replay of past session")\n`
                                    inner.file("script.py", text)

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
                                        let els = ret[i].widgetType === "link" ? document.getElementsByTagName("a") : document.getElementsByTagName(ret[i].widgetType)
                                        let buttons = []
                                        if (ret[i].widgetType === "button") {
                                            for (let j = 0; j < els.length; j++) {
                                                if (!isButtonOfExtension(els[j])) {
                                                    buttons.push(els[j])
                                                }
                                            }
                                            els = buttons
                                        }
                                        let commandObj = {
                                            id: `idCommand${i + 1}`,
                                            comment: "",
                                            command: ret[i].textContent && ret[i].widgetType !== "link" ? "type" : ret[i].selectIndex ? "select" : "click",
                                            target: "",
                                            targets: [],
                                            value: ret[i].textContent && ret[i].widgetType !== "link" ? ret[i].textContent : ret[i].selectIndex ? `label=${ret[i].selectIndex}` : ""
                                        }
                                        commandObj.target = `css=${ret[i].selector}`
                                        commandObj.targets.push([`css=${ret[i].selector}`, "css:finder"])

                                        if (ret[i].elementId) {
                                            commandObj.targets.push([`id=${ret[i].elementId}`, "id"])
                                        }
                                        if (ret[i].widgetType === "link") {
                                            commandObj.targets.push([`linkText=${ret[i].textContent}`, "linkText"])
                                        }
                                        commandObj.targets.push([`xpath=${ret[i].xpath}`, "xpath:idRelative"])

                                        commands.push(commandObj)
                                        if (ret[i].lastInput) {
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
                                    folder.file("gamification-extension-selenium-testing-project.side", JSON.stringify(seleniumFile))
                                    zip.generateAsync({ type: "blob" }).then((blob) => {
                                        saveAs(blob, "scripts.zip");
                                    });
                                    chrome.runtime.sendMessage({ obj: obj, mess: "download" });
                                })
                            })
                        })
                    })
                })
            }
        );
        chrome.storage.sync.set({ startingURL: "", pageStats: JSON.stringify([]) });
    };
    let buttonsDiv = document.createElement("div")
    sideDiv.appendChild(buttonsDiv)
    let toggleClickedElementsButton = document.createElement("button");
    buttonsDiv.appendChild(toggleClickedElementsButton);
    buttonsDiv.id = "gamificationExtensionButtonsDiv"
    buttonsDiv.style = "display: flex; justify-content: center"
    toggleClickedElementsButton.id = "gamificationExtensionToggleClickedElementsButton";
    toggleClickedElementsButton.textContent = "Show Interacted Elements";
    toggleClickedElementsButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    toggleClickedElementsButton.onclick = function () {
        removeBorders()
        drawBorderOnInteracted()
        chrome.storage.sync.set({ overlayMode: "interacted" })
    };
    let removeOverlaysButton = document.createElement("button");
    buttonsDiv.appendChild(removeOverlaysButton);
    removeOverlaysButton.id = "gamificationExtensionRemoveOverlaysButton";
    removeOverlaysButton.textContent = "Remove Overlays";
    removeOverlaysButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    removeOverlaysButton.onclick = function () {
        removeBorders()
        chrome.storage.sync.set({ overlayMode: "none" })
    };
    let toggleAllElementsButton = document.createElement("button");
    buttonsDiv.appendChild(toggleAllElementsButton);
    toggleAllElementsButton.id = "gamificationExtensionToggleAllElementsButton";
    toggleAllElementsButton.textContent = "Show All Elements";
    toggleAllElementsButton.style = " background-color: transparent; color: black; border: 2px solid #416262; border-radius: 12px; padding: 9px; font-size: 16px;"
    toggleAllElementsButton.onclick = function () {
        drawBorderOnAll()
        chrome.storage.sync.set({ overlayMode: "all" })
    };
    chrome.storage.sync.get(["pageActions", "pageStats", "currentURL", "visitedPages", "startingURL", "newPages", "profileInfo"], function (result) {
        let profileInfo = JSON.parse(result.profileInfo)

        function filterURL(event) {
            return event.url === result.currentURL;
        }
        chrome.runtime.sendMessage({
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
                mess: "fetch",
                method: "get",
                body: "/pages/records/" + profileInfo.username,
                content: { url: result.currentURL }
            }, (response2) => {
                let records = response2.data
                let pageRecords = records.filter(filterURL)[0]
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
                    mess: "fetch",
                    method: "get",
                    body: "/pages",
                    content: { url: result.currentURL }
                }, (response3) => {
                    let pageInfo = response3.data[0]
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
        let interactionModeDiv = document.createElement("div")
        interactionModeDiv.id = "gamificationExtensionInteractionModeDiv"
        interactionModeDiv.style = "display: flex; flex-direction: column; align-items: center;"
        sideDiv.appendChild(interactionModeDiv)
        let interactionMode = result.interactionMode
        let currentModeText = document.createElement("h3")
        let currentText = interactionMode === "interact" ? "Current Mode: Page Interaction" : interactionMode === "signal" ? "Current Mode: Signal Issues" : "Current Mode: Replay Session"
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
        enterSignalModeButton.onclick = function () {
            chrome.storage.sync.set({ interactionMode: "signal" })
            enterSignalModeButton.style.display = "none"
            enterInteractModeButton.style.display = "flex"
            currentModeText.textContent = "Current Mode: Signal Issues"
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "none"
            //document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "none"
            //document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "none"
            //document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "none"
            removeBorders()
            drawBackground()
        }
        enterInteractModeButton.onclick = function () {
            chrome.storage.sync.set({ interactionMode: "interact" })
            enterSignalModeButton.style.display = "flex"
            enterInteractModeButton.style.display = "none"
            currentModeText.textContent = "Current Mode: Page Interaction"
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "flex"
            //document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "flex"
            //document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "flex"
            //document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "flex"
            removeBackground()
            drawBorders()
        }
        if (interactionMode === "signal") {
            document.getElementById("gamificationExtensionButtonsDiv").style.display = "none"
            //document.getElementById("gamificationExtensionToggleClickedElementsButton").style.display = "none"
            //document.getElementById("gamificationExtensionRemoveOverlaysButton").style.display = "none"
            //document.getElementById("gamificationExtensionToggleAllElementsButton").style.display = "none"
        }
    })
}