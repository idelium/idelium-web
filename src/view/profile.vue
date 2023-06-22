<template>
  <div class="profile costum">
    <div style="text-align: center; font-size: 1rem">
      <font-awesome-icon icon="user-circle" style="margin-left: 5px; font-size: 10rem" /> <br />{{
        language[config.currentLanguage].Profile.title
      }}
    </div>
    <b-card tag="article" class="mb-2" style="margin-top: 10px">
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.name }}
        </div>
        <div class="col">
          {{ user.name }}
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.email }}
        </div>
        <div class="col">
          {{ user.email }}
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.company }}
        </div>
        <div class="col">
          {{ user.companyName }}
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.role }}
        </div>
        <div class="col">
          {{ user.roleName }}
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.password }}
        </div>
        <div class="col">
          <input type="password" class="form-control" v-model="password" />
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel">
          {{ language[config.currentLanguage].Profile.confirmPassword }}
        </div>
        <div class="col">
          <input
            type="password"
            v-model="confirmPassword"
            class="form-control"
            :disabled="!checkPassword"
          />
        </div>
      </div>
      <div class="row profileRow">
        <div class="col profileLabel"></div>
        <div class="col">
          <button
            type="button"
            class="btn btn-success"
            size="sm"
            style="float: right"
            :disabled="!checkConfirmPassword"
            v-on:click="updatePassword()"
          >
            {{ language[config.currentLanguage].Profile.confirmPassword }}
          </button>
        </div>
      </div>
    </b-card>
  </div>
</template>
<style scoped>
.profile {
  margin: auto;
  width: 50%;
  padding: 10px;
}
.profileRow {
  margin-top: 10px;
}
.profileLabel {
  text-transform: capitalize;
}
</style>
<script>
import axios from 'axios'
import validatePassword from '@/shared/validatePassword'

export default {
  name: 'profile',
  data() {
    return {
      user: {
        name: '',
        costumerName: '',
        roleName: '',
        email: ''
      },
      password: '',
      confirmPassword: '',
      checkPassword: null,
      checkConfirmPassword: null
    }
  },
  watch: {
    password() {
      this.checkPassword = validatePassword.validPassword(this.password)
    },
    confirmPassword() {
      if (this.confirmPassword == this.password) {
        this.checkConfirmPassword = true
      } else {
        this.checkConfirmPassword = false
      }
    }
  },
  created() {
    this.getUser()
    this.emitter.on('refreshProfile', () => {
      this.$forceUpdate()
    })
  },
  methods: {
    getUser() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.profile, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.user = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
        })
    },
    updatePassword() {
      this.emitter.emit('showLoader', true)
      axios
        .put(
          this.config.serviceBaseUrl + this.config.url.profile,
          {
            password: this.password
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayAccounts = response.data
          this.password = ''
          this.confirmPassword = ''
          setTimeout(
            function () {
              this.checkPassword = null
              this.checkConfirmPassword = null
            }.bind(this),
            100
          )
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    }
  }
}
</script>
