const baseURL = "http://localhost:3001/api"

async function getUsers() {
    let url = baseURL + "/users"

    const response = await fetch(url, { mode: 'cors' })
    const usersJson = await response.json();

    if (response.ok) {
        return usersJson
    } else {
        let err = { status: response.status, errObj: usersJson };
        throw err;
    }
}

async function getUserAchievements(username) {
    let url = baseURL + "/users/" + username + "/achievements"

    const response = await fetch(url, { mode: 'cors' })
    const achJson = await response.json()

    if (response.ok) {
        return achJson
    } else {
        let err = { status: response.status, errObj: achJson };
        throw err;
    }
}

async function getUserAvatars(username) {
    let url = baseURL + "/users/" + username + "/avatars"

    const response = await fetch(url, { mode: 'cors' })
    const avJson = await response.json()

    if (response.ok) {
        return avJson
    } else {
        let err = { status: response.status, errObj: avJson };
        throw err;
    }
}

async function getUserRecords(username) {
    let url = baseURL + "/users/" + username + "/records"

    const response = await fetch(url, { mode: 'cors' })
    const recJson = await response.json()

    if (response.ok) {
        return recJson
    } else {
        let err = { status: response.status, errObj: recJson };
        throw err;
    }
}

async function getHighestWidgetsRecords() {
    let url = baseURL + "/users/records/widgets"

    const response = await fetch(url, { mode: 'cors' })
    const recJson = await response.json()

    if (response.ok) {
        return recJson
    } else {
        let err = { status: response.status, errObj: recJson };
        throw err;
    }
}

async function getHighestPagesRecords() {
    let url = baseURL + "/users/records/pages"

    const response = await fetch(url, { mode: 'cors' })
    const recJson = await response.json()

    if (response.ok) {
        return recJson
    } else {
        let err = { status: response.status, errObj: recJson };
        throw err;
    }
}

async function getHighestCoverageRecords() {
    let url = baseURL + "/users/records/coverage"

    const response = await fetch(url, { mode: 'cors' })
    const recJson = await response.json()

    if (response.ok) {
        return recJson
    } else {
        let err = { status: response.status, errObj: recJson };
        throw err;
    }
}

async function getAchievements() {
    let url = baseURL + "/achievements"

    const response = await fetch(url, { mode: 'cors' })
    const achJson = await response.json()

    if (response.ok) {
        return achJson
    } else {
        let err = { status: response.status, errObj: achJson };
        throw err;
    }
}

async function getAchievementsProgress() {
    let url = baseURL + "/achievements/progress"

    const response = await fetch(url, { mode: 'cors' })
    const achJson = await response.json()

    if (response.ok) {
        return achJson
    } else {
        let err = { status: response.status, errObj: achJson };
        throw err;
    }
}

async function getAvatars() {
    let url = baseURL + "/avatars"

    const response = await fetch(url, { mode: 'cors' })
    const avJson = await response.json()

    if (response.ok) {
        return avJson
    } else {
        let err = { status: response.status, errObj: avJson };
        throw err;
    }
}

async function getAvatarsProgress() {
    let url = baseURL + "/avatars/progress"

    const response = await fetch(url, { mode: 'cors' })
    const avJson = await response.json()

    if (response.ok) {
        return avJson
    } else {
        let err = { status: response.status, errObj: avJson };
        throw err;
    }
}

const API = {
    getUsers,
    getUserAchievements,
    getUserAvatars,
    getUserRecords,
    getHighestWidgetsRecords,
    getHighestPagesRecords,
    getHighestCoverageRecords,
    getAchievements,
    getAchievementsProgress,
    getAvatars,
    getAvatarsProgress
}

export default API