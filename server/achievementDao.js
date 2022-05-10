"use strict"

const db = require("./db.js")
const utilities = require("./utilities.js")

exports.getAchievements = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Achievements"
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

exports.getAchievementsProgress = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT idAch,COUNT(\*) as count FROM UserAchievements GROUP BY idAch ORDER BY count DESC"
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

exports.getAchievementsHints = function () {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM AchievementHints"
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