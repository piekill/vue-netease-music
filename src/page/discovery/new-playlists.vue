<template>
  <div
    class="recommend"
    v-if="list.length"
  >
    <Title>推荐歌单</Title>
    <div class="list-wrap">
      <PlaylistCard
        :desc="item.copywriter"
        :id="item.id"
        :img="item.picUrl"
        :key="item.id"
        :name="item.name"
        v-for="item in list"
      />
    </div>
  </div>
</template>

<script>
import PlaylistCard from "@/components/playlist-card"
import { getPersonalized } from "@/api"
import control from "../../utils/control"
import {
  mapState as mapUserState
} from "@/store/helper/user"

export default {
  async created() {
    const { result } = await getPersonalized({ limit: 10 })
    this.list = result
    control.$on("loggedIn", this.updateList)
    this.updateList()
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    updateList() {
      if (this.dailySongs.length > 0 && this.list[0].id !== 0) {
        this.list.unshift({
          copywriter: "根据你的口味生成，每天6:00更新",
          id: 0,
          key: 0,
          name: "每日推荐歌曲",
        })
        this.list.pop()
      }
    }
  },
  computed: {
    ...mapUserState(["dailySongs"])
  },
  components: { PlaylistCard }
}
</script>

<style lang="scss" scoped>
.list-wrap {
  margin: 0 -4px;
  display: flex;
  flex-wrap: wrap;
}
</style>