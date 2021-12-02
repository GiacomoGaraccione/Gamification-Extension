var recordFileButton = document.getElementById("recordFileButton");
var profileFileButton = document.getElementById("profileFileButton");
var profileButton = document.getElementById("profileButton")
var pageURL = document.getElementById("pageURL");
var pageURLButton = document.getElementById("pageURLButton");
var resetButton = document.getElementById("resetButton");
var confirmProfileButton = document.getElementById("confirmProfileButton")
var usernameField = document.getElementById("usernameField")
var logoutButton = document.getElementById("logoutButton")
var viewProfileButton = document.getElementById("viewProfileButton")
var firstWrapper = document.getElementById("firstWrapper")
var secondWrapper = document.getElementById("secondWrapper")
var thirdWrapper = document.getElementById("thirdWrapper")
var fourthWrapper = document.getElementById("fourthWrapper")
var newProfileDiv = document.getElementById("newProfileDiv")
var uploadProfileDiv = document.getElementById("uploadProfileDiv")
var uploadSessionDiv = document.getElementById("uploadSessionDiv")
var resetSessionDiv = document.getElementById("resetSessionDiv")
var urlDiv = document.getElementById("urlDiv")
var logoutDiv = document.getElementById("logoutDiv")
var viewProfileDiv = document.getElementById("viewProfileDiv")
var title = document.getElementById("title")
var confirmButtonWrapper = document.getElementById("confirmButtonWrapper")
var redAvatarContainer = document.getElementById("redAvatarContainer")
var greenAvatarContainer = document.getElementById("greenAvatarContainer")
var blueAvatarContainer = document.getElementById("blueAvatarContainer")
var selectableAvatars = document.getElementById("selectableAvatars")
var achievementsContainer = document.getElementById("achievements")
var goBackButton = document.getElementById("goBackButton")
var viewLeaderboardButton = document.getElementById("viewLeaderboardButton")
var returnButton = document.getElementById("returnButton")
var highestNewVisitedPages = document.getElementById("highestNewVisitedPages")
var highestNewWidgets = document.getElementById("highestNewWidgets")
var highestCoverage = document.getElementById("highestCoverage")
var printLeaderboard = document.getElementById("printLeaderboard")
var importLeaderboard = document.getElementById("importLeaderboard")

var url = "";
var username = ""
var selectedAvatar = ""
var avatarDivs = []

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
    } else {
      return 0
    }
  } else {
    return 0
  }
}

function render(flag) {
  if (flag === "home") {
    secondWrapper.style.display = "none"
    firstWrapper.style.display = "flex"
    newProfileDiv.style.display = "none"
    uploadProfileDiv.style.display = "none"
    uploadSessionDiv.style.display = "flex"
    resetSessionDiv.style.display = "flex"
    urlDiv.style.display = "flex"
    logoutDiv.style.display = "flex"
    viewProfileDiv.style.display = "flex"
  } else if (flag === "create") {
    newProfileDiv.style.display = "flex"
    uploadProfileDiv.style.display = "flex"
    uploadSessionDiv.style.display = "none"
    resetSessionDiv.style.display = "none"
    urlDiv.style.display = "none"
    logoutDiv.style.display = "none"
    viewProfileDiv.style.display = "none"
  }
}

function highlightDefaultAvatar(selected, second, third, color) {
  selected.style = `border:3px; border-style:solid; border-color:#` + color + `; padding: 1em;`
  second.style = "border:0; border-style:solid;"
  third.style = "border:0; border-style:solid;"
}

function drawTable(container, mode, data) {
  var copy = data
  if (mode === "VP") {
    copy.sort((a, b) => b.highestNewVisitedPages - a.highestNewVisitedPages)
  } else if (mode === "W") {
    copy.sort((a, b) => b.highestNewWidgets - a.highestNewWidgets)
  } else if (mode === "C") {
    copy.sort((a, b) => b.highestCoverage - a.highestCoverage)
  }
  if (container.childNodes.length === 3) {
    var tableVP = document.createElement("table")
    var tableVPHead = document.createElement("thead")
    var cell1 = document.createElement("th")
    var cell2 = document.createElement("th")
    tableVP.appendChild(tableVPHead)
    tableVPHead.appendChild(cell1)
    tableVPHead.appendChild(cell2)
    cell1.appendChild(document.createTextNode("Username"))
    cell2.appendChild(document.createTextNode("Score"))
    for (var i = 0; i < copy.length; i++) {
      var row = tableVP.insertRow()
      var cell3 = row.insertCell()
      var cell4 = row.insertCell()
      cell3.appendChild(document.createTextNode(copy[i].username))
      var text = mode === "VP" ? copy[i].highestNewVisitedPages : mode === "W" ? copy[i].highestNewWidgets : copy[i].highestCoverage
      cell4.appendChild(document.createTextNode(text))
    }
    container.appendChild(tableVP)
  }
}

