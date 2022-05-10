"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")

exports.getAvatars = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Avatars"
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

exports.getAvatarsProgress = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT idAv,COUNT(\*) as count FROM UserAvatars GROUP BY idAv ORDER BY count DESC"
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

exports.getAvatarsHints = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM AvatarHints"
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