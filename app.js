const APP_CONFIG = {
  noticeText: 'If you have NPTEL IoT 2018 JAN or 2019 JULY questions, send them to nkcbanka@gmail.com or contact @niteshjeee',
  noticeDurationMs: 5000,
  maxTestQuestions: 50,
  manifestPath: './data/manifest.json',
  repoUrl: 'https://github.com/Niteshjeee/nptel-iot',
  contributionEmail: 'nkcbanka@gmail.com',
  socialHandle: 'niteshjeee',
  storage: {
    profile: 'nptel_iot_profile_v7',
    history: 'nptel_iot_history_v7',
    settings: 'nptel_iot_settings_v7',
    activeTest: 'nptel_iot_active_test_v7'
  }
};

const state = {
  manifest: null,
  banks: [],
  allQuestions: [],
  years: [],
  varieties: [],
  history: [],
  activeTest: null,
  profileName: 'Guest User',
  currentPage: 'home',
  summary: {
    total: 0,
    active: 0,
    blockedVisual: 0,
    coding: 0,
    removed: 0
  }
};

const pageTitles = {
  home: 'Home',
  build: 'Build Test',
  test: 'Practice',
  results: 'Results',
  history: 'History',
  datasets: 'Sessions',
  contact: 'Contact'
};

const dom = {
  noticeBar: document.getElementById('noticeBar'),
  noticeText: document.getElementById('noticeText'),
  menuToggle: document.getElementById('menuToggle'),
  sideDrawer: document.getElementById('sideDrawer'),
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  currentPageTitle: document.getElementById('currentPageTitle'),
  currentPageBadge: document.getElementById('currentPageBadge'),
  profileBtn: document.getElementById('profileBtn'),
  profileAvatar: document.getElementById('profileAvatar'),
  drawerProfileAvatar: document.getElementById('drawerProfileAvatar'),
  drawerProfileName: document.getElementById('drawerProfileName'),
  drawerLoadedStat: document.getElementById('drawerLoadedStat'),
  drawerCodingStat: document.getElementById('drawerCodingStat'),
  totalQuestionsStat: document.getElementById('totalQuestionsStat'),
  usableQuestionsStat: document.getElementById('usableQuestionsStat'),
  imagePendingStat: document.getElementById('imagePendingStat'),
  historyStat: document.getElementById('historyStat'),
  yearsStat: document.getElementById('yearsStat'),
  typesStat: document.getElementById('typesStat'),
  quickHomeBuildBtn: document.getElementById('quickHomeBuildBtn'),
  quickHomeResumeBtn: document.getElementById('quickHomeResumeBtn'),
  datasetBadge: document.getElementById('datasetBadge'),
  homeSummaryText: document.getElementById('homeSummaryText'),
  homeDatasetsGrid: document.getElementById('homeDatasetsGrid'),
  builderDatasetBadge: document.getElementById('builderDatasetBadge'),
  yearSelect: document.getElementById('yearSelect'),
  sessionSelect: document.getElementById('sessionSelect'),
  weekSelect: document.getElementById('weekSelect'),
  typeSelect: document.getElementById('typeSelect'),
  practiceSelect: document.getElementById('practiceSelect'),
  countSelect: document.getElementById('countSelect'),
  searchInput: document.getElementById('searchInput'),
  hideRemovedToggle: document.getElementById('hideRemovedToggle'),
  hideImagePendingToggle: document.getElementById('hideImagePendingToggle'),
  shuffleQuestionsToggle: document.getElementById('shuffleQuestionsToggle'),
  shuffleOptionsToggle: document.getElementById('shuffleOptionsToggle'),
  showSolutionsToggle: document.getElementById('showSolutionsToggle'),
  showReferenceToggle: document.getElementById('showReferenceToggle'),
  builderStatus: document.getElementById('builderStatus'),
  startTestBtn: document.getElementById('startTestBtn'),
  resumeTestBtn: document.getElementById('resumeTestBtn'),
  resetHistoryBtn: document.getElementById('resetHistoryBtn'),
  testPanel: document.getElementById('testPanel'),
  testEmptyState: document.getElementById('testEmptyState'),
  testResumeBtn: document.getElementById('testResumeBtn'),
  testTitle: document.getElementById('testTitle'),
  testMeta: document.getElementById('testMeta'),
  progressChip: document.getElementById('progressChip'),
  answeredCountBadge: document.getElementById('answeredCountBadge'),
  progressBar: document.getElementById('progressBar'),
  questionCard: document.getElementById('questionCard'),
  questionPalette: document.getElementById('questionPalette'),
  submitTestBtn: document.getElementById('submitTestBtn'),
  quitTestBtn: document.getElementById('quitTestBtn'),
  resultsPanel: document.getElementById('resultsPanel'),
  resultsEmptyState: document.getElementById('resultsEmptyState'),
  scoreBadge: document.getElementById('scoreBadge'),
  resultsSummary: document.getElementById('resultsSummary'),
  reviewList: document.getElementById('reviewList'),
  reviewRestartBtn: document.getElementById('reviewRestartBtn'),
  historyBadge: document.getElementById('historyBadge'),
  historyList: document.getElementById('historyList'),
  dataPageGrid: document.getElementById('dataPageGrid'),
  manifestBadge: document.getElementById('manifestBadge'),
  openRepoBtn: document.getElementById('openRepoBtn'),
  copyIssueTemplateBtn: document.getElementById('copyIssueTemplateBtn'),
  mailContributorBtn: document.getElementById('mailContributorBtn'),
  copyContactBtn: document.getElementById('copyContactBtn')
};

init().catch((error) => {
  console.error(error);
  if (dom.noticeText) dom.noticeText.textContent = 'Could not load the local JSON files.';
  if (dom.currentPageBadge) dom.currentPageBadge.textContent = 'Load failed';
});

async function init() {
  applyUiFixes();

  if (dom.noticeText) dom.noticeText.textContent = APP_CONFIG.noticeText;
  bindEvents();
  scheduleNoticeDismiss();
  hydrateProfile();
  loadHistory();
  await loadManifestAndBanks();
  populateFilterOptions();

  const hadSavedSettings = hydrateSettings();
  if (!hadSavedSettings) applyDefaultFilters();

  sanitizeFilters();
  saveSettings();
  updateStats();
  updateBuilderStatus();
  renderHome();
  renderDatasetsPage();
  renderHistory();
  renderResultsFromLastAttempt();
  restoreActiveTest(false);
  showPage('home');
}

