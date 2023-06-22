<template>
  <div class="">
    <div class="title">Postman Collection</div>
    <div class="contentCollection">
      <div v-for="(test, index) in keyCollections" v-bind:key="test">
        <div class="card" style="margin-top: 10px">
          <div class="card-header" :id="'heading' + index">
            <button
              class="btn btn-link collapsed"
              data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + index"
              aria-expanded="true"
              :aria-controls="'collapse' + index"
            >
              <span
                class="badge"
                :style="
                  'margin-right:10px;background-color:' +
                  getStatusCode(postmanCollection[test]['status_code'])
                "
                >{{ postmanCollection[test]['status_code'] }}</span
              >
              <span
                >{{ test }} |
                {{ postmanCollection[test]['reason'] }}
              </span>
            </button>
          </div>
          <div
            :id="'collapse' + index"
            class="collapse dataWindow"
            :aria-labelledby="'heading' + index"
            data-parent="#accordion"
          >
            <div class="row" v-for="attr in arrayAttributes" v-bind:key="attr">
              <div class="col-sm-2">
                <span style="margin-left: 10px">{{ attr }}</span>
              </div>
              <div class="col">{{ postmanCollection[test][attr] }}</div>
            </div>
          </div>
        </div>
      </div>
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
export default {
  data() {
    return {
      postmanCollection: null,
      keyCollections: [],
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
    console.log('postman')
    if (this.$route.params.data == undefined)
      this.$router.push({
        path: '/testsperformed'
      })
    else this.getCollections(this.$route.params.data)
  },
  methods: {
    getCollections(collections) {
      this.postmanCollection = JSON.parse(collections)
      this.keyCollections = Object.keys(this.postmanCollection)
      console.log(this.postmanCollection)
    },
    getStatusCode(code) {
      let httpCode = parseInt(code)
      let color = 'red'
      if (httpCode > 399 && httpCode < 500) color = '#ffc107'
      else if (httpCode > 199 && httpCode < 300) color = 'green'

      return color
    }
  }
}
</script>
