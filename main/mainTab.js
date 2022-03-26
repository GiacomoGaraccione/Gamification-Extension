let profileButton = document.getElementById("profileButton")
let pageURL = document.getElementById("pageURL");
let pageURLButton = document.getElementById("pageURLButton");
let confirmProfileButton = document.getElementById("confirmProfileButton")
let usernameField = document.getElementById("usernameField")
let logoutButton = document.getElementById("logoutButton")
let viewProfileButton = document.getElementById("viewProfileButton")
let firstWrapper = document.getElementById("firstWrapper")
let secondWrapper = document.getElementById("secondWrapper")
let thirdWrapper = document.getElementById("thirdWrapper")
let fourthWrapper = document.getElementById("fourthWrapper")
let newProfileDiv = document.getElementById("newProfileDiv")
let urlDiv = document.getElementById("urlDiv")
let logoutDiv = document.getElementById("logoutDiv")
let viewProfileDiv = document.getElementById("viewProfileDiv")
let title = document.getElementById("title")
let confirmButtonWrapper = document.getElementById("confirmButtonWrapper")
let redAvatarContainer = document.getElementById("redAvatarContainer")
let greenAvatarContainer = document.getElementById("greenAvatarContainer")
let blueAvatarContainer = document.getElementById("blueAvatarContainer")
let selectableAvatars = document.getElementById("selectableAvatars")
let achievementsContainer = document.getElementById("achievements")
let goBackButton = document.getElementById("goBackButton")
let viewLeaderboardButton = document.getElementById("viewLeaderboardButton")
let returnButton = document.getElementById("returnButton")
let highestNewVisitedPages = document.getElementById("highestNewVisitedPages")
let highestNewWidgets = document.getElementById("highestNewWidgets")
let highestCoverage = document.getElementById("highestCoverage")
let loginDiv = document.getElementById("loginDiv")
let loginButton = document.getElementById("loginButton")

let url = "";
let username = ""
let selectedAvatar = ""
let avatarDivs = []

function compareAchievements(a, b) {
  if (a.path === "../img/achievement_bronze.png") {
    if (b.path === "../img/achievement_silver.png" || b.path === "../img/achievement_gold.png") {
      return -1
    } else {
      return 0
    }
  } else if (a.path === "../img/achievement_silver.png") {
    if (b.path === "../img/achievement_bronze.png") {
      return 1
    } else if (b.path === "../img/achievement_gold.png") {
      return 1
    } else {
      return 0
    }
  } else {
    if (b.path === "../img/achievement_gold.png") {
      return 0
    } else {
      return 1
    }
  }
}

function render(flag) {
  if (flag === "home") {
    secondWrapper.style.display = "none"
    firstWrapper.style.display = "flex"
    newProfileDiv.style.display = "none"
    urlDiv.style.display = "flex"
    logoutDiv.style.display = "flex"
    viewProfileDiv.style.display = "flex"
    loginDiv.style.display = "none"
  } else if (flag === "create") {
    newProfileDiv.style.display = "flex"
    urlDiv.style.display = "none"
    logoutDiv.style.display = "none"
    viewProfileDiv.style.display = "none"
    loginDiv.style.display = "flex"
  }
}

function highlightDefaultAvatar(selected, second, third, color) {
  selected.style = `border:3px; border-style:solid; border-color:#` + color + `; padding: 1em;`
  second.style = "border:0; border-style:solid;"
  third.style = "border:0; border-style:solid;"
}

function drawTable(container, mode, data) {
  if (container.childNodes.length === 3) {
    let tableVP = document.createElement("table")
    tableVP.style = "overflow-y:scroll; height:400px; display:block"
    let tableVPHead = document.createElement("thead")
    let cell1 = document.createElement("th")
    let cell2 = document.createElement("th")
    let cellAv = document.createElement("th")
    cell1.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white;"
    cell2.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white;"
    cellAv.style = "border-bottom: 1px solid #ddd; background-color: #416262; color: white;"
    tableVP.appendChild(tableVPHead)
    tableVPHead.appendChild(cell1)
    tableVPHead.appendChild(cell2)
    tableVPHead.appendChild(cellAv)
    cell1.appendChild(document.createTextNode("Username"))
    cell2.appendChild(document.createTextNode("Score"))
    cellAv.appendChild(document.createTextNode("Avatar"))
    for (let i = 0; i < data.length; i++) {
      let row = tableVP.insertRow()
      let cell3 = row.insertCell()
      let cell4 = row.insertCell()
      let cell5 = row.insertCell()
      cell3.style = "height: 200px; width: 200px; border-bottom: 1px solid #ddd; text-align: center"
      cell4.style = "height: 200px; width: 200px; border-bottom: 1px solid #ddd; text-align: center"
      cell5.style = "height: 200px; width: 200px; border-bottom: 1px solid #ddd;"
      let img = document.createElement("img")
      img.src = data[i].selectedAvatar
      img.style = "width: 100%; height: 100%"
      cell3.appendChild(document.createTextNode(data[i].username))
      let text = mode === "VP" ? data[i].highestNewVisitedPages : mode === "W" ? data[i].highestNewWidgets : data[i].highestCoverage.toFixed(2)
      cell4.appendChild(document.createTextNode(text))
      cell5.appendChild(img)
    }
    container.appendChild(tableVP)
  }
}

