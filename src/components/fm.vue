<template>
  <div class="fm">
    <div class="content">
      <div class="song">
        <div class="left">
          <img class="play-bar-support" src="@/assets/image/play-bar-support.png" />
          <img :class="{playing}" class="play-bar" src="@/assets/image/play-bar.png" />
          <div class="img-outer-border" ref="disc">
            <div :class="{paused: !playing}" class="img-outer" ref="discRotate">
              <div class="img-wrap">
                <img v-lazy="$utils.genImgUrl(currentSong.img, 400)" />
              </div>
            </div>
          </div>
          <div class="controls">
            <el-button @click="newFMSong" circle type="primary" style="font-size: 22px;">➤</el-button>
          </div>
        </div>

        <div class="right">
          <div class="name-wrap">
            <p class="name">{{currentSong.name}}</p>
            <span @click="onGoMv" class="mv-tag" v-if="currentSong.mvId">MV</span>
          </div>
          <div class="desc">
            <div class="desc-item">
              <span class="label">歌手：</span>
              <div class="value">{{currentSong.artistsText}}</div>
            </div>
          </div>
          <empty v-if="nolyric">还没有歌词哦~</empty>
          <Scroller
            :data="lyric"
            :options="{disableTouch: true}"
            @init="onInitScroller"
            class="lyric-wrap"
            ref="scroller"
            v-else
          >
            <div>
              <div
                :class="getActiveCls(index)"
                :key="index"
                class="lyric-item"
                ref="lyric"
                v-for="(l,index) in lyricWithTranslation"
              >
                <p
                  :key="contentIndex"
                  class="lyric-text"
                  v-for="(content, contentIndex) in l.contents"
                >{{content}}</p>
              </div>
            </div>
          </Scroller>
        </div>
      </div>
      <div class="bottom">
        <div class="left">
          <Comments :id="currentSong.id" ref="comments" v-if="currentSong.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLyric } from "@/api"
import lyricParser from "@/utils/lrcparse"
import { debounce, isDef, createSong, goMvWithCheck } from "@/utils"
import Comments from "@/components/comments"
import control from "@/utils/control"
import { mapState, mapMutations, mapActions } from "@/store/helper/music"

