<template>
  <div class="costum tests-page">
    <div class="row">
      <div class="col-12">
        <div class="card" v-if="!isBuilderRoute">
          <div
            class="nav nav-tabs idelium-enterprise-tabs"
            id="nav-tab"
            role="tablist"
          >
            <button
              :class="tabButtonClass('modify')"
              id="nav-tabTitleModify-tab"
              type="button"
              role="tab"
              aria-controls="nav-tabTitleModify"
              :aria-selected="isActiveTab('modify')"
              ref="home"
              :disabled="isModifyTabDisabled"
              v-on:click="openTab('modify')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleModify }}
            </button>
            <button
              :class="tabButtonClass('new')"
              id="nav-tabTitleNewTest-tab"
              type="button"
              role="tab"
              ref="tabTitleNewTest"
              aria-controls="nav-tabTitleNewTest"
              :aria-selected="isActiveTab('new')"
              v-on:click="openTab('new')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleNewTest }}
            </button>
            <button
              :class="tabButtonClass('import')"
              id="nav-tabTitleImportTest-tab"
              type="button"
              role="tab"
              ref="tabTitleImportTest"
              aria-controls="nav-tabTitleImportTest"
              :aria-selected="isActiveTab('import')"
              v-on:click="openTab('import')"
            >
              {{ language[config.currentLanguage].Tests.tabTitleImportTest }}
            </button>
          </div>
          <div
            class="tab-content idelium-enterprise-tab-content"
            id="pills-tabContent"
          >
            <div
              :class="tabPaneClass('modify')"
              id="nav-tabTitleModify"
              role="tabpanel"
              aria-labelledby="tabTitleModify-tab"
            >
              <!-- start tabTitleModify tab -->
              <div v-if="arrayTests.length > 0" class="tests-master-detail">
                <section class="tests-test-picker">
                  <header class="tests-test-picker__header">
                    <div>
                      <p class="tests-test-picker__eyebrow">
                        {{
                          language[config.currentLanguage].Tests
                            .testPickerEyebrow
                        }}
                      </p>
                      <h2 id="tests-test-picker-title">
                        {{
                          language[config.currentLanguage].Tests.testPickerTitle
                        }}
                      </h2>
                      <p>
                        {{
                          language[config.currentLanguage].Tests
                            .testPickerDescription
                        }}
                      </p>
                    </div>
                    <span class="tests-test-picker__count">
                      {{
                        formatTestPickerCount(
                          filteredTests.length,
                          language[config.currentLanguage].Tests.testPickerCount,
                        )
                      }}
                    </span>
                  </header>
                  <input
                    class="form-control tests-test-picker__search"
                    type="search"
                    v-model.trim="testSearch"
                    :placeholder="
                      language[config.currentLanguage].Tests
                        .testPickerSearchPlaceholder
                    "
                    aria-labelledby="tests-test-picker-title"
                  />
                  <div
                    v-if="filteredTests.length > 0"
                    class="tests-test-picker__grid"
                    role="listbox"
                    :aria-label="
                      language[config.currentLanguage].Tests.testPickerTitle
                    "
                  >
                    <button
                      v-for="test in filteredTests"
                      v-bind:key="test.id"
                      type="button"
                      :class="[
                        'tests-test-picker-card',
                        { 'is-selected': isSelectedTest(test) },
                      ]"
                      role="option"
                      :aria-selected="isSelectedTest(test)"
                      v-on:click="selectTest(test)"
                    >
                      <span class="tests-test-picker-card__id">
                        #{{ test.id }}
                      </span>
                      <span class="tests-test-picker-card__body">
                        <strong>{{ test.name }}</strong>
                        <small>{{ testSummary(test) }}</small>
                      </span>
                      <span
                        v-if="isSelectedTest(test)"
                        class="tests-test-picker-card__status"
                      >
                        {{
                          language[config.currentLanguage].Tests
                            .testPickerSelected
                        }}
                      </span>
                    </button>
                  </div>
                  <div v-else class="tests-test-picker__empty">
                    {{ language[config.currentLanguage].Tests.testPickerEmpty }}
                  </div>
                </section>
                <aside
                  class="tests-test-detail"
                  v-if="testSelected != null"
                  aria-live="polite"
                >
                  <p class="tests-test-picker__eyebrow">
                    {{ language[config.currentLanguage].Tests.testDetailEyebrow }}
                  </p>
                  <h2>{{ selectedTestName }}</h2>
                  <p>{{ testSummary(testSelected) }}</p>
                  <dl class="tests-test-detail__metrics">
                    <div>
                      <dt>{{ language[config.currentLanguage].Tests.testDetailId }}</dt>
                      <dd>#{{ testSelected.id }}</dd>
                    </div>
                    <div>
                      <dt>
                        {{ language[config.currentLanguage].Tests.testDetailSteps }}
                      </dt>
                      <dd>{{ selectedTestStepCount }}</dd>
                    </div>
                  </dl>
                  <label class="tests-test-detail__field">
                    <span>
                      {{
                        language[config.currentLanguage].Tests
                          .placeholderDescriptionTest
                      }}
                    </span>
                    <input
                      class="form-control tests-test-picker__description"
                      :placeholder="
                        language[config.currentLanguage].Tests
                          .placeholderDescriptionTest
                      "
                      v-model="modifyDescriptionTest"
                    />
                  </label>
                  <div class="tests-test-detail__actions">
                    <button
                      type="button"
                      class="btn btn-success"
                      :disabled="testSelected == null"
                      v-on:click="modifyTest()"
                    >
                      {{ language[config.currentLanguage].Tests.btnModifyTest }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-primary"
                      v-on:click="openTestBuilder(testSelected)"
                    >
                      {{
                        language[config.currentLanguage].Tests
                          .openWorkflowBuilder
                      }}
                    </button>
                  </div>
                </aside>
                <aside class="tests-test-detail tests-test-detail--empty" v-else>
                  <p class="tests-test-picker__eyebrow">
                    {{ language[config.currentLanguage].Tests.testDetailEyebrow }}
                  </p>
                  <h2>
                    {{
                      language[config.currentLanguage].Tests
                        .selectTestToManageStepsTitle
                    }}
                  </h2>
                  <p>
                    {{
                      language[config.currentLanguage].Tests
                        .testDetailEmptyDescription
                    }}
                  </p>
                </aside>
              </div>
              <!-- end tabTitleModify tab -->
            </div>
            <div
              :class="tabPaneClass('new')"
              id="nav-tabTitleNewTest"
              role="tabpanel"
              aria-labelledby="tabTitleNewTest-tab"
            >
              <!-- start tabTitleModify tab -->
              <input
                class="form-control formTest"
                :placeholder="
                  language[config.currentLanguage].Tests.placeholderNameTest
                "
                v-model="newNameTest"
                :disabled="disableNameTest"
              />
              <input
                class="form-control formTest"
                :placeholder="
                  language[config.currentLanguage].Tests
                    .placeholderDescriptionTest
                "
                v-model="newDescriptionTest"
                :disabled="disableTestDescription"
              />
              <button
                type="button"
                class="btn btn-success btn-sm"
                style="float: right"
                :disabled="disableBtnCreateTest"
                v-on:click="saveTest()"
              >
                {{ language[config.currentLanguage].Tests.btnCreateTest }}
              </button>
              <!-- end tabTitleModify tab -->
            </div>
            <div
              :class="tabPaneClass('import')"
              id="nav-tabTitleImportTest"
              role="tabpanel"
              aria-labelledby="tabTitleImportTest-tab"
            >
              <!-- start tabTitleModify tab -->
              <ImportIdeliumTest
                ref="importTestUpload"
                v-on:importTest="importTest"
              />
              <!-- end tabTitleModify tab -->
            </div>
          </div>
        </div>
        <section
          v-if="isBuilderRoute"
          class="tests-builder-hero"
          aria-labelledby="tests-builder-title"
        >
          <button
            type="button"
            class="btn btn-secondary tests-builder-back"
            v-on:click="backToTestsCatalog()"
          >
            <font-awesome-icon icon="arrow-left" />
            {{ language[config.currentLanguage].Tests.backToTestsCatalog }}
          </button>
          <div>
            <p class="tests-test-picker__eyebrow">
              {{ language[config.currentLanguage].Tests.builderEyebrow }}
            </p>
            <h1 id="tests-builder-title">{{ selectedTestName }}</h1>
            <p>{{ builderDescription }}</p>
          </div>
          <button
            type="button"
            class="btn btn-success tests-builder-save"
            :disabled="testSelected == null"
            v-on:click="modifyTest()"
          >
            {{ language[config.currentLanguage].Tests.saveWorkflow }}
          </button>
        </section>
        <section
          v-if="shouldShowStepComposition"
          :class="[
            'tests-composition',
            { 'tests-composition--builder': isBuilderRoute },
          ]"
          aria-labelledby="test-composition-title"
        >
          <header>
            <h2 id="test-composition-title">
              {{ language[config.currentLanguage].Tests.compositionTitle }}
            </h2>
            <p>
              {{
                language[config.currentLanguage].Tests.compositionDescription
              }}
            </p>
          </header>
          <SequenceBuilder
            :accessible-label="sequenceBuilderCopy.accessibleLabel"
            :allow-duplicates="true"
            :available-items="builderAvailableSteps"
            :copy="sequenceBuilderCopy"
            layout="split"
            :picker-filters="testStepPickerFilters"
            :picker-meta="testStepPickerMeta"
            :picker-query="testStepPickerQuery"
            :sequence="testStepSequenceItems"
            :validation="testStepValidation"
            v-on:picker-query-change="handleStepPickerQuery"
            v-on:update:sequence="updateTestStepSequence"
          />
        </section>
        <section
          v-else-if="!isBuilderRoute && tabOpen == 0"
          class="tests-composition tests-composition--empty"
          aria-labelledby="test-composition-empty-title"
        >
          <header>
            <h2 id="test-composition-empty-title">
              {{
                language[config.currentLanguage].Tests
                  .selectTestToManageStepsTitle
              }}
            </h2>
            <p>
              {{
                language[config.currentLanguage].Tests
                  .selectTestToManageStepsDescription
              }}
            </p>
          </header>
        </section>
        <section
          class="tests-import-workspace"
          v-if="!isBuilderRoute && tabOpen == 2 && arrayStepsImported.length != 0"
          aria-labelledby="tests-import-review-title"
        >
          <div class="tests-import-review-panel">
            <header class="tests-import-review-header">
              <div>
                <p class="tests-import-eyebrow">
                  {{ language[config.currentLanguage].Tests.importReviewEyebrow }}
                </p>
                <h2 id="tests-import-review-title">
                  {{
                    importedNameTest ||
                    language[config.currentLanguage].Tests.importReviewFallbackTitle
                  }}
                </h2>
                <p>
                  {{
                    importedDescriptionTest ||
                    language[config.currentLanguage].Tests.importReviewDescription
                  }}
                </p>
              </div>
              <dl class="tests-import-summary">
                <div>
                  <dt>{{ language[config.currentLanguage].Tests.importedSteps }}</dt>
                  <dd>{{ arrayStepsImported.length }}</dd>
                </div>
                <div>
                  <dt>
                    {{ language[config.currentLanguage].Tests.importedActions }}
                  </dt>
                  <dd>{{ importedActionsTotal() }}</dd>
                </div>
              </dl>
            </header>
            <div class="tests-import-list-wrapper">
              <ol class="tests-import-review">
                <li
                  v-for="(element, index) in arrayStepsImported"
                  v-bind:key="arrayImportedStepKeys[index]"
                  class="tests-import-review__item"
                >
                  <article class="tests-import-step-card">
                    <div class="tests-import-step-card__order">
                      {{ index + 1 }}
                    </div>
                    <div class="tests-import-step-card__body">
                      <button
                        type="button"
                        class="tests-import-step-card__title"
                        v-on:click="editImportedItem(index)"
                        v-if="arrayEditImportedSteps[index] == false"
                      >
                        {{ element.name }}
                      </button>
                      <input
                        class="form-control tests-import-step-card__input"
                        v-if="arrayEditImportedSteps[index] == true"
                        v-on:keyup.enter="endEditImportedItem(index)"
                        v-model="arrayStepsImported[index].name"
                      />
                      <p class="tests-import-step-card__meta">
                        {{
                          formatImportCount(
                            importedActionCount(element),
                            language[config.currentLanguage].Tests.importedActionsCount,
                          )
                        }}
                        <span v-if="element.steps?.[0]?.findBy">
                          · {{ element.steps[0].findBy }}
                        </span>
                      </p>
                      <ul
                        class="tests-import-action-preview"
                        v-if="Array.isArray(element.steps)"
                      >
                        <li
                          v-for="(action, actionIndex) in element.steps.slice(0, 3)"
                          v-bind:key="`${arrayImportedStepKeys[index]}-${actionIndex}`"
                        >
                          <span>{{ action.stepType || action.type || "action" }}</span>
                          <code>{{ actionTargetSummary(action) }}</code>
                        </li>
                      </ul>
                    </div>
                    <div class="tests-import-step-card__actions">
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--reorder"
                        v-on:click="moveImportedItem(index, index - 1)"
                        :disabled="index === 0"
                        :title="
                          language[config.currentLanguage].Tests.moveImportedUp
                        "
                      >
                        <font-awesome-icon
                          icon="arrow-up"
                          class="idelium-action-icon--update"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--reorder"
                        v-on:click="moveImportedItem(index, index + 1)"
                        :disabled="index === arrayStepsImported.length - 1"
                        :title="
                          language[config.currentLanguage].Tests
                            .moveImportedDown
                        "
                      >
                        <font-awesome-icon
                          icon="arrow-down"
                          class="idelium-action-icon--update"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--edit"
                        v-on:click="editImportedItem(index)"
                        :title="
                          language[config.currentLanguage].Tests.editImported
                        "
                      >
                        <font-awesome-icon
                          icon="pen"
                          class="idelium-action-icon--modify"
                        />
                      </button>
                      <button
                        type="button"
                        class="tests-icon-action tests-icon-action--delete"
                        v-on:click="deleteItemImported(index)"
                        :title="language[config.currentLanguage].Actions.remove"
                      >
                        <font-awesome-icon
                          icon="times-circle"
                          class="deleteIcon iconClass idelium-action-icon--remove"
                        />
                      </button>
                    </div>
                  </article>
                </li>
              </ol>
            </div>
          </div>
          <aside class="tests-import-actions-panel">
            <p class="tests-import-eyebrow">
              {{ language[config.currentLanguage].Tests.importReadyEyebrow }}
            </p>
            <h3>{{ language[config.currentLanguage].Tests.importReadyTitle }}</h3>
            <p>
              {{ language[config.currentLanguage].Tests.importReadyDescription }}
            </p>
            <button
              type="button"
              class="btn btn-success tests-import-primary-action"
              v-on:click="saveImportTest()"
            >
              {{ language[config.currentLanguage].Tests.btnImportTest }}
            </button>
            <button
              type="button"
              class="btn btn-secondary tests-import-secondary-action"
              v-on:click="cancelUpload()"
            >
              {{ language[config.currentLanguage].Tests.btnCancel }}
            </button>
          </aside>
        </section>
      </div>
    </div>
  </div>
