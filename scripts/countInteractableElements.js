chrome.storage.sync.get(["currentURL", "pageStats", "profileInfo"], (result) => {
    let currentURL = result.currentURL;
    let profileInfo = JSON.parse(result.profileInfo)

    function filterURL(event) {
        return event.url === currentURL
    }

    /**
     * Count of all widgets (links, forms, buttons) present in the page
     * Forms are filtered so that hidden forms aren't included in the count
     * Buttons are filtered so that buttons added by the extension aren't included in the count
     */
    let linkObjects = document.body.getElementsByTagName("a");
    let totalLinkObjects = linkObjects.length;
    let inputs = document.body.getElementsByTagName("input");
    let inputObjects = []
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type !== "hidden") {
            inputObjects.push(inputs[i])
        }
    }
    let totalInputObjects = inputObjects.length;
    let buttonObjects = document.body.getElementsByTagName("button");
    let totalButtonObjects = 0;
    for (let i = 0; i < buttonObjects.length; i++) {
        if (!isButtonOfExtension(buttonObjects[i])) {
            totalButtonObjects++;
        }
    }
    let formObjects = document.body.getElementsByTagName("form")
    let selectObjects = document.body.getElementsByTagName("select")
    let totalSelectObjects = selectObjects.length

    //Gestione di pageStats lasciata con chrome.storage, essendo relativa alla singola sessione e non all'insieme totale
    let psObj = { url: currentURL, interactedLinks: [], interactedInputs: [], interactedButtons: [], interactedSelects: [], newLinks: [], newInputs: [], newButtons: [], newSelects: [] };
    let pageStatsObj = JSON.parse(result.pageStats);
    if (pageStatsObj.filter(filterURL).length === 0) {
        pageStatsObj.push(psObj)
    }
    chrome.storage.sync.set({ pageStats: JSON.stringify(pageStatsObj) });
    /**
     * API Calls
     */
    chrome.runtime.sendMessage({
        mess: "fetch",
        body: "/pages",
        method: "post",
        content: { url: currentURL, totalLinkObjects: totalLinkObjects, totalInputObjects: totalInputObjects, totalButtonObjects: totalButtonObjects, totalSelectObjects: totalSelectObjects }
    }, (response) => {
        let pageInfo = response.data
        chrome.runtime.sendMessage({
            mess: "fetch",
            body: "/pages/records",
            method: "post",
            content: { url: currentURL, username: profileInfo.username },
            firstTime: true
        }, () => {
            for (let i = 0; i < linkObjects.length; i++) {
                linkObjects[i].addEventListener("click", (event) => linkClickListener(event, i, pageInfo))
            }
            for (let i = 0; i < inputObjects.length; i++) {
                inputObjects[i].addEventListener("click", (event) => inputClickListener(event, pageInfo))
            }
            for (let i = 0; i < buttonObjects.length; i++) {
                if (!isButtonOfExtension(buttonObjects[i])) {
                    buttonObjects[i].addEventListener("click", (event) => buttonClickListener(event, pageInfo))
                }
            }
            for (let i = 0; i < selectObjects.length; i++) {
                selectObjects[i].addEventListener("click", (event) => selectClickListener(event, pageInfo))
                selectObjects[i].addEventListener("change", (event) => selectChangeListener(event))
            }
            for (let i = 0; i < formObjects.length; i++) {
                formObjects[i].addEventListener("submit", (event) => formSubmitListener(event, i))
            }
            pageAchievements()
        })
    })
});