<template>
  <div>
    <span
      ><a href="https://www.selenium.dev/selenium-ide/" target="_new" class="linkSeleniumIde"
        >Download Selenium IDE</a
      ></span
    >
    <div v-if="showUpload == true">
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
          {{ language[this.config.currentLanguage].Tests.selenium.importSeleniumFile }}
        </div>
        <div class="upload-text error">
          {{ errortext }}
        </div>
      </file-upload>
      <span style="font-size: 1rem; float: right"> Only Xpath </span>
      <div class="form-check form-switch">
        <input
          type="checkbox"
          class="form-check-input"
          style="font-size: 1rem; float: right"
          v-model="onlyXpath"
          name="check-button"
        />
      </div>
    </div>
    <div v-else>
      <div class="container-fluid">
        <div class="row my-1">
          <div class="col-sm-11">
            <label>{{ language[config.currentLanguage].Tests.selenium.testName }}</label>
          </div>
          <div class="col-sm-9">
            <input class="form-control" type="text" v-model="testName" />
          </div>
        </div>
        <div class="row my-1">
          <div class="col-sm-11">
            <label>{{ language[config.currentLanguage].Tests.selenium.testDescription }}</label>
          </div>
          <div class="col-sm-9">
            <input class="form-control" type="text" v-model="testDescription" />
          </div>
        </div>
        <div class="row my-1"></div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.linkSeleniumIde {
  color: white;
  text-decoration: none;
  float: right;
  font-size: 14px;
}
.upload {
  border-style: dashed;
  border-color: white;
  text-align: center;
  height: 20vh;
  width: 100%;
  position: relative;
  cursor: pointer !important;
}
.upload-text {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 2rem;
  width: 100%;
  cursor: pointer;
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
  name: 'importSelentium',
  props: {},
  components: {
    FileUpload
  },
  data() {
    return {
      files: [],
      extensions: 'side',
      accept: 'text/side',
      errortext: '',
      testName: '',
      testDescription: '',
      test: [],
      commands: [],
      typeXpath: [
        'xpath:idRelative',
        'xpath:position',
        'xpath:href',
        'xpath:link',
        'xpath:attributes'
      ],
      onlyXpath: false,
      showUpload: true
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
      if (fileExt != 'side') {
        this.errortext = this.language[this.config.currentLanguage].Tests.selenium.extensionIsWrong
        return false
      }
      //console.log( this.blobToString(newFile.file))
      let url = URL.createObjectURL(newFile.file)
      axios
        .get(url, {
          responseType: 'json'
        })
        .then((response) => {
          URL.revokeObjectURL(url)
          if (response.data == null || !response.data.url || !response.data.tests) {
            this.errortext =
              this.language[this.config.currentLanguage].Tests.selenium.isNotASeleniumFile
          } else {
            this.loadJson(response.data)
          }
        })
        .catch((e) => {
          this.error = e
        })
    },
    findTarget(commandObj) {
      console.log('findTarget')
      let target = null
      let findBy = null
      if (this.onlyXpath == true) {
        for (let x in this.typeXpath) {
          if (target == null) {
            for (let y in commandObj.targets) {
              if (commandObj.targets[y][1] == this.typeXpath[x]) {
                target = commandObj.targets[y][0].substring(
                  commandObj.targets[y][0].indexOf('=') + 1
                )
                findBy = commandObj.targets[y][0].substring(
                  0,
                  commandObj.targets[y][0].indexOf('=')
                )
              }
            }
          }
        }
      }
      if (target == null) {
        target = commandObj.target.substring(commandObj.target.indexOf('=') + 1)
        findBy = commandObj.target.substring(0, commandObj.target.indexOf('='))
      }
      return { target: target, findBy: findBy }
    },
    loadJson(jsonSel) {
      this.showUpload = false
      this.testName = jsonSel.name
      this.testDescription = 'Testing ' + jsonSel.name
      this.test = []
      this.commands = []
      //build
      for (let i in jsonSel.tests) {
        //tests
        let test = jsonSel.tests[i]
        for (let x in test.commands) {
          let commandObj = test.commands[x]
          let getTarget = this.findTarget(commandObj)
          let target = getTarget.target
          let findBy = getTarget.findBy
          let obj = null
          let name = null
          if (commandObj.command == 'open') {
            if (commandObj.comment.length==0) {
              name=jsonSel.name + ' open browser'
            } else {
              name=commandObj.comment
            }
            obj = {
              name: name,
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: 'open_browser',
                  url: jsonSel.url + commandObj.target,
                  xpath: '//*',
                  note: 'open browser'
                }
              ]
            }
          } else if (commandObj.command == 'click') {
            if (commandObj.comment.length==0) {
              name=jsonSel.name + ' (click)'
            } else {
              name=commandObj.comment
            }
            obj = {
              name: name,
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: 'wait_for_next_step',
                  findBy: findBy,
                  target: target,
                  note: 'verify ' + findBy + '=' + target
                },
                {
                  stepType: 'click',
                  findBy: findBy,
                  target: target,
                  note: 'click on ' + findBy + '=' + target
                }
              ]
            }
          } else if (commandObj.command == 'select') {
            let selectValue = commandObj.value.substring(commandObj.value.indexOf('=') + 1)
            let selectType = commandObj.value.substring(0, commandObj.value.indexOf('='))
            if (commandObj.comment.length==0) {
              name=jsonSel.name + ' (select)'
            } else {
              name=commandObj.comment
            }
            obj = {
              name: name,
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: 'wait_for_next_step',
                  findBy: findBy,
                  target: target,
                  note: 'verify ' + findBy + '=' + target
                },
                {
                  stepType: 'select',
                  findBy: findBy,
                  target: target,
                  selectType: selectType,
                  value: selectValue,
                  note: 'select  on ' + findBy + '=' + target
                }
              ]
            }
          } else if (commandObj.command == 'type' && commandObj.value != '') {
            if (commandObj.comment.length==0) {
              name=jsonSel.name + ' (write)'
            } else {
              name=commandObj.comment
            }
            obj = {
              name: name,
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: 'wait_for_next_step',
                  findBy: findBy,
                  target: target,
                  note: 'verify ' + findBy + '=' + target
                },
                {
                  stepType: 'write',
                  findBy: findBy,
                  target: target,
                  text: commandObj.value,
                  note: "Write '" + findBy + '=' + target
                }
              ]
            }
            //}
          } else if (commandObj.command == 'sendKeys' && commandObj.value != '') {
            //const regex = /(?<=\{)(.*?)(?=\})/
            const regex = /\{(.*)\}/
            obj = {
              name: jsonSel.name + ' (send key) (' + commandObj.value + ')',
              failedExit: true,
              attachScreenshot: true,
              steps: [
                {
                  stepType: 'wait_for_next_step',
                  findBy: findBy,
                  target: target,
                  note: 'verify ' + findBy + '=' + target
                },
                {
                  stepType: 'write',
                  findBy: findBy,
                  target: target,
                  text: commandObj.value.match(regex)[1],
                  note: "Write '" + findBy + '=' + target
                }
              ]
            }
          }
          if (obj != null) {
            this.test.push(obj)
            this.commands.push(commandObj)
          }
        }
      }
      this.$emit('importTest', {
        tests: this.test,
        description: this.testDescription,
        name: this.testName,
        seleniumImport: this.commands
      })
    },
    notifyChange() {
      this.$emit('importTest', {
        description: this.testDescription,
        name: this.testName
      })
    },
    showUploadComponent() {
      this.showUpload = true
    }
  }
}
</script>
