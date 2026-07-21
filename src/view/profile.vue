<template>
  <div class="profile-page">
    <section class="profile-hero">
      <div class="profile-avatar" aria-hidden="true">
        <font-awesome-icon icon="user-circle" />
      </div>
      <div>
        <p class="profile-eyebrow">Idelium</p>
        <h1 class="profile-title">
          {{ language[config.currentLanguage].Profile.title }}
        </h1>
        <p class="profile-subtitle">{{ user.email }}</p>
      </div>
    </section>

    <section class="profile-grid">
      <article class="profile-card">
        <div class="profile-card-header">
          <div>
            <p class="profile-eyebrow">Account</p>
            <h2 class="profile-card-title">
              {{ language[config.currentLanguage].Profile.name }}
            </h2>
          </div>
        </div>

        <dl class="profile-details">
          <div class="profile-detail">
            <dt>{{ language[config.currentLanguage].Profile.name }}</dt>
            <dd>{{ user.name }}</dd>
          </div>
          <div class="profile-detail">
            <dt>{{ language[config.currentLanguage].Profile.email }}</dt>
            <dd>{{ user.email }}</dd>
          </div>
          <div class="profile-detail">
            <dt>{{ language[config.currentLanguage].Profile.company }}</dt>
            <dd>{{ user.companyName }}</dd>
          </div>
          <div class="profile-detail">
            <dt>{{ language[config.currentLanguage].Profile.role }}</dt>
            <dd>
              <span class="profile-role-badge">{{ user.roleName }}</span>
            </dd>
          </div>
        </dl>
      </article>

      <article class="profile-card">
        <div class="profile-card-header">
          <div>
            <p class="profile-eyebrow">Security</p>
            <h2 class="profile-card-title">
              {{ language[config.currentLanguage].Profile.password }}
            </h2>
          </div>
          <font-awesome-icon class="profile-card-icon" icon="key" />
        </div>

        <div class="profile-form">
          <label class="profile-field" for="profile-password">
            <span>{{ language[config.currentLanguage].Profile.password }}</span>
            <input
              id="profile-password"
              type="password"
              class="form-control"
              v-model="password"
              autocomplete="new-password"
            />
          </label>

          <label class="profile-field" for="profile-confirm-password">
            <span>
              {{ language[config.currentLanguage].Profile.confirmPassword }}
            </span>
            <input
              id="profile-confirm-password"
              type="password"
              v-model="confirmPassword"
              class="form-control"
              autocomplete="new-password"
              :disabled="!checkPassword"
            />
          </label>

          <button
            type="button"
            class="btn btn-success profile-action"
            size="sm"
            :disabled="!checkConfirmPassword"
            v-on:click="updatePassword()"
          >
            {{ language[config.currentLanguage].Profile.confirmPassword }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>
<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin: 0 auto;
  max-width: 1180px;
  width: 100%;
}

.profile-hero {
  align-items: center;
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 122, 24, 0.2), transparent 18rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.1rem;
  box-shadow: 0 1.25rem 3.4rem rgba(0, 0, 0, 0.24);
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
}

.profile-avatar {
  align-items: center;
  background: linear-gradient(135deg, #ff8a00, #ff5a2e);
  border-radius: 1.2rem;
  box-shadow: 0 1rem 2.6rem rgba(255, 122, 24, 0.22);
  color: #111318;
  display: inline-flex;
  flex: 0 0 4.75rem;
  font-size: 2.8rem;
  height: 4.75rem;
  justify-content: center;
  width: 4.75rem;
}

.profile-eyebrow {
  color: rgba(244, 244, 245, 0.58);
  font-size: 0.65rem;
  font-weight: 850;
  letter-spacing: 0.16rem;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.profile-title {
  color: #ffffff;
  font-size: clamp(1.6rem, 2vw, 2.15rem);
  font-weight: 850;
  letter-spacing: 0.03rem;
  margin: 0;
}

.profile-subtitle {
  color: rgba(244, 244, 245, 0.68);
  font-size: 0.95rem;
  margin: 0.35rem 0 0;
}

.profile-grid {
  display: grid;
  gap: 1.4rem;
  grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.8fr);
}

.profile-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
    rgba(35, 38, 50, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.1rem;
  box-shadow: 0 1.25rem 3.4rem rgba(0, 0, 0, 0.2);
  min-width: 0;
  padding: 1.25rem;
}

.profile-card-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.profile-card-title {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 850;
  margin: 0;
}

.profile-card-icon {
  color: rgba(255, 122, 24, 0.9);
  font-size: 1.2rem;
}

.profile-details {
  display: grid;
  gap: 0.85rem;
  margin: 0;
}

.profile-detail {
  align-items: center;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.9rem;
  display: grid;
  gap: 0.5rem;
  grid-template-columns: minmax(8rem, 0.36fr) minmax(0, 1fr);
  padding: 0.95rem 1rem;
}

.profile-detail dt {
  color: rgba(244, 244, 245, 0.54);
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.12rem;
  margin: 0;
  text-transform: uppercase;
}

.profile-detail dd {
  color: #f8fafc;
  font-weight: 700;
  margin: 0;
  overflow-wrap: anywhere;
}

.profile-role-badge {
  background: rgba(255, 122, 24, 0.14);
  border: 1px solid rgba(255, 122, 24, 0.3);
  border-radius: 999px;
  color: #ffb36b;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.1rem;
  padding: 0.38rem 0.7rem;
  text-transform: uppercase;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-field {
  color: rgba(244, 244, 245, 0.64);
  display: flex;
  flex-direction: column;
  font-size: 0.68rem;
  font-weight: 850;
  gap: 0.5rem;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.profile-action {
  align-self: flex-end;
  min-width: 12rem;
}

@media only screen and (max-width: 960px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media only screen and (max-width: 600px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-detail {
    grid-template-columns: 1fr;
  }

  .profile-action {
    align-self: stretch;
  }
}
</style>
<script>
import apiClient from '@/services/apiClient'
import validatePassword from '@/shared/validatePassword'

export default {
  name: 'ProfileComponent',
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
      apiClient
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
      apiClient
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
