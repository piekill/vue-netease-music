import storage from 'good-storage'
import { UID_KEY } from '@/utils'
import { notify, isDef } from '@/utils'
import { getUserDetail, getUserPlaylist, userLogin, getCloudList, userLogout, loginRefresh, loginStatus } from "@/api"

export default {
  async login({ commit }, info) {
    const error = () => {
      notify.error('登录失败，请输入正确的信息。')
      return false
    }
    let {email, password, uid} = info

    if (!isDef(uid)) {
      if (!isDef(email) || !isDef(password)) {
        return error()
      }
      try {
        const { profile } = await userLogin(email, password)
        uid = profile.userId
      } catch (e) {
        return error()
      }
    }
    try {
      const {code} = await loginStatus()
      if (code !== 200) {
        return false
      }
    } catch (e) {
      return false
    }
    const user = await getUserDetail(uid)
    const { profile } = user
    commit('setUser', profile)
    storage.set(UID_KEY, uid)
    const { playlist } = await getUserPlaylist(uid)
    commit('setUserPlaylist', playlist)
    const { data } = await getCloudList()
    commit('setCloudList', new Set(data.map(song => {
      return song.simpleSong.id
    })))
    return true
  },
  logout({ commit }) {
    userLogout().finally(() => {
      commit('setUser', {})
      commit('setUserPlaylist', [])
      commit('setCloudList', [])
      storage.set(UID_KEY, null)
    })
  },
  refresh() {
    loginRefresh()
  },
}
