<script>
import ElTable from "element-ui/lib/table"
import { mapMutations, mapActions, mapState } from "@/store/helper/music"
import { pad, goMvWithCheck, isDef } from "@/utils"
import {
    mapActions as mapUserActions,
    mapState as mapUserState
} from "@/store/helper/user"
import control from "@/utils/control"

export default {
  props: {
    hideColumns: {
      type: Array,
      default: () => [],
    },
    songs: {
      type: Array,
      default: () => [],
    },
    highlightText: {
      type: String,
      default: "",
    },
    // 名字下面渲染的额外内容
    renderNameDesc: {
      type: Function,
    },
  },
    created() {
        control.$on("setListFavor", this.setFavor)
    },
    data() {
    const commonHighLightSlotScopes = {
      default: scope => {
        const text = scope.row[scope.column.property]
        return (
          <HighlightText
            class="song-table-name"
            text={text}
            highlightText={this.highlightText}
          />
        )
      },
    }
    return {
      columns: [
        {
          prop: "index",
          label: "",
          width: "70",
          scopedSlots: {
            default: scope => {
              return (
                <div class="index-wrap">
                  {this.isActiveSong(scope.row) ? (
                    <Icon class="horn" type="horn" color="theme" />
                  ) : (
                    // 补上左边的0
                    <span>{pad(scope.$index + 1)}</span>
                  )}
                </div>
              )
            },
          },
        },
          {
              prop: "favorite",
              label: "",
              width: "60",
              scopedSlots: {
                  default: scope => {
                      return (
                          <el-button type="text" class="favor-wrap"
                            vOn:click_stop_prevent={this.changeFavor.bind(this, scope.row)}>
                                {scope.row.favorite  ? '♥' : '♡'}
                            </el-button>
                  )},
              },
          },
        {
          prop: "img",
          label: " ",
          width: "100",
          scopedSlots: {
            default: scope => {
              return (
                <div class="img-wrap">
                  <img v-lazy={this.$utils.genImgUrl(scope.row.img, 120)} />
                  <PlayIcon class="play-icon" />
                </div>
              )
            },
          },
        },
        {
          prop: "name",
          label: "音乐标题",
          className: "title-td",
          scopedSlots: {
            default: scope => {
              const {
                row: { mvId },
              } = scope

              const onGoMv = async e => {
                e.stopPropagation()
                goMvWithCheck(mvId)
              }

              return (
                <div>
                  <div class="song-table-name-cell">
                    {commonHighLightSlotScopes.default(scope)}

                    {mvId ? (
                      <Icon
                        class="mv-icon"
                        onClick={onGoMv}
                        type="mv"
                        color="theme"
                        size={18}
                      />
                    ) : null}
                  </div>

                  {this.renderNameDesc ? this.renderNameDesc(scope) : null}
                </div>
              )
            },
          },
        },
        {
          prop: "artistsText",
          label: "歌手",
          scopedSlots: commonHighLightSlotScopes,
        },
        {
          prop: "albumName",
          label: "专辑",
          scopedSlots: commonHighLightSlotScopes,
        },
        {
          prop: "durationSecond",
          label: "时长",
          width: "100",
          scopedSlots: {
            default: scope => {
              return (
                <span>{this.$utils.formatTime(scope.row.durationSecond)}</span>
              )
            },
          },
        },
      ],
    }
  },
  methods: {
      changeFavor(song) {
          const favor = !song.favorite
          this.likeSong({id: song.id, like: favor}).then(() => {
              song.favorite = favor
              // TODO: find a better way than force udpate
              this.$forceUpdate()
              if (song.id === this.currentSong.id) {
                  control.$emit("setMiniFavor")
              }
          })
      },
      setFavor() {
          const favor = this.likeList.has(this.currentSong.id)
          const curSong = this.songs.filter(song => song.id === this.currentSong.id)[0]
          if (isDef(curSong)){
              curSong.favorite = favor
              this.$forceUpdate()
          }
      },
    onRowClick(song) {
      this.startSong(song)
      this.setPlaylist(this.songs)
    },
    isActiveSong(song) {
      return song.id === this.currentSong.id
    },
    tableCellClassName(args) {
      const { row, columnIndex } = args
      const cellClassNameProp = this.$attrs.cellClassName

      let retCls = []
      // 执行外部传入的方法
      if (cellClassNameProp) {
        const propRet = cellClassNameProp(args)
        if (propRet) {
          retCls.push(propRet)
        }
      }
      if (
        this.isActiveSong(row) &&
        columnIndex ===
          this.showColumns.findIndex(({ prop }) => prop === "name")
      ) {
        retCls.push("song-active")
      }
      return retCls.join(" ")
    },
    ...mapMutations(["setPlaylist"]),
    ...mapActions(["startSong"]),
    ...mapUserActions(["likeSong"])
  },
  computed: {
    showColumns() {
      const hideColumns = this.hideColumns.slice()
      const reference = this.songs[0]
      const { img } = reference
      if (!img) {
        hideColumns.push("img")
      }
      return this.columns.filter(column => {
        return !hideColumns.find(hideColumn => hideColumn === column.prop)
      })
    },
    ...mapState(["currentSong"]),
    ...mapUserState(["likeList"])
  },
  render() {
    const elTableProps = ElTable.props
    // 从$attrs里提取作为prop的值
    const { props, attrs } = genPropsAndAttrs(this.$attrs, elTableProps)
      const tableSongs = this.songs.map(song => {
          song.favorite = this.likeList.has(song.id)
          return song
      })
    const tableAttrs = {
      attrs,
      on: {
        ...this.$listeners,
        ["row-click"]: this.onRowClick,
      },
      props: {
        ...props,
        cellClassName: this.tableCellClassName,
        headerCellClassName: "title-th",
        data: tableSongs,
      },
      style: { width: "99.9%" },
    }
    return this.songs.length ? (
      <el-table class="song-table" {...tableAttrs}>
        {this.showColumns.map((column, index) => {
          const { scopedSlots, ...columnProps } = column
          return (
            <el-table-column
              key={index}
              props={columnProps}
              scopedSlots={scopedSlots}
            ></el-table-column>
          )
        })}
      </el-table>
    ) : null
  },
}

function genPropsAndAttrs(rawAttrs, componentProps) {
  const props = {}
  const attrs = {}
  Object.keys(rawAttrs).forEach(key => {
    const value = rawAttrs[key]
    if (componentProps.hasOwnProperty(key)) {
      props[key] = value
    } else {
      attrs[key] = value
    }
  })
  return { props, attrs }
}
</script>

<style lang="scss">
.song-table {
  .title-th {
    color: var(--font-color-grey2);
    font-weight: normal;
  }

  .title-td {
    color: var(--font-color-white);
  }

  .padding-space {
    padding-left: 24px;
  }

  .song-active {
    color: $theme-color;

    .high-light-text {
      color: $theme-color;
    }
  }

  .index-wrap {
    text-align: center;
    color: var(--font-color-grey-shallow);
  }

    .favor-wrap {
        font-size: 16px;
        color: $theme-color;
    }
  .img-wrap {
    position: relative;
    @include img-wrap(60px);

    img {
      border-radius: 4px;
    }
    .play-icon {
      @include abs-center;
    }
  }
  .high-light-text {
    color: $blue;
  }

  .song-table-name-cell {
    @include text-ellipsis;
    display: flex;
    align-items: center;
    flex: 0 0 24px;

    .song-table-name {
      overflow: hidden;
      @include text-ellipsis;
    }

    .mv-icon {
      width: 24px;
      margin-left: 4px;
    }
  }
}
</style>
