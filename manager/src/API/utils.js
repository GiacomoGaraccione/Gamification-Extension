import images from '../img/images';

function matchAvatar(path) {
    let ret
    switch (path) {
        case "../img/crown_avatar.png":
            ret = images.CrownAvatar
            break
        case "../img/default_blue.png":
            ret = images.BlueAvatar
            break
        case "../img/default_green.png":
            ret = images.GreenAvatar
            break
        case "../img/default_no_cap.png":
            ret = images.NoCapAvatar
            break
        case "../img/default_red.png":
            ret = images.RedAvatar
            break
        case "../img/heart_avatar.png":
            ret = images.HeartAvatar
            break
        case "../img/medal_avatar_bronze.png":
            ret = images.BronzeAvatar
            break
        case "../img/medal_avatar_silver.png":
            ret = images.SilverAvatar
            break
        case "../img/medal_avatar_gold.png":
            ret = images.GoldAvatar
            break
        case "../img/star_avatar.png":
            ret = images.StarAvatar
            break
        case "../img/wizard_avatar.png":
            ret = images.WizardAvatar
            break
        default:
            ret = ""
    }
    return (ret)
}

function matchAchievement(path) {
    let ret
    switch (path) {
        case "../img/achievement_bronze.png":
            ret = images.AchievementBronze
            break
        case "../img/achievement_silver.png":
            ret = images.AchievementSilver
            break
        case "../img/achievement_gold.png":
            ret = images.AchievementGold
            break
        default:
            ret = ""
    }
    return ret
}

const utils = {
    matchAvatar,
    matchAchievement
}

export default utils