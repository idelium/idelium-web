export default {
  Loader: {
    waitMessage: "Caricamento in corso....",
  },
  Dialog: {
    alertTitle: "Attenzione",
    cancel: "Annulla",
    confirm: "Conferma",
    confirmTitle: "Conferma azione",
    firstProjectRequired:
      "Crea o seleziona il primo progetto prima di aprire questa sezione.",
    helpSignIn: "Hai bisogno di aiuto per accedere? Contatta l'amministratore.",
    ok: "OK",
    operationFailed: "L'operazione non può essere completata. Riprova.",
  },
  Actions: {
    copy: "Copia",
    delete: "Elimina",
    download: "Scarica",
    duplicate: "Duplica",
    edit: "Modifica",
    expand: "Espandi",
    launch: "Avvia",
    refresh: "Aggiorna",
    remove: "Rimuovi",
    showPassword: "Mostra password",
    hidePassword: "Nascondi password",
    toggleSidebar: "Apri o chiudi menu",
    userMenu: "Menu utente",
  },
  Sidebar: {
    account: "account",
    costumers: "clienti",
    projects: "progetti",
    environments: "ambienti",
    plugins: "plugins",
    steps: "steps",
    tests: "tests",
    testcycles: "Cicli di test",
    testsperformed: "test eseguiti",
    apikey: "Api Key",
    testlauncher: "Test Launcher",
    platforms: "Piattaforme",
  },
  Navigation: {
    breadcrumbsLabel: "Percorso di navigazione",
    closeNavigation: "Chiudi navigazione",
    discard: "Scarta modifiche",
    project: "Progetto",
    skipToContent: "Vai al contenuto principale",
    stay: "Resta in questa pagina",
    unsavedMessage:
      "Sono presenti modifiche non salvate. Vuoi scartarle e continuare verso la destinazione selezionata?",
    unsavedTitle: "Modifiche non salvate",
    groups: {
      administration: "Amministrazione",
      authoring: "Creazione",
      execution: "Esecuzione",
      other: "Altro",
      resources: "Risorse",
    },
  },
  Header: {
    activeContext: "Cliente e progetto attivi",
    costumer: "Cliente",
    project: "Progetto",
    logOut: "Esci",
    language: "Lingua",
    profile: "Profilo",
    btnChangeCostumer: "Cambia cliente",
    confirmLogoutTitle: "Termina la sessione corrente",
    confirmLogout: "Vuoi uscire dalla console Idelium?",
    cancelLogout: "Resta connesso",
    confirmLogoutAction: "Esci",
    languages: {
      it: "italiano",
      gb: "inglese",
    },
  },
  ExecutionResult: {
    executionResults: "Dettagli risultato esecuzione",
    executionResultsHelp:
      "Esamina metadati canonici, trace, diagnostics, tempi e artifact del risultato.",
    runtime: "runtime",
    schema: "schema",
    duration: "durata",
    diagnostics: "diagnostics",
    artifacts: "artifact",
    trace: "trace",
    page: "pagina",
    timeline: "Timeline esecuzione",
    timelineHelp:
      "Ispeziona stato, durata, diagnostics e artifact disponibili per ogni step senza uscire dal dettaglio esecuzione.",
    artifactViewer: "Viewer artifact",
    closeArtifact: "Chiudi",
    artifactPreviewUnavailable:
      "Questo artifact è registrato, ma non contiene un payload visualizzabile inline.",
    success: "successo",
    failed: "fallito",
    emptyResults:
      "Non sono disponibili dettagli canonici del risultato per questo step.",
  },
  ExecutionObservability: {
    statusUnknown: "Sconosciuto",
    statusQueued: "In coda",
    statusRunning: "In esecuzione",
    statusCancelling: "Annullamento",
    statusPassed: "Superato",
    statusFailed: "Fallito",
    statusCancelled: "Annullato",
    statusSkipped: "Saltato",
    statusBlocked: "Bloccato",
    replayRequired:
      "Gli aggiornamenti live hanno perso eventi. Replay dall'ultimo cursore.",
    redactedPayload: "Payload protetto oscurato",
  },
  Login: {
    btnLogin: "Entra",
    placePassword: "password",
    placeUsername: "email",
    info: "utilizza come nome utente la tua email",
    welcome: "Benvenuto!",
    welcomeMessage:
      "Accedi per gestire il tuo account e utilizza il più potente strumento per i test automatici. Ora è un ottimo momento per migliorare la qualità del tuo software, quindi facciamolo!",
    title: "delium",
    errorMail: "La mail è vuota",
    isNotEmail: "Non è un indirizzo email",
    errorPassword: "La password è vuota",
    errorCredential: "Accesso negato, verifica le tue credenziali",
    rememberPassword: "Ricorda password",
  },
  Logout: {},
  Environments: {
    tabOrderEnvironments: "Ordinamento Ambienti",
    tabNewEnvironment: "Nuovo Ambiente",
    formEyebrow: "Configurazione ambiente",
    formTitle: "Crea ambiente",
    formDescription:
      "Definisci i metadati dell'ambiente, scegli il template runtime e completa la configurazione generata prima del salvataggio.",
    environmentDescriptionLabel: "Descrizione",
    environmentDescriptionHelp:
      "Usa un nome chiaro che spieghi dove viene utilizzato questo ambiente.",
    environmentCodeLabel: "Codice",
    environmentCodeHelp:
      "Usa un codice tecnico breve; verrà normalizzato prima del salvataggio.",
    environmentTypeLabel: "Template runtime",
    environmentTypeHelp:
      "Scegli il template coerente con il runtime di automazione.",
    builderEyebrow: "Builder configurazione",
    builderTitle: "Parametri ambiente",
    typeWeb: "Web",
    typeApp: "App mobile",
    typeWebservice: "Web service",
    placeholderDescriptionEnvironment: "Descrizione Ambiente",
    placeholderFileName: "Codice",
    btnSaveEnvironment: "Aggiungi Environment",
    errorMessageInputEmpty: "Attenzione! I campi non possono essere vuoti",
    confirmationDelete: "Sei sicuro di voler cancellare il file: ",
    confirmationArchive: "Archivia ambiente: ",
    titleErrorModal: "Attenzione",
    errorCharactersError:
      "Attenzione! Il nome dei file contengono caratteri speciali",
    btnCancel: "annulla",
    btnSave: "Salva",
    btnDelete: "Elimina",
    btnDuplicate: "Duplica",
    code: "codice",
    description: "descrizione",
    runtimeType: "Tipo runtime",
    status: "Stato",
    owner: "Proprietario",
    updatedAt: "Aggiornato",
    testConnection: "Testa connessione",
    archive: "Archivia",
    restore: "Ripristina",
    statusFilter: "Stato",
    runtimeFilter: "Runtime",
    allStatuses: "Tutti gli stati",
    allRuntimes: "Tutti i runtime",
    statusActive: "Attivo",
    statusArchived: "Archiviato",
    statusInvalid: "Richiede attenzione",
    id: "#",
    mandatory: "obbligatorio",
    addVariable: "aggiungi variable",
    name: "nome",
    value: "valore",
    someValuesAreMandatory: "Si prega di compilare i campi obbligatori",
    someVariableValuesAreEmpty: "Alcuni valori di variabile sono vuoti",
    invalidJson: "{field} deve contenere un JSON valido",
    invalidSeleniumGridUrl:
      "L'URL Selenium Grid deve essere HTTP o HTTPS e non deve contenere credenziali",
    invalidSeleniumProxyUrl:
      "L'URL proxy Selenium deve essere HTTP o HTTPS e non deve contenere credenziali",
    unsupportedHeadlessBrowser:
      "La modalità headless non è supportata per il browser selezionato",
    listTitle: "Ambienti",
    searchLabel: "Cerca ambienti",
    searchPlaceholder: "Cerca per codice o descrizione",
    paginationLabel: "Pagine dei risultati ambiente",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
  },
  Steps: {
    tabOrderSteps: "Ordinamento Steps",
    tabNewStep: "Nuovo Step",
    placeholderDescriptionStep: "Descrizione step",
    placeholderFileName: "Nome file (senza estenzione)",
    btnSaveStep: "Aggiungi Step",
    errorMessageInputEmpty: "Attenzione! I campi non possono essere vuoti",
    confirmationDelete: "Sei sicuro di voler cancellare il file: ",
    titleErrorModal: "Attenzione",
    errorCharactersError:
      "Attenzione! Il nome dei file contengono caratteri speciali",
    titleAlert: "Attenzione",
    btnCancel: "Annulla",
    btnSave: "Salva",
    btnSaveOrder: "Salva posizione",
    btnDelete: "Elimina",
    btnDuplicate: "Duplica",
    colId: "id",
    colName: "nome",
    colDescription: "descrizione",
    colOrder: "ordine",
    moveUp: "Sposta su",
    moveDown: "Sposta giù",
    listTitle: "Step",
    searchLabel: "Cerca step",
    searchPlaceholder: "Cerca per nome o descrizione dello step",
    paginationLabel: "Pagine dei risultati step",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
    gridEmptyTitle: "Nessuno step disponibile",
    gridEmptyDescription:
      "Crea il primo step per abilitare ordinamento, riuso ed esecuzione nei cicli di test.",
    dsl: {
      sourceLabel: "Sorgente Idelium DSL",
      sourcePlaceholder: 'idelium 1.0\n\ntest "smoke" {\n}',
      sourceHelp:
        "Usa sorgente Idelium DSL versionato. La UI valida il documento prima del salvataggio; l'API resta il confine contrattuale autoritativo.",
      validate: "Valida DSL",
      constructsTitle: "Guida autore DSL v1",
      line: "riga",
      column: "colonna",
      constructs: {
        variables: {
          title: "Variabili e segreti",
          description:
            "Dichiara valori riutilizzabili e marca i segreti per non esporre dati sensibili nei diagnostics.",
        },
        interpolation: {
          title: "Interpolazione",
          description:
            "Usa `${name}` dentro URL, locator, assertion e valori di input.",
        },
        conditions: {
          title: "Condizioni",
          description:
            "Esegui blocchi annidati con controlli visible o hidden mantenendo diagnostics sugli step saltati.",
        },
        loops: {
          title: "Loop limitati",
          description:
            "Ripeti flussi deterministici con limiti espliciti e sicuri per la CI.",
        },
        reuse: {
          title: "Step riutilizzabili",
          description:
            "Definisci helper nominati e richiamali con parametri per evitare logica duplicata.",
        },
        assertions: {
          title: "Assertion",
          description:
            "Valida visibilità, testo, valori, conteggi, URL e titolo con contratti risultato versionati.",
        },
        parameters: {
          title: "Parametri runtime",
          description:
            "Tieni le credenziali fuori dal sorgente DSL e iniettale tramite parametri runtime protetti.",
        },
      },
    },
    wizard: {
      wizardTitle: "Step wizard",
      name: "Nome",
      failedExit: "Se fallisce esce:",
      attachScreenshot: "Cattura immagine",
      addStep: "Aggiungi Step",
      typeStepTitle: "Step type",
      typeStepOrderTitle: "Gestisci",
      importPostmanCollectionFile: "Importa Postman Collection File (v2.1)",
      uploadPostmanCollection:
        "Carica il file collection di postman (aggiunge l'azione automaticamente)",
      uploadPostmanEnvironment: "Carica il file environment di postman",
      uploadPostmanEnvironmentOverrite: "(sovrascrivi)",
      importPostman: {
        isNotCollectionFile: "Is not a Postman Collection file",
      },
      step: {
        stepType: "Tipo di step",
        xpath: "xpath",
        params: "Parametri",
        text: "Testo",
        note: "Note",
        keys: "Chiave",
        addStepType: "Aggiungi tipo",
        editStepType: "Modifica tipo",
      },
    },
    catalog: {
      compatibilityTitle: "Compatibilità",
      groups: {
        advanced: "Selenium avanzato",
        appiumAdvanced: "Appium avanzato",
        basic: "Step base",
      },
      steps: {
        wait_for_next_step: {
          label: "Attendi una condizione",
          note: "Compatibile con le attese esplicite Selenium e con condizioni su URL e titolo pagina.",
        },
        selenium_command: {
          group: "advanced",
          label: "Comando Selenium avanzato",
          note: "Copre navigazione browser, cookie, alert, finestre, script, upload file e shadow DOM supportati dal runtime CLI.",
        },
        selenium_actions: {
          group: "advanced",
          label: "Catena azioni Selenium",
          note: "Usa definizioni JSON per interazioni pointer, tastiera e azioni utente composite.",
        },
        appium_mobile_command: {
          group: "appiumAdvanced",
          label: "Comando mobile Appium",
          note: "Esegue comandi mobile Appium, inclusi quelli esposti dai plugin Appium installati.",
        },
      },
      fields: {
        actions: {
          label: "JSON azioni",
          placeholder: '[{"type":"pointer","action":"move"}]',
          hint: "Usa un array JSON valido che descriva la sequenza di azioni.",
        },
        args: {
          label: "Argomenti script",
          placeholder: '{"arguments":[]}',
          hint: "Usa JSON valido per gli argomenti dell'esecuzione JavaScript.",
        },
        cookie: {
          label: "JSON cookie",
          placeholder: '{"name":"session","value":"..."}',
          hint: "Non salvare valori reali di sessione in step riutilizzabili.",
        },
        findBy: {
          label: "Strategia locator",
          placeholder: "Seleziona come individuare l'elemento",
        },
        handle: {
          label: "Handle finestra",
          placeholder: "Handle o alias della finestra",
        },
        mobileCommand: {
          label: "Comando mobile",
          placeholder: "mobile: nomeComando",
          hint: "Usa il nome comando previsto dal driver o plugin Appium selezionato.",
        },
        name: {
          label: "Nome",
          placeholder: "Nome",
        },
        operation: {
          label: "Operazione",
          placeholder: "Seleziona l'operazione Selenium",
        },
        params: {
          label: "JSON parametri",
          placeholder: "{}",
          hint: "Usa parametri JSON validi accettati dal runtime target.",
        },
        path: {
          label: "Percorso file",
          placeholder: "/percorso/al/file",
        },
        requiredPlugin: {
          label: "Plugin Appium richiesto",
          placeholder: "images",
        },
        script: {
          label: "Script",
          placeholder: "return document.title",
        },
        shadowFindBy: {
          label: "Strategia locator shadow",
        },
        shadowTarget: {
          label: "Target shadow",
        },
        state: {
          label: "Stato elemento",
        },
        target: {
          label: "Target",
          placeholder: "Locator elemento o valore atteso",
        },
        url: {
          label: "URL",
          placeholder: "https://example.com",
        },
        waitCondition: {
          label: "Condizione di attesa",
        },
        waitSeconds: {
          label: "Timeout in secondi",
          placeholder: "30",
        },
        windowType: {
          label: "Tipo finestra",
        },
        xpath: {
          label: "XPath",
          placeholder: '//button[@type="submit"]',
        },
      },
      options: {
        waitCondition: {
          presence: "L'elemento è presente",
          visibility: "L'elemento è visibile",
          clickable: "L'elemento è cliccabile",
          url_contains: "L'URL contiene testo",
          url_to_be: "L'URL è uguale a",
          title_contains: "Il titolo contiene testo",
          title_is: "Il titolo è uguale a",
          frame: "Il frame è disponibile",
          staleness: "L'elemento diventa stale",
        },
      },
    },
  },
  Plugins: {
    tabListPlugins: "Plugins",
    tabNewPlugin: "Nuovo Plugin",
    tabTitleImportPlugin: "Importa Plugin",
    btnCancel: "Annulla",
    titleAlert: "Attenzione",
    btnSave: "Salva",
    btnDelete: "Elimina",
    confirmationDelete: "Sei sicuro di voler cancellare il file: ",
    name: "nome",
    description: "descrizione",
    approval: "approvazione",
    integrity: "integrità sorgente",
    listTitle: "Plugin",
    searchLabel: "Cerca plugin",
    searchPlaceholder: "Cerca per nome o descrizione del plugin",
    paginationLabel: "Pagine dei risultati plugin",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
    approvalStates: {
      approved: "Approvato",
      approvedTitle: "Plugin approvato con provenance verificata.",
      unapproved: "Non approvato",
      unapprovedTitle:
        "Il plugin è salvato ma non può essere eseguito finché approval e integrity check non passano.",
      invalid: "Non valido",
      invalidTitle:
        "I metadati di approvazione del plugin sono incompleti o incoerenti.",
    },
    pluginImported: "plugin importato",
    importPlugin: {
      extensionIsWrong: "Estensione file non conforme",
      isNotAPluginFile: "Non è un file Idelium",
      importPluginFile: "Importa plugin di Idelium",
    },
  },
  Postman: {
    id: "#",
    status: "status",
    request: "request",
    method: "method",
    url: "url",
    assertions: "asserzioni",
    diagnostic: "diagnostica",
    response: "response",
    showResponse: " visualizza response",
    time: "time",
    executionResults: "Risultati esecuzione Postman",
    executionResultsHelp:
      "Controlla status, asserzioni, tempi e payload response raccolti dalla CLI.",
    emptyResults:
      "Non sono disponibili dati di esecuzione Postman per questo step.",
    fullDetails: "Apri dettagli Postman completi",
    responsePreview: "Anteprima response",
    hideResponse: "Nascondi response",
    detailsEyebrow: "Dettaglio esecuzione",
    detailsTitle: "Dettagli Postman",
    detailsDescription:
      "Ispeziona ogni request eseguita dal runtime Postman, inclusi status, asserzioni, durata e payload response.",
    requests: "request",
    backToTestsPerformed: "Torna ai test eseguiti",
  },
  Bidi: {
    artifact: "artefatto",
    event: "evento",
    url: "url",
    message: "messaggio",
    status: "status",
    executionResults: "Diagnostica WebDriver BiDi",
    executionResultsHelp:
      "Controlla metadata console, network, errori JavaScript e navigazione SPA raccolti dalla CLI.",
    emptyResults: "Non sono disponibili diagnostiche BiDi per questo step.",
  },
  Projects: {
    btnNewProject: "nuovo progetto",
    id: "#",
    project: "progetto",
    description: "descrizione",
    titleAlert: "Attenzione",
    btnCancel: "annulla",
    btnDelete: "elimina",
    btnModify: "aggiorna",
    btnModalModifyProject: "modifica progetto",
    btnAddProject: "Aggiungi progetto",
    textDelete:
      "Attenzione, cancellando il progetto cancelli tutti i test e gli step ad esso associato. Vuoi continuare ?",
    titleAddModal: "Aggiungi progetto",
    titleFirstAddModal: "Aggiungi il tuo primo progetto",
    titleModifyModal: "Modifica progetto",
    formHelp:
      "Crea un workspace progetto inserendo i campi gestiti da Idelium.",
    placeholderName: "Codice o nome progetto",
    placeholderDescription: "Descrivi lo scope del progetto",
    projectNameHelp: "Usa un nome progetto breve e riconoscibile.",
    projectDescriptionHelp: "Descrivi cosa contiene o valida questo progetto.",
    projectIsDuplicated: "Esiste già un progetto con questo nome",
    listEyebrow: "Amministrazione workspace",
    listTitle: "Progetti",
    listDescription:
      "Cerca, consulta e gestisci i workspace progetto disponibili per questo cliente.",
    searchLabel: "Cerca progetti",
    searchPlaceholder: "Cerca per nome o descrizione del progetto",
    paginationLabel: "Pagine dei risultati progetto",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
  },
  Tests: {
    compositionTitle: "Configura la sequenza degli step",
    compositionDescription:
      "Seleziona gli step riutilizzabili, verifica runtime e versioni, configura l'ordine e salva il test.",
    moveUp: "Sposta su",
    moveDown: "Sposta giù",
    moveImportedUp: "Sposta su lo step importato",
    moveImportedDown: "Sposta giù lo step importato",
    edit: "Modifica",
    editImported: "Modifica step importato",
    tabTitleModify: "Modifica Test",
    tabTitleNewTest: "Crea Test",
    tabTitleImportTest: "Importa JSON Idelium",
    btnCreateTest: "crea",
    btnModifyTest: "Modifica",
    btnImportTest: "Importa Test",
    btnCancel: "Annulla",
    importReviewEyebrow: "Revisione import",
    importReviewFallbackTitle: "Definizione test importata",
    importReviewDescription:
      "Verifica gli step riutilizzabili importati, modifica nomi o ordine e salva il test nel progetto selezionato.",
    importedSteps: "Step",
    importedActions: "Azioni",
    importedActionsCount: "{count} azioni",
    importReadyEyebrow: "Pronto al salvataggio",
    importReadyTitle: "Completa import",
    importReadyDescription:
      "La definizione è stata analizzata localmente. Il salvataggio creerà il test e gli step riutilizzabili nel progetto corrente.",
    placeholderFilterStep: "cerca test",
    placeholderNameTest: "nome del test",
    placeholderDescriptionTest: "descrizone del test",
    steps: "Step disponibili",
    stepsToDo: "Step Selezionati",
    selectTest: "-- seleziona un test --",
    ideliumImport: {
      eyebrow: "Import nativo del test",
      title: "Importa una definizione test Idelium",
      description:
        "Carica un file JSON con nome test, descrizione e step Idelium riutilizzabili.",
      extensionIsWrong: "Sono supportati solo file JSON",
      invalidJson: "Il file selezionato non è un JSON valido",
      isNotAnIdeliumFile:
        "Il file selezionato non è una definizione di import test Idelium",
      invalidStep:
        "Ogni step importato deve avere un nome e almeno una azione eseguibile",
      readError: "Il file selezionato non può essere letto",
      testName: "Nome test",
      testDescription: "Descrizione test",
      importFile: "Trascina o seleziona un file JSON Idelium",
      ready: "{count} step pronti per l'import",
    },
  },
  TestLauncher: {
    id: "#",
    testcycle: "Ciclo di test",
    description: "descrizione",
    environment: "Ambiente:",
    launchError:
      "L'avvio non è stato completato. La configurazione è stata preservata.",
    launching: "Avvio in corso...",
    launchtest: " Esegui il test",
    correlationId: "Correlation ID",
    retryLaunch: "Riprova dopo preflight",
    pageEyebrow: "Controllo avvio",
    pageTitle: "Test launcher",
    pageDescription:
      "Seleziona un ciclo e un ambiente autorizzati prima di scegliere il target di esecuzione.",
    refresh: "Aggiorna asset",
    notSelected: "Non selezionato",
    reviewEyebrow: "Revisione avvio",
    reviewTitle: "Pronto per la selezione target",
    reviewDescription:
      "Solo asset compatibili e autorizzati possono procedere alla selezione piattaforma.",
    cycleSelector: {
      accessibleLabel: "Selezione ciclo di test",
      count: "{count} cicli",
      description:
        "Cerca risultati limitati e seleziona il contenuto da eseguire.",
      empty: "Non ci sono cicli di test autorizzati.",
      owner: "Proprietario",
      runtime: "Runtime",
      searchLabel: "Cerca ciclo",
      searchPlaceholder: "Cerca per nome ciclo",
      status: "Stato",
      title: "Ciclo di test",
      updatedAt: "Aggiornato",
      version: "Versione",
      disabledReasons: {
        archived: "Questo ciclo è archiviato.",
        crossProject: "Questo ciclo appartiene a un altro progetto.",
        crossTenant: "Questo ciclo appartiene a un altro cliente.",
        runtime: "Questo ciclo non è compatibile con l'ambiente selezionato.",
        unavailable: "Questo ciclo non è disponibile.",
      },
    },
    environmentSelector: {
      accessibleLabel: "Selezione ambiente",
      count: "{count} ambienti",
      description:
        "Cerca risultati limitati e seleziona la configurazione runtime.",
      empty: "Non ci sono ambienti autorizzati.",
      owner: "Proprietario",
      runtime: "Runtime",
      searchLabel: "Cerca ambiente",
      searchPlaceholder: "Cerca per codice ambiente",
      status: "Stato",
      title: "Ambiente",
      updatedAt: "Aggiornato",
      version: "Versione",
      disabledReasons: {
        archived: "Questo ambiente è archiviato.",
        crossProject: "Questo ambiente appartiene a un altro progetto.",
        crossTenant: "Questo ambiente appartiene a un altro cliente.",
        runtime: "Questo ambiente non è compatibile con il ciclo selezionato.",
        unavailable: "Questo ambiente non è disponibile.",
      },
    },
    ModalListPlatform: {
      modalTitle: "Piattaforme",
      launchtest: " Esegui il test",
      colId: "id",
      colHost: "host",
      colLocation: "località",
      colBrand: "marca",
      colOs: "so",
      colBrowser: "browser",
      colStatus: "stato",
      confirmationPlatform: "Sei sicuro di voler eliminare la piattaforma ?",
      btnCancel: "annulla",
      btnDelete: "elimina",
      titleAlert: "Elimina piattaforma",
      all: "tutti",
    },
  },
  Launch: {
    configuration: "Configurazione avvio",
    preflight: "Diagnostiche preflight",
    review: "Revisione avvio",
    target: "Target di esecuzione",
    concurrency: "Concorrenza",
    idempotency: "Protezione avvii duplicati",
    recovery: "Errore di avvio recuperabile",
    remediation: {
      capacityLow:
        "Riduci la concorrenza o seleziona un altro target di esecuzione con capacità disponibile.",
      crossProjectReference:
        "Seleziona entità appartenenti al progetto attivo prima dell'avvio.",
      crossTenantReference:
        "Seleziona entità appartenenti al cliente attivo prima dell'avvio.",
      required: "Completa il campo obbligatorio di avvio prima di continuare.",
      review:
        "Rivedi la configurazione di avvio ed esegui di nuovo il preflight.",
      unsupportedOption:
        "Rimuovi l'opzione non supportata o aggiorna il contratto API prima dell'avvio.",
      unsupportedTarget:
        "Seleziona un target supportato tra locale, piattaforma, Selenium Grid, Appium o API.",
    },
  },
  LaunchTarget: {
    accessibleLabel: "Target di esecuzione e concorrenza",
    browserOverride: "Override browser",
    capacity: "Capacità",
    concurrency: "Concorrenza",
    description:
      "Verifica health, compatibilità runtime, coda e parallelismo sicuro prima dell'avvio.",
    deviceOverride: "Override device",
    health: "Health",
    healthStale:
      "Dato health non aggiornato; il preflight aggiornerà la capacità.",
    queue: "Coda",
    region: "Regione",
    runtime: "Runtime",
    target: "Target",
    title: "Target di esecuzione",
    disabledReasons: {
      capacity: "Questo target non ha capacità disponibile.",
      health: "Questo target non è healthy.",
      runtime: "Questo target non è compatibile con il runtime selezionato.",
      unavailable: "Questo target non è disponibile.",
    },
    remediation: {
      browserOverride:
        "Rimuovi l'override browser o scegli un target che lo supporta.",
      capacity:
        "Seleziona un altro target o attendi che la capacità torni disponibile.",
      concurrency:
        "Riduci la concorrenza alla capacità consentita dal target e dalla policy.",
      deviceOverride:
        "Rimuovi l'override device o scegli un target che lo supporta.",
      health:
        "Seleziona un target healthy o attendi il ripristino dell'infrastruttura.",
      healthStale:
        "Esegui il preflight prima dell'avvio per aggiornare la capacità lato API.",
      required: "Seleziona un target di esecuzione prima dell'avvio.",
      runtime:
        "Seleziona un target compatibile con ciclo e ambiente selezionati.",
    },
  },
  LaunchPreflight: {
    accessibleLabel: "Diagnostiche preflight avvio",
    blocking: "Bloccante",
    description:
      "Esegui la validazione prima dell'avvio e verifica le diagnostiche riferite alla configurazione corrente.",
    empty: "Non ci sono diagnostiche preflight per la configurazione corrente.",
    focus: "Rivedi area",
    run: "Esegui preflight",
    running: "Preflight in corso",
    selectionRequired: "Seleziona ciclo, ambiente e target prima dell'avvio.",
    stale:
      "Le diagnostiche preflight non sono aggiornate perché la configurazione di avvio è cambiata.",
    title: "Preflight",
    areas: {
      concurrency: "Concorrenza",
      environment: "Ambiente",
      launch: "Avvio",
      overrides: "Override",
      selection: "Selezione",
      target: "Target",
    },
    severities: {
      error: "Errore",
      info: "Info",
      warning: "Warning",
    },
  },
  LaunchReview: {
    accessibleLabel: "Revisione riproducibilità avvio",
    cliCommand: "Comando CLI",
    copied: "Copiato",
    copiedFeedback: "Comando CLI copiato negli appunti.",
    copyCommand: "Copia comando",
    description:
      "Verifica il payload redatto e il comando necessario a riprodurre questo avvio.",
    download: "Scarica riepilogo",
    eyebrow: "Revisione avvio",
    title: "Riepilogo riproducibilità",
    warnings: "Warning advisory non risolti",
    labels: {
      artifactPolicy: "Policy artifact",
      concurrency: "Concorrenza",
      cycle: "Ciclo",
      environment: "Ambiente",
      overrides: "Override",
      project: "Progetto",
      target: "Target",
    },
  },
  LaunchErrors: {
    authorization:
      "L'autorizzazione è cambiata. I dati protetti della bozza di avvio sono stati cancellati.",
    capacity:
      "La capacità del target è cambiata prima dell'avvio. Esegui il preflight e riprova quando la capacità è disponibile.",
    conflict:
      "La configurazione di avvio non è aggiornata. Esegui nuovamente il preflight prima di riprovare.",
    field:
      "Il payload di avvio contiene un campo non valido. Rivedi l'area evidenziata.",
    server:
      "Il servizio di avvio ha restituito un errore transitorio. Riprova dopo il preflight.",
    timeout:
      "L'esito di rete è sconosciuto. Riprova in modo sicuro con la stessa idempotency key dopo il preflight.",
    unknown:
      "Avvio fallito con esito sconosciuto. Rivedi le diagnostiche prima di riprovare.",
  },
  TestCycles: {
    compositionTitle: "Configura la sequenza dei test",
    compositionDescription:
      "Seleziona i test autorizzati, verifica le dipendenze, configura l'ordine e salva il ciclo.",
    tabTitleModify: "Modifica  ciclo di test",
    tabTitleNewTestCycle: "Crea  ciclo di test",
    btnCreateTestCycle: "crea",
    btnModifyTestCycle: "Modifica",
    placeholderFilterTest: "cerca ciclo di test",
    placeholderNameTestCycle: "nome del ciclo di test",
    placeholderDescriptionTestCycle: "descrizone del ciclo di test",
    tests: "Test disponibili",
    testsToDo: "Test Selezionati",
    selectTestCycle: "-- seleziona un ciclo di test --",
    commandLineInfo: "Linea di comando per questo ciclo di test:",
    commandLineCopy: "command line copiato",
    nameLabel: "Nome ciclo",
    descriptionLabel: "Descrizione ciclo",
    builderEyebrow: "Costruzione ciclo",
    builderTitle: "Costruisci il flusso di esecuzione passo per passo",
    builderDescription:
      "Un ciclo di test è un piano di esecuzione ordinato. Scegli i test che devono girare insieme, disponili nell'ordine corretto e poi salva il ciclo.",
    builderStepSelectTitle: "Seleziona i test",
    builderStepSelectDescription:
      "Usa il catalogo sotto per aggiungere uno o più test al ciclo.",
    builderStepOrderTitle: "Conferma l'ordine di esecuzione",
    builderStepOrderDescription:
      "Sposta i test selezionati finché la sequenza di esecuzione è corretta.",
    builderStepDescribeTitle: "Nomina e salva",
    builderStepDescribeDescription:
      "Inserisci un nome riconoscibile, una descrizione e crea il ciclo di test.",
    availableTests: "Disponibili",
    selectedTests: "Selezionati",
    readyStatus: "Stato",
    readyStatusIncomplete: "Incompleto",
    readyStatusReady: "Pronto",
  },
  TestsPerformed: {
    pageEyebrow: "Insight esecuzioni",
    pageTitle: "Test eseguiti",
    pageDescription:
      "Consulta le esecuzioni dei cicli di test, ispeziona i run effettuati e apri i dettagli di esecuzione di ogni test.",
    refresh: "Aggiorna",
    columnTestCycle: "Cicli di test",
    columnTestCycleDate: "Cicli di test effettuati",
    columnTest: "Test effettuati",
    selectCycle: "Seleziona un ciclo di test per caricare le sue esecuzioni.",
    selectRun: "Seleziona un run effettuato per visualizzare i test.",
    openDetails: "Apri un test per ispezionare step, risultati e screenshot.",
    emptyCycles: "Non ci sono cicli di test per il progetto selezionato.",
    emptyRuns: "Non ci sono esecuzioni per questo ciclo di test.",
    emptyTests: "Non ci sono test per questa esecuzione.",
    selectCycleFirst: "Seleziona prima un ciclo di test.",
    selectRunFirst: "Seleziona prima una esecuzione.",
    downloadReport: "Scarica report",
    reportUnavailable: "Report non disponibile",
    reportForRun: "per esecuzione",
    downloadFailed:
      "Download del report non riuscito. Il payload protetto resta sul server.",
    viewDetails: "Vedi dettagli",
    statusPending: "In attesa",
    statusPassed: "Superato",
    statusFailed: "Fallito",
    parallelRuns: "Esecuzioni parallele",
    liveRuns: "Workspace run live",
    parallelRunsDescription:
      "Monitora run distribuiti in coda, attivi, completati, falliti e cancellati usando lo stato restituito dal server.",
    liveRunsDescription:
      "Traccia esecuzioni in coda, attive, in annullamento e recenti con telemetria live limitata.",
    liveTransportStatus:
      "Aggiornamenti live: {transport} · {status} · Ultimo aggiornamento {updated}",
    liveTransportPolling: "polling sicuro",
    liveTransportHealthy: "connesso",
    liveTransportDegraded: "retry in corso",
    liveTransportPending: "in attesa",
    parallelRunLabel: "Run",
    emptyParallelRuns:
      "Non ci sono esecuzioni parallele tracciate per questo progetto.",
    cancelRun: "Annulla run",
    cancelRunTitle: "Annullare l'esecuzione parallela?",
    cancelRunMessage:
      "Idelium chiederà al server di annullare il run #{runId}. Impatto previsto: {scope} worker attivi/richiesti. La UI mostrerà annullamento finché lo stato server durevole conferma.",
    confirmCancelRun: "Annulla esecuzione",
    keepRunning: "Mantieni attiva",
    retryTitle: "Retry e rerun",
    rerun: "Riesegui tutto",
    retryFailed: "Riprova falliti",
    retryRunTitle: "Creare una esecuzione derivata?",
    retryRunMessage:
      "Idelium creerà un nuovo run immutabile dal run sorgente #{runId} usando lo scope '{scope}'. Versioni degli asset e preflight restano tracciati nella richiesta.",
    confirmRetryRun: "Crea run",
    keepCurrentRun: "Mantieni run corrente",
    retryRequested: "Richiesta di retry inviata con chiave di idempotenza.",
    retryCreated: "Run derivato #{runId} creato.",
    retryFailedRequest:
      "Richiesta di retry non riuscita. Il run storico non è stato modificato.",
    retryPreflightRequired:
      "È richiesto il preflight perché uno o più asset ereditati non sono disponibili o sono solo snapshot.",
    retryStates: {
      eligible: "Questo run può essere riprovato in sicurezza.",
      "no-failed-scope":
        "Non esiste uno scope fallito. Usa la riesecuzione completa.",
      "preflight-required":
        "Questo retry richiede preflight perché asset ereditati sono cambiati o non disponibili.",
      unauthorized: "Non hai i permessi per riprovare questo run.",
      "unsupported-runtime":
        "Questo runner non supporta il retry automatico. Crea un nuovo run manuale.",
    },
    cancellationStates: {
      "cancellation-requested":
        "Annullamento richiesto, in attesa dello stato server.",
      cancelled: "Annullamento confermato dallo stato server durevole.",
      cancelling: "Annullamento in corso.",
      rejected: "Annullamento rifiutato dal server.",
      requested: "Annullamento richiesto.",
      retryable: "Esito annullamento sconosciuto. Puoi riprovare in sicurezza.",
    },
    workerConcurrency: "Attivi",
    progress: "Avanzamento",
    workerCompleted: "Completati",
    workerFailed: "Falliti",
    workerCancelled: "Annullati",
    analyticsTitle: "Analytics qualità",
    analyticsDescription:
      "Controlla pass rate, tassonomia errori, durata, coda e test flaky per l'esecuzione selezionata.",
    analyticsWindow: "Finestra",
    analyticsTimezone: "Timezone",
    passRate: "Pass rate",
    failureRate: "Failure rate",
    averageDuration: "Durata media",
    averageQueue: "Coda media",
    flakyTests: "Test flaky",
    previousPage: "Precedente",
    nextPage: "Successiva",
    actions: "Azioni",
    allStatuses: "Tutti gli stati",
    clearFilters: "Cancella filtri",
    noResults: "Nessuna esecuzione corrisponde ai filtri selezionati.",
    resultCount: "{count} esecuzioni",
    runHistory: "Storico run",
    runDetail: "Dettaglio esecuzione",
    saveView: "Salva vista",
    status: "Stato",
    tag: "Tag",
    initiator: "Avviato da",
    correlationId: "Correlation ID",
    partialRunDetail:
      "Alcuni asset collegati sono cancellati, scaduti o non disponibili nel payload API corrente. Quando presenti vengono mostrati i valori snapshot.",
    drilldownTitle: "Drill-down esecuzione",
    artifactViewer: "Viewer artifact sicuro",
    fullArtifact: "Apri vista completa",
    noArtifacts: "Non sono disponibili artifact per questo run.",
    artifactStates: {
      available:
        "Il contenuto è disponibile tramite un descrittore autorizzato e temporaneo.",
      expired: "Questo contenuto è scaduto secondo la policy di retention.",
      oversized:
        "Questo contenuto è troppo grande per la preview inline. Usa il download autorizzato se disponibile.",
      quarantined:
        "Questo contenuto è in quarantena e non può essere visualizzato finché non viene verificato.",
      redacted:
        "Questo body è stato oscurato dalla policy. Il contenuto è protetto, non vuoto.",
      unavailable: "Questo contenuto non è disponibile per il run corrente.",
    },
    runDetailTabs: {
      overview: "Overview",
      tests: "Test",
      workers: "Worker",
      timeline: "Timeline",
      artifacts: "Artifact",
      logs: "Log",
      reports: "Report",
    },
    paginationSummary: "Pagina {page} di {lastPage} · {total} risultati",
    parallelStatuses: {
      queued: "In coda",
      running: "In esecuzione",
      cancelling: "Annullamento",
      passed: "Superata",
      cancelled: "Annullata",
      completed: "Completata",
      failed: "Fallita",
      unknown: "Sconosciuta",
    },
    staleTelemetry: "La telemetria non è aggiornata. Aggiorna o attendi.",
    degradedChannel:
      "Gli aggiornamenti live sono degradati. La pagina usa polling limitato.",
    failureClasses: {
      workerFailure:
        "Errore classificato: uno o più worker hanno segnalato errori.",
      cancelled:
        "Annullamento classificato: esecuzione fermata prima del completamento.",
      executionFailure:
        "Errore classificato: l'esecuzione è terminata con stato aggregato fallito.",
    },
    stepId: "#",
    stepName: "Nome step",
    stepStatus: "Esito step",
    screenshots: "Screenshots",
  },
  Apikey: {
    btnGenerateKey: "Genera nuova chiave",
    placeholderKey: "Api Key",
    info: "La chiave da usare per idelium-cl, oppure scarica il file rinominalo .idelium e posizionalo nella tua home directory",
    title: "La tua Idelium Key",
    keyCopy: "chiave copiata",
    confirmGenerateMessage:
      "La generazione della nuova chiave comporta un aggiornamento anche dei parametri per idelium-cl, confermi ?",
    cliEyebrow: "Idelium CLI",
    credentialEyebrow: "Credenziale",
    statusActive: "Attiva",
    packageEyebrow: "Pacchetto",
    cliTitle: "Idelium CLI",
    cliInfo:
      "Installa e aggiorna il client da riga di comando da PyPI, poi posiziona il file della chiave scaricato nella tua home directory.",
    btnCopyKey: "Copia chiave",
    btnDownloadConfig: "Scarica chiave",
    btnDownloadKey: "scarica idelium-cli",
    credentialLifecycleTitle: "Ciclo di vita credenziali",
    credentialLifecycleDescription:
      "Crea credenziali nominali, ruotale in sicurezza, revoca accessi compromessi e consulta audit senza esporre il segreto completo.",
    revealOnceNotice:
      "Il segreto completo viene mostrato una sola volta alla creazione. Salvalo subito.",
    revealOnceTitle: "Credenziale mostrata una sola volta",
    revealOnceHelp:
      "Copia o scarica questo valore adesso. Rimane solo in memoria e verrà cancellato quando lasci la pagina, ricarichi, cambi contesto o scade il timeout.",
    revealOnceAcknowledge:
      "Ho capito che questo segreto non potrà essere mostrato di nuovo dopo aver lasciato questa pagina.",
    revealOnceReady:
      "Credenziale creata. Conferma la visualizzazione una sola volta prima di copiare o scaricare.",
    revealOnceExpired:
      "Il valore mostrato una sola volta è stato cancellato. Crea o ruota una credenziale per ricevere un nuovo valore.",
    acknowledgementRequired:
      "Conferma la visualizzazione una sola volta prima di esportare il segreto.",
    copySecret: "Copia segreto",
    copySecretFeedback: "Segreto copiato negli appunti.",
    downloadSecret: "Scarica segreto",
    downloadSecretFeedback:
      "Segreto scaricato. Conservalo in una posizione sicura approvata.",
    clearSecret: "Cancella segreto",
    copySnippet: "Copia",
    copySnippetFeedback: "Snippet di utilizzo copiato.",
    usageGuidance:
      "Usa variabili d'ambiente o secret store approvati. Non committare mai credenziali. Verifica l'accesso delle pipeline con una credenziale con scope limitato e ruotala in caso di incidenti o cambio operatore.",
    usageSnippetTitles: {
      "generic-ci": "CI generica",
      "github-actions": "GitHub Actions",
      "local-shell": "Shell locale",
    },
    legacyMigrationNotice:
      "Le chiavi legacy restano compatibili durante la finestra di migrazione, ma i nuovi accessi devono usare credenziali nominali.",
    inventoryTitle: "Inventario credenziali",
    inventoryScrollRegion: "Inventario credenziali scrollabile",
    actionsLabel: "Azioni",
    moreActions: "Altre azioni",
    clearFilters: "Cancella filtri",
    resultCount: "{count} credenziali",
    selectPage: "Seleziona questa pagina",
    selectRow: "Seleziona",
    emptyTitle: "Nessuna credenziale",
    emptyDescription:
      "Crea una credenziale nominale per sostituire le chiavi legacy.",
    noResultsTitle: "Nessuna credenziale trovata",
    noResultsDescription:
      "Cancella i filtri o modifica stato, scope, owner o scadenza.",
    colName: "Nome",
    colFingerprint: "Prefisso / fingerprint",
    colScopes: "Scope",
    colStatus: "Stato",
    colOwner: "Owner",
    colCreated: "Creata",
    colLastUsed: "Ultimo uso",
    colExpiry: "Scadenza",
    colLineage: "Lineage",
    filterStatus: "Stato",
    filterScope: "Scope",
    filterOwner: "Owner",
    filterExpiry: "Scadenza",
    filterAll: "Tutte",
    noExpiry: "Nessuna scadenza",
    neverUsed: "Mai usata",
    lastUsedUnavailable: "Non disponibile",
    legacyName: "Chiave API legacy",
    createTooltip: "Crea credenziale",
    rotateTooltip: "Ruota credenziale",
    revokeTooltip: "Revoca credenziale",
    auditTooltip: "Apri audit credenziale",
    actions: {
      audit: "Audit",
      cancel: "Annulla",
      create: "Crea",
      revoke: "Revoca",
      rotate: "Ruota",
    },
    statuses: {
      active: "Attiva",
      expired: "Scaduta",
      expiring: "In scadenza",
      legacy: "Legacy",
      revoked: "Revocata",
      rotated: "Ruotata",
      unknown: "Sconosciuta",
    },
    createCredentialTitle: "Crea credenziale nominale",
    createCredentialHelp:
      "Parti dallo scope minimo approvato e aggiungi solo i permessi necessari all'integrazione.",
    description: "Descrizione",
    constraints: "Vincoli approvati",
    createFailed: "Creazione credenziale non riuscita.",
    rotationTitle: "Ruota credenziale",
    rotationHelp:
      "Genera una credenziale sostitutiva con una policy di cutover approvata. La credenziale originale resta utilizzabile se la rotazione fallisce.",
    rotationPolicy: "Policy di rotazione",
    rotationImmediate: "Cutover immediato",
    rotationOverlap24h: "Sovrapposizione 24 ore",
    rotationOverlap7d: "Sovrapposizione 7 giorni",
    rotationFailed:
      "Rotazione credenziale non riuscita. La credenziale originale resta invariata salvo transizione durevole comunicata dall'API.",
    rotatedFrom: "Ruotata da",
    rotatedCredential: "Credenziale ruotata",
    revocationTitle: "Revoca credenziale",
    revocationHelp:
      "Invalida questa credenziale solo dopo aver confermato nome, fingerprint, impatto sugli scope e conseguenza operativa.",
    revocationImpact: "Conseguenza immediata",
    revocationImpactHelp:
      "Dopo la conferma durevole dell'API, questa credenziale non potrà più autenticare richieste Idelium CLI o automazioni.",
    confirmCredentialName: "Conferma nome credenziale",
    confirmCredentialFingerprint: "Conferma prefisso o fingerprint",
    revocationReason: "Motivo audit",
    revocationElevatedConfirm:
      "Ho capito che questa operazione può revocare l'ultima credenziale utilizzabile o un'automazione protetta.",
    revocationFailed:
      "Revoca credenziale non riuscita. La credenziale resta invariata finché l'API non conferma una transizione durevole.",
    scopeRunExecute: "Esecuzione run",
    scopeRunExecuteHelp: "Consente di avviare esecuzioni di test approvate.",
    scopeArtifactRead: "Lettura artifact",
    scopeArtifactReadHelp:
      "Consente di leggere artifact di esecuzione conservati.",
    scopeCredentialAdmin: "Amministrazione credenziali",
    scopeCredentialAdminHelp:
      "Consente di gestire credenziali e va concesso solo agli amministratori.",
    validation: {
      duplicate: "Esiste già una credenziale con questo nome.",
      "dangerous-combination":
        "Questa combinazione di scope è rischiosa e richiede una credenziale più limitata.",
      "already-revoked": "Questa credenziale è già revocata.",
      "confirmation-mismatch":
        "I valori di conferma devono corrispondere al nome e alla fingerprint della credenziale.",
      "elevated-confirmation-required":
        "Per questa revoca protetta è richiesta una conferma elevata.",
      "invalid-date": "Scegli una data di scadenza valida.",
      "maximum-lifetime":
        "La durata della credenziale non può superare 365 giorni.",
      "missing-capability": "Non sei autorizzato a creare credenziali.",
      "reason-required": "La policy richiede un motivo audit.",
      required: "Completa i campi obbligatori della credenziale.",
      "terminal-state":
        "Questa credenziale non può essere ruotata dal suo stato corrente.",
      "unauthorized-scope": "Non puoi concedere uno o più scope selezionati.",
      "unsupported-policy": "Scegli una policy di rotazione approvata.",
    },
  },
  Profile: {
    title: "Il mio profilo",
    name: "nome",
    email: "email",
    company: "azienda",
    role: "ruolo",
    password: "password",
    confirmPassword: "conferma password",
  },
  Accounts: {
    newAccount: "Nuovo Account",
    id: "#",
    name: "nome",
    account: "account",
    role: "ruolo",
    costumer: "cliente",
    titleAlert: "Attenzione",
    btnCancel: "annulla",
    btnDelete: "elimina",
    btnModify: "modifica",
    btnAudit: "audit",
    btnCancelInvite: "annulla invito",
    btnDetail: "dettagli",
    btnReactivate: "riattiva",
    btnResendInvite: "reinvia invito",
    btnSuspend: "sospendi",
    confirmDeleteAccount: "Vuoi cancellare l'account ?",
    accountExist: "L'account già esiste",
    formHelp: "Crea un account compilando solo i campi gestiti da Idelium.",
    createFormHelp:
      "Questa form crea l'account di accesso e assegna cliente e ruolo usati al primo accesso.",
    invitationFormHelp:
      "Invita l'utente via email e assegna il ruolo che riceverà dopo l'attivazione.",
    invitationExpiryHelp:
      "Idelium invia un invito di attivazione. L'amministratore non inserisce mai la password dell'utente e il feedback di consegna è volutamente generico.",
    invitationSafeFailure:
      "Non è stato possibile inviare l'invito. Controlla i campi visibili o contatta un amministratore.",
    modifyFormHelp:
      "Questa form aggiorna solo i campi profilo account modificabili e salvati da Idelium.",
    placeholderReplacementAdmin: "Seleziona un amministratore sostitutivo",
    placeholderEmail: "utente@example.com",
    placeholderName: "Nome completo",
    placeholderPassword: "Password",
    placeholderConfirmPassword: "Conferma password",
    placeholderRole: "Seleziona un ruolo",
    placeholderCostumer: "Seleziona un cliente",
    privilegedRoleConfirmation:
      "Cambiare {account} da {currentRole} a {nextRole}? Questa modifica privilegiata viene rivalidata dall'API prima di diventare durevole.",
    privilegedRoleSafeFailure:
      "Non è stato possibile completare il cambio ruolo privilegiato. L'account resta invariato finché l'API non conferma l'invariante amministratore.",
    replacementAdmin: "Amministratore sostitutivo",
    replacementAdminHelp:
      "Obbligatorio quando l'ultimo amministratore attivo viene cambiato a un ruolo non amministratore.",
    rolePicker: {
      title: "Assegnazione ruolo",
      description:
        "Scegli un ID ruolo stabile dopo aver verificato scopo, permessi, restrizioni e rischio.",
      noRoleSelected: "Nessun ruolo selezionato",
      matrixTitle: "Matrice permessi",
      permission: "Permesso",
      permissionAllowed: "Permesso consentito",
      permissionDenied: "Permesso non assegnato",
      unavailableRole:
        "I tuoi permessi correnti non consentono di assegnare questo ruolo.",
      groups: {
        administration: "Amministrazione",
        assets: "Asset",
        execution: "Esecuzione",
        governance: "Governance",
      },
      permissions: {
        "account.invite": "Invita account",
        "account.role.assign": "Assegna ruoli",
        "account.suspend": "Sospendi account",
        "artifact.read": "Leggi artifact",
        "credential.audit": "Audit credenziali",
        "run.execute": "Esegui run",
      },
      riskLevels: {
        critical: "Rischio critico",
        high: "Rischio alto",
        low: "Rischio basso",
        medium: "Rischio medio",
      },
      reductionWarnings: {
        "critical-reduction":
          "Questa modifica riduce un ruolo critico e può impattare responsabilità di ownership piattaforma.",
        "governance-reduction":
          "Questa modifica rimuove permessi di governance che potrebbero essere necessari per le responsabilità correnti.",
      },
    },
    status: "stato",
    teams: "team",
    lastActivity: "ultima attività",
    updatedAt: "aggiornato",
    filterAll: "Tutti",
    filterInvitation: "Invito",
    filterRole: "Ruolo",
    filterStatus: "Stato",
    filterTeam: "Team",
    accountStatuses: {
      active: "Attivo",
      archived: "Archiviato",
      "expired-invitation": "Invito scaduto",
      invited: "Invitato",
      suspended: "Sospeso",
    },
    invitationStates: {
      expired: "Scaduto",
      none: "Nessuno",
      pending: "In attesa",
    },
    governanceActionQueued:
      "Azione governance selezionata. Il workflow dettagliato è disponibile dal prossimo step governance",
    auditHistory: {
      action: "Azione",
      actions: {
        invite: "Invito",
        reactivate: "Riattivazione",
        "role-change": "Cambio ruolo",
        suspend: "Sospensione",
      },
      actor: "Attore",
      all: "Tutti",
      close: "Chiudi audit",
      correlationId: "Correlation ID",
      description:
        "Eventi governance immutabili per {account} ({accountId}). I nomi visualizzati sono accompagnati da identificativi durevoli non segreti.",
      empty: "Non sono disponibili eventi audit per l'account selezionato.",
      export: "Richiedi export",
      exportDenied:
        "L'export audit non è disponibile per il contesto autorizzativo corrente.",
      exportQueued:
        "Export audit richiesto. Il download autorizzato verrà preparato in modo asincrono.",
      eyebrow: "Audit governance",
      filters: "Filtri audit",
      loading: "Caricamento storico audit account.",
      next: "Successiva",
      outcome: "Esito",
      outcomes: {
        failed: "Fallito",
        rejected: "Respinto",
        requested: "Richiesto",
        success: "Successo",
      },
      pageStatus: "Pagina {page} di {pages}",
      pagination: "Pagine eventi audit",
      previous: "Precedente",
      reason: "Motivo",
      safeFailure:
        "Non è stato possibile caricare lo storico audit. Accessi cross-tenant e non autorizzati falliscono senza esporre dettagli protetti.",
      target: "Target",
      timestamp: "Timestamp",
      title: "Storico audit account e ruoli",
    },
    lifecycleSafeFailure:
      "Non è stato possibile completare l'azione lifecycle. L'account resta invariato finché l'API non conferma una transizione durevole.",
    lifecycleConfirmations: {
      "cancel-invite":
        "Annullare l'invito per {account}? Ruolo: {role}. Impatto: {impact}",
      reactivate: "Riattivare {account}? Ruolo: {role}. Impatto: {impact}",
      "resend-invite":
        "Reinviare l'invito per {account}? Ruolo: {role}. Impatto: {impact}",
      suspend: "Sospendere {account}? Ruolo: {role}. Impatto: {impact}",
    },
    lifecycleImpacts: {
      "cancel-invite":
        "L'invito diventa inutilizzabile e viene conservato per audit.",
      reactivate:
        "L'account potrà accedere di nuovo secondo la policy sessione dell'API.",
      "resend-invite":
        "Viene richiesta una nuova consegna soggetta ai rate limit dell'API.",
      suspend:
        "Sessioni attive e credenziali vengono invalidate secondo la policy API.",
    },
    emailHelp: "L'indirizzo email viene usato come account di accesso.",
    nameHelp:
      "Usa il nome visualizzato nelle liste account e nelle viste profilo.",
    passwordHelp:
      "Usa una password conforme alla policy configurata in Idelium.",
    listEyebrow: "Amministrazione identità",
    listTitle: "Account",
    listDescription:
      "Cerca e gestisci gli account utente autorizzati per il cliente corrente.",
    searchLabel: "Cerca account",
    searchPlaceholder: "Cerca per email, nome, cliente o ruolo",
    paginationLabel: "Pagine dei risultati account",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
    modal: {
      titleModal: "Dettagli del account",
      modifyAccount: "Modifica account",
      addAccount: "Aggiungi Account",
    },
  },
  Costumers: {
    btnNewCostumer: "nuovo cliente",
    id: "#",
    costumer: "Cliente",
    description: "descrizione",
    licenseExpiration: "Scadenza licenza",
    apiKey: "API Key",
    btnDelete: "cancella",
    btnModify: "aggiorna",
    btnModalModifyCostumer: "modifica cliente",
    btnAddCostumer: "Aggiungi cliente",
    textDelete:
      "Attenzione, cancellando il cliente cancelli tutti i dati ad esso associato. Vuoi continuare ?",
    titleAddModal: "Aggiungi cliente",
    titleModifyModal: "Modifica cliente",
    costumerIsDuplicated: "il cliente già esiste",
    textCopy: "chiave copiata",
    listEyebrow: "Amministrazione tenant",
    listTitle: "Clienti",
    listDescription:
      "Cerca e gestisci i tenant cliente senza esporne le credenziali.",
    searchLabel: "Cerca clienti",
    searchPlaceholder: "Cerca per nome o descrizione del cliente",
    paginationLabel: "Pagine dei risultati cliente",
    previousPage: "Precedente",
    nextPage: "Successiva",
    pageStatus: "Pagina {page} di {pages}",
  },
  TemplateTest: {
    permissionDenied: "Oops! Permesso negato",
    btnOK: "OK",
    btnNewTemplate: "Nuovo ciclo di test",
    btnPublish: "Pubblica",
    btnDelete: "Elimina",
    btnCancel: "Cancella",
    btnSave: "Salva",
    btnOpen: "Apri",
    btnClose: "Chiudi",
    btnCreate: "Crea",
    urlCopied: "Il link è stato copiato",
    btnModify: "Modifica",
    modalTemplate: {
      btnInsert: "Salva",
      btnTest: "Test if jira issues exist",
      btnAdd: "+",
      alertIssueEmpty: "il campo issue non può essere vuoto",
      alertNameTemplateEmpty: "il nome template non può essere vuoto",
      btnUpdate: "Aggiorna",
      alertIssuesEmpty: "Inserire almeno una issue",
      placeholderNameTemplate: "Nome template",
      placeholderAddIssue: "Aggiungi Issue",
      titleModal: "Gestione template",
      alertIssueNotExists: "Attenzione alcune issue non esistono su jira",
      alertIssueNotExist: "Attenzione l'issue non è stata trovata",
    },
    modalCreateCycle: {
      cycleCreated: "Il ciclo di test è stato creato",
      selectTypeVersion: "seleziona tipo di versione",
      selectVersion: "seleziona versione",
      cycleName: "nome versione",
      btnCreateCycle: "Crea ciclo di test",
    },
  },
  DataTable: {
    actions: "Azioni",
    bulk: {
      title: "Azioni massive",
      selected: "{count} righe selezionate",
      allSelected: "Tutte le {count} righe corrispondenti selezionate",
      selectAll: "Seleziona tutte le {count} righe corrispondenti",
      clear: "Rimuovi selezione",
    },
    clearFilters: "Rimuovi filtri",
    create: "Crea elemento",
    refreshComplete: "Risultati aggiornati.",
    retry: "Riprova",
    moreActions: "Altre azioni",
    detail: {
      eyebrow: "Dettaglio elemento",
      close: "Chiudi dettagli",
    },
    preferences: {
      title: "Preferenze tabella",
      density: "Densità",
      columns: "Colonne",
      comfortable: "Comoda",
      compact: "Compatta",
      spacious: "Spaziosa",
      moveUp: "Sposta la colonna in alto",
      moveDown: "Sposta la colonna in basso",
      reset: "Ripristina impostazioni",
    },
    resultCount: "{count} risultati",
    scrollRegion: "Tabella dei risultati scorrevole",
    selectPage: "Seleziona tutte le righe di questa pagina",
    selectRow: "Seleziona",
    states: {
      empty: {
        title: "Nessun elemento",
        description: "Crea il primo elemento per iniziare.",
      },
      error: {
        title: "Risultati non disponibili",
        description: "Impossibile caricare i risultati. Riprova.",
      },
      loading: {
        title: "Caricamento risultati",
        description: "Caricamento degli elementi autorizzati in corso.",
      },
      "no-results": {
        title: "Nessun risultato corrispondente",
        description: "Rimuovi o modifica i filtri attivi.",
      },
      permission: {
        title: "Autorizzazione necessaria",
        description:
          "Non hai l'autorizzazione per visualizzare questi elementi.",
      },
      stale: {
        title: "I risultati potrebbero non essere aggiornati",
        description:
          "Gli ultimi risultati autorizzati rimangono visibili durante l'aggiornamento.",
      },
    },
  },
  EnvironmentSchema: {
    types: {
      web: "Web e Selenium",
      mobile: "Mobile e Appium",
      api: "API e Postman",
    },
    sections: {
      connection: "Connessione",
      browser: "Browser",
      device: "Dispositivo",
      postman: "Comportamento API",
    },
    templates: {
      localBrowser: {
        label: "Browser locale",
        description: "Esegui Selenium in un browser gestito localmente.",
      },
      seleniumGrid: {
        label: "Selenium Grid",
        description: "Connetti Selenium a un Grid remoto.",
      },
      android: {
        label: "Android",
        description: "Esegui Appium su Android con UiAutomator2.",
      },
      ios: {
        label: "iOS",
        description: "Esegui Appium su iOS con XCUITest.",
      },
      externalAppium: {
        label: "Appium esterno",
        description: "Connetti un server Appium gestito esternamente.",
      },
      apiPostman: {
        label: "API e Postman",
        description: "Esegui collezioni API e Postman con valori sicuri.",
      },
    },
    diagnostics: {
      malformed: "La configurazione dell'ambiente non è valida.",
      unknownType: "Il tipo di ambiente non è supportato.",
      newerSchemaVersion:
        "L'ambiente usa una versione dello schema più recente della Console.",
      expiredSchemaVersion:
        "La versione dello schema è fuori dalla finestra di compatibilità.",
      legacySchema:
        "Questo ambiente legacy riceverà una versione dello schema alla modifica.",
    },
    remediation: {
      malformed: "Correggi il sorgente JSON salvato prima della modifica.",
      unknownType: "Scegli un ambiente Web, Mobile o API supportato.",
      newerSchemaVersion: "Aggiorna Idelium prima di modificare l'ambiente.",
      expiredSchemaVersion:
        "Migra l'ambiente tramite una versione intermedia supportata.",
      legacySchema:
        "Verifica le sezioni generate prima di salvare l'ambiente migrato.",
    },
  },
  EnvironmentForm: {
    sections: {
      identity: "Identità",
      runtime: "Runtime e modello",
      variables: "Variabili",
      secrets: "Riferimenti segreti",
      advanced: "Configurazione avanzata",
    },
    schemaSections: {
      connection: "Connessione e rete",
      browser: "Browser",
      device: "Dispositivo",
      postman: "Comportamento API",
    },
    types: {
      web: "Web e Selenium",
      mobile: "Mobile e Appium",
      api: "API e Postman",
    },
    fields: {
      name: {
        label: "Nome ambiente",
        help: "Usa un nome stabile e univoco nel progetto.",
      },
      description: {
        label: "Descrizione",
        help: "Spiega finalità e utilizzatori previsti.",
      },
      type: {
        label: "Tipo di ambiente",
        help: "Il tipo controlla le sezioni runtime compatibili.",
      },
      base_url: {
        label: "URL base",
        help: "Usa un URL assoluto del servizio.",
      },
      browser: { label: "Browser", help: "Seleziona il runtime del browser." },
      seleniumGridUrl: {
        label: "URL Selenium Grid",
        help: "Lascia vuoto per un browser gestito localmente.",
      },
      seleniumHeadless: {
        label: "Esecuzione headless",
        help: "Esegui senza una finestra browser visibile.",
      },
      seleniumLocale: {
        label: "Lingua browser",
        help: "Usa un codice BCP 47 come it-IT.",
      },
      accept_self_certificate: {
        label: "Accetta certificati autofirmati",
        help: "Abilita solo in ambienti di sviluppo controllati.",
      },
      appiumServer: {
        label: "URL server Appium",
        help: "Usa l'endpoint Appium autorizzato.",
      },
      platformName: { label: "Piattaforma", help: "Seleziona Android o iOS." },
      automationName: {
        label: "Driver di automazione",
        help: "Scegli un driver installato sul server Appium.",
      },
      deviceName: {
        label: "Nome dispositivo",
        help: "Identifica il dispositivo di destinazione.",
      },
      platformVersion: {
        label: "Versione piattaforma",
        help: "Limita facoltativamente la versione del sistema operativo.",
      },
      isRealDevice: {
        label: "Dispositivo reale",
        help: "Disabilita per simulatori ed emulatori.",
      },
      app: {
        label: "Percorso applicazione",
        help: "Percorso o URL autorizzato dell'app.",
      },
      appPackage: {
        label: "Package applicazione",
        help: "Identificatore package Android quando necessario.",
      },
      timeoutMs: {
        label: "Timeout richiesta",
        help: "Intervallo consentito: da 1.000 a 120.000 millisecondi.",
      },
      followRedirects: {
        label: "Segui redirect",
        help: "Applica i redirect durante la validazione API.",
      },
      strictTls: {
        label: "Verifica TLS rigorosa",
        help: "Mantieni attiva fuori dallo sviluppo locale controllato.",
      },
    },
    optional: "(facoltativo)",
    sectionErrors: "{count} errori",
    formErrors: "{count} campi richiedono attenzione.",
    valid: "Il form dell'ambiente è valido.",
    save: "Salva ambiente",
    saving: "Salvataggio ambiente",
    advancedDescription:
      "Usa la configurazione raw solo per campi supportati non esposti sopra.",
    advancedLabel: "Configurazione raw dell'ambiente",
    applyAdvanced: "Applica configurazione avanzata",
    typeChangeTitle: "Verifica valori incompatibili",
    typeChangeDescription:
      "Il cambio di tipo rimuove i campi seguenti perché lo schema di destinazione non li supporta.",
    cancel: "Annulla",
    confirmTypeChange: "Cambia tipo e rimuovi valori",
    validation: {
      required: "Inserisci un valore obbligatorio.",
      url: "Inserisci un URL assoluto valido.",
      range: "Inserisci un numero nell'intervallo supportato.",
      enum: "Seleziona un valore supportato.",
      inlineSecret:
        "Usa un riferimento segreto autorizzato invece di un valore inline.",
      json: "Inserisci un oggetto JSON valido.",
    },
  },
  EnvironmentVariables: {
    title: "Variabili effettive",
    description:
      "Verifica i valori di progetto, ambiente e avvio nell'ordine di esecuzione.",
    caption: "Variabili ambiente risolte e relative origini effettive",
    ready: "Pronto per l'esecuzione",
    blocked: "Esecuzione bloccata",
    empty: "Non sono definite variabili per questa esecuzione.",
    diagnostics: "Errori di validazione delle variabili",
    unknown: "Sconosciuta",
    columns: {
      name: "Nome",
      source: "Origine effettiva",
      type: "Tipo",
      override: "Sovrascrittura",
      validation: "Validazione",
      value: "Anteprima",
    },
    sources: {
      project: "Progetto",
      environment: "Ambiente",
      launch: "Avvio",
    },
    types: {
      string: "Testo",
      number: "Numero",
      boolean: "Booleano",
      json: "JSON",
      secret: "Riferimento segreto",
    },
    overrides: "Sovrascrive {sources}",
    notOverridden: "Ereditata senza sovrascrittura",
    valid: "Valida",
    invalid: "Non valida",
    secretReference: "Riferimento protetto: {reference}",
    validation: {
      invalid: "Una variabile non valida è stata rifiutata da {source}.",
      crossTenant:
        "La variabile {name} è stata rifiutata perché appartiene a un altro cliente.",
      duplicate: "La variabile {name} è duplicata in {source}.",
      forbiddenOverride:
        "La variabile {name} non può essere sovrascritta da {source}.",
      unresolved:
        "La variabile {name} fa riferimento alla variabile mancante {reference}.",
      cycle: "Rilevato ciclo tra le dipendenze delle variabili: {members}.",
    },
  },
  EnvironmentSecrets: {
    title: "Riferimento segreto",
    description:
      "Seleziona metadati autorizzati. I valori segreti non vengono mai inviati alla Console.",
    label: "Riferimento segreto autorizzato",
    placeholder: "Seleziona un riferimento segreto",
    neverValidated: "Non ancora validato",
    remove: "Rimuovi riferimento",
    metadata: {
      name: "Nome riferimento",
      provider: "Provider",
      scope: "Ambito",
      status: "Stato",
      lastValidated: "Ultima validazione",
    },
    status: {
      active: "Attivo",
      revoked: "Revocato",
      expired: "Scaduto",
      unavailable: "Non disponibile",
    },
    validation: {
      unavailable:
        "Il riferimento segreto non è disponibile. Seleziona un riferimento autorizzato.",
      revoked:
        "Il riferimento segreto è stato revocato e non può essere usato.",
      expired: "Il riferimento segreto è scaduto e deve essere sostituito.",
    },
    confirmation: {
      title: "Rimuovere un riferimento segreto in uso?",
      description:
        "Il riferimento è usato da {count} configurazioni. La rimozione può bloccare le esecuzioni future.",
      cancel: "Mantieni riferimento",
      confirm: "Rimuovi riferimento",
    },
  },
  EnvironmentConnectionTest: {
    title: "Test connessione",
    description:
      "Richiedi a Idelium API di validare il target autorizzato dell'ambiente.",
    start: "Esegui test connessione",
    cancel: "Annulla test",
    running: "Validazione della connessione in corso.",
    duration: "{duration} ms",
    notAvailable: "Non disponibile",
    metadata: {
      outcome: "Esito",
      duration: "Durata",
      target: "Target",
      diagnostic: "Codice diagnostico",
    },
    outcomes: {
      success: "Riuscito",
      timeout: "Timeout",
      dns: "Errore DNS",
      tls: "Errore TLS",
      authentication: "Autenticazione fallita",
      capabilityMismatch: "Capacità non compatibile",
      targetUnavailable: "Target non disponibile",
      cancelled: "Annullato",
      unexpected: "Errore imprevisto",
    },
    remediation: {
      success: "Il target è raggiungibile e compatibile.",
      timeout:
        "Verifica la disponibilità del target o modifica il timeout limitato dell'API.",
      dns: "Verifica il nome host autorizzato e la sua configurazione DNS.",
      tls: "Verifica la catena del certificato e la policy di attendibilità.",
      authentication:
        "Sostituisci o autorizza nuovamente la credenziale referenziata e riprova.",
      capabilityMismatch:
        "Seleziona un target che esponga le capacità runtime richieste.",
      targetUnavailable:
        "Verifica lo stato del target gestito o contatta il suo amministratore.",
      cancelled: "Il test di connessione è stato annullato in sicurezza.",
      unexpected:
        "Il servizio di validazione non ha completato la richiesta. Riprova più tardi.",
    },
  },
  EnvironmentPreview: {
    title: "Configurazione risolta",
    description:
      "Verifica la rappresentazione approvata e oscurata che può raggiungere un runner.",
    caption: "Campi risolti della configurazione ambiente",
    copy: "Copia JSON oscurato",
    download: "Scarica JSON oscurato",
    copied: "Configurazione oscurata copiata.",
    downloaded: "Configurazione oscurata scaricata.",
    launchWarning:
      "Le sovrascritture all'avvio possono ancora modificare la configurazione effettiva.",
    versions: "Contratto {contract} · schema {schema} · catalogo {catalog}",
    columns: {
      field: "Campo",
      source: "Origine",
      override: "Risoluzione",
      validation: "Validazione",
      value: "Anteprima sicura",
    },
    sources: {
      default: "Valore predefinito dello schema",
      project: "Progetto",
      environment: "Ambiente",
      launch: "Avvio",
    },
    overridden: "Sovrascritto",
    inherited: "Ereditato",
    valid: "Valido",
    invalid: "Non valido",
    redacted: "[OSCURATO: {descriptor}]",
    redactedReference: "[OSCURATO: {descriptor} · {reference}]",
  },
  EnvironmentEditing: {
    title: "Modifiche ambiente",
    saved: "Nessuna modifica non salvata.",
    unsaved: "Sono presenti modifiche ambiente non salvate.",
    failed: "Salvataggio fallito. Le modifiche locali sono ancora disponibili.",
    lastSaved: "Ultimo salvataggio alle {timestamp}.",
    save: "Salva modifiche",
    saving: "Salvataggio modifiche",
    discard: "Annulla modifiche",
    archive: "Archivia ambiente",
    conflict: {
      title: "Esiste una versione più recente dell'ambiente",
      description:
        "Le modifiche sono state conservate. Verifica la versione più recente prima di riprovare.",
    },
    leave: {
      title: "Uscire con modifiche non salvate?",
      description:
        "Le modifiche ambiente non salvate rimarranno solo in questo editor.",
      stay: "Continua modifica",
      confirm: "Esci dalla pagina",
    },
    clone: {
      identityRequired: "Inserisci un nuovo nome ambiente e una destinazione.",
      referencesRequireValidation:
        "I riferimenti segreti sono stati rimossi e devono essere selezionati nuovamente.",
    },
  },
  StepEditor: {
    shell: {
      accessibleLabel: "Editor degli step riutilizzabili",
      title: "Editor step",
      description:
        "Scegli le azioni, configura la sequenza e verifica le proprietà.",
      catalog: "Catalogo azioni",
      sequence: "Canvas sequenza",
      inspector: "Proprietà",
      panelNavigation: "Aree dell'editor step",
      resizeCatalog: "Ridimensiona catalogo azioni",
      resizeInspector: "Ridimensiona proprietà",
      fullScreen: "Apri editor di codice a schermo intero",
      exitFullScreen: "Esci da schermo intero",
    },
    runtimes: {
      selenium: "Selenium",
      appium: "Appium",
      postman: "Postman",
      webservice: "Servizio web",
      plugin: "Plugin",
    },
    catalog: {
      accessibleLabel: "Azioni step disponibili",
      searchLabel: "Cerca azioni",
      searchPlaceholder: "Cerca per nome, finalità o tag",
      resultCount: "{count} azioni disponibili",
      empty: "Nessuna azione corrisponde alla ricerca e al runtime correnti.",
      deprecated: "Deprecata",
      experimental: "Sperimentale",
      unsupported: "Non disponibile",
      documentation: "Apri documentazione in inglese",
      opensNewWindow:
        "La documentazione per {action} si apre in una nuova finestra.",
      noDescription: "Non è disponibile una descrizione localizzata.",
      groups: {
        selenium: "Selenium",
        appium: "Appium",
        postman: "Postman",
        webservice: "Servizio web",
        plugin: "Plugin",
        "control-flow": "Controllo del flusso",
        shared: "Azioni condivise",
      },
      remediation: {
        unsupported:
          "Questa azione non è supportata. Scegli un'alternativa supportata.",
        runtime:
          "Passa al runtime {runtime} prima di aggiungere questa azione.",
        "minimum-version":
          "Aggiorna il runtime {runtime} alla versione {minimum} o successiva.",
        "maximum-version":
          "Questa azione supporta {runtime} fino alla versione {maximum}. Scegli un'azione compatibile.",
      },
    },
    form: {
      optional: "(facoltativo)",
      selectPlaceholder: "Seleziona un valore",
      locatorStrategy: "Strategia del selettore",
      locatorValue: "Valore del selettore",
      locatorStrategies: ["css", "xpath", "id", "accessibility-id"],
      listItem: "{field}, elemento {position}",
      addListItem: "Aggiungi elemento",
      removeListItem: "Rimuovi elemento {position}",
      remove: "Rimuovi",
      validationReady: "Tutti i campi visibili sono validi.",
      validationErrors: "{count} campi richiedono attenzione.",
      validation: {
        required: "Inserisci un valore.",
        number: "Inserisci un numero valido.",
        minimum: "Inserisci un valore uguale o superiore al minimo.",
        maximum: "Inserisci un valore uguale o inferiore al massimo.",
        enum: "Seleziona uno dei valori supportati.",
        json: "Inserisci un JSON valido.",
        list: "Inserisci un elenco valido.",
        minLength: "Inserisci un valore più lungo.",
        maxLength: "Inserisci un valore più corto.",
        pattern: "Usa il formato richiesto.",
        secretReference:
          "Seleziona un riferimento segreto valido. I valori segreti non possono essere inseriti qui.",
      },
    },
    wizard: {
      accessibleLabel: "Editor visuale della sequenza di step",
      inspector: "Proprietà dell'azione",
      actionNumber: "Azione {number}",
      closeInspector: "Chiudi proprietà",
      noSummary: "Non è disponibile un riepilogo dell'azione.",
      runtime: "Runtime",
      failureBehavior: "Comportamento in caso di errore",
      screenshotPolicy: "Criterio screenshot",
      validationStatus: "Validazione",
      valid: "Valida",
      invalid: "{count} problemi",
      notAvailable: "Non configurato",
      validationDiagnostic:
        "L'azione {number}, proprietà {property}, richiede attenzione.",
    },
    json: {
      accessibleLabel: "Editor JSON dello step",
      title: "Sorgente JSON",
      description:
        "Modifica in sicurezza lo step serializzato e applica esplicitamente le modifiche valide.",
      editorLabel: "Sorgente JSON dello step",
      format: "Formatta JSON",
      apply: "Applica modifiche JSON",
      diagnostics: "Diagnostica JSON",
      sourceSize: "{count} byte",
      location: "Riga {line}, colonna {column}, percorso {path}",
      readyToApply: "Le modifiche valide sono pronte per essere applicate.",
      valid: "Il sorgente JSON è valido e corrisponde al modello corrente.",
      validation: {
        syntax: "La sintassi JSON non è valida.",
        size: "Il sorgente JSON supera la dimensione supportata.",
        depth: "Il sorgente JSON contiene troppi livelli.",
        nodes: "Il sorgente JSON contiene troppi valori.",
        inlineSecret: "I valori segreti inline non sono consentiti.",
        schema: "Il sorgente JSON non rispetta lo schema dell'azione.",
      },
      remediation: {
        syntax: "Correggi la sintassi indicata prima di applicare.",
        size: "Riduci il sorgente sotto il limite supportato di un megabyte.",
        depth: "Riduci la nidificazione a un massimo di 50 livelli.",
        nodes: "Riduci il documento a un massimo di 20.000 valori.",
        inlineSecret:
          "Sostituisci il valore con un riferimento segreto autorizzato.",
        schema: "Correggi il valore nel percorso dello schema indicato.",
      },
    },
    dsl: {
      accessibleLabel: "Editor DSL Idelium",
      title: "Sorgente DSL",
      description:
        "Crea DSL Idelium versionato con diagnostica coerente con il catalogo.",
      editorLabel: "Sorgente DSL Idelium",
      apply: "Applica modifiche DSL",
      completions: "Azioni disponibili",
      completionsDescription:
        "Sono mostrate solo le azioni autorizzate che supportano il DSL.",
      noCompletions: "Nessuna azione DSL compatibile è disponibile.",
      documentation: "Documentazione",
      diagnostics: "Diagnostica DSL",
      location: "Riga {line}, colonna {column}",
      readyToApply: "Le modifiche DSL valide sono pronte per essere applicate.",
      valid: "Il sorgente DSL è valido e corrisponde al modello corrente.",
      validation: {
        default: "Il sorgente DSL non è valido.",
        DSL_SOURCE_EMPTY: "Il sorgente DSL non può essere vuoto.",
        DSL_VERSION_MISSING: "Manca la versione del linguaggio DSL.",
        DSL_VERSION_UNSUPPORTED:
          "La versione del linguaggio DSL non è supportata.",
        DSL_TEST_BLOCK_MISSING: "È necessario almeno un blocco test.",
        DSL_OPEN_HTTP_URL: "L'azione usa un URL HTTP non sicuro.",
        DSL_WAIT_TIMEOUT_IMPLICIT: "Il timeout di attesa è implicito.",
        DSL_SECRET_LITERAL: "Un valore segreto inline non è consentito.",
        DSL_BRACE_UNEXPECTED:
          "Una parentesi di chiusura non ha la corrispondente apertura.",
        DSL_BRACE_MISSING: "Manca la chiusura di un blocco.",
        DSL_SOURCE_TOO_LARGE:
          "Il sorgente DSL supera la dimensione supportata.",
        DSL_ACTION_UNSUPPORTED:
          "L'azione non è disponibile nel catalogo DSL autorizzato.",
        DSL_ACTION_RUNTIME_INCOMPATIBLE:
          "L'azione non è compatibile con il runtime attivo.",
      },
      remediation: {
        default: "Correggi il sorgente prima di applicare.",
        DSL_SOURCE_EMPTY: "Inizia con `idelium 1.0` e aggiungi un blocco test.",
        DSL_VERSION_MISSING:
          "Aggiungi `idelium 1.0` come prima riga di contenuto.",
        DSL_VERSION_UNSUPPORTED:
          "Migra il sorgente alla versione 1.0 del DSL Idelium.",
        DSL_TEST_BLOCK_MISSING: "Aggiungi un blocco test con nome.",
        DSL_OPEN_HTTP_URL: "Usa HTTPS negli ambienti condivisi ed enterprise.",
        DSL_WAIT_TIMEOUT_IMPLICIT: "Aggiungi un timeout esplicito.",
        DSL_SECRET_LITERAL:
          "Usa una variabile segreta o un parametro runtime autorizzato.",
        DSL_BRACE_UNEXPECTED:
          "Rimuovi la parentesi in eccesso o apri il blocco.",
        DSL_BRACE_MISSING: "Chiudi ogni blocco aperto.",
        DSL_SOURCE_TOO_LARGE: "Riduci il sorgente sotto 500.000 byte.",
        DSL_ACTION_UNSUPPORTED:
          "Scegli un'azione dal catalogo di completamento.",
        DSL_ACTION_RUNTIME_INCOMPATIBLE:
          "Cambia runtime o scegli un'azione compatibile.",
      },
    },
    conversion: {
      title: "Verifica conversione modalità",
      description: "Converti da {source} a {target}.",
      modes: {
        wizard: "Wizard",
        json: "JSON",
        dsl: "DSL",
      },
      dispositions: {
        preserved: "Preservati",
        normalized: "Normalizzati",
        lossy: "Con perdita",
        unsupported: "Non supportati",
      },
      location: "Posizione interessata: {path}",
      blocked:
        "La conversione è bloccata perché almeno un costrutto non è supportato.",
      acknowledgeLoss:
        "Comprendo che i commenti o la formattazione indicati non potranno essere recuperati dalla rappresentazione di destinazione.",
      cancel: "Annulla",
      convert: "Converti modalità",
      constructs: {
        default: "Questo costrutto richiede una verifica.",
        "stepEditor.conversion.preserved.mode":
          "La rappresentazione corrente viene preservata.",
        "stepEditor.conversion.preserved.action":
          "L'azione è supportata dalla modalità di destinazione.",
        "stepEditor.conversion.normalized.formatting":
          "La formattazione del sorgente sarà normalizzata.",
        "stepEditor.conversion.lossy.comment":
          "Un commento del sorgente non può essere rappresentato nella modalità di destinazione.",
        "stepEditor.conversion.unsupported.action":
          "Un'azione non è supportata dalla modalità di destinazione.",
        "stepEditor.conversion.unsupported.dslAst":
          "Il sorgente DSL non dispone di un modello di azioni convertibile.",
      },
    },
    testing: {
      accessibleLabel: "Validazione step e impatto aggiornamento",
      title: "Prova questo step",
      description:
        "Esegui una validazione mediata dal server su ambiente e destinazione autorizzati.",
      environment: "Ambiente",
      target: "Destinazione",
      timeout: "Timeout in millisecondi",
      selectEnvironment: "Seleziona un ambiente",
      selectTarget: "Seleziona una destinazione",
      run: "Esegui validazione",
      cancel: "Annulla validazione",
      result: "Risultato validazione",
      duration: "Durata: {duration} ms",
      status: {
        passed: "Superata",
        failed: "Validazione non riuscita",
        timeout: "Timeout",
        cancelled: "Annullata",
        unavailable: "Destinazione non disponibile",
      },
      remediation: {
        default:
          "Verifica il risultato e correggi lo step prima dell'aggiornamento.",
        selectionUnavailable:
          "Scegli un ambiente autorizzato e una destinazione compatibile.",
        targetUnavailable:
          "Verifica la disponibilità o scegli un'altra destinazione compatibile.",
        timeout:
          "Aumenta il timeout entro i limiti o verifica le prestazioni della destinazione.",
        validationFailed:
          "Correggi l'errore di validazione ed esegui nuovamente il test.",
        cancelled: "Esegui nuovamente la validazione quando sei pronto.",
      },
      artifact: "{name}, {size} byte",
      impact: "Impatto aggiornamento",
      impactDescription:
        "Verifica i consumatori autorizzati del tenant prima di aggiornare questo step riutilizzabile.",
      consumerTypes: {
        test: "Test",
        cycle: "Ciclo di test",
        schedule: "Pianificazione",
      },
      pinnedVersion: "Vincolato a {version}",
      unpinned: "Usa la bozza corrente",
      noImpact: "Nessun consumatore autorizzato è interessato.",
      pagination: "Pagina {page}, {pageSize} per pagina, {total} totali",
      governance: "Criterio di aggiornamento",
      publishVersion: "Pubblica una nuova versione immutabile",
      updateDraft: "Aggiorna la bozza corrente",
      continueUpdate: "Continua con il criterio selezionato",
    },
    diagnostics: {
      malformedConfig:
        "La configurazione salvata dello step non è valida. Apri la modalità JSON per correggerla.",
      unknownAction:
        "Questo tipo di azione non è disponibile nel catalogo autorizzato.",
      newerCatalogVersion:
        "Lo step usa una versione del catalogo più recente. Aggiorna Idelium prima di modificarlo.",
      unsupportedCatalogVersion:
        "Lo step usa una versione del catalogo fuori dalla finestra di compatibilità supportata.",
      legacyCatalogVersion:
        "Questo step legacy non ha una versione del catalogo e sarà aggiornato quando verrà modificato.",
      deprecatedAction:
        "Questa azione è deprecata ma resta leggibile durante la finestra di compatibilità.",
    },
  },
  SequenceBuilder: {
    accessibleLabel: "Composizione sequenza",
    selectedTitle: "Sequenza selezionata",
    selectedDescription:
      "Verifica gli elementi che saranno salvati nell'ordine corrente.",
    emptyTitle: "Nessun elemento selezionato",
    emptyDescription:
      "Seleziona gli elementi disponibili e aggiungili alla sequenza.",
    removeSelected: "Rimuovi selezionati",
    removeItem: "Rimuovi {name}",
    configureItem: "Configura {name}",
    duplicateItem: "Duplica {name}",
    duplicated: "{name} è stata duplicata.",
    selectItem: "Seleziona {name}",
    undo: "Annulla rimozione",
    position: "Posizione {position}",
    drag: "Trascina",
    dragHandle: "Trascina {name} per riordinare",
    moveToStart: "Sposta all'inizio",
    moveUp: "Sposta su",
    moveDown: "Sposta giù",
    moveToEnd: "Sposta alla fine",
    alreadyFirst: "Questo elemento è già il primo.",
    alreadyLast: "Questo elemento è già l'ultimo.",
    moved: "{name} spostato dalla posizione {from} alla posizione {to}.",
    added: "{count} elementi aggiunti alla sequenza.",
    removed: "{count} elementi rimossi dalla sequenza.",
    restored: "{count} elementi ripristinati nella sequenza.",
    duplicate: "{count} elementi duplicati non sono stati aggiunti.",
    validation: {
      title: "Validazione sequenza",
      description:
        "Risolvi i problemi bloccanti e verifica l'impatto prima di salvare.",
      ready: "Pronto per il salvataggio",
      blocked: "Salvataggio bloccato",
      error: "Errore",
      warning: "Avviso",
      acknowledge: "Ho verificato questo avviso",
      noDiagnostics: "Nessun problema rilevato nella sequenza.",
      impactTitle: "Impatto sulle dipendenze",
      impactDescription:
        "La modifica di questo contenuto riutilizzabile interessa questi riferimenti autorizzati.",
      tests: "Test",
      cycles: "Cicli",
      schedules: "Pianificazioni",
    },
    saveBar: {
      title: "Persistenza sequenza",
      saved: "Tutte le modifiche sono salvate",
      unsaved: "Modifiche non salvate",
      lastSaved: "Ultimo salvataggio",
      serverVersion: "Versione server",
      never: "Non ancora salvato",
      legacy: "Endpoint legacy",
      undo: "Annulla",
      redo: "Ripristina",
      discard: "Scarta modifiche",
      save: "Salva sequenza",
      conflictTitle: "È disponibile una versione server più recente",
      conflictDescription:
        "La sequenza locale è preservata. Ricarica, confronta o riprova se l'endpoint lo supporta.",
      reload: "Ricarica versione server",
      compare: "Confronta modifiche",
      retry: "Riprova salvataggio",
    },
    picker: {
      title: "Elementi disponibili",
      description: "Cerca e seleziona gli elementi idonei per questa sequenza.",
      addSelected: "Aggiungi selezionati",
      addItem: "Aggiungi {name}",
      resultCount: "{count} elementi disponibili",
      searchLabel: "Cerca elementi disponibili",
      searchPlaceholder: "Cerca per nome o metadati",
      allFilterValues: "Tutti",
      paginationLabel: "Pagine degli elementi disponibili",
      previousPage: "Precedente",
      nextPage: "Successiva",
      pageStatus: "Pagina {page} di {pages}",
      retry: "Riprova",
      clearFilters: "Cancella ricerca e filtri",
      disabledReasons: {
        invalid: "Questo elemento non è valido.",
        referenceMissing: "Questo elemento è mancante o non disponibile.",
        referenceStale:
          "Verifica la versione più recente prima di selezionare l'elemento.",
        unavailable: "Questo elemento non può essere selezionato.",
      },
    },
    metadata: {
      runtime: "Runtime",
      tags: "Tag",
      owner: "Proprietario",
      version: "Versione",
      status: "Stato",
    },
    diagnostics: {
      archivedDependency:
        "Una dipendenza archiviata non può essere utilizzata nella sequenza.",
      invalid: "Questo elemento non è valido e non può essere selezionato.",
      incompatibleRuntime:
        "Questo elemento usa un runtime incompatibile con la sequenza.",
      malformed: "La sequenza salvata non è valida.",
      duplicate: "Questo elemento è già presente nella sequenza.",
      limit: "La sequenza supera il limite di elementi supportato.",
      missingVersion:
        "Questo elemento riutilizzabile non ha una versione selezionata.",
      referenceMissing:
        "L'elemento referenziato è mancante o non è più disponibile.",
      referenceStale:
        "È disponibile una versione più recente. Verificala prima di salvare.",
      required: "La sequenza non contiene tutti gli elementi obbligatori.",
      conflict: "La sequenza è cambiata sul server durante la modifica.",
      saveFailed: "Non è stato possibile salvare la sequenza.",
      validationFailed: "Il server ha rifiutato la validazione della sequenza.",
      validationUnavailable:
        "La validazione della sequenza non è temporaneamente disponibile.",
      serverRejected:
        "Il server ha rifiutato la sequenza senza esporre dettagli protetti.",
    },
    remediation: {
      addRequired: "Aggiungi l'elemento obbligatorio prima di salvare.",
      archivedDependency:
        "Sostituisci la dipendenza archiviata con un elemento attivo autorizzato.",
      duplicate: "Rimuovi l'occorrenza duplicata.",
      incompatibleRuntime:
        "Usa elementi con runtime compatibili o modifica la policy.",
      invalid: "Sostituisci l'elemento non valido.",
      limit: "Riduci il numero di elementi selezionati.",
      malformed: "Ricarica la sequenza e correggi la struttura salvata.",
      missingVersion: "Seleziona una versione immutabile per l'elemento.",
      reduceItems:
        "Rimuovi gli elementi fino a rispettare il limite della policy.",
      referenceMissing: "Sostituisci il riferimento mancante.",
      referenceStale: "Verifica e seleziona la versione autorizzata corrente.",
      removeDuplicate: "Rimuovi l'occorrenza duplicata.",
      replaceArchived:
        "Sostituisci la dipendenza archiviata con un elemento attivo autorizzato.",
      replaceMissing: "Sostituisci il riferimento mancante.",
      required: "Aggiungi l'elemento obbligatorio prima di salvare.",
      conflict:
        "Confronta o ricarica la versione server corrente prima di riprovare.",
      saveFailed:
        "Mantieni le modifiche locali e riprova l'operazione di salvataggio.",
      validationFailed:
        "Risolvi i problemi di validazione server prima di riprovare.",
      validationUnavailable:
        "Mantieni la sequenza locale e riprova la validazione prima di salvare.",
      reviewVersion: "Verifica e seleziona la versione autorizzata corrente.",
      selectVersion: "Seleziona una versione immutabile per l'elemento.",
      serverRejected:
        "Verifica i campi e riprova. Contatta un amministratore se il problema persiste.",
      useCompatibleRuntime:
        "Usa elementi con runtime compatibili o modifica la policy.",
    },
    unavailableItem: "Elemento non disponibile",
  },
  Platforms: {
    platforms: "Piattaforme",
    os: "Sistemi Operativi",
    osVersion: "Versione Os",
    browsers: "Browser",
    browserVersion: "Versione Browser",
    brands: "Brands",
    models: "Modelli",
    location: "Località",
    btnSave: "salva",
    btnModify: "Aggiorna",
    btnCancel: "Annulla",
    Grid: {
      searchLabel: "Cerca piattaforme",
      searchPlaceholder: "Cerca nel catalogo delle piattaforme",
      paginationLabel: "Pagine del catalogo piattaforme",
      previousPage: "Precedente",
      nextPage: "Successiva",
      pageStatus: "Pagina {page} di {pages}",
    },
    ManagePlatform: {
      btnAddPlatform: "Aggiungi piattaforma",
      colId: "id",
      colHost: "host",
      colLocation: "località",
      colBrand: "marca",
      colOs: "so",
      colBrowser: "browser",
      colStatus: "stato",
      confirmationPlatform: "Sei sicuro di voler eliminare la piattaforma ?",
      btnCancel: "annulla",
      btnDelete: "elimina",
      titleAlert: "Elimina piattaforma",
      all: "tutti",
      modalAddPlatform: {
        chooseType: "--- Seleziona ---",
        modalTitle: "Aggiungi piattaforma",
        placeholderHost: "ex: 10.10.10.10 o device.example.com",
        lblAddress: "Indirizzo IP o nome host",
        lblLocation: "Località",
        lblBrand: "Marca",
        lblModel: "Modello",
        lblType: "Tipo",
        lblOs: "Sistema Operativo",
        lblOsVersion: "Versione SO",
        lblBrowser: "Browser",
        lblBrowserVersion: "Versione Browser",
        btnSaveNewPlatform: "Salva nuova piattaforma",
      },
    },
    Os: {
      name: "Inserisci il sistema operativo",
      id: "id",
      colName: "nome",
    },
    OsVersion: {
      name: "Inserisci la versione del Sistema Operativo",
      id: "id",
      colOs: "Sistema Operativo",
      colVersion: "Versione",
    },
    Browsers: {
      name: "Inserisci il nome del brwoser",
      id: "id",
      colOs: "Sistema Operativo",
      colBrowser: "Browser",
    },
    BrowserVersion: {
      name: "Inserisci la versione del browser",
      id: "id",
      colOs: "Sistema Operativo",
      colBrowser: "Browser",
      colBrowserVersion: "Version Browser",
    },
    Brand: {
      name: "Inserisci nuovo brand  (Apple, Samsung, Lg....)",
      id: "id",
      colBrand: "Marche",
    },
    ModelDevice: {
      name: "Inserisci nuovo modello",
      id: "id",
      colBrand: "Marca",
      colModel: "Model",
    },
    Location: {
      name: "Inserisci nuova località",
      id: "id",
      colLocation: "Località",
    },
  },
};
