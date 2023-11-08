<template>
  <div class="row" style="margin-top: 10px">
    <div class="col-sm-2" />
    <div class="col">
      <div class="row my-1" v-for="(param, index) in parameters" v-bind:key="index">
        <div class="col-sm-2">
          <label for="input-small">{{ param.typeName }}:</label>
        </div>
        <div class="col-sm-6">
          <input
            class="form-control"
            v-model="values[index]"
            size="sm"
            :placeholder="param.placeholder"
            v-if="param.type == 'string'"
          />
          <input
            class="form-control"
            v-model="values[index]"
            size="sm"
            :placeholder="param.placeholder"
            v-if="param.type == 'int'"
            type="number"
          />
          <select v-model="values[index]" v-if="param.type == 'options'" class="form-control">
            <option v-for="(item, index2) in param.options" v-bind:key="index2" :value="item">
              {{ item }}
            </option>
          </select>
          <div class="form-check form-switch">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="values[index]"
              name="check-button"
              v-if="param.type == 'boolean'"
            />
          </div>
        </div>
        <div class="col">
          <span style="color: red" v-if="param.mandatory == true">{{
            language[config.currentLanguage].Environments.mandatory
          }}</span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-10">
          <button
            type="button"
            class="btn btn-success"
            size="sm"
            style="float: right"
            v-on:click="addVariable()"
          >
            {{ language[config.currentLanguage].Environments.addVariable }}
          </button>
        </div>
        <div class="col-sm-2" />
      </div>
      <div class="row my-1" v-for="(env, index) in environments" v-bind:key="index">
        <div class="col-sm-3">
          <input
            class="form-control"
            v-model="environments[index].name"
            size="sm"
            :placeholder="language[config.currentLanguage].Environments.name"
          />
        </div>
        <div class="col-sm-6">
          <input
            class="form-control"
            v-model="environments[index].value"
            size="sm"
            :placeholder="language[config.currentLanguage].Environments.value"
            :disabled="environments[index].name.length == 0"
          />
        </div>
        <div class="col">
          <span class="text-danger" v-on:click="deleteEnv(index)" style="cursor: pointer"
            ><font-awesome-icon icon="trash" style="font-size: 1rem"
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import param from './environmentsParameter'
export default {
  name: 'EnvironmentsComponent',
  components: {},
  props: {
    json: Object,
    environmentType: String
  },
  data() {
    return {
      parameters: null,
      values: [],
      environments: []
    }
  },
  watch: {
    environmentType() {
      this.setTypeEnvironment()
    },
    environments() {
      this.generateJson(true)
    },
    values() {
      this.generateJson(true)
    }
  },
  created() {
    this.setTypeEnvironment()
  },
  methods: {
    setTypeEnvironment() {
      console.log(this.environmentType)
      if (this.environmentType == 'web') {
        this.parameters = param.selenium
      } else if (this.environmentType == 'app') {
        this.parameters = param.appium
      } else if (this.environmentType == 'webservice') this.parameters = param.webservice
      this.values = []
      this.environments = []
      for (let i in this.parameters) {
        this.values.push(this.parameters[i].default)
      }
      this.generateJson(true)
    },
    addVariable() {
      this.environments.push({
        name: '',
        value: ''
      })
    },
    deleteEnv(index) {
      console.log('delete env:' + index)
      this.environments.splice(index, 1)
    },
    putJson(json) {
      console.log('putJson')
      console.log(json)
      this.values = []
      let keys = Object.keys(json)
      for (let i in keys) {
        console.log(keys[i])
        console.log(this.parameters.findIndex(({ typeName }) => typeName === keys[i]))
        console.log(json[keys[i]])
        this.values.push(json[keys[i]])
      }
    },
    generateJson(isAuto = null) {
      console.log('generate json' + isAuto)
      let jsonToSend = {}
      let subParameter = false
      let jsonSub = {}
      for (let i in this.parameters) {
        if (isAuto == false && this.parameters[i].mandatory == true && this.values[i].length == 0) {
          this.$bvModal.msgBoxOk(
            this.language[this.config.currentLanguage].Environments.someValuesAreMandatory,
            {
              okVariant: 'danger',
              size: 'sm',
              buttonSize: 'sm'
            }
          )
          return false
        }
        if (this.parameters[i].typeName == 'uiautomator2ServerInstallTimeout') subParameter = true
        if (subParameter == true) jsonSub[this.parameters[i].typeName] = this.values[i]
        else jsonToSend[this.parameters[i].typeName] = this.values[i]
      }
      if (subParameter == true) jsonToSend['appiumDesiredCaps'] = jsonSub
      for (let i in this.environments) {
        if (isAuto == false && this.environments[i].value.length == 0) {
          this.$bvModal.msgBoxOk(
            this.language[this.config.currentLanguage].Environments.someVariableValuesAreEmpty,
            {
              okVariant: 'danger',
              size: 'sm',
              buttonSize: 'sm'
            }
          )
          return false
        }
        jsonToSend[this.environments[i].name] = this.environments[i].value
      }
      if (isAuto == false) this.$emit('changeWizardJson', jsonToSend)
      console.log(jsonToSend)
    }
  }
}
</script>
