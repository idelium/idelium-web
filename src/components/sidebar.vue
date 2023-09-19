<template>
  <div class="border-right info costum sidebar" id="sidebar-wrapper" ref="sidebarWrapper">
    <div class="sidebar-heading">Menu</div>
    <hr />
    <div class="list-group">
      <div
        v-for="(item, index) in menu"
        v-bind:key="index"
        :class="
          'list-group-item ' +
          ($router.currentRoute.value.fullPath == '/' + item.link ? 'active' : '')
        "
        v-on:click="go(item.link, item.isActiveEmptyDb)"
        style="margin-top: 10px"
      >
        <font-awesome-icon :icon="item.icon" :class="'iconClass ' + item.class" />
        <span v-if="showLabel" class="itemSidebar">{{
          language[config.currentLanguage].Sidebar[item.name]
        }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.sidebar {
  background-color: rgb(14, 14, 14);
}
.list-group-item {
  border: 0px;
  border-color: #f8f9fa !important;
  background: unset !important;
}

.list-group-item.active {
  z-index: 2;
  color: black !important;
  background-color: rgb(255, 255, 255)!important;
  border-color: rgb(82, 82, 82);
}
.iconClass {
  margin-right: 10px;
}
@media only screen and (max-width: 600px) {
  .info {
    visibility: collapse;
  }
}
.itemSidebar {
  position: absolute;
  left: 55px;
  text-transform: uppercase;
  cursor: pointer;
  font-size: 10px !important;
}
</style>

<script>
import axios from 'axios'

export default {
  watch: {
    $route() {
      this.$forceUpdate()
    }
  },
  created() {
    this.getSidebar()
    this.emitter.on('showIcon', () => {
      if (this.showLabel == true) {
        this.showLabel = false
      } else {
        this.showLabel = true
      }
    })
    this.emitter.on('refreshSideBar', () => {
      this.$forceUpdate()
    })
  },
  methods: {
    go(link, active) {
      if (localStorage.projectIdSelected != undefined || active == true)
        this.$router.push({ path: '/' + link })
      else {
        alert('Please insert your first project')
        this.$router.push({ path: '/projects' })
      }
    },
    getSidebar() {
      this.emitter.emit('showLoader', true)
      axios
        .get(this.config.serviceBaseUrl + this.config.url.sidebar, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)

          this.menu = response.data
        })
        .catch((e) => {
          this.$router.push({ name: 'Login' })
          this.error = e
        })
    }
  },
  data() {
    return {
      showLabel: true,
      styleIcon: '',
      menu: []
    }
  }
}
</script>
