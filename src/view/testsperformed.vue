<template>
  <div class="costum testsperformed-page">
    <section class="card testsperformed-hero">
      <div>
        <span class="testsperformed-eyebrow">
          {{ language[config.currentLanguage].TestsPerformed.pageEyebrow }}
        </span>
        <h1 class="testsperformed-title">
          {{ language[config.currentLanguage].TestsPerformed.pageTitle }}
        </h1>
        <p class="testsperformed-description">
          {{ language[config.currentLanguage].TestsPerformed.pageDescription }}
        </p>
      </div>
      <button
        type="button"
        class="btn btn-outline-light testsperformed-refresh"
        v-on:click="getTestCycles()"
      >
        <font-awesome-icon icon="history" class="iconClass" />
        {{ language[config.currentLanguage].TestsPerformed.refresh }}
      </button>
    </section>

    <section class="testsperformed-summary">
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{ language[config.currentLanguage].TestsPerformed.columnTestCycle }}
        </span>
        <strong>{{ arrayTestCycles.length }}</strong>
      </article>
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{
            language[config.currentLanguage].TestsPerformed.columnTestCycleDate
          }}
        </span>
        <strong>{{ arrayTestCyclesDate.length }}</strong>
      </article>
      <article class="card testsperformed-metric">
        <span class="testsperformed-metric-label">
          {{ language[config.currentLanguage].TestsPerformed.columnTest }}
        </span>
        <strong>{{ arrayTest.length }}</strong>
      </article>
    </section>

    <section class="testsperformed-workspace">
      <article class="card testsperformed-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{ language[config.currentLanguage].TestsPerformed.columnTestCycle }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.selectCycle }}
            </p>
          </div>
          <span class="testsperformed-counter">{{ arrayTestCycles.length }}</span>
        </div>
        <div v-if="arrayTestCycles.length > 0" class="list-group testsperformed-list">
          <button
            :class="[
              'list-group-item',
              'testsperformed-item',
              { active: testCycleSelected == testCycle.id }
            ]"
            v-for="testCycle in arrayTestCycles"
            v-bind:key="testCycle.id"
            type="button"
            v-on:click="getTestCyclesDate(testCycle.id)"
          >
            <span class="testsperformed-item-icon">
              <font-awesome-icon icon="sync" />
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycle.name }}</strong>
            </span>
          </button>
        </div>
        <div v-else class="testsperformed-empty">
          {{ language[config.currentLanguage].TestsPerformed.emptyCycles }}
        </div>
      </article>

      <article class="card testsperformed-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{
                language[config.currentLanguage].TestsPerformed
                  .columnTestCycleDate
              }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.selectRun }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-light testsperformed-icon-button"
            :disabled="testCycleSelected == null"
            v-on:click="getTestCyclesDate(testCycleSelected)"
          >
            <font-awesome-icon icon="history" />
          </button>
        </div>
        <div
          v-if="arrayTestCyclesDate.length > 0"
          class="list-group testsperformed-list"
        >
          <button
            :class="[
              'list-group-item',
              'testsperformed-item',
              { active: testCycleDateSelected == testCycleDate.id }
            ]"
            v-for="testCycleDate in arrayTestCyclesDate"
            v-bind:key="testCycleDate.id"
            type="button"
            v-on:click="getTest(testCycleDate.id)"
          >
            <span class="testsperformed-item-icon">
              <font-awesome-icon icon="clock" />
            </span>
            <span class="testsperformed-item-main">
              <strong>{{ testCycleDate.date }}</strong>
            </span>
          </button>
        </div>
        <div v-else class="testsperformed-empty">
          {{
            testCycleSelected == null
              ? language[config.currentLanguage].TestsPerformed.selectCycleFirst
              : language[config.currentLanguage].TestsPerformed.emptyRuns
          }}
        </div>
      </article>

      <article class="card testsperformed-panel testsperformed-tests-panel">
        <div class="testsperformed-panel-header">
          <div>
            <span class="testsperformed-section-title">
              {{ language[config.currentLanguage].TestsPerformed.columnTest }}
            </span>
            <p class="testsperformed-helper">
              {{ language[config.currentLanguage].TestsPerformed.openDetails }}
            </p>
          </div>
          <span class="testsperformed-counter">{{ arrayTest.length }}</span>
        </div>
        <div v-if="arrayTest.length > 0" class="testsperformed-test-grid">
          <button
            class="card testsperformed-test-card"
            v-for="test in arrayTest"
            v-bind:key="test.id"
            type="button"
            v-on:click="getStep(test.id, test.name)"
          >
            <span :class="['testsperformed-status', getVariant(test.status)]">
              {{ getStatusLabel(test.status) }}
            </span>
            <strong>{{ test.name }}</strong>
            <span class="testsperformed-detail-link">
              {{ language[config.currentLanguage].TestsPerformed.viewDetails }}
            </span>
          </button>
        </div>
        <div v-else class="testsperformed-empty testsperformed-empty-large">
          {{
            testCycleDateSelected == null
              ? language[config.currentLanguage].TestsPerformed.selectRunFirst
              : language[config.currentLanguage].TestsPerformed.emptyTests
          }}
        </div>
      </article>
    </section>
    <modalTestPerformed ref="modalTestPerformed" :test="arrayTest" />
  </div>
</template>
<style scoped>
.testsperformed-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 auto;
  max-width: 1440px;
  width: 100%;
}

.testsperformed-hero {
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(255, 107, 30, 0.18), transparent 32rem),
    linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025));
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  padding: 1.35rem;
}

.testsperformed-eyebrow,
.testsperformed-section-title,
.testsperformed-metric-label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.testsperformed-title {
  color: #ffffff;
  font-size: clamp(1.6rem, 2.5vw, 2.4rem);
  margin: 0.35rem 0;
}

