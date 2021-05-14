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
      @closed="clearInputs"
    >
      <p slot="title">登录</p>
      <div class="login-radio">
        <el-radio v-model="loginMode" label="email">邮箱</el-radio>
        <el-radio v-model="loginMode" label="phone">手机</el-radio>
      </div>
      <el-form class="login-body">
        <el-form-item>
          <el-input
            class="input"
            placeholder="请输入网易云邮箱账号"
            v-model="email"
            type="email"
            autocomplete="on"
            v-if="loginMode === 'email'"
          />
          <div v-if="loginMode === 'phone'">
            <el-select v-model="countrycode" class="country-code-wrap" filterable="true" default-first-option="true">
              <el-option v-for="item in countrycodes"
                         :key="item.value"
                         :label="item.value"
                         :value="item.value">
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">+{{ item.value }}</span>
              </el-option>
            </el-select>
            <el-input
              class="input phone-wrap"
              placeholder="请输入网易云注册手机"
              v-model="phone"
              type="tel"
              autocomplete="on"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-input
            class="input"
            placeholder="请输入密码"
            v-model="password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
                  :loading="loading"
                  @click="onLogin(uid, email, password, phone, countrycode, loginMode)"
                  class="login-btn"
                  type="primary"
          >登 录</el-button
          >
        </el-form-item>
      </el-form>
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
import control from "@/utils/control"
import { COUNTRY_CODES } from "@/utils/config"

export default {
  // 自动登录
  created() {
    this.uid = storage.get(UID_KEY)
    if (isDef(this.uid)) {
      this.onLogin(this.uid).then(success => {
        if (success) {
          this.refresh()
        }
      })

    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      uid: null,
      email: "",
      password: "",
      phone: "",
      countrycode: "86",
      loginMode: "email",
      countrycodes: COUNTRY_CODES
    }
  },
  methods: {
    onOpenModal() {
      this.visible = true
    },
    onCloseModal() {
      this.visible = false
      this.clearInputs()
    },
    clearInputs() {
      this.password = ""
    },
    async onLogin(uid, email, password, phone, countrycode, loginMode) {
      this.loading = true
      const success = await this.login({uid, email, password, phone, countrycode, loginMode}).finally(() => {
        this.loading = false
      })
      if (success) {
        this.onCloseModal()
        control.$emit("loggedIn")
      }
      return success
    },
    onLogout() {
      confirm("确定要注销吗？", () => {
        this.logout().finally(() => router.go(0))
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

  .login-radio {
    margin-bottom: 20px;
  }

  .country-code-wrap {
    width: 80px;
  }

  .phone-wrap {
    width: 195px;
    margin-left: 5px;
  }
}
</style>
