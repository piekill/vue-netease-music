import { request } from '@/utils'

export const getFM = () => request.get('/personal_fm', {withCredentials: true, params: {timestamp: Date.now()}})
