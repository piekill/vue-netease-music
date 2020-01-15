import { requestWithoutLoading } from '@/utils'

export const getUserDetail = (uid) => requestWithoutLoading.get("/user/detail", { params: { uid } })

const PLAYLIST_LIMIT = 1000
export const getUserPlaylist = (uid) => requestWithoutLoading.get("/user/playlist", { params: { uid, limit: PLAYLIST_LIMIT } })

export const getCloudList = () => requestWithoutLoading.get("/user/cloud", {params: {limit: PLAYLIST_LIMIT}, withCredentials: true})

export const userLogin = (email, password) => requestWithoutLoading.get("/login", {params: {email: email, password: password}, withCredentials: true})

export const userLogout = () => requestWithoutLoading.get("/logout", {withCredentials: true})

export const loginRefresh = () => requestWithoutLoading.get("/login/refresh", {withCredentials: true})

export const loginStatus = () => requestWithoutLoading.get("/login/status", {withCredentials: true})