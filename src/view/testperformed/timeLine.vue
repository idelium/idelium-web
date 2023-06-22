<template>
  <div class="timeline">
    <span @click="toggle" style="float: right; cursor: pointer"
      ><font-awesome-icon icon="expand-arrows-alt" @click="toggle"
    /></span>
    <v-stage :config="configKonva" v-if="showMe == true">
      <v-layer
        @mouseDown="eventShowImage"
        @mouseenter="handleMouseEnter"
        @mouseout="handleMouseOut"
      >
        <v-rect v-for="item in rectangles" :key="item.id" :config="item" />
        <v-line v-for="item in lines" :key="item.id" :config="item" />
        <v-text v-for="item in texts" :key="item.id" :config="item" />
      </v-layer>
    </v-stage>
  </div>
</template>
<style scoped>
.timeline {
  display: inline-block;
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  max-height: 35vh;
}
</style>
<script>
let TIME_LINE_WIDTH = 40
let RECT_HEIGHT = 20
let RECT_WIDTH = 50
let MARGIN_RECT = 6
export default {
  props: {
    steps: Array
  },
  data() {
    return {
      configKonva: {
        width: 200,
        height: 200
      },
      arrayExecTimeStep: [],
      ratio: 0,
      rectangles: [],
      texts: [],
      lines: [],
      fullscreen: false,
      showMe: true
    }
  },
  created() {},
  methods: {
    toggle() {
      this.fullscreen = !this.fullscreen
    },
    vw(v) {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      return (v * w) / 100
    },
    handleMouseEnter(e) {
      let index = parseInt(e.target.attrs.id)
      if (this.steps[index].status == 2) {
        const stage = e.target.getStage()
        stage.container().style.cursor = 'pointer'
      }
    },
    handleMouseOut(e) {
      let index = parseInt(e.target.attrs.id)
      if (this.steps[index].status == 2) {
        const stage = e.target.getStage()
        stage.container().style.cursor = 'default'
      }
    },
    eventShowImage(e) {
      console.log(e)
      let index = parseInt(e.target.attrs.id)
      if (this.steps[index].status == 2) this.$emit('showImage', index)
    },
    calc() {
      this.rectangles = []
      this.arrayExecTimeStep = []
      this.ratio = 0
      this.texts = []
      this.lines = []
      let startTime = Date.parse(this.steps[0].created_at) / 1000
      let endTime = Date.parse(this.steps[this.steps.length - 1].updated_at) / 1000
      let elapsed = endTime - startTime
      let ratio = this.vw(TIME_LINE_WIDTH) / elapsed
      this.configKonva.width = this.vw(TIME_LINE_WIDTH) + RECT_WIDTH
      this.configKonva.height = (RECT_HEIGHT + 5) * (this.steps.length + 1)
      console.log(this.configKonva)
      for (let i in this.steps) {
        let start = Date.parse(this.steps[i].created_at) / 1000
        let end = Date.parse(this.steps[i].updated_at) / 1000
        let fill = 'green'
        if (this.steps[i].status == 2) {
          fill = 'red'
        }
        var rect = {
          x: (start - startTime) * ratio,
          y: i * (RECT_HEIGHT + MARGIN_RECT),
          width: RECT_WIDTH,
          height: RECT_HEIGHT,
          scaleX: 1,
          scaleY: 1,
          draggable: false,
          strokeScaleEnabled: false,
          stroke: 'black',
          fill: fill,
          time: end - startTime,
          id: i
        }
        var text = {
          x: (start - startTime) * ratio,
          y: i * (RECT_HEIGHT + MARGIN_RECT),
          fontFamily: 'Calibri',
          fontSize: 15,
          text: end - startTime + 's',
          fill: 'white',
          width: RECT_WIDTH,
          padding: 5,
          align: 'center',
          id: i
        }
        if (i < this.steps.length - 1) {
          console.log(i)
          let startNext = Date.parse(this.steps[parseInt(i) + 1].created_at) / 1000
          let line = {
            x: (start - startTime) * ratio + RECT_WIDTH,
            y: i * (RECT_HEIGHT + MARGIN_RECT) + MARGIN_RECT + 2,
            points: [0, 0, (startNext - start) * ratio - RECT_WIDTH / 2, 0],
            closed: true,
            stroke: 'white',
            id: i
          }
          let line2 = {
            x: (startNext - startTime) * ratio + RECT_WIDTH / 2,
            y: i * (RECT_HEIGHT + MARGIN_RECT) + MARGIN_RECT + 2,
            points: [0, 0, 0, RECT_HEIGHT - 1],
            closed: true,
            stroke: 'white',
            id: i
          }
          let arrow = {
            x: (startNext - startTime) * ratio + RECT_WIDTH / 2,
            y: i * (RECT_HEIGHT + MARGIN_RECT) + MARGIN_RECT + 2,
            points: [-3, RECT_HEIGHT - 6, 3, RECT_HEIGHT - 6, 0, RECT_HEIGHT - 1],
            closed: true,
            stroke: 'white',
            fill: 'white',
            id: i
          }
          this.lines.push(line)
          this.lines.push(line2)
          this.lines.push(arrow)
        }

        this.rectangles.push(rect)
        this.texts.push(text)
      }
      setTimeout(
        function () {
          this.showMe = true
        }.bind(this),
        100
      )
      console.log(this.rectangles)
    }
  }
}
</script>
