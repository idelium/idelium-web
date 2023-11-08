<template>
  <div class="costum">
    <span v-on:click="getTestCycles()" style="float: right">
      <font-awesome-icon icon="history" class="iconClass" />
    </span>
    <splitpanes
      split="horizontal"
      height="80vh"
      width="100vw"
      resizerWidth="10px"
      classes="v-pane-custom"
      class="default-theme"
    >
      <pane size="30%" class="costumPane">
        <span class="titleColumn">{{
          language[config.currentLanguage].TestsPerformed.columnTestCycle
        }}</span>
        <div class="list-group">
          <div
            :class="
              'list-group-item  d-flex justify-content-between ' +
              (testCycleSelected == testCycle.id ? 'active' : '')
            "
            v-for="(testCycle, index) in arrayTestCycles"
            v-bind:key="index"
            v-on:click="getTestCyclesDate(testCycle.id)"
            style="cursor: pointer"
          >
            <font-awesome-icon icon="sync" class="iconClass" />
            <span class="itemSidebar">{{ testCycle.name }}</span>
          </div>
        </div>
      </pane>
      <pane size="30%" class="costumPane">
        <span class="titleColumn">{{
          language[config.currentLanguage].TestsPerformed.columnTestCycleDate
        }}</span>
        <span v-on:click="getTestCyclesDate(testCycleSelected)" style="float: right">
          <font-awesome-icon icon="history" class="iconClass" />
        </span>
        <div class="list-group">
          <div
            :class="
              'list-group-item  d-flex justify-content-between ' +
              (testCycleDateSelected == testCycleDate.id ? 'active' : '')
            "
            v-for="(testCycleDate, index) in arrayTestCyclesDate"
            v-bind:key="index"
            v-on:click="getTest(testCycleDate.id)"
            style="cursor: pointer"
          >
            <font-awesome-icon icon="clock" class="iconClass" />
            <span class="itemSidebar">{{ testCycleDate.date }}</span>
          </div>
        </div>
      </pane>
      <pane size="40%" class="costumPane">
        <span class="titleColumn">{{
          language[config.currentLanguage].TestsPerformed.columnTest
        }}</span>
        <div class="list-group">
          <div
            class="list-group-item d-flex justify-content-between"
            v-for="(test, index) in arrayTest"
            v-bind:key="index"
            v-on:click="getStep(test.id, test.name)"
          >
            <font-awesome-icon icon="clock" class="iconClass" />
            <font-awesome-icon icon="vial" class="iconClass" />
            <button type="button" :class="'btn buttonTest  btn-' + getVariant(test.status)">
              {{ test.name }}
            </button>
          </div>
        </div>
      </pane>
    </splitpanes>
    <modalTestPerformed ref="modalTestPerformed" :test="arrayTest" />
  </div>
</template>
<style scoped>
.list-group-item.active {
  z-index: 2;
  color: #fff !important;
  background-color: rgb(8, 136, 168) !important;
  border-color: rgb(8, 136, 168) !important;
}

.titleColumn {
  font-size: 18px !important;
  margin-left: 5px;
}
.iconClass {
  font-size: 18px !important;
  margin-right: 5px;
}
.buttonTest {
  min-width: 80%;
}
.costumPane {
  background: transparent !important;
  height: 80vh;
  overflow-y: auto;
}
.btn-secondary {
  color: black !important;
}
</style>

<script>
import modalTestPerformed from './testperformed/modalTestPerformed.vue'
import 'splitpanes/dist/splitpanes.css'
import { Splitpanes, Pane } from 'splitpanes'

import axios from 'axios'

export default {
  name: 'TestsPerformedComponent',
  components: {
    Splitpanes,
    Pane,
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
    getTestCycles() {
      this.spinreverse = 'spin-reverse'
      this.arrayTestCyclesDate = []
      this.arrayTest = []
      this.testCycleSelected = null
      this.emitter.emit('showLoader', true)
      axios
        .get(
          this.config.serviceBaseUrl +
            this.config.url.testcycles +
            '/' +
            localStorage.projectIdSelected,
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
      axios
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
      axios
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
      axios
        .get(this.config.serviceBaseUrl + this.config.url.getStepPerformed + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.$refs.modalTestPerformed.showModal(response.data, name)
        })
        .catch((e) => {
          this.error = e
          console.log(e)
          this.Logout(this, e)
        })
    }
  }
}
</script>
