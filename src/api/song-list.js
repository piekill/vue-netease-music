import { request } from '@/utils'

export const getListDetail = params =>
  request.get('/playlist/detail', {params: {...params, ...{timestamp: Date.now()}}, withCredentials: true})
