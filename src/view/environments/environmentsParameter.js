export default {
  webservice: [
    {
      typeName: 'base_url',
      default: '',
      mandatory: false,
      type: 'string',
      placeholder: 'https://www.example.com'
    }
  ],
  selenium: [
    {
      typeName: 'base_url',
      default: '',
      mandatory: false,
      type: 'string',
      placeholder: 'https://www.example.com'
    },
    {
      typeName: 'url',
      default: '',
      mandatory: false,
      type: 'string',
      placeholder: 'https://www.example.com/en/blog'
    },
    {
      typeName: 'xpath_check_url',
      default: '',
      mandatory: false,
      type: 'string',
      placeholder: ''
    },
    {
      typeName: 'userAgent',
      default: '',
      mandatory: false,
      type: 'string',
      placeholder: ''
    },
    {
      typeName: 'browser',
      mandatory: false,
      type: 'options',
      default: 'chrome',
      options: ['chrome', 'firefox', 'iexplorer', 'edge', 'safari', 'opera']
    },
    {
      typeName: 'device',
      mandatory: false,
      type: 'string',
      placeholder: ''
    },
    {
      typeName: 'deviceType',
      mandatory: false,
      type: 'string',
      placeholder: ''
    },
    {
      typeName: 'accept_self_certificate',
      mandatory: false,
      type: 'boolean',
      default: false,
      placeholder: ''
    }
  ],
  appium: [
    {
      typeName: 'os',
      type: 'options',
      default: 'android',
      mandatory: true,
      options: ['android', 'ios', 'windows']
    },
    {
      typeName: 'appiumServer',
      type: 'string',
      mandatory: true,
      default: 'http://localhost:4723/wd/hub',
      placeholder: 'for ex: http://localhost:4723/wd/hub'
    },
    {
      typeName: 'isRealDevice',
      type: 'boolean',
      default: false,
      mandatory: false
    },
    {
      typeName: 'uiautomator2ServerInstallTimeout',
      mandatory: true,
      type: 'int',
      default: 100000
    },
    {
      typeName: 'androidInstallTimeout',
      type: 'int',
      mandatory: true,
      default: 100000
    },
    {
      typeName: 'platformName',
      type: 'options',
      default: 'android',
      mandatory: true,
      options: ['android', 'ios']
    },
    {
      typeName: 'platformVersion',
      type: 'string',
      mandatory: true,
      default: '',
      placeholder: 'for example 8.1'
    },
    {
      typeName: 'deviceName',
      type: 'string',
      mandatory: true,
      default: '',
      placeholder: 'put a string for describe the device'
    },
    {
      typeName: 'appPackage',
      type: 'string',
      mandatory: true,
      default: '',
      placeholder: 'put a string for describe the device'
    },
    {
      typeName: 'app',
      type: 'string',
      mandatory: true,
      default: '',
      placeholder: '/your_build_path/example.(apk or ipa)'
    }
  ]
}
