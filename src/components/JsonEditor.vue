<template>
  <div ref="jsoneditor"></div>
</template>
<style></style>

<script>
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'
import 'jsoneditor/dist/jsoneditor.min.css'
import _ from 'lodash'
export default {
  name: 'json-editor',
  data() {
    return {
      editor: null
    }
  },
  props: {
    json: {
      required: true
    },
    options: {
      type: Object,
      default: () => {
        return {}
      }
    },
    onChange: {
      type: Function
    },
    refName: null
  },
  watch: {
    json: {
      handler(newJson) {
        if (this.editor) {
          this.editor.set(newJson)
        }
      },
      deep: true
    }
  },
  methods: {
    _onChange(e) {
      console.log(e)
      if (this.onChange && this.editor) {
        this.onChange(this.editor.get(), this.refName)
      }
    }
  },
  mounted() {
    const container = this.$refs.jsoneditor
    const options = _.extend(
      {
        onChange: this._onChange
      },
      this.options
    )
    this.editor = new JSONEditor(container, options)
    this.editor.set(this.json)
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
      this.editor = null
    }
  }
}
</script>

<style></style>
