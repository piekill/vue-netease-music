import storage from 'good-storage'
import { UID_KEY } from '@/utils'
import { notify, isDef } from '@/utils'
import { getUserDetail, getUserPlaylist, userLogin, userLoginPhone, getCloudList, getLikeList, getDailySongs,
  userLogout, loginRefresh, loginStatus, setLikeSong } from "@/api"

export default {
  async login({ commit }, info) {
    const error = () => {
      notify.error('登录失败，请输入正确的信息。')
      return false
    }
    let {uid, email, password, phone, countrycode, loginMode} = info

    if (!isDef(uid) || (loginMode === 'email' && isDef(email) && isDef(password))
        || (loginMode === 'phone' && isDef(phone) && isDef(password))) {
      if (loginMode === 'email' && (!isDef(email) || !isDef(password))) {
        return error()
      }
      if (loginMode === 'phone' && (!isDef(phone) || !isDef(password))) {
        return error()
      }
      try {
        const { profile } = loginMode === 'email' ? await userLogin(email, password) :
            await userLoginPhone(phone, countrycode, password)
        uid = profile.userId
      } catch (e) {
        return error()
      }
    }
    try {
      const {data} = await loginStatus()
      if (data.code !== 200) {
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
    const { code, data } = await getCloudList()
      if (code !== 200) {
          return false
      }
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