const WHEEL_TYPE = "wheel"
const SCROLL_TYPE = "scroll"
// 恢复自动滚动的定时器时间
const AUTO_SCROLL_RECOVER_TIME = 1000
export default {
  created() {
    this.lyricScrolling = {
      [WHEEL_TYPE]: false,
      [SCROLL_TYPE]: false
    }
    this.lyricTimer = {
      [WHEEL_TYPE]: null,
      [SCROLL_TYPE]: null
    }
    this.$nextTick(() => {
      this.scrollToActiveLyric()
    })
    control.$on("nextFM", this.newFMSong)
  },
  data() {
    return {
      lyric: [],
      tlyric: [],
      nolyric: false
    }
  },
  mounted() {
    if (!this.isFMMode) {
      this.newFMSong()
    } else {
      this.updateLyric()
    }
  },
  methods: {
    nomalizeSong(song) {
      const {
        id,
        name,
        mvid,
        artists,
        album: { blurPicUrl },
        duration
      } = song
      return createSong({
        id,
        name,
        img: blurPicUrl,
        artists,
        duration,
        mvId: mvid
      })
    },
    newFMSong() {
      this.getFMSongs().then(songs => {
        const normSong = this.nomalizeSong(songs.data[0])
        this.startSong({'song': normSong, 'fmMode': true})
        this.setPlaylist([normSong])
        this.setPlaylistPromptShow(false)
      })
    },
    async updateSong() {
      this.updateLyric()
    },
    async updateLyric() {
      const result = await getLyric(this.currentSong.id)
      this.nolyric = !isDef(result.lrc) || !result.lrc.lyric
      if (!this.nolyric) {
        const { lyric, tlyric } = lyricParser(result)
        this.lyric = lyric
        this.tlyric = tlyric
      }
    },
    getActiveCls(index) {
      return this.activeLyricIndex === index ? "active" : ""
    },
    getDiscRotateCls() {
      return this.playing ? "rotate" : "pause"
    },
    onInitScroller(scoller) {
      const onScrollStart = type => {
        this.clearTimer(type)
        this.lyricScrolling[type] = true
      }
      const onScrollEnd = type => {
        // 滚动结束后两秒 歌词开始自动滚动
        this.clearTimer(type)
        this.lyricTimer[type] = setTimeout(() => {
          this.lyricScrolling[type] = false
        }, AUTO_SCROLL_RECOVER_TIME)
      }
      scoller.on("scrollStart", onScrollStart.bind(null, SCROLL_TYPE))
      scoller.on("mousewheelStart", onScrollStart.bind(null, WHEEL_TYPE))

      scoller.on("scrollEnd", onScrollEnd.bind(null, SCROLL_TYPE))
      scoller.on("mousewheelEnd", onScrollEnd.bind(null, WHEEL_TYPE))
    },
    scrollToActiveLyric() {
      if (this.activeLyricIndex !== -1) {
        const { scroller, lyric } = this.$refs
        if (lyric && lyric[this.activeLyricIndex]) {
          scroller
            .getScroller()
            .scrollToElement(lyric[this.activeLyricIndex], 200, 0, true)
        }
      }
    },
    clearTimer(type) {
      this.lyricTimer[type] && clearTimeout(this.lyricTimer[type])
    },
    onClickPlaylist(id) {
      // 点击的歌单和当前打开的个单页是同一个 直接关闭player
      if (id === Number(this.$route.params.id)) {
        this.setPlayerShow(false)
      } else {
        this.$router.push(`/playlist/${id}`)
      }
    },
    onClickSong(song) {
      this.startSong(song)
      this.addToPlaylist(song)
    },
    onGoMv() {
      this.setPlayerShow(false)
      goMvWithCheck(this.currentSong.mvId)
    },
    resizeScroller: debounce(function() {
      this.$refs.scroller.getScroller().refresh()
    }, 500),
    addResizeListener() {
      window.addEventListener("resize", this.resizeScroller)
    },
    removeResizeListener() {
      window.removeEventListener("resize", this.resizeScroller)
    },
    ...mapMutations(["setPlayerShow", "setPlaylist", "setPlaylistPromptShow", "setFMMode"]),
    ...mapActions(["startSong", "addToPlaylist", "getFMSongs"])
  },
  computed: {
    activeLyricIndex() {
      return this.lyricWithTranslation
        ? this.lyricWithTranslation.findIndex((l, index) => {
            const nextLyric = this.lyricWithTranslation[index + 1]
            return (
              this.currentTime >= l.time &&
              (nextLyric ? this.currentTime < nextLyric.time : true)
            )
          })
        : -1
    },
    lyricWithTranslation() {
      let ret = []
      // 空内容的去除
      const lyricFiltered = this.lyric.filter(({ content }) => Boolean(content))
      // content统一转换数组形式
      if (lyricFiltered.length) {
        lyricFiltered.forEach(l => {
          const { time, content } = l
          const lyricItem = { time, content, contents: [content] }
          const sameTimeTLyric = this.tlyric.find(
            ({ time: tLyricTime }) => tLyricTime === time
          )
          if (sameTimeTLyric) {
            const { content: tLyricContent } = sameTimeTLyric
            if (content) {
              lyricItem.contents.push(tLyricContent)
            }
          }
          ret.push(lyricItem)
        })
      } else {
        ret = lyricFiltered.map(({ time, content }) => ({
          time,
          content,
          contents: [content]
        }))
      }
      return ret
    },
    ...mapState(["currentSong", "currentTime", "playing", "isPlayerShow", "isFMMode"])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id) {
        this.setPlayerShow(false)
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      // 如果歌曲详情显示状态切歌 需要拉取歌曲相关信息
      if (this.isPlayerShow) {
        this.updateSong()
      } else {
        // 否则只是更新歌词
        this.updateLyric()
      }
    },
    activeLyricIndex(newIndex, oldIndex) {
      if (
        newIndex !== oldIndex &&
        !this.lyricScrolling[WHEEL_TYPE] &&
        !this.lyricScrolling[SCROLL_TYPE]
      ) {
        this.scrollToActiveLyric()
      }
    },
    $route() {
      this.setPlayerShow(false)
    }
  },
  components: {
    Comments
  }
}
</script>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(1turn);
  }
}

