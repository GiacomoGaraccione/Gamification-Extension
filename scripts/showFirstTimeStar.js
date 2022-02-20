chrome.storage.sync.get(["currentURL", "profileInfo"], function (result) {
    let profileInfo = JSON.parse(result.profileInfo)
    chrome.runtime.sendMessage({
        mess: "fetch",
        method: "get",
        body: "/pages/actions/" + profileInfo.username,
        content: { url: result.currentURL }
    }, (response) => {
        let pageInfo = response.data
        if (pageInfo.length === 0) {
            let found = document.getElementById("gamificationExtensionNewPageStar");
            if (found === null) {
                let div = document.createElement("img");
                document.body.appendChild(div);
                div.id = "gamificationExtensionNewPageStar";
                div.width = 30;
                div.height = 20;
                div.src = chrome.runtime.getURL("img/star.png");
                div.style = "position: fixed; bottom: 10%;  right: 0;width: 30px;border: 3px solid #FFD700;";
            }
        }
    })
});