chrome.storage.sync.get(["overlayMode"], function (result) {
    var overlayMode = result.overlayMode
    if (overlayMode === "interacted") {
        drawBorderOnInteracted()
    } else if (overlayMode === "all") {
        drawBorderOnAll()
    }
})