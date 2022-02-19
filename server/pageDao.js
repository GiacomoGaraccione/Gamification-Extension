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
                    const sql = "INSERT INTO PageInfo(url, totalLinkObjects, totalInputObjects, totalButtonObjects, totalSelectObjects) VALUES(?, ?, ?, ?, ?)"
                    db.run(sql, [page.url, page.totalLinkObjects, page.totalInputObjects, page.totalButtonObjects, page.totalSelectObjects], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                } else {
                    const sql = "UPDATE PageInfo SET totalLinkObjects = ?, totalInputObjects = ?, totalButtonObjects = ?, totalSelectObjects = ? WHERE url = ?"
                    db.run(sql, [page.totalLinkObjects, page.totalInputObjects, page.totalButtonObjects, page.totalSelectObjects, page.url], (err, row) => {
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
        const sql = "INSERT INTO PageIssues(username, url, objectId, objectType, issueText) VALUES(?, ?, ?, ?, ?)"
        db.run(sql, [pageAction.username, pageAction.url, pageAction.objectId, pageAction.objectType, pageAction.issueText], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getPageIssues = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PageIssues"
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

exports.solvePageIssue = function (username, pageIssue) {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM PageIssues WHERE username = ? AND url = ? AND objectId = ? AND objectType = ?"
        db.run(sql, [username, pageIssue.url, pageIssue.objectId, pageIssue.objectType], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.addPageRecord = function (pageRecord) {
    return new Promise((resolve, reject) => {
        const sqlCh = "SELECT * FROM PageRecords WHERE url = ? AND username = ?"
        db.get(sqlCh, [pageRecord.url, pageRecord.username], (errCh, rowCh) => {
            if (errCh) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errCh.errno + " - code: " + errCh.code
                reject(utilities.errorObjs.dbError)
            } else {
                if (!rowCh) {
                    const sql = "INSERT INTO PageRecords(username, url, highestWidgets, coverage, linksCoverage, inputsCoverage, buttonsCoverage, selectsCoverage, highestLinks, highestInputs, highestButtons, highestSelects) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    db.run(sql, [pageRecord.username, pageRecord.url, pageRecord.highestWidgets, pageRecord.coverage, pageRecord.linksCoverage, pageRecord.inputsCoverage, pageRecord.buttonsCoverage, pageRecord.selectsCoverage, pageRecord.highestLinks, pageRecord.highestInputs, pageRecord.highestButtons, pageRecord.highestSelects], (err, row) => {
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
                    let selectsCoverage = pageRecord.selectsCoverage > rowCh.selectsCoverage ? pageRecord.selectsCoverage : rowCh.selectsCoverage
                    let highestLinks = pageRecord.highestLinks > rowCh.highestLinks ? pageRecord.highestLinks : rowCh.highestLinks
                    let highestInputs = pageRecord.highestInputs > rowCh.highestInputs ? pageRecord.highestInputs : rowCh.highestInputs
                    let highestButtons = pageRecord.highestButtons > rowCh.highestButtons ? pageRecord.highestButtons : rowCh.highestButtons
                    let highestSelects = pageRecord.highestSelects > rowCh.highestSelects ? pageRecord.highestSelects : rowCh.highestSelects
                    const sql = "UPDATE PageRecords SET highestWidgets = ?, coverage = ?, linksCoverage = ?, inputsCoverage = ?, buttonsCoverage = ?, selectsCoverage = ?, highestLinks = ?, highestInputs = ?, highestButtons = ?, highestSelects = ? WHERE url = ? AND username = ?"
                    db.run(sql, [highestWidgets, coverage, linksCoverage, inputsCoverage, buttonsCoverage, selectsCoverage, highestLinks, highestInputs, highestButtons, highestSelects, pageRecord.url, pageRecord.username], (err, row) => {
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
                                selectsCoverage: selectsCoverage,
                                highestLinks: highestLinks,
                                highestInputs: highestInputs,
                                highestButtons: highestButtons,
                                highestSelects: highestSelects
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

exports.addWidgetCrop = function (widgetCrop, username) {
    return new Promise((resolve, reject) => {
        if (widgetCrop.widgetType === "select") {

        }
        const sql = "INSERT INTO WidgetCrops(username, imageUrl, widgetType, widgetId, textContent, selectIndex, selector, xpath, elementId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"
        db.run(sql, [username, widgetCrop.imageUrl, widgetCrop.widgetType, widgetCrop.widgetId, widgetCrop.textContent, widgetCrop.selectIndex, widgetCrop.selector, widgetCrop.xpath, widgetCrop.elementId], (err, row) => {
            if (err) {
                console.log(err)
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getWidgetCrops = function (username) {
    return new Promise((resolve, reject) => {
        const sqlClear = "DELETE FROM WidgetCrops WHERE username = ? AND widgetType = ? AND selectIndex IS NULL"
        db.run(sqlClear, [username, "select"], (errClear, rowClear) => {
            if (errClear) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errClear.errno + " - code: " + errClear.code
                reject(utilities.errorObjs.dbError)
            } else {
                const sql = "SELECT * FROM WidgetCrops WHERE username = ? ORDER BY id"
                db.all(sql, [username], (err, rows) => {
                    if (err) {
                        utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                        reject(utilities.errorObjs.dbError)
                    } else {
                        const sqlDel = "DELETE FROM WidgetCrops WHERE username = ?"
                        db.run(sqlDel, [username], (errDel, rowDel) => {
                            if (errDel) {
                                utilities.errorObjs.dbError.errorMessage = "errno: " + errDel.errno + " - code: " + errDel.code
                                reject(utilities.errorObjs.dbError)
                            } else {
                                resolve(rows)
                            }
                        })
                    }
                })
            }
        })
    })
}

exports.updateWidgetCrop = function (username, widgetCrop) {
    return new Promise((resolve, reject) => {
        if (widgetCrop.lastInput) {
            const sqlMax = "SELECT MAX(id) FROM WidgetCrops WHERE username = ? AND widgetType = ? AND lastInput IS NULL"
            db.get(sqlMax, [username, "input"], (errMax, rowMax) => {
                if (errMax) {
                    utilities.errorObjs.dbError.errorMessage = "errno: " + errMax.errno + " - code: " + errMax.code
                    reject(utilities.errorObjs.dbError)
                } else {
                    let maxId = rowMax["MAX(id)"]
                    const sql = "UPDATE WidgetCrops SET lastInput = true WHERE username = ? AND widgetType = ? AND widgetId = ? AND id = ?"
                    db.run(sql, [username, "input", widgetCrop.widgetId, maxId], (err, row) => {
                        if (err) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                    resolve()
                }
            })
        } else if (!widgetCrop.selectIndex) {
            const sql = "UPDATE WidgetCrops SET textContent = ? WHERE username = ? AND widgetType = ? AND widgetId = ? AND textContent IS NULL"
            db.run(sql, [widgetCrop.textContent, username, "input", widgetCrop.widgetId], (err, row) => {
                if (err) {
                    utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                    reject(utilities.errorObjs.dbError)
                } else {
                    resolve()
                }
            })
        } else {
            const sql = "UPDATE WidgetCrops SET selectIndex = ? WHERE id = (SELECT id FROM WidgetCrops WHERE widgetType = ? AND widgetId = ? AND username = ? AND selectIndex IS NULL)"
            db.run(sql, [widgetCrop.selectIndex, "select", widgetCrop.widgetId, username], (err, row) => {
                if (err) {
                    utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                    reject(utilities.errorObjs.dbError)
                } else {
                    const sqlDel = "DELETE FROM WidgetCrops WHERE widgetType = ? AND widgetId = ? AND username = ? AND selectIndex IS NULL"
                    db.run(sqlDel, ["select", widgetCrop.widgetId, username], (errDel, rowDel) => {
                        if (errDel) {
                            utilities.errorObjs.dbError.errorMessage = "errno: " + errDel.errno + " - code: " + errDel.code
                            reject(utilities.errorObjs.dbError)
                        } else {
                            resolve()
                        }
                    })
                }
            })
        }
    })
}