function drawLeaderboards() {
  chrome.runtime.sendMessage({
    mess: "fetch",
    method: "get",
    body: "/users/records/pages"
  }, (response) => {
    drawTable(highestNewVisitedPages, "VP", response.data)
    chrome.runtime.sendMessage({
      mess: "fetch",
      method: "get",
      body: "/users/records/widgets"
    }, (response2) => {
      drawTable(highestNewWidgets, "W", response2.data)
      chrome.runtime.sendMessage({
        mess: "fetch",
        method: "get",
        body: "/users/records/coverage"
      }, (response3) => {
        drawTable(highestCoverage, "C", response3.data)
      })
    })
  })
}


chrome.storage.sync.get(["profileInfo", "startingURL", "currentURL"], function (result) {
  let profileInfo = result.profileInfo
  if (profileInfo !== undefined && profileInfo !== "[]") {
    let profileInfoObj = JSON.parse(profileInfo)
    title.textContent = "Main Page - Welcome " + profileInfoObj.username + "!"
    render("home")
  }

  if (result.startingURL !== "" && result.startingURL !== undefined) {
    pageURL.disabled = true
    pageURL.value = result.currentURL
    logoutButton.disabled = true
  }

  document.getElementById("passwordField").addEventListener("change", () => displayConfirmButton())

  pageURLButton.addEventListener("click", async () => {
    isValidUrl = (_string) => {
      let url_string;
      try {
        url_string = new URL(_string);
      } catch (_) {
        return false;
      }
      return url_string.protocol === "http:" || url_string.protocol === "https:";
    }
    let url = document.getElementById("pageURL").value;
    if (!isValidUrl(url)) {
      alert("Please insert an URL with the correct format!")
    } else {
      if (url[url.length - 1] !== "/") {
        url += "/"
      }
      let [tab] = await chrome.tabs.query({ url: url });
      let domain = new URL(url);
      pageURL.disabled = true

      chrome.storage.sync.set({
        startingURL: domain.hostname,
        visitedPages: [],
        pageStats: JSON.stringify([]),
        newPages: [],
        pageSession: JSON.stringify([]),
        widgetCrops: JSON.stringify([]),
        baseURL: url,
        stack: [url],
        clickedLink: null,
        lastAction: ""
      });
      if (tab === undefined) {
        chrome.runtime.sendMessage({
          mess: "openNew",
          url: url,
        });
      } else {
        chrome.tabs.update(tab.id, { highlighted: true });
      }
    }

  });

  loginButton.addEventListener("click", (event) => {
    let username = document.getElementById("usernameLogin").value
    let password = document.getElementById("passwordLogin").value
    chrome.runtime.sendMessage({
      mess: "fetch",
      method: "get",
      body: "/login",
      content: { username: username, password: password }
    }, (response) => {
      let ret = response.data
      if (ret.statusText) {
        alert("Wrong credentials!")
      } else {
        chrome.storage.sync.set({ profileInfo: JSON.stringify(ret) });
        title.textContent = "Main Page - Welcome " + ret.username + "!"
        render("home")
      }
    })

  })

  profileButton.addEventListener("click", function () {
    firstWrapper.style.display = "none"
    secondWrapper.style.display = "flex"
  })

  confirmProfileButton.addEventListener("click", function () {
    chrome.storage.sync.get(["registeredUsers"], function (result) {
      function filterUsers(event) {
        return event.username === username
      }
      let password = document.getElementById("passwordField").value
      if (!password) {
        alert("Please insert a password")
      } else {
        chrome.runtime.sendMessage({
          mess: "fetch",
          method: "get",
          body: "/users",
          content: {}
        }, (response) => {
          let users = response.data.filter(filterUsers)
          if (users.length > 0) {
            alert("Error: this username is already taken")
          } else if (username === "" || selectedAvatar === "") {
            alert("Error: choose a username and an avatar")
          } else {
            chrome.runtime.sendMessage({
              mess: "fetch",
              body: "/users",
              method: "post",
              content: { username: username, password: password, selectedAvatar: selectedAvatar }
            }, () => {
              let profileInfo = { username: username, selectedAvatar: selectedAvatar }
              chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
              title.textContent = "Main Page - Welcome " + username + "!"
              render("home")
            })
          }
        })
      }
    })
  })

  function displayConfirmButton() {
    if (username !== "" && selectedAvatar !== "" && document.getElementById("passwordField").value != "") {
      confirmButtonWrapper.style.display = "flex"
    }
  }

  usernameField.addEventListener("change", function (event) {
    username = event.target.value
    displayConfirmButton()
  })

  greenAvatarContainer.addEventListener("click", function () {
    highlightDefaultAvatar(greenAvatarContainer, redAvatarContainer, blueAvatarContainer, "00FF00")
    selectedAvatar = "../img/default_green.png"
    displayConfirmButton()
  })

  redAvatarContainer.addEventListener("click", function () {
    highlightDefaultAvatar(redAvatarContainer, greenAvatarContainer, blueAvatarContainer, "FF0000")
    selectedAvatar = "../img/default_red.png"
    displayConfirmButton()
  })

  blueAvatarContainer.addEventListener("click", function () {
    highlightDefaultAvatar(blueAvatarContainer, greenAvatarContainer, redAvatarContainer, "0000FF")
    selectedAvatar = "../img/default_blue.png"
    displayConfirmButton()
  })

  logoutButton.addEventListener("click", function () {
    chrome.storage.sync.set({ profileInfo: "[]" })
    title.textContent = "Main Page"
    render("create")
  })

  viewProfileButton.addEventListener("click", function () {
    chrome.storage.sync.get(["profileInfo"], function (result) {
      let profileInfo = JSON.parse(result.profileInfo)
      firstWrapper.style.display = "none"
      thirdWrapper.style.display = "flex"
      if (selectableAvatars.childNodes.length === 0 && achievementsContainer.childNodes.length === 0) {
        chrome.runtime.sendMessage({
          mess: "fetch",
          method: "get",
          body: "/users/" + profileInfo.username + "/avatars"
        }, (response) => {
          let avatars = response.data
          chrome.runtime.sendMessage({
            mess: "fetch",
            method: "get",
            body: "/users/" + profileInfo.username + "/achievements"
          }, (response2) => {
            let achievements = response2.data
            for (let i = 0; i < avatars.length; i++) {
              let div = document.createElement("div")
              div.className = "file"
              let h2 = document.createElement("h3")
              h2.style = "text-align: center;"
              h2.textContent = avatars[i].name
              div.appendChild(h2)
              let img = document.createElement("img")
              img.style = "max-width:100%; max-height:100%;"
              img.src = avatars[i].url
              div.appendChild(img)
              selectableAvatars.appendChild(div)
              if (profileInfo.selectedAvatar === avatars[i].url) {
                div.style = `border:3px; border-style:solid; border-color:#2215E2; padding: 1em;`
              }
              div.id = i + 1
              avatarDivs.push(div)
              function changeSelectedAvatar(divClicked, otherDivs) {
                if (divClicked !== undefined) {
                  divClicked.style = `border:3px; border-style:solid; border-color:#2215E2; padding: 1em;`
                  otherDivs.map((d) => d.style = "border:0; border-style:solid;")
                  let child = divClicked.childNodes[1]
                  let pos = child.src.indexOf("/img")
                  let src = ".." + child.src.slice(pos)
                  profileInfo.selectedAvatar = src
                  chrome.runtime.sendMessage({
                    mess: "fetch",
                    method: "patch",
                    body: "/users/" + profileInfo.username,
                    content: { selectedAvatar: src }
                  }, () => { chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) }) })
                }
              }
              div.addEventListener("click", function (event) {
                function filterAvatars(e) {
                  return e.id === event.target.id
                }
                function filterOthers(e) {
                  return e.id !== event.target.id
                }
                let divClicked = avatarDivs.filter(filterAvatars)[0]
                let otherDivs = avatarDivs.filter(filterOthers)
                changeSelectedAvatar(divClicked, otherDivs)
              })
              img.addEventListener("click", function (event) {
                function filterAvatars(e) {
                  return e.childNodes[1].src === event.target.src
                }
                function filterOthers(e) {
                  return e.childNodes[1].src !== event.target.src
                }
                let divClicked = avatarDivs.filter(filterAvatars)[0]
                let otherDivs = avatarDivs.filter(filterOthers)
                changeSelectedAvatar(divClicked, otherDivs)
              })
            }
            if (achievements.length === 0) {
              let h3 = document.createElement("h3")
              h3.textContent = "You have obtained no achievements!"
              h3.style = "text-align: center; color: #2215E2"
              achievementsContainer.appendChild(h3)
            } else {
              achievements.sort(compareAchievements)
              achievements.map((a) => {
                let div = document.createElement("div")
                div.className = "file"
                let img = document.createElement("img")
                img.style = "max-width:50%; max-height:50%;"
                img.src = a.path
                div.appendChild(img)
                let p = document.createElement("h3")
                p.style = "text-align: center"
                p.textContent = a.text
                div.appendChild(p)
                achievementsContainer.appendChild(div)
              })
            }
          })
        })
      }

    })
  })

  goBackButton.addEventListener("click", function () {
    firstWrapper.style.display = "flex"
    thirdWrapper.style.display = "none"
  })

  viewLeaderboardButton.addEventListener("click", function () {
    firstWrapper.style.display = "none"
    fourthWrapper.style.display = "flex"
    drawLeaderboards()
  })

  returnButton.addEventListener("click", function () {
    firstWrapper.style.display = "flex"
    fourthWrapper.style.display = "none"
  })

})