.testsperformed-description,
.testsperformed-helper {
  color: rgba(255, 255, 255, 0.66);
  margin: 0;
}

.testsperformed-refresh {
  align-items: center;
  border-color: rgba(255, 255, 255, 0.18);
  display: inline-flex;
  gap: 0.45rem;
  white-space: nowrap;
}

.testsperformed-summary {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.testsperformed-metric {
  padding: 1rem;
}

.testsperformed-metric strong {
  color: #ffffff;
  display: block;
  font-size: 2rem;
  line-height: 1;
  margin-top: 0.35rem;
}

.testsperformed-workspace {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(16rem, 0.85fr) minmax(16rem, 0.95fr) minmax(24rem, 1.6fr);
}

.testsperformed-panel {
  min-height: 34rem;
  overflow: hidden;
  padding: 1rem;
}

.testsperformed-panel-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.testsperformed-counter {
  align-items: center;
  background: rgba(255, 107, 30, 0.16);
  border: 1px solid rgba(255, 107, 30, 0.5);
  border-radius: 999px;
  color: #ffd1b8;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-width: 2rem;
  padding: 0.25rem 0.65rem;
}

.testsperformed-list,
.testsperformed-test-grid {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.testsperformed-item,
.testsperformed-test-card {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.88);
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.testsperformed-item {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  padding: 0.8rem;
}

.testsperformed-item:hover,
.testsperformed-test-card:hover {
  border-color: rgba(255, 107, 30, 0.55);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.2);
  color: #ffffff;
  transform: translateY(-1px);
}

.testsperformed-item.active {
  background: linear-gradient(135deg, rgba(255, 107, 30, 0.26), rgba(255, 139, 35, 0.1));
  border-color: rgba(255, 107, 30, 0.7);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  color: #ffffff !important;
}

.testsperformed-item-icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 0.65rem;
  display: inline-flex;
  height: 2.25rem;
  justify-content: center;
  width: 2.25rem;
}

.testsperformed-item-main {
  min-width: 0;
}

.testsperformed-test-grid {
  max-height: 32rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.testsperformed-test-card {
  cursor: pointer;
  gap: 0.55rem;
  padding: 1rem;
}

.testsperformed-status {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 0.28rem 0.6rem;
  text-transform: uppercase;
  width: max-content;
}

.testsperformed-status.secondary {
  background: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
}

.testsperformed-status.success {
  background: rgba(25, 135, 84, 0.2);
  color: #75d7a0;
}

.testsperformed-status.danger {
  background: rgba(220, 53, 69, 0.2);
  color: #ff8f9b;
}

.testsperformed-detail-link {
  color: #ffb37a;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.testsperformed-empty {
  align-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 0.9rem;
  color: rgba(255, 255, 255, 0.58);
  display: flex;
  justify-content: center;
  min-height: 10rem;
  padding: 1.25rem;
  text-align: center;
}

.testsperformed-empty-large {
  min-height: 24rem;
}

.testsperformed-icon-button:disabled {
  opacity: 0.35;
}

.iconClass {
  margin-right: 5px;
}

@media (max-width: 1180px) {
  .testsperformed-workspace {
    grid-template-columns: 1fr;
  }

  .testsperformed-panel {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .testsperformed-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 1rem;
  }

  .testsperformed-summary {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
import modalTestPerformed from './testperformed/modalTestPerformed.vue'

import apiClient from '@/services/apiClient'
import { getSelectedProjectId } from '@/stores/session'

export default {
  name: 'TestsPerformedComponent',
  components: {
    modalTestPerformed
  },
  data() {
    return {
      arrayTestCycles: [],
      testCycleSelected: null,
      arrayTestCyclesDate: [],
      testCycleDateSelected: null,
      arrayTest: [],
      testSelected: null,
      spinreverse: null,
      spinreverseDate: null
    }
  },
  watch: {
    $route() {
      this.$forceUpdate()
    }
  },
  created() {
    this.getTestCycles()
    this.emitter.on('refreshTestCyclePerformed', (msg) => {
      if (msg == true) this.getTestCycles()
      else this.$forceUpdate()
    })
  },
  methods: {
    getVariant(status) {
      let variant = null
      if (status == 0) {
        variant = 'secondary'
      } else if (status == 1) {
        variant = 'success'
      } else {
        variant = 'danger'
      }
      return variant
    },
    getStatusLabel(status) {
      if (status == 0) {
        return this.language[this.config.currentLanguage].TestsPerformed.statusPending
      }
      if (status == 1) {
        return this.language[this.config.currentLanguage].TestsPerformed.statusPassed
      }
      return this.language[this.config.currentLanguage].TestsPerformed.statusFailed
    },
    getTestCycles() {
      this.spinreverse = 'spin-reverse'
      this.arrayTestCyclesDate = []
      this.arrayTest = []
      this.testCycleSelected = null
      this.emitter.emit('showLoader', true)
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            getSelectedProjectId(),
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.spinreverse = null
          this.emitter.emit('showLoader', false)
          this.arrayTestCycles = response.data
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getTestCyclesDate(id) {
      this.arrayTest = []
      this.emitter.emit('showLoader', true)
      this.spinreverseDate = 'spin-reverse'
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.getTestCyclePerformed + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTestCyclesDate = response.data
          this.testCycleSelected = id
          this.testCycleDateSelected = null
          this.spinreverseDate = null
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },

    getTest(id) {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.getTestPerformed + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayTest = response.data
          this.testCycleDateSelected = id
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    getStep(id, name) {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.getStepPerformed + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.$refs.modalTestPerformed.showModal(response.data, name)
        })
        .catch((e) => {
          this.error = e
          this.Logout(this, e)
        })
    }
  }
}
</script>
