const express = require("express");
const morgan = require('morgan');
const utilities = require("./utilities.js")
const userDao = require("./userDao.js")
const pageDao = require("./pageDao.js")

const { query, check, body, param, validationResult } = require('express-validator');

const PORT = 3001;

const app = new express();
app.use(morgan('tiny'));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`)
}
);

//------------------------ User APIs ---------------------------------

app.post("/api/login", [
    body("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("password", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        userDao.checkPassword(req.body.username, req.body.password)
            .then((ret) => res.json(ret))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * POST API - Creation of a new user
 * Request Parameters: none
 * Request Body Content: an object containing the username of the new user and the path corresponding to the avatar selected by the new user
 *      Example input:
 *          {"username":"Giacomo","selectedAvatar":"../img/default_blue.png"}
 * Response Body Content: none
 */
app.post("/api/users", [
    body("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("selectedAvatar", "Parameter isn't a valid path").notEmpty().isIn(["../img/default_green.png", "../img/default_red.png", "../img/default_blue.png"]),
    body("password", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const user = req.body
        userDao.addUser(user)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

app.get("/api/users", (req, res) => {
    userDao.getUsers()
        .then((users) => res.json(users))
        .catch((err) => {
            utilities.resolveErrors(err, res)
        })
})

/**
 * GET API - Retrieval of a user
 * Request Parameters: a string corresponding to the username of the user whose information is asked
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: an object containing the username and the currently selected avatar of a user
 *      Example output:
 *          {"username":"Giacomo","selectedAvatar":"../img/default_blue.png"}
 */
app.get("/api/users/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        userDao.getUser(username)
            .then((user) => res.json(user))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

app.patch("/api/users/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("selectedAvatar", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const user = { username: req.params.username, selectedAvatar: req.body.selectedAvatar }
        userDao.updateUser(user)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * GET API - Retrieval of a user's unlocked avatars
 * Request Parameters: a string corresponding to the username of the user whose information is asked
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing the name and the path of an avatar
 *      Example output:
 *          [ { "name": "Green Avatar", "url": "../img/default_green.png" }, { "name": "Red Avatar", "url": "../img/default_red.png" }, { "name": "Blue Avatar", "url": "../img/default_blue.png" } ]
 */
app.get("/api/users/:username/avatars", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        userDao.getUserAvatars(username)
            .then((avatars) => res.json(avatars))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

/**
 * GET API - Retrieval of a user's unlocked achievements
 * Request Parameters: a string corresponding to the username of the user whose information is asked
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing identifier, name and path of an achievement
 *      Example output:
 *          [{"idAch":1,"text":"Obtained 25% coverage for a type of widgets!","path":"../img/achievement_bronze.png"},{"idAch":2,"text":"Obtained 50% coverage for a type of widgets!","path":"../img/achievement_silver.png"}]
 */
app.get("/api/users/:username/achievements", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        userDao.getUserAchievements(username)
            .then((achievements) => res.json(achievements))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

/**
 * PATCH API - Update of a user's records
 * Request Parameters: a string corresponding to the username of the user whose information is to be updated
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: an object containing the new scores obtained by the user
 *      Example input:
 *          {"highestNewVisitedPages": 3, "highestNewWidgets": 4, "highestCoverage": 10.0}
 * Response Body Content: none
 */
app.patch("/api/users/:username/records", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("highestNewVisitedPages", "Parameter isn't a number").notEmpty().isNumeric(),
    body("highestNewWidgets", "Parameter isn't a number").notEmpty().isNumeric(),
    body("highestCoverage", "Parameter isn't a number").notEmpty().isNumeric()
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const record = {
            username: req.params.username,
            highestNewVisitedPages: req.body.highestNewVisitedPages,
            highestNewWidgets: req.body.highestNewWidgets,
            highestCoverage: req.body.highestCoverage
        }
        userDao.updateUserRecords(record)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})


app.get("/api/users/:username/records", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        userDao.getUserRecords(username)
            .then((records) => res.json(records))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

/**
 * GET API - Retrieval of the ranking of all users, ordered by their "highestNewVisitedPages" score
 * Request Parameters: none
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing username and scores
 *      Example output:
 *          [{"username":"Giacomo","highestNewVisitedPages":4,"highestNewWidgets":4,"highestCoverage":10},{"username":"Jacks","highestNewVisitedPages":1,"highestNewWidgets":5,"highestCoverage":9}]
 */
app.get("/api/users/records/pages", (req, res) => {
    userDao.getRecords()
        .then((records) => {
            records.sort((a, b) => b.highestNewVisitedPages - a.highestNewVisitedPages)
            res.json(records)
        })
        .catch((err) => utilities.resolveErrors(err, res))
})

/**
 * GET API - Retrieval of the ranking of all users, ordered by their "highestNewWidgets" score
 * Request Parameters: none
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing username and scores
 *      Example output:
 *          [{"username":"Jacks","highestNewVisitedPages":1,"highestNewWidgets":5,"highestCoverage":9},{"username":"Giacomo","highestNewVisitedPages":4,"highestNewWidgets":4,"highestCoverage":10}]
 */
app.get("/api/users/records/widgets", (req, res) => {
    userDao.getRecords()
        .then((records) => {
            records.sort((a, b) => b.highestNewWidgets - a.highestNewWidgets)
            res.json(records)
        })
        .catch((err) => utilities.resolveErrors(err, res))
})

/**
 * GET API - Retrieval of the ranking of all users, ordered by their "highestCoverage" score
 * Request Parameters: none
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing username and scores
 *      Example output:
 *          [{"username":"Giacomo","highestNewVisitedPages":4,"highestNewWidgets":4,"highestCoverage":10},{"username":"Jacks","highestNewVisitedPages":1,"highestNewWidgets":5,"highestCoverage":9}]
 */
app.get("/api/users/records/coverage", (req, res) => {
    userDao.getRecords()
        .then((records) => {
            records.sort((a, b) => b.highestCoverage - a.highestCoverage)
            res.json(records)
        })
        .catch((err) => utilities.resolveErrors(err, res))
})

/**
 * POST API - Unlock of a new avatar by a user
 * Request Parameters: a string equal to the username of the user that unlocked the new avatar
 *      Example input: {"username": "Giacomo"}
 * Request Body Content: a string equal to the name of the unlocked avatar
 *      Example input:
 *          {"name":"Heart Avatar"}
 * Response Body Content: none
 */
app.post("/api/users/:username/avatars", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("name", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        const name = req.body.name
        userDao.addAvatar(username, name)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * POST API - Unlock of a new achievement by a user
 * Request Parameters: a string equal to the username of the user that unlocked the new achievement
 *      Example input: {"username": "Giacomo"}
 * Request Body Content: a string equal to the name of the unlocked achievement
 *      Example input:
 *          {"text":"Obtained 100% coverage for a type of widgets!"}
 * Response Body Content: none
 */
app.post("/api/users/:username/achievements", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("text", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        const text = req.body.text
        userDao.addAchievement(username, text)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})


//------------------------ Page APIs ---------------------------------

/**
 * POST API - Creation of a new page
 * Request Parameters: none
 * Request Body Content: an object containing the url of the new page and the amount of different widgets (links, forms, buttons) present in the page
 *      Example input:
 *          {"url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci", "totalLinkObjects":64, "totalInputObjects":2, "totalButtonObjects":2}
 * Response Body Content: none
 */
app.post("/api/pages", [
    body("url", "Parameter doesn't respect specifications").notEmpty().isURL(),
    body("totalLinkObjects", "Parameter doesn't respect specifications").notEmpty().isNumeric(),
    body("totalInputObjects", "Parameter doesn't respect specifications").notEmpty().isNumeric(),
    body("totalButtonObjects", "Parameter doesn't respect specifications").notEmpty().isNumeric(),
    body("totalSelectObjects", "Parameter doesn't respect specifications").notEmpty().isNumeric()
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const page = req.body
        pageDao.addPage(page)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

app.get("/api/pages", (req, res) => {
    pageDao.getPages()
        .then((pages) => res.json(pages))
        .catch((err) => utilities.resolveErrors(err, res))
})

/**
 * GET API - Retrieval of the count of all widgets present in a page
 * Request Parameters: none
 * Request Body Content: an object containing the url of the page whose information is to be retrieved
 *      Example input:
 *          {"url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci"}
 * Response Body Content: an object containing url of the page and the count of all widgets
 *      Example output:
 *          {"url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci","totalLinkObjects":64,"totalInputObjects":2,"totalButtonObjects":1}
 */
app.get("/api/pages/:url", [
    param("url", "Parameter doesn't respect specifications").notEmpty()
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const url = req.params.url
        pageDao.getPage(url)
            .then((page) => res.json(page))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

/**
 * POST API - Creation of a new action on a page
 * Request Parameters: none
 * Request Body Content: an object containing the url of the page where the action was made, the username of the user that performed the action, the id and type of widget interacted with that identifies the action
 *      Example input:
 *          {"url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci", "username":"Giacomo", "objectId":"32", "objectType":"link"}
 * Response Body Content: none
 */
app.post("/api/pages/actions", [
    body("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("url", "Parameter doesn't respect specifications").notEmpty().isURL(),
    body("objectId", "Parameter doesn't respect specifications").notEmpty().isNumeric(),
    body("objectType", "Parameter doesn't respect specifications").notEmpty().isIn(["link", "input", "button", "select"])
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const pageAction = req.body
        pageDao.addPageAction(pageAction)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * GET API - Retrieval of the count of all widgets interacted with by a user in a page
 * Request Parameters: a string equal to the username of the user whose actions are requested
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing id and type of an interacted widget
 *      Example output:
 *          [{"username":"Giacomo","url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci","objectId":32,"objectType":"link"},{"username":"Giacomo","url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci","objectId":33,"objectType":"link"}]
 */
app.get("/api/pages/actions/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        pageDao.getPageActions(username)
            .then((actions) => res.json(actions))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

/**
 * POST API - Creation of a new issue on a page
 * Request Parameters: none
 * Request Body Content: an object containing the url of the page where the issue was found, the username of the user that reported the issue, the id and type of widget interacted with that identifies the issue (non-working widget)
 *      Example input:
 *          {"url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci", "username":"Giacomo", "objectId":"32", "objectType":"link"}
 * Response Body Content: none
 */
app.post("/api/pages/issues", [
    body("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/),
    body("url", "Parameter doesn't respect specifications").notEmpty().isURL()
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const pageIssue = req.body
        pageDao.addPageIssue(pageIssue)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * GET API - Retrieval of the count of all issues reported by a user in a page
 * Request Parameters: a string equal to the username of the user whose reported issues are requested
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: an array of objects, each one containing id and type of a signaled widget
 *      Example output:
 *          [{"username":"Giacomo","url":"https://elite.polito.it/teaching/current-courses/513-02jskov-hci","objectId":32,"objectType":"link", "issueText":"Wrong link text"}]
 */
app.get("/api/pages/issues/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        pageDao.getPageIssues(username)
            .then((issues) => res.json(issues))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

app.delete("/api/pages/issues/:username", /*[],*/(req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        const pageIssue = req.body
        pageDao.solvePageIssue(username, pageIssue)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

app.post("/api/pages/records", /*[],*/(req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const pageRecord = req.body
        pageDao.addPageRecord(pageRecord)
            .then((records) => res.json(records))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

/**
 * GET API - Retrieval of all records of all pages of a user
 * Request Parameters: a string equal to the username of the user whose records are requested
 *      Example input:
 *          {"username":"Giacomo"}
 * Request Body Content: none
 * Response Body Content: none
 */
app.get("/api/pages/records/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        pageDao.getPageRecords(username)
            .then((records) => res.json(records))
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

app.post("/api/pages/crops/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const widgetCrop = req.body
        const username = req.params.username
        pageDao.addWidgetCrop(widgetCrop, username)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})

app.get("/api/pages/crops/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        pageDao.getWidgetCrops(username)
            .then((crops) => { res.json(crops) })
            .catch((err) => utilities.resolveErrors(err, res))
    }
})

app.patch("/api/pages/crops/:username", [
    param("username", "Parameter doesn't respect specifications").notEmpty().matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};///':"\\|,.<>\/? ]+$/)
], (req, res) => {
    if (utilities.resolveExpressValidator(validationResult(req), res)) {
        const username = req.params.username
        const widgetCrop = req.body
        pageDao.updateWidgetCrop(username, widgetCrop)
            .then(() => res.status(200).json(utilities.successObj))
            .catch((err) => {
                utilities.resolveErrors(err, res)
            })
    }
})