$img-left-padding: 36px;
$img-outer-border-d: 320px;
$img-outer-d: 300px;

.fm {
  position: fixed;
  top: $header-height;
  bottom: $mini-player-height;
  left: 300px;
  right: 0;
  padding-right: 236px;
  padding-left: 136px;
  z-index: $song-detail-z-index;
  overflow: hidden;
  overflow-y: auto;
  transition: transform 0.5s;

  &.hide {
    transform: translateY(105%);
  }

  &.show {
    transform: none;
  }

  .content {
    max-width: 100vw;
    margin: auto;

    .song {
      display: flex;

      .left {
        position: relative;
        padding: 80px 70px 0 $img-left-padding;
        display: flex;
        justify-content: center;

        $support-d: 30px;
        $support-d-half: $support-d / 2;
        .play-bar-support {
          position: absolute;
          left: $img-left-padding + $img-outer-border-d / 2 - $support-d / 2;
          top: -$support-d-half;
          width: $support-d;
          height: $support-d;
          z-index: 2;
        }

        .controls {
          position: absolute;
          bottom: 20px;
          z-index: 2;
        }

        .play-bar {
          $w: 100px;
          $h: 146px;
          position: absolute;
          top: 0;
          left: $img-left-padding + $img-outer-border-d / 2 - 6px;
          width: $w;
          height: $h;
          z-index: 1;
          transform-origin: 0 0;
          transform: rotate(-30deg);
          transition: all 0.3s;

          &.playing {
            transform: rotate(5deg);
          }
        }

        .img-outer-border {
          @include round($img-outer-border-d);
          @include flex-center;
          background: var(--song-shallow-grey-bg);

          .img-outer {
            @include round($img-outer-d);
            @include flex-center;
            background: $black;
            background: linear-gradient(-45deg, #333540, #070708, #333540);
            animation: rotate 20s linear infinite;

            &.paused {
              animation-play-state: paused;
            }

            .img-wrap {
              @include img-wrap(200px);

              img {
                border-radius: 50%;
              }
            }
          }
        }
      }

      .right {
        flex: 1;
        padding-top: 45px;
        .name-wrap {
          display: flex;
          align-items: center;
          margin-bottom: 16px;

          .name {
            font-size: $font-size-title-lg;
            color: var(--font-color-white);
          }

          .mv-tag {
            display: inline-block;
            margin-left: 8px;
            padding: 2px;
            border: 1px solid currentColor;
            border-radius: 2px;
            color: $theme-color;
            cursor: pointer;
          }
        }

        .artists {
          margin-bottom: 16px;
        }

        .desc {
          display: flex;
          font-size: $font-size-sm;
          margin-bottom: 30px;

          .desc-item {
            display: flex;
            margin-right: 32px;
            .label {
              display: inline-block;
              margin-right: 4px;
            }

            .value {
              color: $blue;
            }
          }
        }

        .empty {
          height: 280px;
        }
        .lyric-wrap {
          width: 380px;
          height: 350px;
          mask-image: linear-gradient(
            180deg,
            hsla(0, 0%, 100%, 0) 0,
            hsla(0, 0%, 100%, 0.3) 1%,
            #fff 25%,
            #fff 75%,
            hsla(0, 0%, 100%, 0.3) 99%,
            hsla(0, 0%, 100%, 0)
          );

          .lyric-item {
            margin-bottom: 16px;
            font-size: $font-size-sm;

            &.active {
              font-size: $font-size;
              color: var(--font-color-white);
              font-weight: $font-weight-bold;
            }

            .lyric-text {
              margin-bottom: 8px;
            }
          }
        }
      }
    }

    .bottom {
      display: flex;
      margin-top: 48px;
      margin-bottom: 36px;

      .left {
        flex: 1;
      }

      .right {
        padding-left: 36px;
        width: 28%;
        overflow: hidden;

        .title {
          font-size: $font-size-lg;
          font-weight: $font-weight-bold;
          margin-bottom: 12px;
        }

        .desc {
          display: flex;
          align-items: center;

          .count {
            margin-left: 4px;
          }
        }
      }
    }
  }
}
</style>