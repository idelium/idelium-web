import apiClient from '@/services/apiClient'
export default {
  getPlatforms(obj, type) {
    return apiClient.get(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/manageplatforms/' + type,
      {
        headers: obj.setHeaders()
      }
    )
  },
  savePlatform(obj, payload) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/manageplatforms',
      payload,
      {
        headers: obj.setHeaders()
      }
    )
  },
  updateStatusPlatform(obj, id, type, status) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/manageplatforms',
      {
        id: id,
        type: type,
        status: status
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  deletePlatform(obj, id, type) {
    return apiClient.delete(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/manageplatforms/' + type + '/' + id,
      {
        headers: obj.setHeaders()
      }
    )
  },
  getTypes(obj) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/types', {
      headers: obj.setHeaders()
    })
  },
  getStatus(obj) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/status', {
      headers: obj.setHeaders()
    })
  },
  getOs(obj, type) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/os/' + type, {
      headers: obj.setHeaders()
    })
  },
  saveOs(obj, name, type) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/os',
      {
        name: name,
        type: type
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyOs(obj, name, id, type) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/os',
      {
        name: name,
        id: id,
        type: type
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getOsVersion(obj, idOs) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/osversion/' + idOs, {
      headers: obj.setHeaders()
    })
  },
  saveOsVersion(obj, version, idOs) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/osversion',
      {
        version: version,
        idOs: idOs
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyOsVersion(obj, version, id, idOs) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/osversion',
      {
        version: version,
        id: id,
        idOs: idOs
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getBrowser(obj, idOs) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/browsers/' + idOs, {
      headers: obj.setHeaders()
    })
  },
  saveBrowser(obj, name, idOs) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/browsers',
      {
        name: name,
        idOs: idOs
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyBrowser(obj, name, id, idOs) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/browsers',
      {
        name: name,
        id: id,
        idOs: idOs
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getBrowserVersion(obj, idBrowser) {
    return apiClient.get(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/browserversions/' + idBrowser,
      {
        headers: obj.setHeaders()
      }
    )
  },
  saveBrowserVersion(obj, version, idBrowser) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/browserversions',
      {
        version: version,
        idBrowser: idBrowser
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyBrowserVersion(obj, version, id, idBrowser) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/browserversions',
      {
        version: version,
        id: id,
        idBrowser: idBrowser
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getBrand(obj) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/brands', {
      headers: obj.setHeaders()
    })
  },
  saveBrand(obj, brand) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/brands',
      {
        brand: brand
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyBrand(obj, brand, id) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/brands',
      {
        brand: brand,
        id: id
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getModelDevice(obj, idBrand) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/models/' + idBrand, {
      headers: obj.setHeaders()
    })
  },
  saveModelDevice(obj, model, idBrand) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/models',
      {
        model: model,
        idBrand: idBrand
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyModelDevice(obj, model, id, idBrand) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/models',
      {
        model: model,
        id: id,
        idBrand: idBrand
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  getLocation(obj) {
    return apiClient.get(obj.config.serviceBaseUrl + obj.config.url.platforms + '/locations', {
      headers: obj.setHeaders()
    })
  },
  saveLocation(obj, name) {
    return apiClient.post(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/locations',
      {
        name: name
      },
      {
        headers: obj.setHeaders()
      }
    )
  },
  modifyLocation(obj, name, id) {
    return apiClient.put(
      obj.config.serviceBaseUrl + obj.config.url.platforms + '/locations',
      {
        name: name,
        id: id
      },
      {
        headers: obj.setHeaders()
      }
    )
  }
}
