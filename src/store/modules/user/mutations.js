export default {
  setUser(state, user) {
    state.user = user
  },
  setUserPlaylist(state, playlist) {
    state.userPlaylist = playlist
  },
  setCloudList(state, cloudList) {
    state.cloudList = cloudList
  },
  setLikeList(state, likeList) {
    state.likeList = likeList
  },
  addToLikeList(state, id) {
    state.likeList.add(id)
  },
  removeFromLikeList(state, id) {
    state.likeList.delete(id)
  },
  setDailySongs(state, recommend) {
    state.dailySongs = recommend
  }
}
