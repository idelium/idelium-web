<template>
  <div>
    <div class="row">
      <div class="col" fluid="lg">
        <div class="welcome">
          <img src="@/assets/idelium.png" style="width: 16rem" />
          <p class="infoLogin">
            {{ language[config.currentLanguage].Login.welcome }}
          </p>
          <p class="welcomeMessage">
            {{ language[config.currentLanguage].Login.welcomeMessage }}
          </p>
        </div>
      </div>
      <div class="col" fluid="lg">
        <div class="formLogin">
          <div class="login">
            <p class="infoLogin messageLogin">
              {{ language[config.currentLanguage].Login.info }}
            </p>
            <span class="errorMessage">{{ error }}</span>
            <input
              :placeholder="language[config.currentLanguage].Login.placeUsername"
              class="form-control username"
              v-model="email"
              id="username"
              v-on:keyup.enter="auth()"
            />
            <div class="input-group mb-3">
              <input
                :placeholder="language[config.currentLanguage].Login.placePassword"
                aria-describedby="password-addon"
                id="password"
                v-model="password"
                class="form-control password"
                :type="showPassword == true ? 'text' : 'password'"
                v-on:keyup.enter="auth()"
              />
              <button
                type="button"
                class="input-group-text password"
                v-on:click="showPassword = !showPassword"
              >
                <font-awesome-icon
                  :icon="showPassword == true ? 'eye-slash' : 'eye'"
                  id="password-addon"
                />
              </button>
            </div>
            <button
              type="button"
              id="login"
              class="btn btn-primary loginbutton"
              v-on:click="auth()"
              size="sm"
              style="min-width: 100%"
            >
              {{ language[config.currentLanguage].Login.btnLogin }}
            </button>
            <img
              src="@/assets/sectigo_trust_seal_sm_2x.png"
              style="margin-top: 10px; width: 100px; float: right"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.formLogin {
  position: absolute;
  border-left: 1px solid #d8d8d8;
  padding: 60px;
  top: 30vh;
}

.login {
}
.welcome {
  padding: 60px;
  position: absolute;
  top: 30vh;
  left: 30vh;
  max-width: 30rem;
}
.errorMessage {
  text-transform: uppercase;
  text-align: center;
  font-size: 20px;
  color: red;
}
.center {
  /*margin: auto; */
  /*width: 50%; */
  padding: 10px;
  top: 30vh;
}

.loginbutton {
  align-content: right;
  margin-top: 30px;
  font-size: 1rem !important;
}
.buttonEye {
  font-size: 1rem;
  border: 1px solid #ced4da;
  max-height: 40px;
  top: 30px;
}
.password {
  align-content: right;
  margin-top: 30px;
  font-size: 1rem !important;
}
.username {
  align-content: right;
  margin-top: 30px;
  font-size: 1rem !important;
}
.infoLogin {
  text-align: left;
  font-size: 2.2rem;
}
.titleLogin {
  text-align: center;
  font-size: 45px;
  text-transform: uppercase;
}
.form-control::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  text-transform: uppercase;
  font-size: 20px !important;
}

.form-control:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  text-transform: uppercase;
  font-size: 20px !important;
}

.form-control::-ms-input-placeholder {
  /* Microsoft Edge */
  text-transform: uppercase;
  font-size: 20px !important;
}
@media only screen and (max-width: 600px) {
  .formLogin {
    position: relative;
    border-left: 0px solid #d8d8d8;
    padding: 0px;
    top: -10vh;
    max-width: 70wh;
  }
  .welcome {
    position: relative;
    top: 0vh;
    left: 0vh;
    max-width: 70vh;
  }
  .login {
    max-width: 30vh;
    text-align: center;
  }
  .messageLogin {
    visibility: hidden;
  }

  .infoLogin {
    text-align: left;
    font-size: 2rem;
    text-align: center;
  }
  .col {
    text-align: -webkit-center;
  }
}
@media only screen and (max-width: 400px) {
  .formLogin {
    position: relative;
    border-left: 0px solid #d8d8d8;
    padding: 0px;
    top: -35vh;
    max-width: 70wh;
  }
  .welcome {
    position: relative;
    top: 0vh;
    left: 0vh;
    max-width: 70vh;
  }
  .welcomeMessage {
    visibility: hidden;
  }
  .login {
    max-width: 50vh;
    text-align: center;
  }
  .messageLogin {
    visibility: hidden;
  }

  .infoLogin {
    text-align: left;
    font-size: 2rem;
    text-align: center;
  }
  .col {
    text-align: -webkit-center;
  }
}
</style>
<script>
import axios from 'axios'

import validateEmail from '@/shared/validateEmail'
axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
export default {
  data() {
    return {
      email: '',
      password: '',
      status: 'not_accepted',
      error: null,
      showError: false,
      showPassword: false
    }
  },
  created() {
    console.log('login')
  },
  methods: {
    csrf() {
      axios
        .get(this.config.serviceBaseUrl + this.config.url.csrf, {})
        .then((response) => {
          console.log(response.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    async auth() {
      if (this.email == '') {
        this.error = this.language[this.config.currentLanguage].Login.errorMail
        this.showError = true
        return false
      }
      if (validateEmail.validateEmail(this.email) == false) {
        this.error = this.language[this.config.currentLanguage].Login.isNotEmail
        this.showError = true
        return false
      }
      if (this.password == '') {
        this.error = this.language[this.config.currentLanguage].Login.errorPassword
        this.showError = true
        return false
      }
      this.error = null
      this.showError = false
      await this.csrf()
      let token=null
      if (import.meta.env.VITE_GOOGLE_SITE_KEY) {
        await this.$recaptchaLoaded()
        token = await this.$recaptcha('login')
      }
      
      this.emitter.emit('showLoader', true)
      axios
        .post(
          this.config.serviceBaseUrl + this.config.url.login,
          {
            email: this.email,
            password: this.password,
            token: token
          },
          {
            headers: {
              xsrfHeaderName: 'X-CSRFToken'
            }
          }
        )
        .then((response) => {
          console.log(response.data)
          localStorage.token = response.data.access_token
          localStorage.session = response.data.session
          if (this.$route.query.back) {
            this.$router.push({ name: this.$route.query.back }).catch()
          } else {
            this.$router.push({ name: 'projects' }).catch()
          }
        })
        .catch((e) => {
          this.error = this.language[this.config.currentLanguage].Login.errorCredential
          this.showError = true
          this.$isAuthenticated.value = false
          console.log(e)
        })
    },
    ask() {
      alert('Non riesci ad entrare ? Chiedi in segreteria')
    }
  }
}
</script>
