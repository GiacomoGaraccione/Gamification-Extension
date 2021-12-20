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

exports.getPages = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageInfo"
        db.all(sql, [], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.getPage = function (url) {
    return new Promise((resolve, reject) => {
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

exports.getPageActions = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageActions WHERE username = ?"
        db.all(sql, [username], (err, rows) => {
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

exports.getPageIssues = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageIssues WHERE username = ?"
        db.all(sql, [username], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.addPageRecord = function (pageRecord) {
    return new Promise((resolve, reject) => {
        const sqlCh = "SELECT * FROM PageRecords WHERE url = ?"
        db.get(sqlCh, [pageRecord.url], (errCh, rowCh) => {
            if (errCh) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errCh.errno + " - code: " + errCh.code
                reject(utilities.errorObjs.dbError)
            } else {
                if (!rowCh) {
                    const sql = "INSERT INTO PageRecords(username, url, highestWidgets, coverage, linksCoverage, inputsCoverage, buttonsCoverage, highestLinks, highestInputs, highestButtons) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    db.run(sql, [pageRecord.username, pageRecord.url, pageRecord.highestWidgets, pageRecord.coverage, pageRecord.linksCoverage, pageRecord.inputsCoverage, pageRecord.buttonsCoverage, pageRecord.highestLinks, pageRecord.highestInputs, pageRecord.highestButtons], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve(pageRecord)
                        }
                    })

                } else {
                    let highestWidgets = pageRecord.highestWidgets > rowCh.highestWidgets ? pageRecord.highestWidgets : rowCh.highestWidgets
                    let coverage = pageRecord.coverage > rowCh.coverage ? pageRecord.coverage : rowCh.coverage
                    let linksCoverage = pageRecord.linksCoverage > rowCh.linksCoverage ? pageRecord.linksCoverage : rowCh.linksCoverage
                    let inputsCoverage = pageRecord.inputsCoverage > rowCh.inputsCoverage ? pageRecord.inputsCoverage : rowCh.inputsCoverage
                    let buttonsCoverage = pageRecord.buttonsCoverage > rowCh.buttonsCoverage ? pageRecord.buttonsCoverage : rowCh.buttonsCoverage
                    let highestLinks = pageRecord.highestLinks > rowCh.highestLinks ? pageRecord.highestLinks : rowCh.highestLinks
                    let highestInputs = pageRecord.highestInputs > rowCh.highestInputs ? pageRecord.highestInputs : rowCh.highestInputs
                    let highestButtons = pageRecord.highestButtons > rowCh.highestButtons ? pageRecord.highestButtons : rowCh.highestButtons
                    const sql = "UPDATE PageRecords SET highestWidgets = ?, coverage = ?, linksCoverage = ?, inputsCoverage = ?, buttonsCoverage = ?, highestLinks = ?, highestInputs = ?, highestButtons = ? WHERE url = ? AND username = ?"
                    db.run(sql, [highestWidgets, coverage, linksCoverage, inputsCoverage, buttonsCoverage, highestLinks, highestInputs, highestButtons, pageRecord.url, pageRecord.username], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            let ret = {
                                username: pageRecord.username,
                                url: pageRecord.url,
                                highestWidgets: highestWidgets,
                                coverage: coverage,
                                linksCoverage: linksCoverage,
                                inputsCoverage: inputsCoverage,
                                buttonsCoverage: buttonsCoverage,
                                highestLinks: highestLinks,
                                highestInputs: highestInputs,
                                highestButtons: highestButtons
                            }
                            resolve(ret)
                        }
                    })
                }
            }
        })
    })
}

exports.getPageRecords = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageRecords WHERE username = ?"
        db.all(sql, [username], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}