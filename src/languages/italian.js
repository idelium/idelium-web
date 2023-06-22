export default {
  Loader: {
    waitMessage: 'Caricamento in corso....'
  },
  Sidebar: {
    account: 'account',
    costumers: 'clienti',
    projects: 'progetti',
    environments: 'ambienti',
    plugins: 'plugins',
    steps: 'steps',
    tests: 'tests',
    testcycles: 'Cicli di test',
    testsperformed: 'test eseguiti',
    apikey: 'Api Key',
    testlauncher: 'Test Launcher',
    platforms: 'Piattaforme'
  },
  Header: {
    costumer: 'Cliente',
    project: 'Progetto',
    logOut: 'Esci',
    language: 'Lingua',
    profile: 'Profilo',
    btnChangeCostumer: 'Cambia cliente',
    confirmLogout: 'Vuoi finire la sessione ?',
    languages: {
      it: 'italiano',
      gb: 'inglese'
    }
  },
  Login: {
    btnLogin: 'Entra',
    placePassword: 'password',
    placeUsername: 'email',
    info: 'utilizza come nome utente la tua email',
    welcome: 'Benvenuto!',
    welcomeMessage:
      'Accedi per gestire il tuo account e utilizza il più potente strumento per i test automatici. Ora è un ottimo momento per migliorare la qualità del tuo software, quindi facciamolo!',
    title: 'delium',
    errorMail: 'La mail è vuota',
    isNotEmail: 'Non è un indirizzo email',
    errorPassword: 'La password è vuota',
    errorCredential: 'Accesso negato, verifica le tue credenziali'
  },
  Logout: {},
  Environments: {
    tabOrderEnvironments: 'Ordinamento Ambienti',
    tabNewEnvironment: 'Nuovo Ambiente',
    placeholderDescriptionEnvironment: 'Descrizione Ambiente',
    placeholderFileName: 'Codice',
    btnSaveEnvironment: 'Aggiungi Environment',
    errorMessageInputEmpty: 'Attenzione! I campi non possono essere vuoti',
    confirmationDelete: 'Sei sicuro di voler cancellare il file: ',
    titleErrorModal: 'Attenzione',
    errorCharactersError: 'Attenzione! Il nome dei file contengono caratteri speciali',
    btnCancel: 'annulla',
    btnSave: 'Salva',
    btnDelete: 'Elimina',
    btnDuplicate: 'Duplica',
    code: 'codice',
    description: 'descrizione',
    id: '#',
    mandatory: 'obbligatorio',
    addVariable: 'aggiungi variable',
    name: 'nome',
    value: 'valore',
    someValuesAreMandatory: 'Si prega di compilare i campi obbligatori',
    someVariableValuesAreEmpty: 'Alcuni valori di variabile sono vuoti'
  },
  Steps: {
    tabOrderSteps: 'Ordinamento Steps',
    tabNewStep: 'Nuovo Step',
    placeholderDescriptionStep: 'Descrizione step',
    placeholderFileName: 'Nome file (senza estenzione)',
    btnSaveStep: 'Aggiungi Step',
    errorMessageInputEmpty: 'Attenzione! I campi non possono essere vuoti',
    confirmationDelete: 'Sei sicuro di voler cancellare il file: ',
    titleErrorModal: 'Attenzione',
    errorCharactersError: 'Attenzione! Il nome dei file contengono caratteri speciali',
    titleAlert: 'Attenzione',
    btnCancel: 'Annulla',
    btnSave: 'Salva',
    btnSaveOrder: 'Salva posizione',
    btnDelete: 'Elimina',
    btnDuplicate: 'Duplica',
    colId: 'id',
    colName: 'nome',
    colDescription: 'descrizione',
    wizard: {
      wizardTitle: 'Step wizard',
      name: 'Nome',
      failedExit: 'Se fallisce esce:',
      attachScreenshot: 'Cattura immagine',
      addStep: 'Aggiungi Step',
      typeStepTitle: 'Step type',
      typeStepOrderTitle: 'Gestisci',
      importPostmanCollectionFile: 'Importa Postman Collection File (v2.1)',
      uploadPostmanCollection:
        "Carica il file collection di postman (aggiunge l'azione automaticamente)",
      uploadPostmanEnvironment: 'Carica il file environment di postman',
      uploadPostmanEnvironmentOverrite: '(sovrascrivi)',
      importPostman: {
        isNotCollectionFile: 'Is not a Postman Collection file'
      },
      step: {
        stepType: 'Tipo di step',
        xpath: 'xpath',
        params: 'Parametri',
        text: 'Testo',
        note: 'Note',
        keys: 'Chiave',
        addStepType: 'Aggiungi tipo',
        editStepType: 'Modifica tipo'
      }
    }
  },
  Plugins: {
    tabListPlugins: 'Plugins',
    tabNewPlugin: 'Nuovo Plugin',
    tabTitleImportPlugin: 'Importa Plugin',
    btnCancel: 'Annulla',
    titleAlert: 'Attenzione',
    btnSave: 'Salva',
    btnDelete: 'Elimina',
    confirmationDelete: 'Sei sicuro di voler cancellare il file: ',
    name: 'nome',
    description: 'descrizione',
    pluginImported: 'plugin importato',
    importPlugin: {
      extensionIsWrong: 'Estensione file non conforme',
      isNotAPluginFile: 'Non è un file Idelium',
      importPluginFile: 'Importa plugin di Idelium'
    }
  },
  Projects: {
    btnNewProject: 'nuovo progetto',
    id: '#',
    project: 'progetto',
    description: 'descrizione',
    titleAlert: 'Attenzione',
    btnCancel: 'annulla',
    btnDelete: 'elimina',
    btnModify: 'aggiorna',
    btnModalModifyProject: 'modifica progetto',
    btnAddProject: 'Aggiungi progetto',
    textDelete:
      'Attenzione, cancellando il progetto cancelli tutti i test e gli step ad esso associato. Vuoi continuare ?',
    titleAddModal: 'Aggiungi progetto',
    titleFirstAddModal: 'Aggiungi il tuo primo progetto',
    titleModifyModal: 'Modifica progetto'
  },
  Tests: {
    tabTitleModify: 'Modifica Test',
    tabTitleNewTest: 'Crea Test',
    tabTitleImportTest: 'Importa Selenium IDE',
    btnCreateTest: 'crea',
    btnModifyTest: 'Modifica',
    btnImportTest: 'Importa Test',
    btnCancel: 'Annulla',
    placeholderFilterStep: 'cerca test',
    placeholderNameTest: 'nome del test',
    placeholderDescriptionTest: 'descrizone del test',
    steps: 'Step disponibili',
    stepsToDo: 'Step Selezionati',
    selectTest: '-- seleziona un test --',
    selenium: {
      extensionIsWrong: 'Estensione file non conforme',
      isNotASeleniumFile: 'Non è un file Selenium',
      testName: 'Nome test',
      importSeleniumFile: 'Importa file di Selenium'
    }
  },
  TestLauncher: {
    id: '#',
    testcycle: 'Ciclo di test',
    description: 'descrizione',
    environment: 'Ambiente:',
    launchtest: ' Esegui il test',
    ModalListPlatform: {
      modalTitle: 'Piattaforme',
      launchtest: ' Esegui il test',
      colId: 'id',
      colHost: 'host',
      colLocation: 'località',
      colBrand: 'marca',
      colOs: 'so',
      colBrowser: 'browser',
      colStatus: 'stato',
      confirmationPlatform: 'Sei sicuro di voler eliminare la piattaforma ?',
      btnCancel: 'annulla',
      btnDelete: 'elimina',
      titleAlert: 'Elimina piattaforma',
      all: 'tutti'
    }
  },
  TestCycles: {
    tabTitleModify: 'Modifica  ciclo di test',
    tabTitleNewTestCycle: 'Crea  ciclo di test',
    btnCreateTestCycle: 'crea',
    btnModifyTestCycle: 'Modifica',
    placeholderFilterTest: 'cerca ciclo di test',
    placeholderNameTestCycle: 'nome del ciclo di test',
    placeholderDescriptionTestCycle: 'descrizone del ciclo di test',
    tests: 'Test disponibili',
    testsToDo: 'Test Selezionati',
    selectTestCycle: '-- seleziona un ciclo di test --',
    commandLineInfo: 'Linea di comando per questo ciclo di test:',
    commandLineCopy: 'command line copiato'
  },
  TestsPerformed: {
    columnTestCycle: 'Cicli di test',
    columnTestCycleDate: 'Cicli di test effettuati',
    columnTest: 'Test effettuati',
    stepId: '#',
    stepName: 'Nome step',
    stepStatus: 'Esito step',
    screenshots: 'Screenshots'
  },
  Apikey: {
    btnGenerateKey: 'Genera nuova chiave',
    placeholderKey: 'Api Key',
    info: 'La chiave da usare per idelium-cl, oppure scarica il file rinominalo .idelium e posizionalo nella tua home directory',
    title: 'La tua Idelium Key',
    keyCopy: 'chiave copiata',
    confirmGenerateMessage:
      'La generazione della nuova chiave comporta un aggiornamento anche dei parametri per idelium-cl, confermi ?',
    btnDownloadKey: 'scarica idelium-cli'
  },
  Profile: {
    title: 'Il mio profilo',
    name: 'nome',
    email: 'email',
    company: 'azienda',
    role: 'ruolo',
    password: 'password',
    confirmPassword: 'conferma password'
  },
  Accounts: {
    newAccount: 'Nuovo Account',
    id: '#',
    name: 'nome',
    account: 'account',
    role: 'ruolo',
    costumer: 'cliente',
    titleAlert: 'Attenzione',
    btnCancel: 'annulla',
    btnDelete: 'elimina',
    btnModify: 'modifica',
    confirmDeleteAccount: "Vuoi cancellare l'account ?",
    accountExist: "L'account già esiste",
    modal: {
      titleModal: 'Dettagli del account',
      modifyAccount: 'Modifica account',
      addAccount: 'Aggiungi Account'
    }
  },
  Costumers: {
    btnNewCostumer: 'nuovo cliente',
    id: '#',
    costumer: 'Cliente',
    description: 'descrizione',
    licenseExpiration: 'Scadenza licenza',
    apiKey: 'API Key',
    btnDelete: 'cancella',
    btnModify: 'aggiorna',
    btnModalModifyCostumer: 'modifica cliente',
    btnAddCostumer: 'Aggiungi cliente',
    textDelete:
      'Attenzione, cancellando il cliente cancelli tutti i dati ad esso associato. Vuoi continuare ?',
    titleAddModal: 'Aggiungi cliente',
    titleModifyModal: 'Modifica cliente',
    costumerIsDuplicated: 'il cliente già esiste',
    textCopy: 'chiave copiata'
  },
  TemplateTest: {
    permissionDenied: 'Oops! Permesso negato',
    btnOK: 'OK',
    btnNewTemplate: 'Nuovo ciclo di test',
    btnPublish: 'Pubblica',
    btnDelete: 'Elimina',
    btnCancel: 'Cancella',
    btnSave: 'Salva',
    btnOpen: 'Apri',
    btnClose: 'Chiudi',
    btnCreate: 'Crea',
    urlCopied: 'Il link è stato copiato',
    btnModify: 'Modifica',
    modalTemplate: {
      btnInsert: 'Salva',
      btnTest: 'Test if jira issues exist',
      btnAdd: '+',
      alertIssueEmpty: 'il campo issue non può essere vuoto',
      alertNameTemplateEmpty: 'il nome template non può essere vuoto',
      btnUpdate: 'Aggiorna',
      alertIssuesEmpty: 'Inserire almeno una issue',
      placeholderNameTemplate: 'Nome template',
      placeholderAddIssue: 'Aggiungi Issue',
      titleModal: 'Gestione template',
      alertIssueNotExists: 'Attenzione alcune issue non esistono su jira',
      alertIssueNotExist: "Attenzione l'issue non è stata trovata"
    },
    modalCreateCycle: {
      cycleCreated: 'Il ciclo di test è stato creato',
      selectTypeVersion: 'seleziona tipo di versione',
      selectVersion: 'seleziona versione',
      cycleName: 'nome versione',
      btnCreateCycle: 'Crea ciclo di test'
    }
  },
  Platforms: {
    platforms: 'Piattaforme',
    os: 'Sistemi Operativi',
    osVersion: 'Versione Os',
    browsers: 'Browser',
    browserVersion: 'Versione Browser',
    brands: 'Brands',
    models: 'Modelli',
    location: 'Località',
    btnSave: 'salva',
    ManagePlatform: {
      btnAddPlatform: 'Aggiungi piattaforma',
      colId: 'id',
      colHost: 'host',
      colLocation: 'località',
      colBrand: 'marca',
      colOs: 'so',
      colBrowser: 'browser',
      colStatus: 'stato',
      confirmationPlatform: 'Sei sicuro di voler eliminare la piattaforma ?',
      btnCancel: 'annulla',
      btnDelete: 'elimina',
      titleAlert: 'Elimina piattaforma',
      all: 'tutti',
      modalAddPlatform: {
        chooseType: '--- Seleziona ---',
        modalTitle: 'Aggiungi piattaforma',
        placeholderHost: 'ex: 10.10.10.10 o device.idelium.io',
        lblAddress: 'Indirizzo IP o nome host',
        lblLocation: 'Località',
        lblBrand: 'Marca',
        lblModel: 'Modello',
        lblType: 'Tipo',
        lblOs: 'Sistema Operativo',
        lblOsVersion: 'Versione SO',
        lblBrowser: 'Browser',
        lblBrowserVersion: 'Versione Browser',
        btnSaveNewPlatform: 'Salva nuova piattaforma'
      }
    },
    Os: {
      name: 'Inserisci il sistema operativo',
      id: 'id',
      colName: 'nome'
    },
    OsVersion: {
      name: 'Inserisci la versione del Sistema Operativo',
      id: 'id',
      colOs: 'Sistema Operativo',
      colVersion: 'Versione'
    },
    Browsers: {
      name: 'Inserisci il nome del brwoser',
      id: 'id',
      colOs: 'Sistema Operativo',
      colBrowser: 'Browser'
    },
    BrowserVersion: {
      name: 'Inserisci la versione del browser',
      id: 'id',
      colOs: 'Sistema Operativo',
      colBrowser: 'Browser',
      colBrowserVersion: 'Version Browser'
    },
    Brand: {
      name: 'Inserisci nuovo brand  (Apple, Samsung, Lg....)',
      id: 'id',
      colBrand: 'Marche'
    },
    ModelDevice: {
      name: 'Inserisci nuovo modello',
      id: 'id',
      colBrand: 'Marca',
      colModel: 'Model'
    },
    Location: {
      name: 'Inserisci nuova località',
      id: 'id',
      colLocation: 'Località'
    }
  }
}