function applyUiFixes() {
  const style = document.createElement('style');
  style.textContent = `
    body.notice-hidden .topbar {
      top: 0 !important;
    }
    #page-build .toggle-grid {
      display: none !important;
    }
    #page-home .hero-actions,
    #page-build .actions-row {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    #page-build .actions-row button:last-child {
      grid-column: 1 / -1;
    }
    #page-test .page-card {
      padding-bottom: 120px;
    }
    .actions-row > button,
    .hero-actions > button {
      min-height: 50px;
    }
    .profile-chip.simple {
      pointer-events: none;
      cursor: default;
    }
    @media (max-width: 719px) {
      .quick-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .actions-row > button,
      .hero-actions > button {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  const eyebrowEls = document.querySelectorAll('.topbar .eyebrow');
  eyebrowEls.forEach((el) => {
    el.textContent = 'NPTEL IoT Practice';
  });

  if (dom.profileBtn) {
    dom.profileBtn.setAttribute('title', 'Guest user');
    dom.profileBtn.setAttribute('aria-label', 'Guest user');
  }
}

function on(element, eventName, handler) {
  if (element) element.addEventListener(eventName, handler);
}

function scheduleNoticeDismiss() {
  if (!dom.noticeBar) return;
  window.setTimeout(() => {
    dom.noticeBar.classList.add('is-hidden');
    document.body.classList.add('notice-hidden');
  }, APP_CONFIG.noticeDurationMs);
}

function bindEvents() {
  on(dom.menuToggle, 'click', openDrawer);
  on(dom.closeDrawerBtn, 'click', closeDrawer);
  on(dom.drawerBackdrop, 'click', closeDrawer);
  on(dom.quickHomeBuildBtn, 'click', () => showPage('build'));
  on(dom.quickHomeResumeBtn, 'click', () => restoreActiveTest(true));
  on(dom.testResumeBtn, 'click', () => restoreActiveTest(true));
  on(dom.startTestBtn, 'click', startTest);
  on(dom.resumeTestBtn, 'click', () => restoreActiveTest(true));
  on(dom.resetHistoryBtn, 'click', resetHistory);
  on(dom.submitTestBtn, 'click', submitTest);
  on(dom.quitTestBtn, 'click', quitTest);
  on(dom.reviewRestartBtn, 'click', () => showPage('build'));
  on(dom.openRepoBtn, 'click', () => window.open(APP_CONFIG.repoUrl, '_blank', 'noopener'));
  on(dom.copyIssueTemplateBtn, 'click', copyIssueTemplate);
  on(dom.mailContributorBtn, 'click', openContributionMail);
  on(dom.copyContactBtn, 'click', copyContactDetails);

  document.querySelectorAll('button[data-page]').forEach((btn) =>
    on(btn, 'click', () => showPage(btn.dataset.page))
  );
  document.querySelectorAll('[data-page-jump]').forEach((btn) =>
    on(btn, 'click', () => showPage(btn.dataset.pageJump))
  );
  document.querySelectorAll('.drawer-link').forEach((btn) =>
    on(btn, 'click', () => showPage(btn.dataset.page))
  );
  document.querySelectorAll('.bottom-link').forEach((btn) =>
    on(btn, 'click', () => showPage(btn.dataset.page))
  );
  document.querySelectorAll('[data-quick]').forEach((btn) =>
    on(btn, 'click', () => applyQuickPreset(btn.dataset.quick))
  );

  [
    dom.yearSelect,
    dom.sessionSelect,
    dom.weekSelect,
    dom.typeSelect,
    dom.practiceSelect,
    dom.countSelect,
    dom.searchInput
  ]
    .filter(Boolean)
    .forEach((el) => {
      const eventName = el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change';
      on(el, eventName, onFilterChange);
    });
}

function parseDatasetFile(file) {
  const match = String(file || '').match(/(20\d{2})_(JAN|JULY)/i);
  if (!match) return { year: null, session: null };
  return {
    year: Number(match[1]),
    session: match[2].toUpperCase()
  };
}

function optionValues(select) {
  return select ? [...select.options].map((option) => option.value) : [];
}

function setSelectValueSafely(select, value, fallback = 'ALL') {
  if (!select) return;
  const values = optionValues(select);
  const target = String(value ?? '');
  if (values.includes(target)) {
    select.value = target;
    return;
  }
  if (values.includes(String(fallback))) {
    select.value = String(fallback);
    return;
  }
  select.value = values[0] || '';
}

function sanitizeFilters() {
  const datasets = sortDatasets(state.manifest?.datasets || []);
  const latest = datasets[0] || null;

  setSelectValueSafely(dom.yearSelect, dom.yearSelect?.value, latest ? String(latest.year) : 'ALL');
  populateSessionOptions();
  setSelectValueSafely(dom.sessionSelect, dom.sessionSelect?.value, 'ALL');
  populateWeekOptions();
  setSelectValueSafely(dom.weekSelect, dom.weekSelect?.value, 'ALL');
  setSelectValueSafely(dom.typeSelect, dom.typeSelect?.value, 'ALL');
  setSelectValueSafely(dom.practiceSelect, dom.practiceSelect?.value, 'ALL');

  if (dom.countSelect) {
    const countOptions = optionValues(dom.countSelect);
    const raw = Math.min(Number(dom.countSelect.value || 15), APP_CONFIG.maxTestQuestions);
    const fallback = countOptions.includes('15') ? '15' : countOptions[0] || '15';
    setSelectValueSafely(dom.countSelect, String(raw || 15), fallback);
  }

  if (dom.searchInput && typeof dom.searchInput.value !== 'string') {
    dom.searchInput.value = '';
  }
}

function getDatasetRuntimeSummary(dataset) {
  const file = typeof dataset === 'string' ? dataset : dataset.file;
  const questions = state.allQuestions.filter((question) => question.sourceFile === file);

  const total = questions.length;
  const removed = questions.filter((question) => Boolean(question.removed)).length;
  const imageRequired = questions.filter((question) => !question.removed && Boolean(question.blockedVisual)).length;
  const ready = questions.filter((question) => !question.removed && !question.blockedVisual).length;
  const coding = questions.filter(
    (question) => !question.removed && !question.blockedVisual && question.practiceTag === 'coding'
  ).length;
  const conceptual = questions.filter(
    (question) => !question.removed && !question.blockedVisual && question.practiceTag === 'conceptual'
  ).length;

  return { total, removed, imageRequired, ready, coding, conceptual };
}

async function loadManifestAndBanks() {
  const manifestRes = await fetch(APP_CONFIG.manifestPath, { cache: 'no-cache' });
  if (!manifestRes.ok) throw new Error('Failed to load data/manifest.json');

  const rawManifest = await manifestRes.json();
  const resolvedDatasets = (rawManifest.datasets || []).map((dataset) => {
    const derived = parseDatasetFile(dataset.file);
    return {
      ...dataset,
      year: derived.year ?? dataset.year,
      session: derived.session ?? dataset.session
    };
  });

  state.manifest = {
    ...rawManifest,
    datasets: resolvedDatasets
  };

  const banks = await Promise.all(
    resolvedDatasets.map(async (dataset) => {
      const path = `./data/${dataset.file}`;
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${dataset.file}`);

      const bank = await res.json();
      return {
        ...bank,
        year: dataset.year,
        session: dataset.session,
        file: dataset.file,
        slug: dataset.slug,
        title: buildDatasetTitle(dataset),
        summary: dataset.summary || {}
      };
    })
  );

  state.banks = banks;
  state.allQuestions = banks.flatMap((bank) =>
    (bank.questions || []).map((question, index) => normalizeQuestion(question, bank, index))
  );

  state.years = [...new Set(state.manifest.datasets.map((dataset) => dataset.year))]
    .filter((value) => value !== null && value !== undefined)
    .sort((a, b) => a - b);

  state.varieties = [...new Set(state.allQuestions.map((question) => question.varietyTag))].sort();

  if (dom.datasetBadge) dom.datasetBadge.textContent = `${banks.length} files · ${state.allQuestions.length} questions`;
  if (dom.builderDatasetBadge) dom.builderDatasetBadge.textContent = `${banks.length} files loaded`;
  if (dom.manifestBadge) dom.manifestBadge.textContent = `${banks.length} files`;
}