</template>
<style scoped>
.tests-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 76px - 3rem);
  height: calc(100dvh - 76px - 3rem);
  max-width: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.tests-page > .row,
.tests-page > .row > .col-12 {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}

.tests-page .card {
  flex: 0 0 auto;
}

.tests-master-detail {
  display: grid;
  gap: var(--id-space-4);
  grid-template-columns: minmax(18rem, 0.95fr) minmax(22rem, 1.05fr);
  padding: var(--id-space-4);
}

.formTest {
  margin: 10px;
  width: 98%;
  text-transform: uppercase;
}

.tests-test-picker {
  display: grid;
  gap: var(--id-space-3);
  min-width: 0;
}

.tests-test-picker__header {
  align-items: flex-start;
  display: flex;
  gap: var(--id-space-3);
  justify-content: space-between;
}

.tests-test-picker__header h2,
.tests-test-picker__header p {
  margin: 0;
}

.tests-test-picker__header h2 {
  color: var(--id-text-primary);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tests-test-picker__header p:not(.tests-test-picker__eyebrow) {
  color: var(--id-text-secondary);
  line-height: 1.5;
  margin-top: 0.35rem;
}

.tests-test-picker__eyebrow,
.tests-test-picker__count {
  color: var(--id-text-muted);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.tests-test-picker__count {
  background: var(--id-surface-soft);
  border: 1px solid var(--id-border);
  border-radius: 999px;
  color: var(--id-accent);
  flex: 0 0 auto;
  padding: 0.4rem 0.75rem;
}

.tests-test-picker__search,
.tests-test-picker__description {
  margin: 0;
  width: 100%;
}

.tests-test-picker__grid {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: 1fr;
  max-height: 31rem;
  overflow-y: auto;
  padding-right: 0.25rem;
  scrollbar-color: rgba(255, 122, 24, 0.8) rgba(255, 255, 255, 0.08);
}

.tests-test-picker-card {
  align-items: center;
  background:
    linear-gradient(145deg, rgba(255, 122, 24, 0.05), transparent 36%),
    var(--id-surface-soft);
  border: 1px solid var(--id-border);
  border-radius: 1rem;
  color: var(--id-text-primary);
  cursor: pointer;
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 5rem;
  padding: 0.95rem 1rem;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.tests-test-picker-card:hover,
.tests-test-picker-card:focus-visible {
  border-color: rgba(255, 122, 24, 0.62);
  box-shadow: 0 0.9rem 2rem rgba(255, 122, 24, 0.12);
  outline: none;
  transform: translateY(-1px);
}

.tests-test-picker-card.is-selected {
  background:
    linear-gradient(145deg, rgba(255, 122, 24, 0.22), transparent 42%),
    var(--id-surface-soft);
  border-color: var(--id-accent);
  box-shadow: 0 1rem 2.4rem rgba(255, 122, 24, 0.18);
}

.tests-test-picker-card__id {
  align-items: center;
  background: rgba(255, 122, 24, 0.15);
  border: 1px solid rgba(255, 122, 24, 0.35);
  border-radius: 0.85rem;
  color: var(--id-accent);
  display: inline-flex;
  font-weight: 900;
  height: 2.5rem;
  justify-content: center;
  min-width: 2.8rem;
}

.tests-test-picker-card__body {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.tests-test-picker-card__body strong,
.tests-test-picker-card__body small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tests-test-picker-card__body strong {
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tests-test-picker-card__body small {
  color: var(--id-text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.tests-test-picker-card__status {
  background: rgba(255, 122, 24, 0.18);
  border-radius: 999px;
  color: var(--id-accent);
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  padding: 0.35rem 0.6rem;
  text-transform: uppercase;
}

.tests-test-picker__empty {
  border: 1px dashed var(--id-border);
  border-radius: 1rem;
  color: var(--id-text-secondary);
  padding: 1.2rem;
  text-align: center;
}

.tests-test-detail,
.tests-builder-hero {
  background:
    linear-gradient(145deg, rgba(255, 122, 24, 0.1), transparent 34%),
    var(--id-surface-soft);
  border: 1px solid var(--id-border);
  border-radius: 1.15rem;
  box-shadow: 0 1rem 2.4rem rgba(0, 0, 0, 0.16);
}

.tests-test-detail {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: var(--id-space-4);
  min-width: 0;
  padding: var(--id-space-4);
}

.tests-test-detail h2,
.tests-test-detail p,
.tests-builder-hero h1,
.tests-builder-hero p {
  margin: 0;
}

.tests-test-detail h2,
.tests-builder-hero h1 {
  color: var(--id-text-primary);
  font-weight: 900;
  letter-spacing: 0.04em;
}

.tests-test-detail p,
.tests-builder-hero p {
  color: var(--id-text-secondary);
  line-height: 1.55;
}

.tests-test-detail__metrics {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
}

.tests-test-detail__metrics div,
.tests-test-detail__field {
  background: var(--id-surface);
  border: 1px solid var(--id-border);
  border-radius: 0.95rem;
  padding: 0.95rem;
}

.tests-test-detail__metrics dt,
.tests-test-detail__field span {
  color: var(--id-text-muted);
  display: block;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.tests-test-detail__metrics dd {
  color: var(--id-text-primary);
  font-size: 1.25rem;
  font-weight: 900;
  margin: 0.25rem 0 0;
}

.tests-test-detail__field {
  display: grid;
  gap: var(--id-space-2);
}

.tests-test-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--id-space-3);
  margin-top: auto;
}

.tests-test-detail__actions .btn {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  min-width: 11rem;
}

.tests-test-detail--empty {
  justify-content: center;
}

.tests-builder-hero {
  align-items: center;
  display: grid;
  gap: var(--id-space-4);
  grid-template-columns: auto minmax(0, 1fr) auto;
  margin-top: var(--id-space-4);
  padding: var(--id-space-4);
}

.tests-builder-back,
.tests-builder-save {
  align-items: center;
  display: inline-flex;
  gap: var(--id-space-2);
  justify-content: center;
  white-space: nowrap;
}

.tests-composition--builder {
  background: var(--id-surface-soft);
  border: 1px solid var(--id-border);
  border-radius: 1.15rem;
  padding: var(--id-space-4);
}

.tests-workspace {
  flex: 1 1 auto;
  margin-top: 1rem;
  min-height: 0;
  overflow: hidden;
}

.tests-import-workspace {
  display: grid;
  flex: 1 1 auto;
  gap: var(--id-space-4);
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
  margin-top: var(--id-space-4);
  min-height: 0;
  overflow: hidden;
}

.tests-composition {
  display: grid;
  gap: var(--id-space-4);
  margin-top: var(--id-space-4);
  min-height: 0;
  overflow: auto;
}

.tests-composition > header h2,
.tests-composition > header p {
  margin: 0;
}

.tests-workspace > .col-sm-6,
.tests-selected-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tests-steps-list,
.tests-selected-list,
.tests-import-list-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.tests-workspace-spacer {
  max-width: 2rem;
}

.tests-selected-panel {
  border: 1px dashed rgba(255, 122, 24, 0.45);
  border-radius: 1rem;
  overflow: hidden;
  padding-bottom: 0.75rem;
}

.tests-selected-list {
  border-radius: 0.9rem;
}

.tests-import-review-panel,
.tests-import-actions-panel {
  background:
    linear-gradient(145deg, rgba(255, 122, 24, 0.08), transparent 34%),
    rgba(38, 42, 54, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.15rem;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.18);
  min-height: 0;
}

.tests-import-review-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tests-import-review-header {
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: var(--id-space-4);
  justify-content: space-between;
  padding: var(--id-space-4);
}

.tests-import-review-header h2,
.tests-import-review-header p,
.tests-import-actions-panel h3,
.tests-import-actions-panel p {
  margin: 0;
}

.tests-import-review-header h2 {
  color: #ffffff;
  font-size: 1.35rem;
  letter-spacing: 0.02em;
  margin-bottom: 0.35rem;
}

.tests-import-review-header p,
.tests-import-actions-panel p {
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.55;
}

.tests-import-eyebrow {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.tests-import-summary {
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: repeat(2, minmax(6rem, 1fr));
  margin: 0;
  min-width: 16rem;
}

.tests-import-summary div {
  background: rgba(10, 13, 24, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
}

.tests-import-summary dt {
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.tests-import-summary dd {
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0.2rem 0 0;
}

.tests-import-list-wrapper {
  padding: var(--id-space-4);
  scrollbar-color: rgba(255, 122, 24, 0.8) rgba(255, 255, 255, 0.08);
}

.tests-import-review {
  display: grid;
  gap: var(--id-space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.tests-import-review__item {
  min-width: 0;
}

.tests-import-step-card {
  align-items: flex-start;
  background: rgba(49, 53, 67, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  display: grid;
  gap: var(--id-space-3);
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 1rem;
}

.tests-import-step-card__order {
  align-items: center;
  background: rgba(255, 122, 24, 0.16);
  border: 1px solid rgba(255, 122, 24, 0.35);
  border-radius: 0.85rem;
  color: #ffb36c;
  display: inline-flex;
  font-weight: 800;
  height: 2.35rem;
  justify-content: center;
  min-width: 2.35rem;
}

.tests-import-step-card__body {
  min-width: 0;
}

.tests-import-step-card__title {
  background: transparent;
  border: 0;
  color: #ffffff;
  display: block;
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  width: 100%;
}

.tests-import-step-card__input {
  background: rgba(10, 13, 24, 0.75);
  color: #ffffff;
  max-width: 42rem;
}

.tests-import-step-card__meta {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin: 0.35rem 0 0;
  text-transform: uppercase;
}

.tests-import-action-preview {
  display: grid;
  gap: 0.4rem;
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
}

.tests-import-action-preview li {
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  display: grid;
  gap: var(--id-space-2);
  grid-template-columns: minmax(6rem, auto) minmax(0, 1fr);
  min-width: 0;
}

.tests-import-action-preview span {
  color: #9ed4ff;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tests-import-action-preview code {
  background: rgba(10, 13, 24, 0.48);
  border-radius: 0.45rem;
  color: rgba(255, 255, 255, 0.75);
  overflow: hidden;
  padding: 0.2rem 0.45rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tests-import-step-card__actions {
  display: flex;
  gap: 0.5rem;
}

.tests-import-actions-panel {
  align-self: start;
  display: grid;
  gap: var(--id-space-3);
  padding: var(--id-space-4);
}

.tests-import-actions-panel h3 {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tests-import-primary-action,
.tests-import-secondary-action {
  width: 100%;
}

.deleteIcon {
  color: white;
  font-size: 12px;
}
.tests-icon-action {
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.7rem;
  display: inline-flex;
  height: 2rem;
  justify-content: center;
  padding: 0;
  width: 2rem;
}

.tests-icon-action:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
.modal-dialog {
  min-width: 80vw;
  margin: 1.75rem auto;
}

@media only screen and (max-width: 760px) {
  .tests-page {
    height: auto;
    min-height: calc(100vh - 76px - 3rem);
    min-height: calc(100dvh - 76px - 3rem);
    overflow: visible;
  }

  .tests-steps-list,
  .tests-selected-list,
  .tests-import-list-wrapper {
    min-height: 20rem;
  }

  .tests-import-workspace {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .tests-master-detail,
  .tests-builder-hero {
    grid-template-columns: 1fr;
  }

  .tests-test-detail__metrics {
    grid-template-columns: 1fr;
  }

  .tests-import-review-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .tests-import-summary {
    min-width: 0;
    width: 100%;
  }

  .tests-import-step-card {
    grid-template-columns: 1fr;
  }

  .tests-workspace-spacer {
    display: none;
  }
}
</style>

<script>
import apiClient from "@/services/apiClient";
import { getSelectedProjectId } from "@/stores/session";
import { buildTestPayload } from "@/domain/workflowPayloads";
import {
  loadPersistedSequence,
  normalizeSequenceItem,
  validateSequenceComposition,
} from "@/domain/sequenceBuilder";
import SequenceBuilder from "@/components/sequence/SequenceBuilder.vue";
import english from "@/languages/english";
import ImportIdeliumTest from "./tests/importIdeliumTest.vue";
import { routableTabs } from "@/shared/routableTabs";

export default {
  name: "TestsComponent",
  components: {
    ImportIdeliumTest,
    SequenceBuilder,
  },
  mixins: [routableTabs("modify", ["modify", "new", "import"])],
  data() {
    return {
      delay: 1000,
      arraySteps: [],
      arrayStepsSelectedDragged: [],
      arrayStepsImported: [],
      arrayImportedStepKeys: [],
      arrayEditImportedSteps: [],
      listOriginalSteps: [],
      arrayTests: [],
      testSelected: null,
      testSearch: "",
      stepFilter: "",
      testStepPickerQuery: {
        page: 1,
        search: "",
        filters: {},
      },
      disableNameTest: true,
      disableTestDescription: true,
      disableBtnCreateTest: true,
      newNameTest: "",
      newDescriptionTest: "",
      importedNameTest: "",
      importedDescriptionTest: "",
      modifyDescriptionTest: "",
      tabOpen: 0,
      testsLoaded: false,
      testsGridQuery: {
        page: 1,
        pageSize: 25,
        sort: "id",
        direction: "asc",
      },
      testsGridMeta: {
        page: 1,
        pageSize: 25,
        total: null,
        lastPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      importedFromIdelium: false,
    };
  },
  created() {
    this.getSteps();
    this.emitter.on("refreshTest", (msg) => {
      if (msg == true) this.getSteps();
      else this.$forceUpdate();
    });
  },
  watch: {
    stepFilter() {
      // Do something with search nameIssue after it debounced
      let filter = this.stepFilter;
      this.searchTextSteps(filter);
    },
    arrayStepsSelectedDragged() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0;
    },
    newNameTest() {
      this.disableTestDescription = this.newNameTest.length == 0;
    },
    newDescriptionTest() {
      this.disableBtnCreateTest = this.newDescriptionTest.length == 0;
    },
    testSelected() {
      this.getTest();
    },
    "$route.params.testId"() {
      this.applyRouteTestSelection();
    },
    /*$route() {
      this.$forceUpdate();
    }, */
    files() {},
  },
  computed: {
    isBuilderRoute() {
      return this.$route.name === "tests-builder";
    },
    selectedTestName() {
      return (
        this.testSelected?.name ||
        this.language[this.config.currentLanguage].Tests.builderFallbackTitle
      );
    },
    builderDescription() {
      return (
        this.modifyDescriptionTest ||
        this.testSummary(this.testSelected) ||
        this.language[this.config.currentLanguage].Tests.testPickerNoDescription
      );
    },
    selectedTestStepCount() {
      return Array.isArray(this.arrayStepsSelectedDragged)
        ? this.arrayStepsSelectedDragged.length
        : 0;
    },
    filteredTests() {
      const search = String(this.testSearch ?? "")
        .trim()
        .toLowerCase();
      if (search === "") return this.arrayTests;
      return this.arrayTests.filter((test) => {
        const searchable = [
          test.id,
          test.name,
          test.description,
          test.runtime,
          test.status,
        ]
          .map((value) => String(value ?? "").toLowerCase())
          .join(" ");
        return searchable.includes(search);
      });
    },
    isModifyTabDisabled() {
      return this.testsLoaded && this.arrayTests.length === 0;
    },
    shouldShowStepComposition() {
      return this.isBuilderRoute
        ? this.testSelected != null
        : this.tabOpen === 1;
    },
    sequenceBuilderCopy() {
      const dictionary = this.language[this.config.currentLanguage] ?? english;
      const sequenceCopy =
        dictionary.SequenceBuilder ?? english.SequenceBuilder;
      return {
        ...sequenceCopy,
        picker: {
          ...sequenceCopy.picker,
          states: dictionary.DataTable?.states ?? english.DataTable.states,
        },
      };
    },
    builderAvailableSteps() {
      return this.arraySteps.map((step) => this.toBuilderStep(step));
    },
    testStepSequenceState() {
      return loadPersistedSequence(this.arrayStepsSelectedDragged, {
        availableItems: this.listOriginalSteps.map((step) =>
          this.toBuilderStep(step),
        ),
        duplicatePolicy: "allow",
        entityType: "step",
      });
    },
    testStepSequenceItems() {
      return this.testStepSequenceState.items.map((item) => ({
        ...item.persisted,
        disabledReason: item.disabledReason,
        identity: item.identity,
        metadata: item.metadata,
        name: item.name,
        persisted: item.persisted,
        status: item.status,
        version: item.version,
      }));
    },
    testStepValidation() {
      return validateSequenceComposition(this.testStepSequenceState, {
        duplicatePolicy: "allow",
        minimumItems: 1,
      });
    },
    testStepPickerMeta() {
      return {
        page: 1,
        lastPage: 1,
        total: this.builderAvailableSteps.length,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    },
    testStepPickerFilters() {
      const runtimes = [
        ...new Set(
          this.listOriginalSteps
            .map((step) => this.stepRuntime(step))
            .filter(Boolean),
        ),
      ];
      return runtimes.length === 0
        ? []
        : [
            {
              key: "runtime",
              label: this.sequenceBuilderCopy.metadata.runtime,
              options: runtimes.map((runtime) => ({
                label: runtime,
                value: runtime,
              })),
            },
          ];
    },
  },
  methods: {
    applyRouteTestSelection() {
      if (!this.isBuilderRoute || this.arrayTests.length === 0) return;
      const routeTestId = String(this.$route.params.testId ?? "");
      const nextTest = this.arrayTests.find(
        (test) => String(test.id) === routeTestId,
      );
      if (nextTest != null && !this.isSelectedTest(nextTest)) {
        this.testSelected = nextTest;
      }
    },
    openTestBuilder(test) {
      if (test?.id == null) return;
      this.$router.push({
        name: "tests-builder",
        params: {
          projectId: getSelectedProjectId(),
          testId: test.id,
        },
      });
    },
    backToTestsCatalog() {
      this.$router.push({
        name: "tests",
        params: {
          projectId: getSelectedProjectId(),
          tab: "modify",
        },
      });
    },
    selectTest(test) {
      this.testSelected = test;
    },
    isSelectedTest(test) {
      return (
        this.testSelected != null &&
        String(this.testSelected.id) === String(test?.id)
      );
    },
    testSummary(test) {
      return (
        test?.description ||
        this.language[this.config.currentLanguage].Tests.testPickerNoDescription
      );
    },
    formatTestPickerCount(count, template) {
      return String(template ?? "{count}").replace("{count}", count);
    },
    stepRuntime(step) {
      return (
        step.runtime ??
        step.type ??
        step.config?.runtime ??
        step.config?.steps?.[0]?.runtime ??
        ""
      );
    },
    toBuilderStep(step) {
      const persisted = JSON.parse(JSON.stringify(step));
      const normalized = normalizeSequenceItem(
        {
          ...step,
          name: step.description ?? step.name,
          metadata: {
            runtime: this.stepRuntime(step),
            tags: Array.isArray(step.tags) ? step.tags.join(", ") : "",
            version: step.version ?? step.catalogVersion ?? "",
            status: step.status ?? "active",
          },
        },
        { entityType: "step" },
      );
      return { ...normalized, persisted };
    },
    updateTestStepSequence(nextSequence) {
      this.arrayStepsSelectedDragged = nextSequence.map((item) =>
        JSON.parse(JSON.stringify(item.persisted)),
      );
      this.copyArray();
    },
    handleStepPickerQuery(query) {
      this.testStepPickerQuery = query;
      this.stepFilter = query.search ?? "";
      this.searchTextSteps(this.stepFilter);
    },
    onRoutableTabChange(tab) {
      this.tabOpen = ["modify", "new", "import"].indexOf(tab);
    },
    redirectEmptyTests() {
      if (
        !this.isBuilderRoute &&
        this.isModifyTabDisabled &&
        this.isActiveTab("modify")
      ) {
        this.openTab("new");
      }
    },
    cancelUpload() {
      this.$refs.importTestUpload.showUploadComponent();
      this.arrayStepsImported = [];
      this.arrayImportedStepKeys = [];
    },
    importedActionCount(step) {
      return Array.isArray(step?.steps) ? step.steps.length : 0;
    },
    importedActionsTotal() {
      return this.arrayStepsImported.reduce(
        (total, step) => total + this.importedActionCount(step),
        0,
      );
    },
    formatImportCount(count, template) {
      return String(template ?? "{count}").replace("{count}", count);
    },
    actionTargetSummary(action) {
      return (
        action?.findBy ??
        action?.url ??
        action?.value ??
        action?.locator ??
        action?.selector ??
        action?.name ??
        "configured action"
      );
    },
    importTest(value) {
      this.importedNameTest = value.name;
      this.importedDescriptionTest = value.description;
      if (value.tests) {
        this.arrayStepsImported = value.tests.map((step) =>
          JSON.parse(JSON.stringify(step)),
        );
        this.arrayImportedStepKeys = value.tests.map(
          (_step, index) => `import-${Date.now()}-${index}`,
        );
        this.importedFromIdelium = true;
        this.arrayEditImportedSteps = [];
        for (let i in this.arrayStepsImported) {
          this.arrayEditImportedSteps.push(false);
        }
      }
    },
    searchTextSteps(filter) {
      const search = String(filter ?? "")
        .trim()
        .toLowerCase();
      const runtime = this.testStepPickerQuery.filters?.runtime;
      this.arraySteps = this.listOriginalSteps.filter((step) => {
        const displayName = step.description ?? step.name ?? "";
        const matchesSearch =
          search === "" || displayName.toLowerCase().includes(search);
        const matchesRuntime = !runtime || this.stepRuntime(step) === runtime;
        return matchesSearch && matchesRuntime;
      });
    },
    normalizeGridResponse(responseData, fallbackMeta) {
      if (Array.isArray(responseData)) {
        return {
          rows: responseData,
          meta: {
            ...fallbackMeta,
            total: null,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      const meta = responseData?.meta || {};
      return {
        rows: Array.isArray(responseData?.data) ? responseData.data : [],
        meta: {
          page: Number(meta.page) || fallbackMeta.page,
          pageSize: Number(meta.pageSize) || fallbackMeta.pageSize,
          total: Number.isFinite(Number(meta.total)) ? Number(meta.total) : 0,
          lastPage: Math.max(Number(meta.lastPage) || 1, 1),
          hasNextPage: Boolean(meta.hasNextPage),
          hasPreviousPage: Boolean(meta.hasPreviousPage),
        },
      };
    },
    getSteps() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.steps +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arraySteps = this.listOriginalSteps = response.data;
          this.getTests();
        })
        .catch((e) => {
          this.error = e;
        });
    },
    getTests() {
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId(),
          {
            headers: this.setHeaders(),
            params: this.testsGridQuery,
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          const result = this.normalizeGridResponse(
            response.data,
            this.testsGridMeta,
          );
          this.arrayTests = result.rows;
          this.testsGridMeta = result.meta;
          this.testsLoaded = true;
          this.applyRouteTestSelection();
          this.redirectEmptyTests();
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    getTest() {
      if (this.testSelected == null) {
        this.modifyDescriptionTest = "";
        this.arrayStepsSelectedDragged = [];
        return false;
      }
      this.emitter.emit("showLoader", true);
      apiClient
        .get(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testSelected.id,
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.arrayStepsSelectedDragged = JSON.parse(response.data.config);
          this.modifyDescriptionTest = response.data.description;
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.tests,
          buildTestPayload({
            name: this.newNameTest,
            description: this.newDescriptionTest,
            steps: this.arrayStepsSelectedDragged,
            projectId: getSelectedProjectId(),
          }),
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arraySteps = this.listOriginalSteps;
          this.arrayStepsSelectedDragged = [];
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    saveImportTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .post(
          this.config.serviceBaseUrl + this.config.url.importtest,
          {
            name: this.importedNameTest,
            description: this.importedDescriptionTest,
            import: JSON.stringify(this.arrayStepsImported),
            idProject: getSelectedProjectId(),
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.arrayStepsSelectedDragged = [];
          this.arrayStepsImported = [];
          this.cancelUpload();
          this.getSteps();
          this.openTab("modify");
        })
        .catch((e) => {
          this.Logout(this, e);
          this.error = e;
        });
    },
    modifyTest() {
      this.emitter.emit("showLoader", true);
      apiClient
        .put(
          this.config.serviceBaseUrl +
            this.config.url.tests +
            "/" +
            getSelectedProjectId() +
            "/" +
            this.testSelected.id,
          {
            config: JSON.stringify(this.arrayStepsSelectedDragged),
            description: this.modifyDescriptionTest,
          },
          {
            headers: this.setHeaders(),
          },
        )
        .then((response) => {
          this.emitter.emit("showLoader", false);
          this.listPlugins = response.data;
          this.arraySteps = this.listOriginalSteps;
        })
        .catch((e) => {
          //this.Logout(this)
          this.$showAlert({
            message:
              e?.message ||
              this.language[this.config.currentLanguage].Dialog.operationFailed,
            variant: "danger",
          });
          this.error = e;
        });
    },
    log: function () {
      this.copyArray();
    },
    deleteItem(index) {
      this.arrayStepsSelectedDragged.splice(index, 1);
      this.copyArray();
    },
    deleteItemImported(index) {
      this.arrayStepsImported.splice(index, 1);
      this.arrayImportedStepKeys.splice(index, 1);
    },
    moveImportedItem(index, destination) {
      if (
        destination < 0 ||
        destination >= this.arrayStepsImported.length ||
        destination === index
      ) {
        return;
      }
      const [step] = this.arrayStepsImported.splice(index, 1);
      const [key] = this.arrayImportedStepKeys.splice(index, 1);
      this.arrayStepsImported.splice(destination, 0, step);
      this.arrayImportedStepKeys.splice(destination, 0, key);
    },
    editImportedItem(index) {
      for (let i in this.arrayEditImportedSteps)
        this.arrayEditImportedSteps[i] = false;
      this.arrayEditImportedSteps[index] = true;
      this.$forceUpdate();
    },
    endEditImportedItem(index) {
      this.arrayEditImportedSteps[index] = false;
      this.$forceUpdate();
    },
    copyArray() {
      this.disableNameTest = this.arrayStepsSelectedDragged.length == 0;
      this.arrayStepsSelected = [];
      for (let i = 0; i < this.arrayStepsSelectedDragged.length; i++) {
        this.arrayStepsSelected.push(this.arrayStepsSelectedDragged[i].name);
      }
    },
  },
};
</script>
