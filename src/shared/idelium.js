import axios from 'axios'

export default {
  getParameterByName: function (name, url) {
    console.log('parameter')
    if (!url) url = window.location.href
    name = name.replace(/[\[\]]/g, '\\$&')
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url)
    console.log('ok')
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  },
  getPathFromUrl: function (url) {
    return url.split(/[?#]/)[0]
  },
  convertdateDatePicker: function (objectDate) {
    console.log(objectDate.getDate())

    let day = objectDate.getDate()
    let year = objectDate.getFullYear()
    let month = objectDate.getMonth() + 1
    if (day < 10) day = '0' + day
    if (month < 10) month = '0' + month
    return year + '-' + month + '-' + day
  },
  mongo(url, method, path, payload) {
    return axios
      .post(url, {
        path: path,
        method: method,
        payload: payload
      })
      .then((response) => {
        return response.data
      })
      .catch((e) => {
        this.error = e
      })
  },
  jira(url, method, urlJira, payload) {
    return axios
      .post(url, {
        url: urlJira,
        method: method,
        payload: JSON.stringify(payload)
      })
      .then((response) => {
        return response.data
      })
      .catch((e) => {
        this.error = e
      })
  }
}