function normalizeQuestion(question, bank, index) {
  const answerKeys = Array.isArray(question.answer?.keys) ? question.answer.keys.map(String) : [];
  const answerTexts = Array.isArray(question.answer?.text) ? question.answer.text.map(String) : [];
  const options = Array.isArray(question.options) ? question.options : [];
  const image = question.image || null;

  const year = question.year ?? bank.year;
  const session = (question.session ?? bank.session ?? '').toString().toUpperCase();
  const week = question.week ?? null;
  const responseMode = question.response_mode || 'single_select';

  const rawPractice = String(question.practice_tag || '').toLowerCase();
  const rawVariety = String(question.variety_tag || question.type || '').toLowerCase();

  const isCodeQuestion = Boolean(
    question.type === 'code_based' ||
    question.has_code === true ||
    question.code_block ||
    rawPractice === 'coding' ||
    rawVariety === 'code_based'
  );

  const isActuallyVisual = Boolean(
    question.image_required === true ||
    question.needs_image === true ||
    question.type === 'image_based' ||
    /visual/i.test(String(responseMode))
  );

  const practiceTag = isCodeQuestion ? 'coding' : (isActuallyVisual ? 'visual' : 'conceptual');

  let varietyTag = question.variety_tag || question.type || 'mcq';
  if (String(varietyTag).toLowerCase() === 'visual' && !isActuallyVisual) {
    varietyTag = question.type && question.type !== 'image_based' ? question.type : 'mcq';
  }

  return {
    ...question,
    year,
    session,
    week,
    runtimeIndex: index,
    bankTitle: bank.title,
    bankSlug: bank.slug,
    sourceFile: bank.file,
    answerKeys,
    answerTexts,
    answerDisplay:
      question.answer_display || (answerTexts.length ? answerTexts.join(', ') : answerKeys.join(', ')),
    varietyTag,
    practiceTag,
    responseMode,
    image,
    imageResolved: !isActuallyVisual,
    blockedVisual: isActuallyVisual,
    searchBlob: normalizeText(
      [
        question.uid,
        question.id,
        question.display_no,
        question.question,
        question.code_block,
        question.detailed_solution,
        question.reference,
        question.answer_display,
        practiceTag,
        varietyTag,
        bank.title,
        bank.file,
        year,
        session,
        week,
        ...(options.map((option) => option.text))
      ]
        .filter(Boolean)
        .join(' ')
    )
  };
}

function hydrateProfile() {
  const saved = localStorage.getItem(APP_CONFIG.storage.profile);
  if (saved) state.profileName = saved;
  syncProfileDom();
}

function syncProfileDom() {
  const initial = (state.profileName || 'G').trim().charAt(0).toUpperCase() || 'G';
  if (dom.drawerProfileName) dom.drawerProfileName.textContent = state.profileName;
  if (dom.profileAvatar) dom.profileAvatar.textContent = initial;
  if (dom.drawerProfileAvatar) dom.drawerProfileAvatar.textContent = initial;
}

function loadHistory() {
  try {
    state.history = JSON.parse(localStorage.getItem(APP_CONFIG.storage.history) || '[]');
  } catch {
    state.history = [];
  }
}

function saveHistory() {
  localStorage.setItem(APP_CONFIG.storage.history, JSON.stringify(state.history.slice(0, 50)));
}

function resetHistory() {
  if (!window.confirm('Clear the saved attempt history from this browser?')) return;
  state.history = [];
  saveHistory();
  renderHistory();
  updateStats();
  renderResultsFromLastAttempt();
}

function hydrateSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(APP_CONFIG.storage.settings) || '{}');
    const hasSaved = Object.keys(settings).length > 0;

    if (settings.year && dom.yearSelect) dom.yearSelect.value = settings.year;
    if (settings.session && dom.sessionSelect) dom.sessionSelect.value = settings.session;
    if (settings.week && dom.weekSelect) dom.weekSelect.value = settings.week;
    if (settings.type && dom.typeSelect) dom.typeSelect.value = settings.type;
    if (settings.practice && dom.practiceSelect) dom.practiceSelect.value = settings.practice;
    if (settings.count && dom.countSelect) {
      dom.countSelect.value = String(Math.min(Number(settings.count), APP_CONFIG.maxTestQuestions));
    }
    if (typeof settings.search === 'string' && dom.searchInput) dom.searchInput.value = settings.search;
    return hasSaved;
  } catch {
    return false;
  }
}