function drawLeaderboards() {

  chrome.storage.sync.get(["registeredUsers"], function (result) {
    var registeredUsers = JSON.parse(result.registeredUsers)
    drawTable(highestNewVisitedPages, "VP", registeredUsers)
    drawTable(highestNewWidgets, "W", registeredUsers)
    drawTable(highestCoverage, "C", registeredUsers)

  })
}


chrome.storage.sync.get(["profileInfo"], function (result) {
  var profileInfo = result.profileInfo
  if (profileInfo !== undefined && profileInfo !== "[]") {
    var profileInfoObj = JSON.parse(profileInfo)
    title.textContent = "Main Page - Welcome " + profileInfoObj.username + "!"
    render("home")
  }

  profileFileButton.addEventListener("click", function () {
    var input = profileFileButton.parentElement.getElementsByTagName("input");
    input[0].addEventListener("change", function () {
      var fr = new FileReader();

      fr.onload = function () {
        chrome.storage.sync.set({ profileInfo: fr.result });
        var profileInfo = JSON.parse(fr.result)
        title.textContent = "Main Page - Welcome " + profileInfo.username + "!"
        render("home")
      };
      fr.readAsText(this.files[0]);
    });
    $($(this).parent().find("input")).click();
  })
  recordFileButton.addEventListener("click", function () {
    var input = recordFileButton.parentElement.getElementsByTagName("input");
    input[0].addEventListener("change", function () {
      var fr = new FileReader();

      fr.onload = function () {
        chrome.storage.sync.set({ pageActions: fr.result });
      };
      fr.readAsText(this.files[0]);
    });
    $($(this).parent().find("input")).click();
  });

  pageURLButton.addEventListener("click", async () => {
    var url = document.getElementById("pageURL").value;
    var [tab] = await chrome.tabs.query({ url: url });
    var domain = new URL(url);
    var empty = [];

    chrome.storage.sync.set({ startingURL: domain.hostname });
    chrome.storage.sync.set({ visitedPages: [] });
    chrome.storage.sync.set({ pageStats: JSON.stringify(empty) });
    chrome.storage.sync.set({ newPages: [] });
    chrome.storage.sync.set({ pageSession: JSON.stringify(empty) })
    if (tab === undefined) {
      chrome.runtime.sendMessage({
        mess: "openNew",
        url: url,
      });
    } else {
      chrome.tabs.update(tab.id, { highlighted: true });
    }
  });

  resetButton.addEventListener("click", function () {
    chrome.storage.sync.get(["profileInfo"], function (result) {
      var profileInfo = JSON.parse(result.profileInfo)
      profileInfo.achievements = []
      profileInfo.availableAvatars = profileInfo.availableAvatars.slice(0, 3)
      //console.log(profileInfo)
      chrome.storage.sync.set({ pageActions: JSON.stringify([]), profileInfo: JSON.stringify(profileInfo) });

    })
  });

  profileButton.addEventListener("click", function () {
    firstWrapper.style.display = "none"
    secondWrapper.style.display = "flex"
  })

  confirmProfileButton.addEventListener("click", function () {
    chrome.storage.sync.get(["registeredUsers"], function (result) {
      function filterUsers(event) {
        return event.username === username
      }
      var registeredUsers = result.registeredUsers === undefined ? [] : JSON.parse(result.registeredUsers)
      var userObj = {
        username: username,
        highestNewVisitedPages: 0,
        highestNewWidgets: 0,
        highestCoverage: 0
      }
      var filteredUsers = registeredUsers.filter(filterUsers)
      if (filteredUsers.length > 0) {
        alert("Error: this username is already taken")
      } else if (username === "" || selectedAvatar === "") {
        alert("Error: choose a username and an avatar")
      } else {
        registeredUsers.push(userObj)
        var profileInfo = {
          username: username,
          selectedAvatar: selectedAvatar,
          availableAvatars: [{ name: "Green Avatar", url: "../img/default_green.png" }, { name: "Red Avatar", url: "../img/default_red.png" }, { name: "Blue Avatar", url: "../img/default_blue.png" }],
          achievements: []
        }
        var blob = new Blob([JSON.stringify(profileInfo)], {
          type: "text/plain;charset=UTF-8",
        });
        var url = window.URL.createObjectURL(blob);
        var obj = {
          url: url,
          filename: "gamification-extension-profile-" + username + ".txt",
        };
        chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo), registeredUsers: JSON.stringify(registeredUsers) })
        chrome.runtime.sendMessage({ obj: obj, mess: "download" });
        title.textContent = "Main Page - Welcome " + username + "!"
        render("home")
      }
    })


  })

  function displayConfirmButton() {
    if (username !== "" && selectedAvatar !== "") {
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
      var profileInfo = JSON.parse(result.profileInfo)
      firstWrapper.style.display = "none"
      thirdWrapper.style.display = "flex"
      if (selectableAvatars.childNodes.length === 0 && achievementsContainer.childNodes.length === 0) {
        for (var i = 0; i < profileInfo.availableAvatars.length; i++) {
          var div = document.createElement("div")
          div.className = "file"
          var h2 = document.createElement("h2")
          h2.style = "text-align: center;"
          h2.textContent = profileInfo.availableAvatars[i].name
          div.appendChild(h2)
          var img = document.createElement("img")
          img.style = "max-width:100%; max-height:100%;"
          img.src = profileInfo.availableAvatars[i].url
          div.appendChild(img)
          selectableAvatars.appendChild(div)
          if (profileInfo.selectedAvatar === profileInfo.availableAvatars[i].url) {
            div.style = `border:3px; border-style:solid; border-color:#FFD700; padding: 1em;`
          }
          div.id = i + 1
          avatarDivs.push(div)
          function changeSelectedAvatar(divClicked, otherDivs) {
            if (divClicked !== undefined) {
              divClicked.style = `border:3px; border-style:solid; border-color:#FFD700; padding: 1em;`
              otherDivs.map((d) => d.style = "border:0; border-style:solid;")
              var child = divClicked.childNodes[1]
              var pos = child.src.indexOf("/img")
              var src = ".." + child.src.slice(pos)
              profileInfo.selectedAvatar = src
              chrome.storage.sync.set({ profileInfo: JSON.stringify(profileInfo) })
            }
          }
          div.addEventListener("click", function (event) {
            function filterAvatars(e) {
              return e.id === event.target.id
            }
            function filterOthers(e) {
              return e.id !== event.target.id
            }
            var divClicked = avatarDivs.filter(filterAvatars)[0]
            var otherDivs = avatarDivs.filter(filterOthers)
            changeSelectedAvatar(divClicked, otherDivs)
          })
          img.addEventListener("click", function (event) {
            function filterAvatars(e) {
              return e.childNodes[1].src === event.target.src
            }
            function filterOthers(e) {
              return e.childNodes[1].src !== event.target.src
            }
            var divClicked = avatarDivs.filter(filterAvatars)[0]
            var otherDivs = avatarDivs.filter(filterOthers)
            changeSelectedAvatar(divClicked, otherDivs)
          })
        }
        var achievements = profileInfo.achievements
        if (achievements.length === 0) {
          var h3 = document.createElement("h3")
          h3.textContent = "You have obtained no achievements!"
          h3.style = "text-align: center"
          achievementsContainer.appendChild(h3)
        } else {
          achievements.sort(compareAchievements)
          achievements.map((a) => {
            var div = document.createElement("div")
            div.className = "file"
            var img = document.createElement("img")
            img.style = "max-width:50%; max-height:50%;"
            img.src = a.path
            div.appendChild(img)
            var p = document.createElement("h3")
            p.style = "text-align: center"
            p.textContent = a.text
            div.appendChild(p)
            achievementsContainer.appendChild(div)
          })
        }
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

  printLeaderboard.addEventListener("click", function () {
    chrome.storage.sync.get(["registeredUsers"], function (result) {
      var blob = new Blob([result.registeredUsers], {
        type: "text/plain;charset=UTF-8",
      });
      var url = window.URL.createObjectURL(blob);
      var obj = {
        url: url,
        filename: "gamification-extension-leaderboard.txt",
      };
      chrome.runtime.sendMessage({ obj: obj, mess: "download" });
    })
  })

  importLeaderboard.addEventListener("click", function () {
    var input = importLeaderboard.parentElement.getElementsByTagName("input");
    input[0].addEventListener("change", function () {
      var fr = new FileReader();

      fr.onload = function () {
        chrome.storage.sync.set({ registeredUsers: fr.result }, function () {
          drawLeaderboards()
        });
      };
      fr.readAsText(this.files[0]);
    });
    $($(this).parent().find("input")).click();
  })
})

