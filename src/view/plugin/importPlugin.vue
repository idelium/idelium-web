<template>
  <div>
    <div>
      <file-upload
        ref="upload"
        v-model="files"
        class="upload"
        :extensions="extensions"
        :accept="accept"
        @input-filter="inputFilter"
        :drop="true"
      >
        <div class="upload-text">
          {{
            language[this.config.currentLanguage].Plugins.importPlugin.importPostmanCollectionFile
          }}
        </div>
        <div class="upload-text error">
          {{ errortext }}
        </div>
      </file-upload>
    </div>
  </div>
</template>
<style scoped>
.upload {
  border-style: dashed;
  border-color: white;
  text-align: center;
  height: 20vh;
  width: 99%;
  position: relative;
}
.upload-text {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 2rem;
  width: 100%;
}
.error {
  color: orangered;
  top: 70% !important;
  font-size: 1rem;
  text-transform: uppercase;
}
</style>
<script>
import axios from 'axios'
import FileUpload from 'vue-upload-component'
export default {
  name: 'SeleniumComponent',
  props: {},
  components: {
    FileUpload
  },
  data() {
    return {
      files: [],
      extensions: 'py',
      accept: 'text/py',
      errortext: ''
    }
  },

  created() {
    console.log('import selenium')
  },
  watch: {
    testName() {
      this.notifyChange()
    },
    testDescription() {
      this.notifyChange()
    }
  },
  methods: {
    inputFilter(newFile) {
      console.log('---------')
      this.errortext = ''
      var fileExt = newFile.name.split('.').pop()
      if (fileExt != 'py') {
        this.errortext =
          this.language[this.config.currentLanguage].Plugins.importPlugin.extensionIsWrong
        return false
      }
      //console.log( this.blobToString(newFile.file))
      let url = URL.createObjectURL(newFile.file)
      axios
        .get(url, {
          responseType: 'text'
        })
        .then((response) => {
          this.$emit('importPlugin', response.data)
        })
        .catch((e) => {
          this.error = e
        })
    },
    notifyChange() {}
  }
}
</script>
