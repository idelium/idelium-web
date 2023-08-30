<template>
  <div class="">
    <div class="title">{{nameTest}}</div>
    <div class="contentCollection">
        <table class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.id }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.status }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.method }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.url }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.time }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Postman.response }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(connection,index) in dataTest" v-bind:key="connection">
                  <td>{{index + 1}}</td>
                  <td><span :class="'badge text-bg-' +  getStatusCode(connection.status)" >{{connection.status}}</span></td>
                  <td>{{connection.method}}</td>
                  <td>{{connection.url}}</td>
                  <td>{{connection.time}}</td>
                  <td>
                <button
                  type="button"
                  class="btn btn-primary"
                  v-on:click="showModal(index)"
                >
                  {{ language[config.currentLanguage].Postman.showResponse }}
                </button>

                  </td>
            </tr>
          </tbody>
        </table>
        <modalPostmanResponse
         ref="modalPostmanResponseShow"
        />
      </div>
  </div>
</template>
<style>
body {
  font-family: Arial;
}

* {
  box-sizing: border-box;
}
.title {
  font-size: 2rem;
  text-align: center;
}

.wrapper {
  max-width: 400px;
  margin: 50px auto;
}
.dot {
  height: 12px;
  width: 12px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

.dataWindow {
  border: 3px solid #f1f1f1;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  width: 90vw;
  margin: 10px;
  background-color: rgb(7, 42, 92);
  overflow: auto;
}

.top {
  padding: 10px;
  background: #f1f1f1;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.contentCollection {
  padding: 10px;
  overflow-y: auto;
  max-height: 80vh;
}
</style>
<script>
import modalPostmanResponse from './modalPostmanResponse.vue'
import axios from 'axios'
export default {
  components: {
    modalPostmanResponse,
  },
  data() {
    return {
      postmanCollection: null,
      keyCollections: [],
      dataTest: {},
      nameTest: null,     
      arrayAttributes: [
        'url',
        'apparent_encoding',
        //'content',
        'cookies',
        'elapsed',
        'encoding',
        'headers',
        'history',
        'is_permanent_redirect',
        'is_redirect',
        'links',
        'next',
        'ok',
        //"raw",
        'reason',
        'request',
        'status_code',
        'text'
      ]
    }
  },
  created() {
    console.log('show postman')
    this.getStep(this.$route.params.id)
  },
  methods: {
    getStep(id) {

      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.getStepPerformed + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          console.log('getStep: ' +  id)
          this.emitter.emit('showLoader', false)
          this.dataTest=JSON.parse(response.data[0].data)
          this.nameTest=response.data[0].name
        })
        .catch((e) => {
          this.error = e
          console.log(e)
          this.Logout(this, e)
        })
    },
    getCollections(collections) {
      this.postmanCollection = JSON.parse(collections)
      this.keyCollections = Object.keys(this.postmanCollection)
      console.log(this.postmanCollection)
    },
    showModal(index) {
        console.log('modalPostmanResponseShow: ' +  index)
        this.$refs.modalPostmanResponseShow.showModal(this.dataTest[index].response)
    },
    getStatusCode(code) {
      let httpCode = parseInt(code)
      let color = 'red'
      if (httpCode > 499) color = 'danger'
      else if (httpCode > 199 && httpCode < 300) color = 'success'
      else if (httpCode > 301 && httpCode < 500) color = 'warning'

      return color
    }
  }
}
</script>
