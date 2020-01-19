<template>
  <div @click="onClickCard" class="playlist-card">
    <div class="img-wrap">
      <img v-lazy="$utils.genImgUrl(img, 300)" v-if="id !== 0"/>
      <!-- https://shkspr.mobi/blog/2018/02/this-svg-always-shows-todays-date/-->
      <svg v-else xmlns="http://www.w3.org/2000/svg"
           aria-label="Calendar" role="img"
           viewBox="0 0 512 512" height="300" width="300">
        <rect x="0" y="100" width="512" height="412" rx="15" fill="#e0e7ec"/>

        <path d="M484 0h-47c2 4 4 9 4 14a28 28 0 1 1-53-14H124c3 4 4 9 4 14A28 28 0 1 1 75 0H28C13 0 0 13 0 28v157h512V28c0-15-13-28-28-28z" fill="#dd2f45"/>

        <g fill="#f3aab9">
          <circle cx="470" cy="142" r="14"/>
          <circle cx="470" cy="100" r="14"/>
          <circle cx="427" cy="142" r="14"/>
          <circle cx="427" cy="100" r="14"/>
          <circle cx="384" cy="142" r="14"/>
          <circle cx="384" cy="100" r="14"/>
        </g>

        <text id="month"
              x="32"
              y="164"
              fill="#fff"
              font-family="monospace"
              font-size="140px"
              style="text-anchor: start">{{MMM}}</text>

        <text id="day"
              x="256"
              y="400"
              fill="#66757f"
              font-family="monospace"
              font-size="256px"
              style="text-anchor: middle">{{DD}}</text>

        <text id="weekday"
              x="256"
              y="480"
              fill="#66757f"
              font-family="monospace"
              font-size="64px"
              style="text-anchor: middle">{{DDD}}</text>
      </svg>
      <div class="desc-wrap" v-if="desc">
        <span class="desc">{{ desc }}</span>
      </div>
      <PlayIcon :size="36" class="play-icon" />
    </div>
    <p class="name">{{ name }}</p>
  </div>
</template>

<script>
export default {
  props: ["id", "img", "name", "desc"],
  methods: {
    onClickCard() {
      this.$router.push(`/playlist/${this.id}`)
    },
  },
  data() {
    return {
      DD: "",
      DDD: "",
      MMM: ""
    }
  },
  created() {
    if (this.id === 0) {
      let time = new Date();
      // daily recommendations are updated at 6am
      if (time.getHours() < 6) {
        time.setDate(time.getDate() - 1)
      }
      const locale = "en-us";
      this.DD = time.getDate();
      this.DDD = time.toLocaleString(locale, {weekday: "long"});
      this.MMM = time.toLocaleString(locale, {month: "short"}).toUpperCase();
    }
  }
}
</script>

<style lang="scss" scoped>
.playlist-card {
  position: relative;
  width: calc(20% - 8px);
  margin: 4px;
  margin-bottom: 32px;
  cursor: pointer;

  .img-wrap {
    position: relative;
    width: 100%;
    padding-top: 100%;
    margin-bottom: 8px;
    border-radius: 4px;
    overflow: hidden;

    img, svg {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }

    .desc-wrap {
      position: absolute;
      padding: 6px;
      left: 0;
      right: 0;
      top: 0;
      background-color: rgba(0, 0, 0, 0.4);
      transform: translateY(-100%);
      transition: all 0.3s;

      .desc {
        color: $white;
        font-size: $font-size-sm;
      }
    }

    .play-icon {
      opacity: 0;
      position: absolute;
      right: 4px;
      bottom: 4px;
      font-size: 24px;
      transition: all 0.3s;
      color: $white;
    }

    &:hover {
      .desc-wrap {
        transform: translateY(0);
      }

      .play-icon {
        opacity: 1;
      }
    }
  }

  .name {
    font-size: $font-size-sm;
    @include text-ellipsis();
  }
}
</style>
