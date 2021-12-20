chrome.storage.sync.get(["currentURL", "profileInfo"], function (result) {
    var profileInfo = JSON.parse(result.profileInfo)

    function filterLink(event) {
        return event.objectType === "link"
    }
    function filterInput(event) {
        return event.objectType === "input"
    }
    function filterButton(event) {
        return event.objectType === "button"
    }

    chrome.runtime.sendMessage({
        mess: "fetch",
        method: "get",
        body: "/pages/actions/" + profileInfo.username,
        content: { url: result.currentURL }
    }, (response) => {
        let pageActions = response.data
        chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/pages",
            content: { url: result.currentURL }
        }, (response2) => {
            let pageInfo = response2.data[0]
            let totalLinkObjects = pageInfo.totalLinkObjects;
            let totalInputObjects = pageInfo.totalInputObjects;
            let totalButtonObjects = pageInfo.totalButtonObjects;
            let denom = (totalLinkObjects + totalInputObjects + totalButtonObjects) !== 0
            let interactedLinks = pageActions.filter(filterLink).length;
            let interactedInputs = pageActions.filter(filterInput).length;
            let interactedButtons = pageActions.filter(filterButton).length;
            let progress = denom ? ((interactedLinks + interactedInputs + interactedButtons) * 100) / (totalLinkObjects + totalInputObjects + totalButtonObjects) : -1;

            let topnav = document.createElement("div");
            topnav.id = "gamificationExtensionTopnav";
            let found = document.getElementById("gamificationExtensionTopnav");
            if (found === null) {
                document.body.appendChild(topnav);
                topnav.style = "background-color: transparent;position: fixed;bottom: 0;width: 100%;";
                let outerDiv = document.createElement("div");
                outerDiv.id = "gamificationExtensionTopnavOuter";
                outerDiv.style = "color:#000!important;background-color:#f1f1f1!important;border-radius:16px";
                topnav.appendChild(outerDiv);
                let innerDiv = document.createElement("div");
                innerDiv.id = "gamificationExtensionTopnavInner";
                if (progress === undefined) {
                    progress = 0;
                }
                innerDiv.style = `border-radius:16px;margin-top:16px;margin-bottom:16px;color:#000!important;background-color:#2196F3!important; width:` + progress + `%; white-space:nowrap`;
                innerDiv.textContent = denom ? "Progress: " + progress + "%" : "There are no widgets in this page";
                outerDiv.appendChild(innerDiv);
            }
        })
    })
});