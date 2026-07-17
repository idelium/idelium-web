<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="welcome">
        <div class="welcome-card">
          <img src="@/assets/idelium.png" class="login-logo" alt="Idelium" />
          <p class="infoLogin">
            {{ language[config.currentLanguage].Login.welcome }}
          </p>
          <p class="welcomeMessage">
            {{ language[config.currentLanguage].Login.welcomeMessage }}
          </p>
        </div>
      </section>
      <section class="formLogin">
        <div class="login-card">
          <div class="login">
            <p class="infoLogin messageLogin">
              {{ language[config.currentLanguage].Login.info }}
            </p>
            <span class="errorMessage">{{ error }}</span>
            <input
              :placeholder="
                language[config.currentLanguage].Login.placeUsername
              "
              class="form-control username"
              v-model="email"
              id="username"
              v-on:keyup.enter="auth()"
            />
            <div class="input-group mb-3">
              <input
                :placeholder="
                  language[config.currentLanguage].Login.placePassword
                "
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
            <div class="form-check remember-password">
              <input
                class="form-check-input"
                type="checkbox"
                id="rememberPassword"
                v-model="rememberPassword"
              />
              <label class="form-check-label" for="rememberPassword">
                {{ language[config.currentLanguage].Login.rememberPassword }}
              </label>
            </div>
            <button
              type="button"
              id="login"
              class="btn btn-primary loginbutton"
              v-on:click="auth()"
              size="sm"
            >
              {{ language[config.currentLanguage].Login.btnLogin }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped>
.login-page {
  align-items: center;
  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(249, 128, 8, 0.22),
      transparent 24rem
    ),
    radial-gradient(
      circle at 88% 12%,
      rgba(255, 90, 46, 0.16),
      transparent 28rem
    ),
    linear-gradient(135deg, #11131a 0%, #242733 52%, #30333e 100%);
  color: #f4f4f5;
  display: flex;
  min-height: 100vh;
  padding: 2rem;
}

.login-shell {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.75fr);
  margin: 0 auto;
  max-width: 1180px;
  width: 100%;
}

.formLogin {
  align-items: center;
  display: flex;
}

.login-card,
.welcome-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.055), transparent),
    rgba(28, 31, 41, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.4rem;
  box-shadow: 0 28px 72px rgba(0, 0, 0, 0.32);
  width: 100%;
}

.login-card {
  padding: 2.2rem;
}

.welcome {
  align-items: center;
  display: flex;
}

.welcome-card {
  overflow: hidden;
  padding: 3rem;
  position: relative;
}

.welcome-card::after {
  background: linear-gradient(
    135deg,
    rgba(249, 128, 8, 0.24),
    rgba(255, 90, 46, 0)
  );
  border-radius: 999px;
  content: "";
  height: 18rem;
  position: absolute;
  right: -7rem;
  top: -7rem;
  width: 18rem;
}

.login-logo {
  margin-bottom: 2.5rem;
  max-width: 16rem;
  width: 65%;
}
.errorMessage {
  display: block;
  min-height: 1.4rem;
  text-transform: uppercase;
  text-align: left;
  font-size: 0.8rem;
  color: #ff8a8a;
}
.center {
  /*margin: auto; */
  /*width: 50%; */
  padding: 10px;
  top: 30vh;
}

.loginbutton {
  align-content: right;
  margin-top: 1.6rem;
  font-size: 1rem !important;
  min-width: 100%;
  padding: 0.85rem 1rem !important;
}
.buttonEye {
  font-size: 1rem;
  border: 1px solid #ced4da;
  max-height: 40px;
  top: 30px;
}
.password {
  align-content: right;
  margin-top: 1.1rem;
  font-size: 1rem !important;
}
.username {
  align-content: right;
  margin-top: 1.1rem;
  font-size: 1rem !important;
}
.remember-password {
  color: rgba(244, 244, 245, 0.8);
  font-size: 0.9rem;
  margin-top: 0.8rem;
}
.remember-password label {
  cursor: pointer;
}
.infoLogin {
  text-align: left;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.welcomeMessage {
  color: rgba(244, 244, 245, 0.72);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 34rem;
}
.titleLogin {
  text-align: center;
  font-size: 45px;
  text-transform: uppercase;
}
.form-control::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  text-transform: uppercase;
  font-size: 0.78rem !important;
}

