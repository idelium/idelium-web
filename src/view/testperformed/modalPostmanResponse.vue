<template>
  <div>
    <div
      class="modal fade"
      ref="mymodal"
      id="postmanModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              <font-awesome-icon icon="vial" class="iconClass" /> 
            </h5>
          </div>
            <v-ace-editor
            v-model:value="dataResponse"
            lang="python"
            theme="chrome"
            style="margin-top: 10px; min-height: 80vh; max-height: 80vh"
            v-if="showEditor == true"
          />
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
import { Modal } from 'bootstrap'
import { VAceEditor } from 'vue3-ace-editor'
export default {
  created() {
    console.log('modal testcycle')
  },
  data() {
    return {
      dataResponse:'test',
      showEditor:false,
    }
  },
  mounted() {
    this.modalElem = new Modal(document.getElementById('postmanModal'))
  },
  methods: {
    showPostmanCollection(index) {
      console.log(index)
      this.modalElem.hide()
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
    showModal(dataResponse) {
      this.dataResponse=JSON.stringify(dataResponse)
      console.log(dataResponse)
      this.modalElem.show()
      setTimeout(
          function () {
            this.showEditor=true
          }.bind(this),
          100
        )
    },
  },
  components: {
    VAceEditor,
  },
}
</script>