function applyDefaultFilters() {
  const datasets = sortDatasets(state.manifest?.datasets || []);
  const latest = datasets[0];
  if (!latest) return;

  if (dom.yearSelect) dom.yearSelect.value = String(latest.year);
  populateSessionOptions();
  if (dom.sessionSelect) dom.sessionSelect.value = latest.session;
  populateWeekOptions();

  if (dom.weekSelect) dom.weekSelect.value = 'ALL';
  if (dom.typeSelect) dom.typeSelect.value = 'ALL';
  if (dom.practiceSelect) dom.practiceSelect.value = 'ALL';
  if (dom.countSelect) dom.countSelect.value = '15';
  if (dom.searchInput) dom.searchInput.value = '';
}

function saveSettings() {
  localStorage.setItem(APP_CONFIG.storage.settings, JSON.stringify(readFilterSettings()));
}

function readFilterSettings() {
  return {
    year: dom.yearSelect?.value || 'ALL',
    session: dom.sessionSelect?.value || 'ALL',
    week: dom.weekSelect?.value || 'ALL',
    type: dom.typeSelect?.value || 'ALL',
    practice: dom.practiceSelect?.value || 'ALL',
    count: String(Math.min(Number(dom.countSelect?.value || 15), APP_CONFIG.maxTestQuestions)),
    search: dom.searchInput?.value.trim() || '',
    hideRemoved: true,
    hideImagePending: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    showSolutions: true,
    showReference: true
  };
}

function populateFilterOptions() {
  populateSelect(dom.yearSelect, state.years, 'ALL', 'All years', (value) => String(value));
  populateSelect(dom.typeSelect, state.varieties, 'ALL', 'All varieties');
  populateSessionOptions();
  populateWeekOptions();
}

function populateSessionOptions() {
  if (!dom.sessionSelect) return;

  const year = dom.yearSelect?.value || 'ALL';
  const sessions = [
    ...new Set(
      (state.manifest?.datasets || [])
        .filter((dataset) => year === 'ALL' || String(dataset.year) === year)
        .map((dataset) => dataset.session)
    )
  ].sort((a, b) => sessionRank(a) - sessionRank(b));

  const current = dom.sessionSelect.value || 'ALL';
  dom.sessionSelect.innerHTML = '';

  if (sessions.length !== 1) {
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = 'All sessions';
    dom.sessionSelect.appendChild(allOption);
  }

  sessions.forEach((session) => {
    const option = document.createElement('option');
    option.value = String(session);
    option.textContent = formatSession(session);
    dom.sessionSelect.appendChild(option);
  });

  if (sessions.length === 1) {
    dom.sessionSelect.value = sessions[0];
    dom.sessionSelect.disabled = true;
  } else {
    dom.sessionSelect.disabled = false;
    dom.sessionSelect.value = optionValues(dom.sessionSelect).includes(current) ? current : 'ALL';
  }
}

function populateWeekOptions() {
  const year = dom.yearSelect?.value || 'ALL';
  const session = dom.sessionSelect?.value || 'ALL';

  const weeks = [
    ...new Set(
      state.allQuestions
        .filter(
          (question) =>
            (year === 'ALL' || String(question.year) === year) &&
            (session === 'ALL' || question.session === session)
        )
        .map((question) => question.week)
        .filter((week) => week !== null && week !== undefined && String(week).trim() !== '')
    )
  ].sort((a, b) => Number(a) - Number(b));

  populateSelect(dom.weekSelect, weeks, 'ALL', 'All weeks', (value) => `Week ${value}`);
}

function populateSelect(select, values, allValue, allLabel, formatter = formatType) {
  if (!select) return;

  const current = select.value || allValue;
  select.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = allValue;
  allOption.textContent = allLabel;
  select.appendChild(allOption);

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = formatter(String(value));
    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === current)) {
    select.value = current;
  } else {
    select.value = allValue;
  }
}

function clampCountSelect() {
  if (!dom.countSelect) return;
  const count = Math.min(Number(dom.countSelect.value || 15), APP_CONFIG.maxTestQuestions);
  dom.countSelect.value = String(count);
}

function onFilterChange(event) {
  if (event?.target?.id === 'yearSelect') {
    populateSessionOptions();
    populateWeekOptions();
  }

  if (event?.target?.id === 'sessionSelect') {
    populateWeekOptions();
  }

  sanitizeFilters();
  clampCountSelect();
  saveSettings();
  updateBuilderStatus();
  renderHome();
  renderDatasetsPage();
}

function applyQuickPreset(key) {
  const latestJan = getLatestDatasetBySession('JAN');
  const latestJuly = getLatestDatasetBySession('JULY');

  const preset = {
    'latest-jan': latestJan
      ? { year: String(latestJan.year), session: latestJan.session, practice: 'ALL', type: 'ALL' }
      : null,
    'latest-july': latestJuly
      ? { year: String(latestJuly.year), session: latestJuly.session, practice: 'ALL', type: 'ALL' }
      : null,
    'mixed-2025': { year: '2025', session: 'ALL', practice: 'ALL', type: 'ALL' },
    'all-years': { year: 'ALL', session: 'ALL', practice: 'ALL', type: 'ALL' },
    code: { year: 'ALL', session: 'ALL', practice: 'coding', type: 'ALL' },
    tf: { year: 'ALL', session: 'ALL', practice: 'ALL', type: 'true_false' }
  }[key];

  if (!preset) return;

  dom.yearSelect.value = preset.year;
  populateSessionOptions();
  dom.sessionSelect.value = preset.session;
  populateWeekOptions();
  dom.weekSelect.value = 'ALL';
  dom.practiceSelect.value = preset.practice;
  dom.typeSelect.value = preset.type;

  sanitizeFilters();
  saveSettings();
  updateBuilderStatus();
  showPage('build');
}