.form-control:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  text-transform: uppercase;
  font-size: 0.78rem !important;
}

.form-control::-ms-input-placeholder {
  /* Microsoft Edge */
  text-transform: uppercase;
  font-size: 0.78rem !important;
}
@media only screen and (max-width: 900px) {
  .login-page {
    padding: 1rem;
  }
  .login-shell {
    grid-template-columns: 1fr;
  }
  .welcome-card,
  .login-card {
    padding: 1.5rem;
  }
}
@media only screen and (max-width: 600px) {
  .formLogin {
    position: relative;
    border-left: 0px solid #d8d8d8;
    padding: 0px;
    max-width: 70wh;
  }
  .welcome {
    position: relative;
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
    max-width: 70wh;
  }
  .welcome {
    position: relative;
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
import apiClient from "@/services/apiClient";
import { useSessionStore } from "@/stores/session";
import validateEmail from "@/shared/validateEmail";

const rememberedLoginKey = "idelium.rememberedLogin";

export default {
  name: "LoginComponent",
  setup() {
    return { session: useSessionStore() };
  },
  data() {
    return {
      email: "",
      password: "",
      status: "not_accepted",
      error: null,
      showError: false,
      showPassword: false,
      rememberPassword: false,
    };
  },
  mounted() {
    this.loadRememberedLogin();
  },
  methods: {
    loadRememberedLogin() {
      const rememberedLogin = window.localStorage.getItem(rememberedLoginKey);
      if (rememberedLogin == null) return;

      try {
        const credentials = JSON.parse(rememberedLogin);
        this.email = credentials.email || "";
        this.password = credentials.password || "";
        this.rememberPassword = this.email !== "" || this.password !== "";
      } catch {
        window.localStorage.removeItem(rememberedLoginKey);
      }
    },
    updateRememberedLogin() {
      if (this.rememberPassword == false) {
        window.localStorage.removeItem(rememberedLoginKey);
        return;
      }

      window.localStorage.setItem(
        rememberedLoginKey,
        JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      );
    },
    csrf() {
      return apiClient.get(this.config.serviceBaseUrl + this.config.url.csrf);
    },
    async auth() {
      if (this.email == "") {
        this.error = this.language[this.config.currentLanguage].Login.errorMail;
        this.showError = true;
        return false;
      }
      if (validateEmail.validateEmail(this.email) == false) {
        this.error =
          this.language[this.config.currentLanguage].Login.isNotEmail;
        this.showError = true;
        return false;
      }
      if (this.password == "") {
        this.error =
          this.language[this.config.currentLanguage].Login.errorPassword;
        this.showError = true;
        return false;
      }
      this.error = null;
      this.showError = false;
      await this.csrf();
      let token = null;
      if (import.meta.env.VITE_GOOGLE_SITE_KEY) {
        await this.$recaptchaLoaded();
        token = await this.$recaptcha("login");
      }

      this.emitter.emit("showLoader", true);
      try {
        await apiClient.post(
          this.config.serviceBaseUrl + this.config.url.login,
          {
            email: this.email,
            password: this.password,
            token: token,
          },
        );
        this.updateRememberedLogin();
        this.session.establishSession();
        await this.$router.push({ name: this.$route.query.back || "projects" });
      } catch {
        this.error =
          this.language[this.config.currentLanguage].Login.errorCredential;
        this.showError = true;
        this.$isAuthenticated.value = false;
      } finally {
        this.emitter.emit("showLoader", false);
      }
    },
    ask() {
      alert("Need help signing in? Contact your administrator.");
    },
  },
};
</script>
