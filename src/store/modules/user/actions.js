import storage from 'good-storage'
import { UID_KEY } from '@/utils'
import { notify, isDef } from '@/utils'
import { getUserDetail, getUserPlaylist, userLogin, getCloudList, getLikeList, getDailySongs,
  userLogout, loginRefresh, loginStatus, setLikeSong } from "@/api"

export default {
  async login({ commit }, info) {
    const error = () => {
      notify.error('登录失败，请输入正确的信息。')
      return false
    }
    let {email, password, uid} = info

    if (!isDef(uid) || (isDef(email) && isDef(password))) {
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
    const { ids } = await getLikeList()
    commit('setLikeList', new Set(ids))
    const { recommend } = await getDailySongs()
    commit('setDailySongs', recommend)
    return true
  },
  async logout({ commit }) {
    await userLogout()
    commit('setUser', {})
    commit('setUserPlaylist', [])
    commit('setCloudList', new Set())
    commit('setLikeList', new Set())
    commit('setDailySongs', [])
    storage.set(UID_KEY, null)
    return true
  },
  refresh() {
    loginRefresh()
  },
  async likeSong({ commit }, info) {
    const { id, like } = info
    const { code } = await setLikeSong(id, like)
    if (code !== 200) {
      notify("Failed to change favor. Logged in?")
    } else {
      if (like) {
        commit('addToLikeList', id)
        notify.success("Liked")
      } else {
        commit('removeFromLikeList', id)
        notify.success("Ditched")
      }
    }
  }
}