function updateStats() {
  const total = state.allQuestions.length;
  const removed = state.allQuestions.filter((question) => question.removed).length;
  const imageHidden = state.allQuestions.filter((question) => !question.removed && question.blockedVisual).length;
  const active = state.allQuestions.filter((question) => !question.removed && !question.blockedVisual).length;
  const coding = state.allQuestions.filter(
    (question) => !question.removed && !question.blockedVisual && question.practiceTag === 'coding'
  ).length;
  const years = new Set(state.allQuestions.map((question) => question.year)).size;
  const types = new Set(state.allQuestions.map((question) => question.varietyTag)).size;

  state.summary = { total, active, blockedVisual: imageHidden, coding, removed };

  if (dom.totalQuestionsStat) dom.totalQuestionsStat.textContent = String(total);
  if (dom.usableQuestionsStat) dom.usableQuestionsStat.textContent = String(active);
  if (dom.imagePendingStat) dom.imagePendingStat.textContent = String(imageHidden);
  if (dom.historyStat) dom.historyStat.textContent = String(state.history.length);
  if (dom.yearsStat) dom.yearsStat.textContent = String(years);
  if (dom.typesStat) dom.typesStat.textContent = String(types);
  if (dom.drawerLoadedStat) dom.drawerLoadedStat.textContent = String(total);
  if (dom.drawerCodingStat) dom.drawerCodingStat.textContent = String(coding);
  if (dom.historyBadge) dom.historyBadge.textContent = `${state.history.length} attempt${state.history.length === 1 ? '' : 's'}`;
}

function updateBuilderStatus() {
  const pool = getFilteredPool();
  const conceptual = pool.filter((question) => question.practiceTag === 'conceptual').length;
  const coding = pool.filter((question) => question.practiceTag === 'coding').length;
  const imageRequired = pool.filter((question) => question.blockedVisual).length;

  const summary = `Pool ready: ${pool.length} question${pool.length === 1 ? '' : 's'} · conceptual ${conceptual} · coding ${coding} · image-required ${imageRequired}`;

  if (dom.builderStatus) dom.builderStatus.textContent = summary;
  if (dom.homeSummaryText) dom.homeSummaryText.textContent = summary;
  if (dom.startTestBtn) dom.startTestBtn.disabled = pool.length === 0;

  if (dom.currentPageBadge && ['home', 'build'].includes(state.currentPage)) {
    dom.currentPageBadge.textContent = pool.length ? `${pool.length} ready` : 'No match';
  }
}

function renderHome() {
  if (!state.manifest || !dom.homeDatasetsGrid) return;
  const latestFirst = sortDatasets(state.manifest.datasets);
  dom.homeDatasetsGrid.innerHTML = latestFirst.map((dataset) => buildDatasetCard(dataset, true)).join('');
  bindDatasetButtons(dom.homeDatasetsGrid);
}

function renderDatasetsPage() {
  if (!state.manifest || !dom.dataPageGrid) return;
  const latestFirst = sortDatasets(state.manifest.datasets);
  dom.dataPageGrid.innerHTML = latestFirst.map((dataset) => buildDatasetCard(dataset, false)).join('');
  bindDatasetButtons(dom.dataPageGrid);
  if (dom.manifestBadge) dom.manifestBadge.textContent = `${latestFirst.length} files`;
}

function buildDatasetCard(dataset, compact = false) {
  const runtime = getDatasetRuntimeSummary(dataset);
  const readyNoImages = runtime.ready;
  const blocked = runtime.imageRequired;

  const metaBits = compact
    ? [
        `<span class="badge subtle">${readyNoImages} ready</span>`,
        `<span class="badge subtle">${runtime.coding} coding</span>`
      ]
    : [
        `<span class="badge subtle">${runtime.total} total</span>`,
        `<span class="badge subtle">${readyNoImages} ready</span>`,
        `<span class="badge subtle">${runtime.coding} coding</span>`,
        `<span class="badge subtle">${blocked} image-required</span>`
      ];

  return `
    <article class="dataset-card ${compact ? 'dataset-card-compact' : ''}">
      <div class="dataset-top-row">
        <div>
          <h4>${escapeHtml(buildDatasetTitle(dataset))}</h4>
          ${
            compact
              ? `<div class="muted small-text">Session loaded</div>`
              : `<div class="muted small-text">${escapeHtml(dataset.file)}</div>`
          }
        </div>
        <button class="ghost-btn small-btn" type="button" data-use-year="${dataset.year}" data-use-session="${escapeHtml(dataset.session)}">Use</button>
      </div>
      <div class="dataset-meta">
        ${metaBits.join('')}
      </div>
    </article>
  `;
}

function bindDatasetButtons(root) {
  if (!root) return;
  root.querySelectorAll('[data-use-year][data-use-session]').forEach((button) => {
    on(button, 'click', () => applyDatasetSelection(button.dataset.useYear, button.dataset.useSession));
  });
}

function applyDatasetSelection(year, session) {
  dom.yearSelect.value = String(year);
  populateSessionOptions();
  dom.sessionSelect.value = session;
  populateWeekOptions();
  dom.weekSelect.value = 'ALL';

  sanitizeFilters();
  saveSettings();
  updateBuilderStatus();
  showPage('build');
}

function getFilteredPool() {
  const settings = readFilterSettings();
  const search = normalizeText(settings.search);

  return state.allQuestions.filter((question) => {
    if (settings.year !== 'ALL' && String(question.year) !== String(settings.year)) return false;
    if (settings.session !== 'ALL' && String(question.session) !== String(settings.session)) return false;
    if (settings.week !== 'ALL' && String(question.week) !== String(settings.week)) return false;
    if (settings.type !== 'ALL' && String(question.varietyTag) !== String(settings.type)) return false;
    if (settings.practice !== 'ALL' && String(question.practiceTag) !== String(settings.practice)) return false;
    if (settings.hideRemoved && question.removed) return false;
    if (settings.hideImagePending && question.blockedVisual) return false;
    if (search && !question.searchBlob.includes(search)) return false;
    return true;
  });
}

