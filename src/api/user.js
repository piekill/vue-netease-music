import { requestWithoutLoading } from '@/utils'
const crypto = require('crypto')

export const getUserDetail = (uid) => requestWithoutLoading.get("/user/detail", { params: { uid } })

const PLAYLIST_LIMIT = 3000
export const getUserPlaylist = (uid) => requestWithoutLoading.get("/user/playlist", { params: { uid, limit: PLAYLIST_LIMIT } })

export const getCloudList = () => requestWithoutLoading.get("/user/cloud", {params: {limit: PLAYLIST_LIMIT}, withCredentials: true})

export const userLogin = (email, password) => {
    const pwd = crypto.createHash('md5').update(password).digest('hex')
    return requestWithoutLoading.get("/login", {params: {email: email, md5_password: pwd}, withCredentials: true})
}

export const userLogout = () => requestWithoutLoading.get("/logout", {withCredentials: true, params: {timestamp: Date.now()}})

export const loginRefresh = () => requestWithoutLoading.get("/login/refresh", {withCredentials: true})

export const loginStatus = () => requestWithoutLoading.get("/login/status", {withCredentials: true, params: {timestamp: Date.now()}})

export const getLikeList = (uid) => requestWithoutLoading.get("/likelist", {params: { uid }, withCredentials: true})

export const setLikeSong = (id, like) => requestWithoutLoading.get("/like", {params: { id, like }, withCredentials: true})

export const userLoginPhone = (phone, countrycode, password) => {
    const pwd = crypto.createHash('md5').update(password).digest('hex')
    return requestWithoutLoading.get("/login/cellphone", {params: {phone: phone, countrycode: countrycode, md5_password: pwd,}, withCredentials: true})
}
