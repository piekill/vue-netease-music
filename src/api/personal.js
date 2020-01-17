import { request, requestWithoutLoading } from '@/utils'

export const getFM = () => request.get('/personal_fm', {withCredentials: true, params: {timestamp: Date.now()}})

export const getDailySongs = () => requestWithoutLoading.get('/recommend/songs', {withCredentials: true})