function startTest() {
  const settings = readFilterSettings();
  let pool = getFilteredPool();

  if (!pool.length) {
    window.alert('No questions match the current filters.');
    return;
  }

  if (settings.shuffleQuestions) pool = shuffle([...pool]);

  const count = Math.min(Number(settings.count) || 15, APP_CONFIG.maxTestQuestions, pool.length);
  const selected = pool.slice(0, count).map((question) => ({
    ...question,
    options: settings.shuffleOptions ? shuffle([...(question.options || [])]) : [...(question.options || [])]
  }));

  state.activeTest = {
    startedAt: new Date().toISOString(),
    settings,
    title: buildTestTitle(settings, count),
    questions: selected,
    currentIndex: 0,
    answers: {},
    checked: {},
    submitted: false,
    result: null
  };

  persistActiveTest();
  renderActiveTest();
  showPage('test');
}

function buildTestTitle(settings, count) {
  const bits = [];
  if (settings.year !== 'ALL') bits.push(settings.year);
  if (settings.session !== 'ALL') bits.push(formatSession(settings.session));
  if (settings.practice !== 'ALL') bits.push(formatType(settings.practice));
  if (settings.type !== 'ALL') bits.push(formatType(settings.type));
  return `${bits.length ? bits.join(' · ') : 'Mixed Practice'} · ${count} Questions`;
}

function persistActiveTest() {
  localStorage.setItem(APP_CONFIG.storage.activeTest, JSON.stringify(state.activeTest));
}

function restoreActiveTest(shouldNavigate = true) {
  try {
    const saved = JSON.parse(localStorage.getItem(APP_CONFIG.storage.activeTest) || 'null');
    if (!saved || !saved.questions?.length) {
      toggleTestEmptyState(true);
      return false;
    }
    state.activeTest = saved;
    renderActiveTest();
    if (shouldNavigate) showPage('test');
    return true;
  } catch {
    toggleTestEmptyState(true);
    return false;
  }
}

function toggleTestEmptyState(isEmpty) {
  if (dom.testPanel) dom.testPanel.classList.toggle('hidden', isEmpty);
  if (dom.testEmptyState) dom.testEmptyState.classList.toggle('hidden', !isEmpty);
}

function renderActiveTest() {
  if (!state.activeTest?.questions?.length) {
    toggleTestEmptyState(true);
    return;
  }

  toggleTestEmptyState(false);

  const total = state.activeTest.questions.length;
  const answered = Object.values(state.activeTest.answers).filter(hasAnswer).length;
  const current = state.activeTest.questions[state.activeTest.currentIndex];

  if (dom.testTitle) dom.testTitle.textContent = state.activeTest.title;
  if (dom.testMeta) {
    dom.testMeta.textContent = `${current.year} ${formatSession(current.session)} · ${current.week_label || `Week ${current.week}`} · ${formatType(current.varietyTag)}`;
  }
  if (dom.progressChip) dom.progressChip.textContent = `${state.activeTest.currentIndex + 1} / ${total}`;
  if (dom.answeredCountBadge) dom.answeredCountBadge.textContent = `${answered} answered`;
  if (dom.progressBar) dom.progressBar.style.width = `${((state.activeTest.currentIndex + 1) / total) * 100}%`;
  if (dom.questionCard) dom.questionCard.innerHTML = buildQuestionHtml(current);

  bindQuestionOptionEvents(current);
  bindSwipeEvents();
  renderQuestionPalette();
}

function buildQuestionHtml(question) {
  const selectedValue = state.activeTest.answers[question.id] || '';
  const checked = Boolean(state.activeTest.checked[question.id]);
  const solutionModeEnabled = state.activeTest.settings.showSolutions;
  const shouldReveal = checked;
  const canCheckSolution = solutionModeEnabled && hasAnswer(selectedValue) && !checked;

  const meta = [
    question.display_no,
    formatType(question.varietyTag),
    `${question.marks || 1} mark`
  ];

  let imageBlock = '';
  if (question.blockedVisual) {
    imageBlock = `<div class="inline-warning">This question depends on an image asset. Keep “Hide image-required questions” enabled unless matching files are added in <code>/images</code>.</div>`;
  }

  const optionHtml = (question.options || [])
    .map((option) => {
      const isSelected = String(selectedValue) === String(option.key);
      const isCorrect = question.answerKeys.includes(String(option.key));
      const classes = ['option-btn'];

      if (isSelected) classes.push('selected');
      if (shouldReveal && isCorrect) classes.push('correct');
      if (shouldReveal && isSelected && !isCorrect) classes.push('wrong');

      return `
      <button class="${classes.join(' ')}" type="button" data-option-key="${escapeHtml(option.key)}" ${checked ? 'disabled' : ''}>
        <span class="option-key">${escapeHtml(String(option.key).toUpperCase())}</span>
        <span>${escapeHtml(option.text || '')}</span>
      </button>
    `;
    })
    .join('');

  const solutionActionBlock = solutionModeEnabled
    ? `
    <div class="question-action-row">
      ${canCheckSolution ? `<button class="primary-btn small-btn" type="button" data-check-solution="${escapeHtml(question.id)}">Check solution</button>` : ''}
      ${!checked && hasAnswer(selectedValue) ? `<button class="ghost-btn small-btn" type="button" data-clear-answer="${escapeHtml(question.id)}">Clear answer</button>` : ''}
      ${checked ? `<span class="inline-state-pill">Solution checked</span>` : ''}
    </div>
  `
    : '';

  const answerBlock = shouldReveal
    ? `<div class="inline-answer"><strong>Correct answer:</strong> ${escapeHtml(question.answerDisplay || '—')}</div>`
    : '';
  const referenceBlock =
    state.activeTest.settings.showReference && question.reference
      ? `<div class="inline-reference"><strong>Reference:</strong> ${escapeHtml(question.reference)}</div>`
      : '';
  const solutionBlock =
    shouldReveal && question.detailed_solution
      ? `<div class="inline-reference"><strong>Explanation:</strong> ${escapeHtml(question.detailed_solution)}</div>`
      : '';

  return `
    <div class="question-meta">
      ${meta.map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join('')}
    </div>
    <div class="question-text">${escapeHtml(question.question || 'Untitled question')}</div>
    ${question.code_block ? `<pre class="code-block"><code>${escapeHtml(question.code_block)}</code></pre>` : ''}
    ${imageBlock}
    <div class="options-list">${optionHtml}</div>
    ${solutionActionBlock}
    ${answerBlock}
    ${solutionBlock}
    ${referenceBlock}
  `;
}

