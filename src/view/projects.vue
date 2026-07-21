<template>
  <div class="costum">
    <div class="row">
      <div class="col-sm-11">
        <button
          type="button"
          size="sm"
          class="btn btn-primary"
          style="margin-bottom: 5px; float: right"
          v-on:click="showModal(null, 'new')"
        >
          {{ language[config.currentLanguage].Projects.btnNewProject }}
        </button>
      </div>
      <div class="col-sm-1" />
    </div>
    <div class="row">
      <div class="col-sm-1" />
      <div class="col">
        <table width="50%" class="table table-striped costum">
          <thead>
            <tr>
              <th scope="col">
                {{ language[config.currentLanguage].Projects.id }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Projects.project }}
              </th>
              <th scope="col">
                {{ language[config.currentLanguage].Projects.description }}
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(project, index) in arrayProjects" v-bind:key="index">
              <td>
                {{ project.id }}
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ project.name }}
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-link btn-sm"
                  v-on:click="showModal(index, 'modify')"
                >
                  {{ project.description }}
                </button>
              </td>
              <td>
                <span
                  class="idelium-action-icon--delete"
                  :disabled="project.username == 'admin'"
                  v-on:click="deleteProject(project.id)"
                  :title="language[config.currentLanguage].Actions.delete"
                  role="button"
                  style="cursor: pointer"
                  ><font-awesome-icon
                    icon="trash"
                    class="idelium-action-icon idelium-action-icon--delete"
                /></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-1" />
    </div>
    <modalModifyProject
      ref="modifyModal"
      :arrayProjects="arrayProjects"
      v-on:updateData="updateData"
    />
  </div>
</template>
<script>
import apiClient from '@/services/apiClient'
import modalModifyProject from './project/modalModifyProject.vue'

export default {
  name: 'ProjectsComponent',
  created() {
    this.getProjects()
    this.$gtag.event('idelium-builder', { method: 'project' })
    this.emitter.on('refreshProject', (msg) => {
      if (msg == true) this.getProjects(true)
      else this.$forceUpdate()
    })
  },
  watch: {
    $route() {
      this.$gtag.event('idelium-builder', { method: 'project' })
      this.getProjects()
      this.$forceUpdate()
    }
  },
  data() {
    return {
      newproject: null,
      arrayProjects: [],
      idSelected: null,
      projectToModify: null
    }
  },
  methods: {
    modify(id, name) {
      this.idSelected = id
      this.projectToModify = name
    },

    deleteProject(id) {
      return this.$showConfirm({
        message: this.language[this.config.currentLanguage].Projects.textDelete,
        variant: 'warning'
      }).then((confirmed) => {
        if (confirmed) this.deleteAction(id)
      })
    },
    deleteAction(id) {
      apiClient
        .delete(this.config.serviceBaseUrl + this.config.url.projects + '/' + id, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.arrayProjects = response.data
          if (this.arrayProjects.length == 0) {
            this.showModal(null, 'new')
          }
          this.emitter.emit('showLoader', false)
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    getCostumers() {
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.costumers, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          if (response.data.length == 0) {
            this.showModal(null, 'new')
          }
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },

    getProjects(isAutomaticLoad = false) {
      this.emitter.emit('showLoader', true)
      apiClient
        .get(this.config.serviceBaseUrl + this.config.url.projects, {
          headers: this.setHeaders()
        })
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayProjects = response.data
          if (this.arrayProjects.length == 0) {
            this.getCostumers()
          } else {
            if (isAutomaticLoad == false) this.emitter.emit('updateListProject', this.arrayProjects)
          }
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    insertProject(data) {
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.projects,
          {
            name: data.name,
            description: data.description
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayProjects = response.data
          this.emitter.emit('updateListProject', this.arrayProjects)
        })
        .catch((e) => {
          this.Logout(this, e)
          this.error = e
        })
    },
    updateProject(data) {
      this.emitter.emit('showLoader', true)
      apiClient
        .put(
          this.config.serviceBaseUrl + this.config.url.projects + '/' + data.id,
          {
            name: data.name,
            description: data.description
          },
          {
            headers: this.setHeaders()
          }
        )
        .then((response) => {
          this.emitter.emit('showLoader', false)
          this.arrayProjects = response.data
          this.emitter.emit('updateListProject', this.arrayProjects)
        })
        .catch((e) => {
          this.emitter.emit('showLoader', false)
          this.Logout(this, e)
          this.error = e
        })
    },
    showModal(index, type) {
      if (type == 'new') {
        this.$refs.modifyModal.showModal(null, type)
      } else {
        this.$refs.modifyModal.showModal(this.arrayProjects[index], type)
      }
    },
    updateData(data) {
      if (data.type == 'new') {
        this.insertProject(data)
      } else {
        this.updateProject(data)
      }
    }
  },
  components: {
    modalModifyProject
  }
}
</script>
