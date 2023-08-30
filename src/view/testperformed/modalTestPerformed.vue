<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="myModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              <font-awesome-icon icon="vial" class="iconClass" /> {{ testName }}
            </h5>
          </div>
          <div v-if="fullscreen == false">
            <timeline ref="timeline" :steps="arrayStep" v-on:showImage="showImage" />
            <div class="stepTable">
              <table class="table table-striped costum">
                <thead>
                  <tr>
                    <th scope="col">
                      {{ language[config.currentLanguage].TestsPerformed.stepId }}
                    </th>
                    <th scope="col">
                      {{ language[config.currentLanguage].TestsPerformed.stepName }}
                    </th>
                    <th scope="col">
                      {{ language[config.currentLanguage].TestsPerformed.stepStatus }}
                    </th>
                    <th scope="col">
                      {{ language[config.currentLanguage].TestsPerformed.screenshots }}
                    </th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(step, index) in arrayStep" v-bind:key="index">
                    <td>{{ step.id }}</td>
                    <td>
                      {{ step.name }}
                    </td>
                    <td>
                      <button
                        type="button"
                        :class="'btn btn-' + getVariant(step.status) + ' buttonTest'"
                      >
                        {{ getStatusText(step.status) }}
                      </button>
                    </td>
                    <td>
                      <span
                        v-for="screen in JSON.parse(step.screenshots)"
                        v-bind:key="screen"
                        v-on:click="fullscreenImage(screen)"
                        style="cursor: pointer"
                      >
                        <img :src="screen" class="img" />
                      </span>
                    </td>
                    <td v-if="step.type == 'postman'">
                      <button type="button" :class="btn" v-on:click="showPostmanCollection(index)">
                        Postman Collection Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="fullscreen == true" v-on:click="fullscreenImage(null)">
            <img :src="screenFull" class="imgFull" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.img {
  max-width: 100px;
}
.imgFull {
  max-width: 100%;
}
.buttonTest {
  min-width: 80%;
}
.iconClass {
  font-size: 18px !important;
  margin-right: 5px;
}
.stepTable {
  display: inline-block;
  overflow-y: auto;
  max-height: 50vh;
  min-width: 100%;
}
</style>

<script>
import timeline from './timeLine.vue'
import { Modal } from 'bootstrap'
export default {
  components: {
    timeline,
  },
  created() {
    console.log('modal testcycle')
  },
  data() {
    return {
      testName: '',
      arrayStep: [],
      fullscreen: false,
      screenFull: null,
      postmanCollection: null,
      showCollectionWindow: false,
      showMe: true
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('myModal'))
  },
  methods: {
    showPostmanCollection(index) {
      console.log(index)
      this.modalElem.hide()
      this.$router.push({ path: '/postman/' + this.arrayStep[index].testDoneId })
    },
    getVariant(status) {
      let variant = 'success'
      if (status != 1) {
        variant = 'danger'
      }
      return variant
    },
    getStatusText(status) {
      let variant = 'success'
      if (status != 1) {
        variant = 'failed'
      }
      return variant
    },
    showModal(arrayStep, name) {
      this.arrayStep = arrayStep
      this.testName = name
      this.fullscreen = false
      this.modalElem.show()
      this.showCollectionWindow = false
      setTimeout(
        function () {
          this.$refs.timeline.calc()
        }.bind(this),
        100
      )
    },
    fullscreenImage(screen) {
      this.fullscreen = !this.fullscreen
      this.screenFull = screen
      this.showCollectionWindow = false
      if (this.fullscreen == false) {
        setTimeout(
          function () {
            this.$refs.timeline.calc()
          }.bind(this),
          100
        )
      }
    },
    showImage(index) {
      console.log('showImage')
      this.fullscreenImage(JSON.parse(this.arrayStep[index].screenshots)[0])
    }
  }
}
</script>
