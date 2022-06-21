"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")
const moment = require("moment")

exports.beginSession = function (username, url) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT MAX(session) AS max FROM SessionLogs WHERE username = ?"
        db.get(sqlGet, [username], (errGet, rowGet) => {
            if (errGet) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errGet.errno + " - code: " + errGet.code
                reject(utilities.errorObjs.dbError)
            } else {
                let now = moment().format("DD-MM-YYYY HH:mm:ss")
                if (rowGet["max"] === null) {
                    const sql = "INSERT INTO SessionLogs(username, session, url, action, date, id) VALUES(?, ?, ?, ?, ?, ?)"
                    db.run(sql, [username, 0, url, "Begin Session", now, 0], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                } else {
                    let session = rowGet["max"] + 1
                    const sql = "INSERT INTO SessionLogs(username, session, url, action, date, id) VALUES(?, ?, ?, ?, ?, ?)"
                    db.run(sql, [username, session, url, "Begin Session", now, 0], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                }
            }
        })
    })
}

exports.addAction = function (username, sessionAction) {
    return new Promise((resolve, reject) => {
        const sqlMax = "SELECT * FROM SessionLogs WHERE username = ? AND session = (SELECT MAX(session) FROM SessionLogs WHERE username = ?)"
        db.all(sqlMax, [username, username], (errMax, rowsMax) => {
            if (errMax) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errMax.errno + " - code: " + errMax.code
                reject(utilities.errorObjs.dbError)
            } else {
                console.log(sessionAction)
                let now = moment().format("DD-MM-YYYY HH:mm:ss")
                let lastRow = rowsMax[rowsMax.length - 1]
                let id = lastRow["id"] + 1
                let session = lastRow["session"]
                const sql = "INSERT INTO SessionLogs(username, session, id, imageUrl, url, widgetId, widgetType, issueText, action, date, content) VALUES(?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)"
                db.run(sql, [username, session, id, sessionAction.imageUrl, sessionAction.url, sessionAction.widgetId, sessionAction.widgetType, sessionAction.issueText, sessionAction.action, now, sessionAction.content], (err, row) => {
                    if (err) {
                        utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                        reject(utilities.errorObjs.dbError)
                    } else {
                        resolve()
                    }
                })
            }
        })
    })
}

exports.endSession = function (username) {
    return new Promise((resolve, reject) => {
        const sqlMax = "SELECT * FROM SessionLogs WHERE username = ? AND session = (SELECT MAX(session) FROM SessionLogs WHERE username = ?)"
        db.all(sqlMax, [username, username], (errMax, rowsMax) => {
            if (errMax) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errMax.errno + " - code: " + errMax.code
                reject(utilities.errorObjs.dbError)
            } else {
                let now = moment().format("DD-MM-YYYY HH:mm:ss")
                let lastRow = rowsMax[rowsMax.length - 1]
                let session = lastRow["session"]
                let url = lastRow["url"]
                let id = lastRow["id"] + 1
                const sqlEnd = "INSERT INTO SessionLogs(username, session, url, action, date, id) VALUES(?, ?, ?, ?, ?, ?)"
                db.run(sqlEnd, [username, session, url, "End Session", now, id], (errEnd, rowEnd) => {
                    if (errEnd) {
                        console.log(errEnd)
                        utilities.errorObjs.dbError.errorMessage = "errno: " + errEnd.errno + " - code: " + errEnd.code
                        reject(utilities.errorObjs.dbError)
                    } else {
                        let end = {
                            username: username,
                            session: session,
                            id: id,
                            imageUrl: null,
                            url: url,
                            widgetId: null,
                            widgetType: null,
                            issueText: null,
                            action: "End Session",
                            date: now
                        }
                        rowsMax.push(end)
                        resolve(rowsMax)
                    }
                })
            }
        })
    })
}