export function routableTabs(defaultTab, tabs) {
  const validTabs = new Set(tabs)

  return {
    data() {
      return {
        activeTab: defaultTab
      }
    },
    watch: {
      '$route.params.tab'() {
        this.syncTabFromRoute()
      }
    },
    created() {
      this.syncTabFromRoute()
    },
    methods: {
      isActiveTab(tab) {
        return this.activeTab === tab
      },
      tabButtonClass(tab) {
        return ['nav-link', { active: this.isActiveTab(tab) }]
      },
      tabPaneClass(tab) {
        return ['tab-pane', 'fade', { show: this.isActiveTab(tab), active: this.isActiveTab(tab) }]
      },
      openTab(tab) {
        if (!validTabs.has(tab) || this.isActiveTab(tab)) return

        this.$router.push({ name: this.$route.name, params: { ...this.$route.params, tab } })
      },
      syncTabFromRoute() {
        const tab = this.$route.params.tab || defaultTab

        if (!validTabs.has(tab)) {
          this.$router.replace({
            name: this.$route.name,
            params: { ...this.$route.params, tab: defaultTab }
          })
          return
        }

        const previousTab = this.activeTab
        this.activeTab = tab

        if (previousTab !== tab && typeof this.onRoutableTabChange === 'function') {
          this.onRoutableTabChange(tab, previousTab)
        }
      }
    }
  }
}