function bindQuestionOptionEvents(question) {
  dom.questionCard?.querySelectorAll('[data-option-key]').forEach((button) => {
    on(button, 'click', () => selectOption(question, button.dataset.optionKey));
  });
  dom.questionCard?.querySelectorAll('[data-check-solution]').forEach((button) => {
    on(button, 'click', () => checkSolution(question.id));
  });
  dom.questionCard?.querySelectorAll('[data-clear-answer]').forEach((button) => {
    on(button, 'click', () => clearAnswer(question.id));
  });
}

let touchStartX = null;

function bindSwipeEvents() {
  if (!dom.questionCard) return;

  dom.questionCard.ontouchstart = (event) => {
    touchStartX = event.changedTouches[0].screenX;
  };

  dom.questionCard.ontouchend = (event) => {
    if (touchStartX === null) return;
    const diff = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 55) {
      if (diff < 0) moveQuestion(1);
      else moveQuestion(-1);
    }
    touchStartX = null;
  };
}

function selectOption(question, key) {
  if (!state.activeTest) return;
  state.activeTest.answers[question.id] = key;
  if (state.activeTest.checked[question.id]) delete state.activeTest.checked[question.id];
  persistActiveTest();
  renderActiveTest();
}

function checkSolution(questionId) {
  if (!state.activeTest) return;
  const currentQuestion = state.activeTest.questions.find((item) => item.id === questionId);
  if (!currentQuestion) return;
  if (!hasAnswer(state.activeTest.answers[questionId])) return;

  state.activeTest.checked[questionId] = true;
  persistActiveTest();
  renderActiveTest();
}

function clearAnswer(questionId) {
  if (!state.activeTest) return;
  delete state.activeTest.answers[questionId];
  delete state.activeTest.checked[questionId];
  persistActiveTest();
  renderActiveTest();
}

function moveQuestion(delta) {
  if (!state.activeTest) return;
  const total = state.activeTest.questions.length;
  state.activeTest.currentIndex = Math.max(
    0,
    Math.min(total - 1, state.activeTest.currentIndex + delta)
  );
  persistActiveTest();
  renderActiveTest();
}

function jumpToQuestion(index) {
  if (!state.activeTest) return;
  state.activeTest.currentIndex = index;
  persistActiveTest();
  renderActiveTest();
}

function renderQuestionPalette() {
  if (!state.activeTest || !dom.questionPalette) return;

  dom.questionPalette.innerHTML = state.activeTest.questions
    .map((question, index) => {
      const classes = ['palette-btn'];
      if (index === state.activeTest.currentIndex) classes.push('current');
      if (hasAnswer(state.activeTest.answers[question.id])) classes.push('answered');
      return `<button class="${classes.join(' ')}" type="button" data-jump-index="${index}">${index + 1}</button>`;
    })
    .join('');

  dom.questionPalette.querySelectorAll('[data-jump-index]').forEach((button) => {
    on(button, 'click', () => jumpToQuestion(Number(button.dataset.jumpIndex)));
  });
}

