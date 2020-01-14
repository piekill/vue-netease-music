<template>
  <div class="user">
    <!-- 登录前 -->
    <div @click="onOpenModal" class="login-trigger" v-if="!isLogin">
      <i class="user-icon iconfont icon-yonghu" />
      <p class="user-name">未登录</p>
    </div>
    <!-- 登录后 -->
    <div @click="onLogout" class="logined-user" v-else>
      <img v-lazy="$utils.genImgUrl(user.avatarUrl, 80)" class="avatar" />
      <p class="user-name">{{ user.nickname }}</p>
    </div>

    <!-- 登录框 -->
    <el-dialog
      :modal="false"
      :visible.sync="visible"
      :width="$utils.toRem(320)"
    >
      <p slot="title">登录</p>
      <div class="login-body">
        <el-input
          class="input"
          placeholder="请输入网易云邮箱账号"
          v-model="email"
          type="email"
        />
        <el-input
          class="input"
          placeholder="请输入密码"
          v-model="password"
          type="password"
        />
      </div>
      <span class="dialog-footer" slot="footer">
        <el-button
          :loading="loading"
          @click="onLogin(email, password, uid)"
          class="login-btn"
          type="primary"
          >登 录</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import storage from "good-storage"
import { UID_KEY, isDef } from "@/utils"
import { confirm } from "@/base/confirm"
import {
  mapActions as mapUserActions,
  mapState as mapUserState,
  mapGetters as mapUserGetters
} from "@/store/helper/user"
import router from '@/router.js'

export default {
  // 自动登录
  created() {
    this.uid = storage.get(UID_KEY)
    if (isDef(this.uid)) {
      this.onLogin(null, null, this.uid)
      this.refresh()
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      uid: null,
      email: "",
      password: ""
    }
  },
  methods: {
    onOpenModal() {
      this.visible = true
    },
    onCloseModal() {
      this.visible = false
    },
    async onLogin(email, password, uid) {
      this.loading = true
      const success = await this.login({email, password, uid}).finally(() => {
        this.loading = false
      })
      if (success) {
        this.onCloseModal()
      }
    },
    onLogout() {
      confirm("确定要注销吗？", () => {
        this.logout()
        router.push('/')
      })
    },
    ...mapUserActions(["login", "logout", "refresh", "checkStatus"])
  },
  computed: {
    ...mapUserState(["user"]),
    ...mapUserGetters(["isLogin"])
  },
  components: {}
}
</script>

<style lang="scss" scoped>
.user {
  padding: 16px;
  padding-bottom: 0;
  margin-bottom: 12px;

  .login-trigger {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .user-icon {
    font-size: 24px;
  }

  .user-name {
    margin-left: 8px;
  }

  .logout {
    transform: translateY(1px);
    margin-left: 8px;
    color: var(--font-color-shallow-grey);
  }

  .login-body {
    .input {
      margin-bottom: 16px;
    }

    .login-help {
      .help {
        margin-bottom: 4px;
      }
    }
  }

  .login-btn {
    width: 100%;
    padding: 8px 0;
  }

  .logined-user {
    display: flex;
    align-items: center;
    cursor: pointer;

    .avatar {
      @include round(40px);
    }
  }
}
</style>
