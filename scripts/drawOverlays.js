chrome.storage.sync.get(["overlayMode", "interactionMode"], function (result) {
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