function hasAnswer(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function quitTest() {
  if (!state.activeTest) return;
  persistActiveTest();
  showPage('home');
}

function submitTest() {
  if (!state.activeTest) return;

  const scored = state.activeTest.questions.map((question) => {
    const selected = state.activeTest.answers[question.id] || '';
    const correct = question.answerKeys.includes(String(selected));
    return { question, selected, correct };
  });

  const score = scored
    .filter((item) => item.correct)
    .reduce((sum, item) => sum + (item.question.marks || 1), 0);
  const total = scored.reduce((sum, item) => sum + (item.question.marks || 1), 0);
  const percent = total ? Math.round((score / total) * 100) : 0;

  const record = {
    id: `attempt_${Date.now()}`,
    title: state.activeTest.title,
    startedAt: state.activeTest.startedAt,
    submittedAt: new Date().toISOString(),
    score,
    total,
    percent,
    questionCount: state.activeTest.questions.length,
    settings: state.activeTest.settings,
    review: scored.map((item) => ({
      id: item.question.id,
      question: item.question.question,
      questionLabel: item.question.display_no,
      selected: item.selected,
      selectedText: resolveOptionText(item.question, item.selected),
      correctKeys: item.question.answerKeys,
      correctAnswer: item.question.answerDisplay,
      reference: item.question.reference || '',
      detailedSolution: item.question.detailed_solution || '',
      correct: item.correct,
      practiceTag: item.question.practiceTag,
      varietyTag: item.question.varietyTag,
      codeBlock: item.question.code_block || ''
    }))
  };

  state.history.unshift(record);
  state.history = state.history.slice(0, 50);
  saveHistory();
  localStorage.removeItem(APP_CONFIG.storage.activeTest);
  state.activeTest = null;
  renderHistory();
  renderResults(record);
  updateStats();
  showPage('results');
}

function renderResults(record) {
  if (!record) {
    dom.resultsPanel?.classList.add('hidden');
    dom.resultsEmptyState?.classList.remove('hidden');
    return;
  }

  dom.resultsPanel?.classList.remove('hidden');
  dom.resultsEmptyState?.classList.add('hidden');

  if (dom.scoreBadge) dom.scoreBadge.textContent = `${record.score} / ${record.total}`;

  if (dom.resultsSummary) {
    dom.resultsSummary.innerHTML = `
      <article class="summary-card"><strong>${record.percent}%</strong><div class="muted">Score percentage</div></article>
      <article class="summary-card"><strong>${record.questionCount}</strong><div class="muted">Questions attempted</div></article>
      <article class="summary-card"><strong>${record.review.filter((item) => item.correct).length}</strong><div class="muted">Correct answers</div></article>
    `;
  }

  if (dom.reviewList) {
    dom.reviewList.innerHTML = record.review
      .map(
        (item) => `
      <article class="review-item">
        <h4>${escapeHtml(item.questionLabel)} · ${escapeHtml(formatType(item.varietyTag))} · ${escapeHtml(formatType(item.practiceTag))}</h4>
        <div class="muted">${escapeHtml(item.question)}</div>
        ${item.codeBlock ? `<pre class="code-block"><code>${escapeHtml(item.codeBlock)}</code></pre>` : ''}
        <div class="review-answer-row">
          <div class="answer-line ${item.correct ? 'status-good' : 'status-bad'}">${item.correct ? 'Correct' : 'Incorrect'}</div>
          <div class="answer-line"><strong>Your answer:</strong> ${escapeHtml(item.selectedText || item.selected || 'Not answered')}</div>
          <div class="answer-line"><strong>Correct answer:</strong> ${escapeHtml(item.correctAnswer || '—')}</div>
          ${item.detailedSolution ? `<div class="answer-line"><strong>Explanation:</strong> ${escapeHtml(item.detailedSolution)}</div>` : ''}
          ${item.reference ? `<div class="answer-line"><strong>Reference:</strong> ${escapeHtml(item.reference)}</div>` : ''}
        </div>
      </article>
    `
      )
      .join('');
  }
}

function renderResultsFromLastAttempt() {
  renderResults(state.history[0] || null);
}

function renderHistory() {
  if (dom.historyBadge) {
    dom.historyBadge.textContent = `${state.history.length} attempt${state.history.length === 1 ? '' : 's'}`;
  }
  if (!dom.historyList) return;

  if (!state.history.length) {
    dom.historyList.innerHTML = `<article class="history-item"><h4>No attempts yet</h4><div class="muted">Finished tests will appear here.</div></article>`;
    return;
  }

  dom.historyList.innerHTML = state.history
    .map(
      (entry) => `
    <article class="history-item">
      <h4>${escapeHtml(entry.title)}</h4>
      <div class="muted">${formatDate(entry.submittedAt)} · ${entry.score}/${entry.total} · ${entry.percent}%</div>
      <div class="actions-row compact-row">
        <button class="secondary-btn" type="button" data-history-open="${entry.id}">Open review</button>
      </div>
    </article>
  `
    )
    .join('');

  dom.historyList.querySelectorAll('[data-history-open]').forEach((button) => {
    on(button, 'click', () => {
      const found = state.history.find((item) => item.id === button.dataset.historyOpen);
      if (!found) return;
      renderResults(found);
      showPage('results');
    });
  });
}

function openDrawer() {
  dom.sideDrawer?.classList.add('open');
  dom.drawerBackdrop?.classList.remove('hidden');
  dom.sideDrawer?.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  dom.sideDrawer?.classList.remove('open');
  dom.drawerBackdrop?.classList.add('hidden');
  dom.sideDrawer?.setAttribute('aria-hidden', 'true');
}

function showPage(page) {
  state.currentPage = page;

  document.querySelectorAll('.app-page').forEach((section) =>
    section.classList.toggle('active', section.dataset.page === page)
  );
  document.querySelectorAll('.drawer-link').forEach((button) =>
    button.classList.toggle('active', button.dataset.page === page)
  );
  document.querySelectorAll('.bottom-link').forEach((button) =>
    button.classList.toggle('active', button.dataset.page === page)
  );

  if (dom.currentPageTitle) dom.currentPageTitle.textContent = pageTitles[page] || 'NPTEL IoT';

  if (dom.currentPageBadge) {
    if (page === 'test') {
      dom.currentPageBadge.textContent = state.activeTest
        ? `${state.activeTest.currentIndex + 1}/${state.activeTest.questions.length}`
        : 'No active test';
    } else if (page === 'results' && state.history[0]) {
      dom.currentPageBadge.textContent = `${state.history[0].percent}%`;
    } else if (page === 'history') {
      dom.currentPageBadge.textContent = `${state.history.length} saved`;
    } else if (page === 'datasets') {
      dom.currentPageBadge.textContent = `${state.banks.length} files`;
    } else if (page === 'contact') {
      dom.currentPageBadge.textContent = 'Support';
    } else {
      updateBuilderStatus();
    }
  }

  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyIssueTemplate() {
  const settings = readFilterSettings();
  const template = [
    'NPTEL IoT issue report',
    `Year: ${settings.year === 'ALL' ? '' : settings.year}`,
    `Session: ${settings.session === 'ALL' ? '' : settings.session}`,
    `Week: ${settings.week === 'ALL' ? '' : settings.week}`,
    'Question ID: ',
    'Problem: ',
    'Expected fix: ',
    `Send to: ${APP_CONFIG.contributionEmail}`
  ].join('\n');

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(template)
      .then(() => window.alert('Issue template copied.'))
      .catch(() => window.alert(template));
  } else {
    window.alert(template);
  }
}

function openContributionMail() {
  const subject = encodeURIComponent('NPTEL IoT missing session / correction');
  const body = encodeURIComponent(
    [
      'Hello,',
      '',
      'I want to share a missing session, correction, or dataset feedback.',
      '',
      'Available missing session:',
      '- 2018 JAN / 2019 JULY',
      '',
      'Details:',
      ''
    ].join('\n')
  );
  window.location.href = `mailto:${APP_CONFIG.contributionEmail}?subject=${subject}&body=${body}`;
}

function copyContactDetails() {
  const text = [
    `Email: ${APP_CONFIG.contributionEmail}`,
    `Social handle: @${APP_CONFIG.socialHandle}`,
    'Requested session uploads: 2018 JAN / 2019 JULY'
  ].join('\n');

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Contact details copied.'))
      .catch(() => window.alert(text));
  } else {
    window.alert(text);
  }
}

function buildDatasetTitle(dataset) {
  return `NPTEL IoT ${dataset.year} ${formatSession(dataset.session)}`;
}

function getLatestDatasetBySession(session) {
  return sortDatasets((state.manifest?.datasets || []).filter((dataset) => dataset.session === session))[0] || null;
}

function sortDatasets(datasets) {
  return [...datasets].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return sessionRank(b.session) - sessionRank(a.session);
  });
}

function sessionRank(session) {
  return { JAN: 1, JULY: 2 }[String(session).toUpperCase()] || 0;
}

function resolveOptionText(question, key) {
  const option = (question.options || []).find((item) => String(item.key) === String(key));
  return option ? option.text : '';
}

function formatSession(value) {
  const upper = String(value || '').toUpperCase();
  return upper === 'JAN' || upper === 'JULY' ? upper : formatType(value);
}

function formatType(value) {
  const raw = String(value || '');
  if (!raw) return '';

  const map = {
    true_false: 'True / False',
    fill_blank: 'Fill Blank',
    code_based: 'Code Based',
    single_select: 'Single Select',
    multi_select: 'Multi Select',
    mcq: 'MCQ'
  };

  if (map[raw]) return map[raw];
  return raw.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
