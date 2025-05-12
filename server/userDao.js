"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")
const bcrypt = require("bcrypt")

const defaultParams = [
    { name: "NoHair", paramType: "topType" },
    { name: "LongHairStraight", paramType: "topType" },
    { name: "LongHairBigHair", paramType: "topType" },
    { name: "ShortHairShortFlat", paramType: "topType" },
    { name: "ShortHairTheCaesar", paramType: "topType" },
    { name: "Brown", paramType: "hairColor" },
    { name: "Blonde", paramType: "hairColor" },
    { name: "Auburn", paramType: "hairColor" },
    { name: "Black", paramType: "hairColor" },
    { name: "Blue01", paramType: "clotheColor" },
    { name: "PastelGreen", paramType: "clotheColor" },
    { name: "Red", paramType: "clotheColor" },
    { name: "Light", paramType: "skinColor" },
    { name: "Brown", paramType: "skinColor" },
    { name: "Black", paramType: "skinColor" },
    { name: "Yellow", paramType: "skinColor" }
]
/**
 * Adds a new user to the database.
 * Creates entries specifying the user has the three default avatars and no records yet.
 * @param user An object containing information about the new user
 * @returns Nothing
 */
exports.addUser = function (user) {
    return new Promise((resolve, reject) => {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);
        const sql = "INSERT INTO Users(username, email, password, salt) VALUES(?, ?, ?, ?)"
        db.run(sql, [user.username, user.email, hash, salt], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                let sqlAv = "INSERT INTO UserAvatarParams(username, name, paramType) VALUES (?, ?, ?), "
                for (let i = 0; i < defaultParams.length - 2; i++) {
                    sqlAv += "(?, ?, ?), "
                }
                sqlAv += "(?, ?, ?)"
                const params = []
                defaultParams.map((p) => {
                    params.push(user.username)
                    params.push(p.name)
                    params.push(p.paramType)
                })
                db.run(sqlAv, params, (err, row) => {
                    if (err) {
                        utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                        reject(utilities.errorObjs.dbError)
                    } else {
                        const sqlRec = "INSERT INTO Records(username, highestNewVisitedPages, highestNewWidgets, highestCoverage) VALUES(?, ?, ?, ?)"
                        db.run(sqlRec, [user.username, 0, 0, 0], (err, row) => {
                            if (err) {
                                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                                reject(utilities.errorObjs.dbError)
                            } else {
                                const sqlCur = "INSERT INTO UserCurrentAvatar(username, topType, hairColor, clotheColor, skinColor) VALUES(?, ?, ?, ?, ?)"
                                db.run(sqlCur, [user.username, user.avatarParams.topType, user.avatarParams.hairColor, user.avatarParams.clotheColor, user.avatarParams.skinColor], (errCur, rowCur) => {
                                    if (errCur) {
                                        utilities.errorObjs.dbError.errorMessage = "errno: " + errCur.errno + " - code: " + errCur.code
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
        })
    })
}

exports.getUsers = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT username, selectedAvatar, email FROM Users"
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

exports.getUser = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Users WHERE username = ?"
        db.get(sql, [username], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                if (row) {
                    resolve(row)
                } else {
                    resolve(undefined)
                }
            }
        })
    })
}

exports.updateUser = function (user) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE Users SET selectedAvatar = ? WHERE username = ?"
        db.run(sql, [user.selectedAvatar, user.username], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}

exports.getUserAvatars = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM UserAvatarParams WHERE username = ? ORDER BY paramType"
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

exports.updateAvatarParameter = function (username, param, name) {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE UserCurrentAvatar SET " + param + " = ? WHERE username = ?"
        db.run(sql, [name, username], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve()
            }
        })
    })
}


exports.getUserAchievements = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT UserAchievements.idAch, text, path FROM Achievements, UserAchievements WHERE Achievements.idAch = UserAchievements.idAch AND UserAchievements.username = ?"
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

exports.updateUserRecords = function (record) {
    return new Promise((resolve, reject) => {
        const sqlGet = "SELECT * FROM Records WHERE username = ?"
        db.get(sqlGet, [record.username], (errGet, rowGet) => {
            if (errGet) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errGet.errno + " - code: " + errGet.code
                reject(utilities.errorObjs.dbError)
            } else {
                let highestNewVisitedPages = record.highestNewVisitedPages > rowGet.highestNewVisitedPages ? record.highestNewVisitedPages : rowGet.highestNewVisitedPages
                let highestNewWidgets = record.highestNewWidgets > rowGet.highestNewWidgets ? record.highestNewWidgets : rowGet.highestNewWidgets
                let highestCoverage = record.highestCoverage > rowGet.highestCoverage ? record.highestCoverage : rowGet.highestCoverage

                const sql = "UPDATE Records SET highestNewVisitedPages = ?, highestNewWidgets = ?, highestCoverage = ? WHERE username = ?"
                db.run(sql, [highestNewVisitedPages, highestNewWidgets, highestCoverage, record.username], (err, row) => {
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

exports.getUserRecords = function (username) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Records WHERE username = ?"
        db.get(sql, [username], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(row)
            }
        })
    })
}

exports.getRecords = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Records, UserCurrentAvatar WHERE UserCurrentAvatar.username = Records.username"
        db.all(sql, (err, rows) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                resolve(rows)
            }
        })
    })
}

exports.addAvatar = function (username, name) {
    return new Promise((resolve, reject) => {
        const sqlId = "SELECT idAv FROM Avatars WHERE name = ?"
        db.get(sqlId, [name], (errId, rowId) => {
            if (errId) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errId.errno + " - code: " + errId.code
                reject(utilities.errorObjs.dbError)
            } else {
                const sql = "INSERT INTO UserAvatars(username, idAv) VALUES(?, ?)"
                db.run(sql, [username, rowId.idAv], (err, row) => {
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
    })
}

exports.addAchievement = function (username, text) {
    return new Promise((resolve, reject) => {
        const sqlId = "SELECT idAch FROM Achievements WHERE text = ?"
        db.get(sqlId, [text], (errId, rowId) => {
            if (errId) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errId.errno + " - code: " + errId.code
                reject(utilities.errorObjs.dbError)
            } else {
                const sql = "INSERT INTO UserAchievements(idAch, username) VALUES(?, ?)"
                db.run(sql, [rowId.idAch, username], (err, row) => {
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

exports.checkPassword = function (username, password) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Users WHERE username = ?"
        db.get(sql, [username], (err, row) => {
            if (err) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                reject(utilities.errorObjs.dbError)
            } else {
                const hash = bcrypt.hashSync(password, row.salt)
                if (hash !== row.password) {
                    reject(utilities.errorObjs.credentialsError)
                } else {
                    resolve({ username: row.username, selectedAvatar: row.selectedAvatar })
                }
            }
        })
    })
}

exports.getUserIssues = function (username) {
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