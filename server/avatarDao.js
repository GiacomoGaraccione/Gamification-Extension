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

exports.getAvatarsHints = function (username) {
    return new Promise((resolve, reject) => {
        const sqlAll = "SELECT * FROM AvatarParams ORDER BY paramType"
        //const sql = "SELECT * FROM AvatarHints"
        db.all(sqlAll, [], (errAll, rowsAll) => {
            if (errAll) {
                utilities.errorObjs.dbError.errorMessage = "errno: " + errAll.errno + " - code: " + errAll.code
                reject(utilities.errorObjs.dbError)
            } else {
                const sql = "SELECT * FROM UserAvatarParams WHERE username = ?"
                db.all(sql, [username], (err, rows) => {
                    if (err) {
                        utilities.errorObjs.dbError.errorMessage = "errno: " + err.errno + " - code: " + err.code
                        reject(utilities.errorObjs.dbError)
                    } else {
                        let missing = []
                        for (let row of rowsAll) {
                            function filterParam(event) {
                                return event.name === row.name && event.paramType === row.paramType
                            }
                            if (rows.filter(filterParam).length === 0) {
                                missing.push(row)
                            }
                        }
                        let params = {
                            accessoriesType: [],
                            clotheColor: [],
                            clotheType: [],
                            eyeType: [],
                            eyebrowType: [],
                            facialHairType: [],
                            graphicType: [],
                            hairColor: [],
                            hatColor: [],
                            mouthType: [],
                            skinColor: [],
                            topType: [],
                            facialHairColor: []
                        }
                        for (let row of missing) {
                            params[row.paramType].push({ name: row.name, hint: row.hint })
                        }
                        resolve(params)
                    }
                })
            }
        })
    })
}