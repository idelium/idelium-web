export default {
  Loader: {
    waitMessage: 'Loading....'
  },
  Sidebar: {
    account: 'accounts',
    costumers: 'costumers',
    projects: 'projects',
    environments: 'environments',
    plugins: 'plugins',
    steps: 'steps',
    tests: 'tests',
    testcycles: 'Test cycles',
    testsperformed: 'Test Performed',
    apikey: 'Api Key',
    testlauncher: 'Test Launcher',
    platforms: 'Platforms'
  },
  Header: {
    costumer: 'Costumer',
    project: 'Project',
    logOut: 'Log Out',
    language: 'Language',
    profile: 'Profile',
    btnChangeCostumer: 'Switch costumer',
    confirmLogout: 'Do you want to logout ?',
    languages: {
      gb: 'English',
      it: 'Italian'
    }
  },
  Login: {
    btnLogin: 'enter',
    placePassword: 'password',
    placeUsername: 'email',
    info: 'Sign into your account',
    welcome: 'Welcome!',
    welcomeMessage:
      "Log in to manage your account and get access to the most powerful tool for automation test. Now's a great time to improve the quality of your software, so let's do this!",
    title: 'delium',
    errorMail: 'The email is empty',
    isNotEmail: 'Is not a validate email',
    errorPassword: 'The password is empty',
    errorCredential: 'Access denied, check your credentials'
  },
  Logout: {},
  Environments: {
    tabOrderEnvironments: 'Sorting Environments',
    tabNewEnvironment: 'New Environment',
    placeholderDescriptionEnvironment: 'Environment Description',
    placeholderFileName: 'Code',
    btnSaveEnvironment: 'Add Environment',
    errorMessageInputEmpty: 'Attention! Fields cannot be empty',
    confirmationDelete: 'Are you sure you want to delete the file: ',
    titleErrorModal: 'Attention',
    errorCharactersError: 'Attention! The filenames contain special characters',
    btnCancel: 'cancel',
    btnSave: 'save',
    btnDelete: 'delete',
    btnDuplicate: 'Duplicate',
    code: 'code',
    description: 'description',
    id: '#',
    mandatory: 'mandatory',
    addVariable: 'add variable',
    name: 'name',
    value: 'value',
    someValuesAreMandatory: 'Please fill the mandatory fields',
    someVariableValuesAreEmpty: 'Some variable values are empty'
  },
  Steps: {
    tabOrderSteps: 'Ordering Steps',
    tabNewStep: 'New Step',
    placeholderDescriptionStep: 'step description',
    placeholderFileName: 'File name (without extension)',
    btnSaveStep: 'Save Step',
    errorMessageInputEmpty: 'Attention! Fields cannot be empty',
    confirmationDelete: 'Are you sure you want to delete the file: ',
    titleErrorModal: 'Attention',
    errorCharactersError: 'Attention! The filenames contain special characters',
    titleAlert: 'Attention',
    btnCancel: 'cancel',
    btnSave: 'save',
    btnSaveOrder: 'save order',
    btnDelete: 'delete',
    btnDuplicate: 'duplicate',
    colId: 'id',
    colName: 'name',
    colDescription: 'description',
    wizard: {
      wizardTitle: 'Step wizard',
      name: 'name',
      failedExit: 'Exits if it fails:',
      attachScreenshot: 'Capture Image',
      addStep: 'Add Step',
      typeStepTitle: 'Step type',
      typeStepOrderTitle: 'Manage',
      importPostmanCollectionFile: 'Import Postman Collection File (v2.1)',
      uploadPostmanCollection: 'Upload postman collection file (automatically add action)',
      uploadPostmanEnvironment: 'Upload postman environment file',
      uploadPostmanEnvironmentOverrite: '(overrite)',
      importPostman: {
        isNotCollectionFile: 'Is not a Postman Collection file'
      },
      step: {
        stepType: 'Step type',
        xpath: 'xpath',
        params: 'Parameters',
        text: 'Text',
        note: 'Note',
        keys: 'Key',
        addStepType: 'Add',
        editStepType: 'Edit'
      }
    }
  },
  Plugins: {
    tabListPlugins: 'Plugins',
    tabNewPlugin: 'New Plugin',
    tabTitleImportPlugin: 'Import Plugin',
    btnCancel: 'Cancel',
    titleAlert: 'Attention',
    btnSave: 'Save',
    btnDelete: 'Delete',
    confirmationDelete: 'Are you sure you want to delete the file: ',
    name: 'name',
    description: 'description',
    pluginImported: 'plugin imported',
    importPlugin: {
      extensionIsWrong: 'Extension is wrong',
      isNotAPluginFile: 'Is not a Idelium Plugin file',
      importPluginFile: 'Import Idelium plugin file'
    }
  },
  Projects: {
    btnNewProject: 'new project',
    id: '#',
    project: 'project',
    description: 'description',
    titleAlert: 'Attenzione',
    btnCancel: 'cancel',
    btnDelete: 'delete',
    btnModify: 'update',
    btnModalModifyProject: 'modify project',
    btnAddProject: 'Add progetto',
    textDelete:
      'Attention, by deleting the project you delete all the tests and the steps associated with it. Do you want to continue ?',
    titleAddModal: 'Add project',
    titleModifyModal: 'Modify project',
    titleFirstAddModal: 'Add your firstproject'
  },
  Tests: {
    tabTitleModify: 'Modify Test',
    tabTitleNewTest: 'Create Test',
    tabTitleImportTest: 'Import Selenium IDE',
    btnCreateTest: 'Create',
    btnModifyTest: 'Modify',
    btnImportTest: 'Import Test',
    btnCancel: 'Cancel',
    placeholderFilterStep: 'search test',
    placeholderNameTest: ' test',
    placeholderDescriptionTest: 'descrizone del test',
    steps: 'Steps available',
    stepsToDo: 'Selected Step',
    selectTest: '-- select a test --',
    selenium: {
      extensionIsWrong: 'Extension is wrong',
      isNotASeleniumFile: 'Is not a Selenium ide file',
      testName: 'Test name',
      importSeleniumFile: 'Import Selenium file'
    }
  },
  TestLauncher: {
    id: '#',
    testcycle: 'Test Cycle',
    description: 'description',
    environment: 'Environment:',
    launchtest: ' Launch Test',
    ModalListPlatform: {
      modalTitle: 'List platform',
      launchtest: ' Launch Test',
      colId: 'id',
      colHost: 'host',
      colLocation: 'location',
      colBrand: 'brand',
      colOs: 'os',
      colBrowser: 'browser',
      colStatus: 'status',
      confirmationPlatform: 'Are you sure you want to delete the platform ?',
      btnCancel: 'cancel',
      btnDelete: 'delete',
      titleAlert: 'Delete platform',
      all: 'all'
    }
  },
  TestCycles: {
    tabTitleModify: 'Modify  test cycle',
    tabTitleNewTestCycle: 'Create  test cycle',
    btnCreateTestCycle: 'Create',
    btnModifyTestCycle: 'Modify',
    placeholderFilterTest: 'search test cycle',
    placeholderNameTestCycle: ' test cycle',
    placeholderDescriptionTestCycle: 'Test Cycle Description',
    tests: 'Tests available',
    testsToDo: 'Selected Tests',
    selectTestCycle: '-- select a test cycle --',
    commandLineInfo: 'Command line for run this testcycle:',
    commandLineCopy: 'command line is copied to clipboard'
  },
  TestsPerformed: {
    columnTestCycle: 'Test cycles',
    columnTestCycleDate: 'Test cycles performed',
    columnTest: 'Tests carried out',
    stepId: '#',
    stepName: 'Name step',
    stepStatus: 'Step outcome',
    screenshots: 'Screenshots'
  },
  Apikey: {
    btnGenerateKey: 'Generate new Key',
    placeholderKey: 'Api Key',
    info: 'The key to use for idelium-cl or download the file rename it .idelium and place it in your home directory',
    title: 'Your Idelium Key',
    keyCopy: 'key copy on clipboard',
    confirmGenerateMessage:
      'The generation of the new key also involves an update of the parameters for idelium-cl, confirm?',
    btnDownloadKey: 'download idelium-cli'
  },
  Profile: {
    title: 'My profile',
    name: 'name',
    email: 'email',
    company: 'company',
    role: 'role',
    password: 'password',
    confirmPassword: 'confirm password'
  },
  Accounts: {
    newAccount: 'Nuovo Account',
    id: '#',
    name: 'name',
    account: 'account',
    role: 'role',
    costumer: 'costumer',
    titleAlert: 'attention',
    btnCancel: 'cancel',
    btnDelete: 'delete',
    btnModify: 'modify',
    confirmDeleteAccount: 'Do you want to delete this account ?',
    accountExist: 'Account exist',
    modal: {
      titleModal: 'Account details',
      modifyAccount: 'Modify account',
      addAccount: 'Add account'
    }
  },
  Costumers: {
    btnNewCostumer: 'new costumer',
    id: '#',
    costumer: 'costumer',
    description: 'description',
    licenseExpiration: 'Expired License',
    apiKey: 'API Key',
    btnDelete: 'delete',
    btnModify: 'update',
    btnModalModifyCostumer: 'modify costumer',
    btnAddCostumer: 'add cliente',
    textDelete:
      'Attention, deleting the customer deletes all the data associated with it. Do you want to continue ?',
    titleAddModal: 'add costumer',
    titleModifyModal: 'Modify costumer',
    costumerIsDuplicated: 'the customer already exists',
    textCopy: 'key copied'
  },
  TemplateTest: {
    permissionDenied: 'Oops! Permission denied',
    btnOK: 'OK',
    btnNewTemplate: 'New test cycle',
    btnPublish: 'Publish',
    btnDelete: 'Elimina',
    btnCancel: 'Cancella',
    btnSave: 'Salva',
    btnOpen: 'Apri',
    btnClose: 'Chiudi',
    btnCreatete: 'Create',
    urlCopied: 'Il link è stato copiato',
    btnModify: 'Modify',
    modalTemplate: {
      btnInsert: 'Salva',
      btnTest: 'Test if jira issues exist',
      btnAdd: '+',
      alertIssueEmpty: 'il campo issue non può essere vuoto',
      alertNameTemplateEmpty: 'il name template non può essere vuoto',
      btnUpdate: 'Aggiorna',
      alertIssuesEmpty: 'Inserire almeno una issue',
      placeholderNameTemplate: 'Nome template',
      placeholderAddIssue: 'Aggiungi Issue',
      titleModal: 'Gestione template',
      alertIssueNotExists: 'Attenzione alcune issue non esistono su jira',
      alertIssueNotExist: "Attenzione l'issue non è stata trovata"
    },
    modalCreateteCycle: {
      cycleCreateted: 'Il test cycle è stato Createto',
      selectTypeVersion: 'seleziona tipo di versione',
      selectVersion: 'seleziona versione',
      cycleName: 'Cycle name',
      btnCreateteCycle: 'Create test cycle'
    }
  },
  Platforms: {
    platforms: 'Platforms',
    os: 'Operative Systems',
    osVersion: 'OS Version',
    browsers: 'Browsers',
    browserVersion: 'Browser Version',
    brands: 'Brands',
    models: 'Models',
    locations: 'Locations',
    btnSave: 'save',
    ManagePlatform: {
      btnAddPlatform: 'Add platform',
      colId: 'id',
      colHost: 'host',
      colLocation: 'location',
      colBrand: 'brand',
      colOs: 'os',
      colBrowser: 'browser',
      colStatus: 'status',
      confirmationPlatform: 'Are you sure you want to delete the platform ?',
      btnCancel: 'cancel',
      btnDelete: 'delete',
      titleAlert: 'Delete platform',
      all: 'all',
      modalAddPlatform: {
        chooseType: '--- select a type ---',
        placeholderHost: 'ex: 10.10.10.10 or device.idelium.io',
        modalTitle: 'Add platform form',
        lblAddress: 'IP address or hostname',
        lblLocation: 'Location',
        lblBrand: 'Brand',
        lblModel: 'Model',
        lblType: 'Type',
        lblOs: 'Operative System',
        lblOsVersion: 'OS Version',
        lblBrowser: 'Browser',
        lblBrowserVersion: 'Browser Version',
        btnSaveNewPlatform: 'Save new platform'
      }
    },
    Os: {
      name: 'Insert the name of Operative System',
      id: 'id',
      colName: 'name'
    },
    OsVersion: {
      name: 'Insert the version of Operative System',
      id: 'id',
      colOs: 'Operative System',
      colVersion: 'Version'
    },
    Browsers: {
      name: 'Insert the browsers',
      id: 'id',
      colOs: 'Operative System',
      colBrowser: 'Browser'
    },
    BrowserVersion: {
      name: 'Insert the browser version',
      id: 'id',
      colOs: 'Operative System',
      colBrowser: 'Browser',
      colBrowserVersion: 'Browser Version'
    },
    Brand: {
      name: 'Insert new brand (Apple, Samsung, Lg....)',
      id: 'id',
      colBrand: 'Brand'
    },
    ModelDevice: {
      name: 'Inserisci nuovo modello',
      id: 'id',
      colBrand: 'Brand',
      colModel: 'Model'
    },
    Location: {
      name: 'Insert new location',
      id: 'id',
      colLocation: 'Location'
    }
  }
}
