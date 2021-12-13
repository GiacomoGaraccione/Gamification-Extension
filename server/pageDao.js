"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")

exports.addPage = function (page) {
    return new Promise((resolve, reject) => {
        const sqlCh = "SELECT * FROM PageInfo WHERE url = ?"
        db.get(sqlCh, [page.url], (errCh, rowCh) => {
            if (errCh) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errCh.errno + " - code: " + errCh.code
                reject(utilities.errorObjs.dbError)
            } else {
                if (!rowCh) {
                    const sql = "INSERT INTO PageInfo(url, totalLinkObjects, totalInputObjects, totalButtonObjects) VALUES(?, ?, ?, ?)"
                    db.run(sql, [page.url, page.totalLinkObjects, page.totalInputObjects, page.totalButtonObjects], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                } else {
                    const sql = "UPDATE PageInfo SET totalLinkObjects = ?, totalInputObjects = ?, totalButtonObjects = ? WHERE url = ?"
                    db.run(sql, [page.totalLinkObjects, page.totalInputObjects, page.totalButtonObjects, page.url], (err, row) => {
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

exports.getPage = function (url) {
    return new Promise((resolve, reject) => {
        console.log(url)
        const sql = "SELECT * FROM PageInfo WHERE url = ?"
        db.get(sql, [url], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(row)
            }
        })
    })
}

exports.addPageAction = function (pageAction) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO PageActions(username, url, objectId, objectType) VALUES(?, ?, ?, ?)"
        db.run(sql, [pageAction.username, pageAction.url, pageAction.objectId, pageAction.objectType], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getPageActions = function (username, url) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageActions WHERE username = ? AND url = ?"
        db.all(sql, [username, url], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.addPageIssue = function (pageAction) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO PageIssues(username, url, objectId, objectType) VALUES(?, ?, ?, ?)"
        db.run(sql, [pageAction.username, pageAction.url, pageAction.objectId, pageAction.objectType], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getPageIssues = function (username, url) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageIssues WHERE username = ? AND url = ?"
        db.all(sql, [username, url], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}