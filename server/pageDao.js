"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")

/**
 * Inserts information about a web page in the database.
 * Updates information in case a page is already present in the database.
 * @param page An object containing information about a page to be inserted in the database
 * @returns Nothing
 */
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

/**
 * Returns information on all pages present in the database.
 * @returns An array of objects containing information about pages
 */
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

/**
 * Returns information about a single page.
 * @param url A string corresponding to the URL of the page to be retrieved
 * @returns An object containing information about the page requested
 */
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

/**
 * Inserts information about a new action performed on a page element
 * @param pageAction An object containing all the information about the performed action
 * @returns Nothing
 */
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

/**
 * Returns the list of page actions made by a single user
 * @param username A string corresponding to the username of the user that wants to know his/her page actions
 * @returns An array containing objects that identify the various page actions made by the user
 */
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

/**
 * Inserts information about a new issue reported on a malfunctioning page element
 * @param pageAction An object containing all the information about the issue
 * @returns Nothing
 */
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

/**
 * Returns the list of issues reported by a single user
 * @param username A string corresponding to the username of the user that wants to know his/her issues
 * @returns An array containing objects that identify the various issues reported by the user
 */
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

/**
 * Marks a previously reported issue on an element as solved.
 * @param username A string corresponding to the user that previously reported an issue and is now marking it as solved
 * @param pageIssue An object used to univocally identify the issue to mark as solved
 * @returns Nothing
 */
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

/**
 * Adds, or updates if already present, information about records made by a user on a page.
 * @param pageRecord An object containing information about all the records to be inserted in the database
 * @returns An object containing the records inserted in the database
 */
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

/**
 * Returns all the records made by a single user.
 * @param username A string corresponding to the user that wants to know his/her records
 * @returns An array containing all the records made by the user
 */
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

/**
 * Inserts information about an interacted element for use at the end of the session, to generate the automated scripts.
 * @param widgetCrop An object containing all the information about the action
 * @param username A string corresponding to the username of the user that performed the registered action
 * @returns Nothing
 */
exports.addWidgetCrop = function (widgetCrop, username) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO WidgetCrops(username, imageUrl, widgetType, widgetId, textContent, selectIndex, selector, xpath, elementId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"
        db.run(sql, [username, widgetCrop.imageUrl, widgetCrop.widgetType, widgetCrop.widgetId, widgetCrop.textContent, widgetCrop.selectIndex, widgetCrop.selector, widgetCrop.xpath, widgetCrop.elementId], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

/**
 * Returns all crops that identify the actions made by a user during a session.
 * @param username A string corresponding to the username of the user that is ending a testing session and wishes to retrieve his/her widget crops to generate automated scripts
 * @returns An array containing all the crops corresponding to the actions made during a testing session
 */
exports.getWidgetCrops = function (username) {
    return new Promise((resolve, reject) => {
        //The event listener for clicking on a dropdown menu is called also when selecting a value, meaning that there's the chance to have a crop corresponding to a selection with null value.
        //All select-type element with no selection index are thus deleted from the table
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
                        //All the crops made during the session are deleted, resetting the state for future sessions
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

/**
 * Updates information about a previously added widget crop (i.e. text content of a form field, selection index of a dropdown menu)
 * @param username A string containing the username of the user that is updating a previous widget crop
 * @param widgetCrop An object containing the new information to be added to the widget crop
 * @returns Nothing
 */
exports.updateWidgetCrop = function (username, widgetCrop) {
    return new Promise((resolve, reject) => {
        if (widgetCrop.lastInput) {
            //When a form field is the last one of its form it must be marked as last so that script can correctly use it to submit the form
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
            //In case there's an update and there's no selection index then the crops corresponds to a form field; its text content is correctly updated
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
            //If none of the previous cases apply then the crop to update corresponds to a dropdown menu whose selection index has been chosen by the user
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

exports.addIssueCrop = function (issueCrop, username) {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO IssueCrops(username, imageUrl, issueText, widgetType, widgetId) VALUES(?, ?, ?, ?, ?)"
        db.run(sql, [username, issueCrop.imageUrl, issueCrop.issueText, issueCrop.widgetType, issueCrop.widgetId], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getIssueCrops = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM IssueCrops WHERE username = ? ORDER BY id"
        db.all(sql, [username], (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                //All the crops made during the session are deleted, resetting the state for future sessions
                const sqlDel = "DELETE FROM IssueCrops WHERE username = ?"
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
    })
}

exports.deleteIssueCrop = function (username, issueCrop) {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM IssueCrops WHERE username = ? AND widgetId = ? AND widgetType = ?"
        db.run(sql, [username, issueCrop.widgetId, issueCrop.widgetType], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}