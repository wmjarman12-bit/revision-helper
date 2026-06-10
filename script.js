const ADMIN_CODE = "ADMIN";
const STORAGE_USERS = "revisionHelperUsers";
const STORAGE_CURRENT_USER = "revisionHelperCurrentUser";
const STORAGE_CUSTOM_CARDS = "revisionHelperCustomFlashcards";
const STORAGE_THEME = "revisionHelperTheme";
const STORAGE_BOOKMARKS = "revisionHelperBookmarks";

const levelLabels = {
  ks3: "KS3",
  ks4: "KS4",
  gcse: "GCSE",
  alevel: "A-Level"
};

const subjectTemplates = {
  "computer-science": {
    icon: "💻",
    title: "Computer Science",
    description: "Build strong revision habits with programming basics, systems thinking, and algorithms.",
    levelTopics: {
      ks3: ["algorithm", "program", "hardware", "software", "input", "output", "data", "network", "debug", "binary"],
      ks4: ["variable", "loop", "condition", "CPU", "RAM", "storage", "encryption", "database", "website", "algorithm efficiency"],
      gcse: ["logic gate", "iteration", "recursion", "operating system", "compiler", "IP address", "HTML", "CSS", "Python", "machine learning"],
      alevel: ["object-oriented", "data structure", "database normalization", "network topology", "cybersecurity", "cloud computing", "parallel processing", "AI ethics", "encryption algorithm", "algorithm analysis"]
    }
  },
  science: {
    icon: "🔬",
    title: "Science",
    description: "Strengthen your science knowledge with core biology, chemistry, and physics concepts.",
    levelTopics: {
      ks3: ["cell", "plant", "animal", "gravity", "force", "matter", "energy", "sound", "electricity", "water cycle"],
      ks4: ["atom", "periodic table", "chemical reaction", "photosynthesis", "motion", "electromagnetism", "cell division", "acid", "ecosystem", "energy transfer"],
      gcse: ["atomic structure", "chemical bonding", "electric circuit", "genetics", "wave behavior", "forces and motion", "ecosystem balance", "reaction rate", "pressure", "radioactivity"],
      alevel: ["organic chemistry", "thermodynamics", "rate equation", "genetics inheritance", "quantum physics", "homeostasis", "reaction mechanism", "momentum", "electric field", "chemical equilibrium"]
    }
  },
  english: {
    icon: "✍️",
    title: "English",
    description: "Practice language skills, grammar, and vocabulary through active revision tasks.",
    levelTopics: {
      ks3: ["noun", "verb", "adjective", "sentence", "paragraph", "punctuation", "story", "poem", "dialogue", "capital letter"],
      ks4: ["synonym", "antonym", "metaphor", "simile", "clause", "theme", "tone", "persuasion", "grammar", "spelling"],
      gcse: ["literary device", "context", "structure", "analysis", "argument", "vocabulary", "dialogue", "poetry", "novel", "character"],
      alevel: ["critical theory", "intertextuality", "genre", "author intent", "linguistic technique", "social commentary", "discourse", "identity", "representation", "subjectivity"]
    }
  },
  maths: {
    icon: "📐",
    title: "Maths",
    description: "Sharpen your maths skills with formulas, shapes, and quick problem-solving practice.",
    levelTopics: {
      ks3: ["addition", "subtraction", "multiplication", "division", "fraction", "decimal", "angle", "perimeter", "area", "volume"],
      ks4: ["algebra", "equation", "gradient", "probability", "ratio", "circle", "graph", "statistics", "trigonometry", "function"],
      gcse: ["quadratic", "simultaneous equation", "indices", "normal distribution", "circle theorem", "vector", "transformation", "surd", "compound interest", "rate"],
      alevel: ["calculus", "differentiation", "integration", "complex number", "matrix", "proof", "series", "coordinate geometry", "modulus", "differential equation"]
    }
  }
};

function buildCards(subject, levelKey, topics, count = 100) {
  const levelText = levelLabels[levelKey];
  const flashTemplates = [
    "What is {concept}?",
    "Define {concept}.",
    "Why is {concept} important in {subject}?",
    "How does {concept} work in {subject}?",
    "What does {concept} mean?",
    "How would you use {concept} in {subject}?",
    "Give an example of {concept}.",
    "What is the role of {concept} in {subject}?",
    "Name a key fact about {concept}.",
    "Which statement best describes {concept}?"
  ];
  const questionTemplates = [
    "How would you explain {concept}?",
    "Why does {concept} matter in {subject}?",
    "Give an example of {concept}.",
    "What happens when {concept} changes?",
    "Which of these relates to {concept}?",
    "What is one benefit of understanding {concept}?",
    "Name one way {concept} appears in real life.",
    "How would you describe {concept} to a classmate?",
    "What is the main idea behind {concept}?",
    "Why might {concept} be taught at {level}?"
  ];

  const flashcards = [];
  const questions = [];
  for (let i = 0; i < count; i += 1) {
    const concept = topics[i % topics.length];
    const flashPrompt = flashTemplates[i % flashTemplates.length]
      .replace(/{concept}/g, concept)
      .replace(/{subject}/g, subject)
      .replace(/{level}/g, levelText);
    const questionPrompt = questionTemplates[i % questionTemplates.length]
      .replace(/{concept}/g, concept)
      .replace(/{subject}/g, subject)
      .replace(/{level}/g, levelText);

    flashcards.push({
      prompt: flashPrompt,
      answer: `${concept[0].toUpperCase() + concept.slice(1)} is a ${levelText} ${subject.toLowerCase()} concept that students should understand.`
    });
    questions.push({
      question: questionPrompt,
      answer: `${concept[0].toUpperCase() + concept.slice(1)} is the answer when the question asks about ${concept} in ${subject}.`
    });
  }

  return { flashcards, questions };
}

function buildSubjects() {
  return Object.fromEntries(
    Object.entries(subjectTemplates).map(([key, template]) => {
      const levels = Object.fromEntries(
        Object.entries(template.levelTopics).map(([levelKey, topics]) => {
          const cards = buildCards(template.title, levelKey, topics, 100);
          return [levelKey, {
            title: levelLabels[levelKey],
            description: `${levelLabels[levelKey]} ${template.title} study cards and questions built for increasing difficulty and exam preparation.`,
            topics,
            flashcards: cards.flashcards,
            questions: cards.questions
          }];
        })
      );
      return [key, { ...template, levels }];
    })
  );
}

const subjects = buildSubjects();

const state = {
  currentSubject: "computer-science",
  currentLevel: "ks3",
  currentMode: "flashcards",
  currentIndex: 0,
  showAnswer: false,
  flashOrder: {},
  questionOrder: {},
  questionStats: {},
  learnedCards: {},
  users: [],
  currentUser: null,
  isAdmin: false,
  tempAdmin: false,
  adminPanelLocked: false,
  bookmarks: new Set(),
  searchTerm: "",
  studyTimerSeconds: 0,
  timerRunning: false,
  timerId: null,
  revisionOptions: {
    autoAdvance: false,
    showHints: false,
    focus: "review"
  }
};

const authScreen = document.getElementById("auth-screen");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginFeedback = document.getElementById("login-feedback");
const loginAdminFeedback = document.getElementById("login-admin-feedback");
const loginAdminCodeSection = document.getElementById("login-admin-unlock-section");
const loginAdminCodeInput = document.getElementById("login-admin-code");
const showAdminUnlockButton = document.getElementById("show-admin-unlock");
const loginAdminUnlockBtn = document.getElementById("login-admin-unlock-btn");
const signupFeedback = document.getElementById("signup-feedback");
const userNameLabel = document.getElementById("user-name");
const userRoleLabel = document.getElementById("user-role");
const summarySubject = document.getElementById("summary-subject");
const summaryLearned = document.getElementById("summary-learned");
const summaryCorrect = document.getElementById("summary-correct");
const adminPanel = document.getElementById("admin-panel");
const adminStatus = document.getElementById("admin-status");
const adminActions = document.getElementById("admin-actions");
const adminUnlockRow = document.getElementById("admin-unlock-row");
const adminCodeInput = document.getElementById("admin-code");
const adminLockPanelBtn = document.getElementById("admin-lock-panel");
const adminUsersTable = document.getElementById("admin-users-table");

const subjectButtons = document.querySelectorAll(".subject-btn");
const levelButtons = document.querySelectorAll(".level-btn");
const modeButtons = document.querySelectorAll(".mode-btn");
const menuItems = document.querySelectorAll(".menu-item");
const drawerOpenBtn = document.getElementById("drawer-open-btn");
const drawerCloseBtn = document.getElementById("drawer-close-btn");
const drawerOverlay = document.getElementById("drawer-overlay");
const sideDrawer = document.getElementById("side-drawer");
const drawerSignoutBtn = document.getElementById("drawer-signout-btn");
const dashboardPanel = document.getElementById("dashboard-panel");
const subjectPanel = document.getElementById("subject-panel");
const revisionPanel = document.getElementById("revision-panel");
const progressPanel = document.getElementById("progress-panel");
const achievementsPanel = document.getElementById("achievements-panel");
const achievementGrid = document.getElementById("achievement-grid");
const mainPanel = document.querySelector(".main-panel");
const subjectTitle = document.getElementById("subject-title");
const subjectDescription = document.getElementById("subject-description");
const subjectIcon = document.getElementById("subject-icon");
const subjectTopics = document.getElementById("subject-topics");
const subjectCount = document.getElementById("subject-count");
const subjectRoadmap = document.getElementById("subject-roadmap");
const subjectTip = document.getElementById("subject-tip");
const summaryLevel = document.getElementById("summary-level");
const themeToggle = document.getElementById("theme-toggle");
const searchInput = document.getElementById("search-cards");
const bookmarkCountLabel = document.getElementById("bookmark-count");
const timerDisplay = document.getElementById("timer-display");
const adminUserSearch = document.getElementById("admin-user-search");
const adminAccountCount = document.getElementById("admin-account-count");
const adminCount = document.getElementById("admin-count");
const lockedCount = document.getElementById("locked-count");
const homePanel = document.getElementById("home-panel");
const homeNextStep = document.getElementById("home-next-step");
const homeStreak = document.getElementById("home-streak");
const homeCompleted = document.getElementById("home-completed");
const homeStartStudy = document.getElementById("home-start-study");
const homeViewProgress = document.getElementById("home-view-progress");
const subjectSection = document.getElementById("subject-section");
const contentArea = document.getElementById("content-area");

function loadTheme() {
  const storedTheme = localStorage.getItem(STORAGE_THEME);
  applyTheme(storedTheme === "dark" ? "dark" : "light");
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_THEME, theme);
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  if (themeToggle) {
    themeToggle.checked = isDark;
  }
}

function loadBookmarks() {
  const stored = localStorage.getItem(STORAGE_BOOKMARKS);
  if (!stored) {
    updateBookmarkCount();
    return;
  }
  try {
    const list = JSON.parse(stored);
    state.bookmarks = new Set(Array.isArray(list) ? list : []);
  } catch (error) {
    state.bookmarks = new Set();
  }
  updateBookmarkCount();
}

function saveBookmarks() {
  localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(Array.from(state.bookmarks)));
}

function getCardKey(index) {
  return `${state.currentSubject}:${state.currentLevel}:${state.currentMode}:${index}`;
}

function toggleBookmark(index) {
  const key = `${state.currentSubject}:${state.currentLevel}:${state.currentMode}:${index}`;
  if (state.bookmarks.has(key)) {
    state.bookmarks.delete(key);
  } else {
    state.bookmarks.add(key);
  }
  saveBookmarks();
  renderContent();
  updateBookmarkCount();
}

function updateBookmarkCount() {
  if (bookmarkCountLabel) {
    bookmarkCountLabel.textContent = `${state.bookmarks.size} saved`;
  }
}

function updateTimerDisplay() {
  if (!timerDisplay) return;
  const minutes = String(Math.floor(state.studyTimerSeconds / 60)).padStart(2, "0");
  const seconds = String(state.studyTimerSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (state.timerRunning) return;
  state.timerRunning = true;
  state.timerId = window.setInterval(() => {
    state.studyTimerSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!state.timerRunning) return;
  state.timerRunning = false;
  window.clearInterval(state.timerId);
  state.timerId = null;
}

function resetTimer() {
  pauseTimer();
  state.studyTimerSeconds = 0;
  updateTimerDisplay();
}

function getVisibleIndices(indices, items) {
  const term = state.searchTerm.trim().toLowerCase();
  if (!term) return indices;
  return indices.filter((index) => {
    const raw = state.currentMode === "flashcards"
      ? `${items[index].prompt} ${items[index].answer}`
      : `${items[index].question} ${items[index].answer}`;
    return raw.toLowerCase().includes(term);
  });
}

function renderRoadmap() {
  if (!subjectRoadmap) return;
  const levels = ["ks3", "ks4", "gcse", "alevel"];
  subjectRoadmap.innerHTML = levels.map((levelKey) => {
    const isActive = levelKey === state.currentLevel;
    return `
      <div class="roadmap-step ${isActive ? "active" : ""}">
        <span>${levelLabels[levelKey]}</span>
      </div>
    `;
  }).join("");
}

function renderStudyTip() {
  if (!subjectTip) return;
  const tips = [
    "Bookmark cards you want to review later.",
    "Use search to find difficult terms quickly.",
    "Try repeating difficult cards after a short break.",
    "Switch levels when you feel confident in the current topic.",
    "Use the timer to build steady study sessions."
  ];
  subjectTip.textContent = tips[Math.floor(Math.random() * tips.length)];
}

function renderAchievements() {
  if (!achievementGrid) return;
  const totals = getUserTotals();
  const levelsCompleted = Object.entries(subjects).reduce((count, [subjectKey, subject]) => {
    return count + Object.entries(subject.levels).filter(([levelKey]) => {
      const key = `${subjectKey}:${levelKey}`;
      return (state.currentUser?.progress?.learned?.[key] || []).length >= subject.levels[levelKey].flashcards.length;
    }).length;
  }, 0);

  const items = [
    { label: "First 10 cards", unlocked: totals.learned >= 10 },
    { label: "Halfway there", unlocked: totals.learned >= 400 },
    { label: "Level complete", unlocked: levelsCompleted >= 1 },
    { label: "Multi-level learner", unlocked: levelsCompleted >= 4 },
    { label: "Bookmark champion", unlocked: state.bookmarks.size >= 10 },
    { label: "Study streak starter", unlocked: (state.currentUser?.profile?.streak || 0) >= 3 }
  ];

  achievementGrid.innerHTML = items.map((item) => `
    <div class="achievement-card ${item.unlocked ? "unlocked" : "locked"}">
      <strong>${item.label}</strong>
      <span>${item.unlocked ? "Unlocked" : "Locked"}</span>
    </div>
  `).join("");
}

function loadUsers() {
  const stored = localStorage.getItem(STORAGE_USERS);
  state.users = stored ? JSON.parse(stored) : [];
  state.users = state.users.map((entry) => ({
    ...entry,
    isAdmin: Boolean(entry.isAdmin),
    isLocked: Boolean(entry.isLocked),
    profile: entry.profile || { createdAt: normalizeDay(), lastLogin: normalizeDay(), lastActiveDay: normalizeDay(), streak: 0 },
    progress: entry.progress || { learned: {}, questionStats: {} }
  }));
}

function showPage(page, button) {
  menuItems.forEach((item) => item.classList.toggle("active", item.dataset.page === page));
  const showHome = page === "home";
  const showSubjects = page === "subjects";
  const showOptions = page === "options";
  const showAdmin = page === "admin";

  dashboardPanel.classList.toggle("hidden", !showHome);
  homePanel?.classList.toggle("hidden", !showHome);
  subjectPanel.classList.toggle("hidden", !showSubjects);
  subjectSection?.classList.toggle("hidden", !showSubjects);
  revisionPanel.classList.toggle("hidden", !showOptions);
  progressPanel.classList.toggle("hidden", !showOptions);
  achievementsPanel.classList.toggle("hidden", !showOptions);
  adminPanel.classList.toggle("hidden", !showAdmin);
  mainPanel.classList.toggle("hidden", !(showHome || showSubjects));

  if (showHome) {
    document.querySelector(".page-shell").classList.add("compact-view");
    renderHomePanel();
  } else if (showSubjects) {
    document.querySelector(".page-shell").classList.remove("compact-view");
  } else {
    document.querySelector(".page-shell").classList.add("compact-view");
  }
  closeDrawer();
}

function openDrawer() {
  sideDrawer.classList.remove("hidden");
  requestAnimationFrame(() => {
    sideDrawer.classList.add("open");
  });
  drawerOverlay.classList.remove("hidden");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  sideDrawer.classList.remove("open");
  drawerOverlay.classList.add("hidden");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => {
    if (!sideDrawer.classList.contains("open")) {
      sideDrawer.classList.add("hidden");
    }
  }, 280);
}

function saveUsers() {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(state.users));
}

function loadCurrentUserFromStorage() {
  const username = localStorage.getItem(STORAGE_CURRENT_USER);
  if (!username) return null;
  return state.users.find((user) => user.username === username) || null;
}

function saveCurrentUserName() {
  if (state.currentUser) {
    localStorage.setItem(STORAGE_CURRENT_USER, state.currentUser.username);
  }
}

function clearCurrentUserName() {
  localStorage.removeItem(STORAGE_CURRENT_USER);
}

function loadCustomFlashcards() {
  const stored = localStorage.getItem(STORAGE_CUSTOM_CARDS);
  if (!stored) return;
  const customCards = JSON.parse(stored);
  customCards.forEach((entry) => {
    const level = entry.level || "ks3";
    if (subjects[entry.subject]?.levels?.[level]) {
      subjects[entry.subject].levels[level].flashcards.push({ prompt: entry.prompt, answer: entry.answer });
    }
  });
}

function getCustomFlashcards() {
  const stored = localStorage.getItem(STORAGE_CUSTOM_CARDS);
  return stored ? JSON.parse(stored) : [];
}

function saveCustomFlashcards(cards) {
  localStorage.setItem(STORAGE_CUSTOM_CARDS, JSON.stringify(cards));
}

function switchAuthTab(tab) {
  document.getElementById("switch-to-login").classList.toggle("active", tab === "login");
  document.getElementById("switch-to-signup").classList.toggle("active", tab === "signup");
  loginForm.classList.toggle("hidden", tab !== "login");
  signupForm.classList.toggle("hidden", tab !== "signup");
}

function updateUserPanel() {
  if (!state.currentUser) {
    userNameLabel.textContent = "Guest";
    userRoleLabel.textContent = "Student";
  } else {
    userNameLabel.textContent = state.currentUser.username;
    userRoleLabel.textContent = state.currentUser.isAdmin
      ? "Admin"
      : state.tempAdmin
        ? "Admin (session)"
        : "Student";
  }
}

function renderAdminPanel() {
  if (!state.currentUser) {
    adminPanel.classList.add("hidden");
    return;
  }
  const hasAdminAccess = Boolean(state.currentUser.isAdmin || state.tempAdmin);
  const isPanelLocked = state.adminPanelLocked && hasAdminAccess;
  state.isAdmin = hasAdminAccess;
  adminPanel.classList.remove("hidden");

  if (!hasAdminAccess) {
    adminStatus.textContent = "Enter the unlock code to gain admin privileges for your account.";
  } else if (isPanelLocked) {
    adminStatus.textContent = "Admin panel locked. Enter the code to unlock it.";
  } else {
    adminStatus.textContent = "Admin unlocked. You can manage users, export data, and control flashcards.";
  }

  adminActions.classList.toggle("hidden", !hasAdminAccess || isPanelLocked);
  adminUnlockRow?.classList.toggle("hidden", !(!hasAdminAccess || isPanelLocked));
  adminLockPanelBtn?.classList.toggle("hidden", !(hasAdminAccess && !isPanelLocked));

  renderAdminUsersTable();
  renderAdminSummary();
  renderHomePanel();
}

function renderHomePanel() {
  if (!homePanel) return;
  const totals = getUserTotals();
  homeNextStep.textContent = `${subjects[state.currentSubject].title} – ${levelLabels[state.currentLevel]}`;
  homeStreak.textContent = `${state.currentUser?.profile?.streak || 0} day streak`;
  homeCompleted.textContent = `${totals.learned} cards learned`;
}

function renderAdminUsersTable() {
  if (!state.currentUser?.isAdmin) {
    adminUsersTable.innerHTML = "";
    return;
  }
  const filter = adminUserSearch?.value.trim().toLowerCase() || "";
  const filteredUsers = state.users.filter((user) => {
    if (!filter) return true;
    return [user.username, user.isAdmin ? "admin" : "student", user.isLocked ? "locked" : "active"].some((value) => value.includes(filter));
  });
  if (filteredUsers.length === 0) {
    adminUsersTable.innerHTML = "<div class='progress-card'>No accounts match the filter.</div>";
    return;
  }
  const html = filteredUsers
    .map((user) => {
      const learned = Object.values(user.progress.learned || {}).reduce((sum, list) => sum + (list?.length || 0), 0);
      const totalAttempts = Object.values(user.progress.questionStats || {}).reduce((sum, stats) => sum + (stats.attempts || 0), 0);
      const totalCorrect = Object.values(user.progress.questionStats || {}).reduce((sum, stats) => sum + (stats.correct || 0), 0);
      const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
      const roleLabel = user.isAdmin ? "Admin" : "Student";
      const lockLabel = user.isLocked ? "Locked" : "Active";
      return `
        <div class="admin-user-card ${user.isLocked ? "locked" : ""}">
          <div class="admin-user-meta">
            <strong>${user.username}</strong>
            <span class="admin-tag ${user.isAdmin ? "admin" : "student"}">${roleLabel}</span>
            <span class="admin-tag ${user.isLocked ? "locked" : "active"}">${lockLabel}</span>
          </div>
          <p>Learned cards: ${learned}</p>
          <p>Accuracy: ${accuracy}%</p>
          <p>Streak: ${user.profile?.streak || 0} days</p>
          <div class="admin-user-actions">
            <button class="secondary-btn toggle-admin-btn" data-user="${user.username}">${user.isAdmin ? "Revoke admin" : "Make admin"}</button>
            <button class="secondary-btn toggle-lock-btn" data-user="${user.username}">${user.isLocked ? "Unlock" : "Lock"}</button>
            <button class="secondary-btn reset-user-btn" data-user="${user.username}">Reset progress</button>
            <button class="secondary-btn delete-user-btn" data-user="${user.username}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
  adminUsersTable.innerHTML = html;
  document.querySelectorAll(".reset-user-btn").forEach((button) => {
    button.addEventListener("click", () => resetUserProgress(button.dataset.user));
  });
  document.querySelectorAll(".toggle-admin-btn").forEach((button) => {
    button.addEventListener("click", () => toggleUserAdmin(button.dataset.user));
  });
  document.querySelectorAll(".toggle-lock-btn").forEach((button) => {
    button.addEventListener("click", () => toggleUserLock(button.dataset.user));
  });
  document.querySelectorAll(".delete-user-btn").forEach((button) => {
    button.addEventListener("click", () => deleteUser(button.dataset.user));
  });
}

function renderAdminSummary() {
  if (!adminAccountCount || !adminCount || !lockedCount) return;
  const totalUsers = state.users.length;
  const adminUsers = state.users.filter((user) => user.isAdmin).length;
  const lockedUsers = state.users.filter((user) => user.isLocked).length;
  adminAccountCount.textContent = totalUsers;
  adminCount.textContent = adminUsers;
  lockedCount.textContent = lockedUsers;
}

function resetUserProgress(username) {
  const user = state.users.find((entry) => entry.username === username);
  if (!user) return;
  user.progress = { learned: {}, questionStats: {} };
  saveUsers();
  if (state.currentUser?.username === username) {
    loadCurrentUserProgress();
    renderContent();
    updateUserDashboard();
  }
  renderAdminUsersTable();
}

function toggleUserAdmin(username) {
  const user = state.users.find((entry) => entry.username === username);
  if (!user) return;
  user.isAdmin = !user.isAdmin;
  saveUsers();
  if (state.currentUser?.username === username) {
    state.currentUser.isAdmin = user.isAdmin;
    state.isAdmin = user.isAdmin;
    updateUserPanel();
    renderAdminPanel();
  } else {
    renderAdminUsersTable();
    renderAdminSummary();
  }
}

function toggleUserLock(username) {
  const user = state.users.find((entry) => entry.username === username);
  if (!user) return;
  user.isLocked = !user.isLocked;
  saveUsers();
  if (state.currentUser?.username === username && user.isLocked) {
    logoutUser();
  }
  renderAdminUsersTable();
  renderAdminSummary();
}

function deleteUser(username) {
  if (!confirm(`Delete account '${username}'? This action cannot be undone.`)) return;
  state.users = state.users.filter((entry) => entry.username !== username);
  saveUsers();
  if (state.currentUser?.username === username) {
    logoutUser();
  }
  renderAdminUsersTable();
  renderAdminSummary();
}

function exportUsersData() {
  const data = JSON.stringify(state.users, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "revision-helper-users.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getProgressKey(subjectKey = state.currentSubject, levelKey = state.currentLevel) {
  return `${subjectKey}:${levelKey}`;
}

function getCurrentLevelData(subjectKey = state.currentSubject, levelKey = state.currentLevel) {
  return subjects[subjectKey].levels[levelKey];
}

function getLearnedSet(subjectKey = state.currentSubject, levelKey = state.currentLevel) {
  const key = getProgressKey(subjectKey, levelKey);
  if (!state.learnedCards[key]) {
    state.learnedCards[key] = new Set();
  }
  return state.learnedCards[key];
}

function getQuestionStats(subjectKey = state.currentSubject, levelKey = state.currentLevel) {
  const key = getProgressKey(subjectKey, levelKey);
  if (!state.questionStats[key]) {
    state.questionStats[key] = { correct: 0, attempts: 0 };
  }
  return state.questionStats[key];
}

function initializeSubject(subjectKey, levelKey = state.currentLevel) {
  const subject = subjects[subjectKey];
  const levelData = getCurrentLevelData(subjectKey, levelKey);
  state.flashOrder[subjectKey] = state.flashOrder[subjectKey] || {};
  state.questionOrder[subjectKey] = state.questionOrder[subjectKey] || {};
  if (!state.flashOrder[subjectKey][levelKey]) {
    state.flashOrder[subjectKey][levelKey] = levelData.flashcards.map((_, index) => index);
  }
  if (!state.questionOrder[subjectKey][levelKey]) {
    state.questionOrder[subjectKey][levelKey] = levelData.questions.map((_, index) => index);
  }
  getQuestionStats(subjectKey, levelKey);
  getLearnedSet(subjectKey, levelKey);
}

function loadCurrentUserProgress() {
  if (!state.currentUser) return;
  const progress = state.currentUser.progress || { learned: {}, questionStats: {} };
  const key = getProgressKey();
  const learned = progress.learned[key] || [];
  state.learnedCards[key] = new Set(learned);
  state.questionStats[key] = progress.questionStats[key] || { correct: 0, attempts: 0 };
}

function normalizeDay(dateString) {
  const date = new Date(dateString ? dateString : Date.now());
  return date.toISOString().split("T")[0];
}

function updateCurrentUserActivity() {
  if (!state.currentUser) return;
  const today = normalizeDay();
  const lastActive = state.currentUser.profile?.lastActiveDay;
  const profile = state.currentUser.profile || { createdAt: today, lastLogin: today, streak: 0, lastActiveDay: null };
  if (lastActive === today) {
    profile.streak = profile.streak || 1;
  } else if (lastActive === normalizeDay(new Date(Date.now() - 86400000).toISOString())) {
    profile.streak = (profile.streak || 0) + 1;
  } else {
    profile.streak = 1;
  }
  profile.lastActiveDay = today;
  profile.lastLogin = today;
  state.currentUser.profile = profile;
  saveUsers();
}

function getUserTotals() {
  const learned = Object.values(state.currentUser?.progress?.learned || {}).reduce((sum, list) => sum + (list?.length || 0), 0);
  const totalFlashcards = Object.values(subjects).reduce(
    (subjectSum, subject) =>
      subjectSum + Object.values(subject.levels).reduce((levelSum, level) => levelSum + level.flashcards.length, 0),
    0
  );
  const questionStats = state.currentUser?.progress?.questionStats || {};
  const totalAttempts = Object.values(questionStats).reduce((sum, stats) => sum + (stats.attempts || 0), 0);
  const totalCorrect = Object.values(questionStats).reduce((sum, stats) => sum + (stats.correct || 0), 0);
  return { learned, totalFlashcards, totalCorrect, totalAttempts };
}

function updateUserDashboard() {
  if (!state.currentUser) {
    document.getElementById("dashboard-learned").textContent = "0";
    document.getElementById("dashboard-accuracy").textContent = "0%";
    document.getElementById("dashboard-streak").textContent = "0 days";
    document.getElementById("progress-bars").innerHTML = "";
    return;
  }
  const totals = getUserTotals();
  document.getElementById("dashboard-learned").textContent = `${totals.learned}`;
  document.getElementById("dashboard-accuracy").textContent = `${totals.totalAttempts ? Math.round((totals.totalCorrect / totals.totalAttempts) * 100) : 0}%`;
  document.getElementById("dashboard-streak").textContent = `${state.currentUser.profile?.streak || 0} days`;
  renderProgressBars();
}

function renderProgressBars() {
  const container = document.getElementById("progress-bars");
  if (!state.currentUser) {
    container.innerHTML = "";
    return;
  }
  const html = Object.entries(subjects)
    .flatMap(([key, subject]) =>
      Object.entries(subject.levels).map(([levelKey, level]) => {
        const progressKey = `${key}:${levelKey}`;
        const learned = (state.currentUser.progress.learned?.[progressKey] || []).length;
        const percent = level.flashcards.length ? Math.round((learned / level.flashcards.length) * 100) : 0;
        return `
          <div class="progress-bar-row">
            <div class="progress-bar-label">
              <span>${subject.title} ${levelLabels[levelKey]}</span>
              <span>${percent}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
      })
    )
    .join("");
  container.innerHTML = html;
}

function persistCurrentUserProgress() {
  if (!state.currentUser) return;
  const progress = state.currentUser.progress || { learned: {}, questionStats: {} };
  progress.learned = progress.learned || {};
  progress.questionStats = progress.questionStats || {};
  const key = getProgressKey();
  progress.learned[key] = Array.from(getLearnedSet());
  progress.questionStats[key] = getQuestionStats();
  state.currentUser.progress = progress;
  const index = state.users.findIndex((user) => user.username === state.currentUser.username);
  if (index >= 0) {
    state.users[index] = state.currentUser;
    saveUsers();
  }
  updateUserDashboard();
}

function updateSubject(subjectKey) {
  state.currentSubject = subjectKey;
  state.currentIndex = 0;
  state.showAnswer = false;
  initializeSubject(subjectKey, state.currentLevel);
  subjectButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.subject === subjectKey);
  });
  const subject = subjects[subjectKey];
  const levelData = getCurrentLevelData(subjectKey, state.currentLevel);
  subjectTitle.textContent = subject.title;
  subjectDescription.textContent = levelData.description;
  subjectIcon.textContent = subject.icon;
  subjectTopics.textContent = levelData.topics.join(" • ");
  subjectCount.textContent = `${levelData.flashcards.length} flashcards / ${levelData.questions.length} questions`;
  if (state.currentUser) {
    loadCurrentUserProgress();
  }
  renderRoadmap();
  renderStudyTip();
  renderContent();
}

function updateLevel(levelKey) {
  state.currentLevel = levelKey;
  state.currentIndex = 0;
  state.showAnswer = false;
  levelButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === levelKey);
  });
  updateSubject(state.currentSubject);
}

function updateMode(mode) {
  state.currentMode = mode;
  state.currentIndex = 0;
  state.showAnswer = false;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  renderContent();
}

function getOrderedIndices() {
  const order = [...state[state.currentMode === "flashcards" ? "flashOrder" : "questionOrder"][state.currentSubject][state.currentLevel]];
  if (state.currentMode === "flashcards") {
    if (state.revisionOptions.focus === "exam") {
      return shuffleArray(order);
    }
    if (state.revisionOptions.focus === "review") {
      const learned = getLearnedSet();
      return order.sort((a, b) => {
        const aLearned = learned.has(a);
        const bLearned = learned.has(b);
        return aLearned === bLearned ? 0 : aLearned ? 1 : -1;
      });
    }
  }
  return order;
}

function getOrderedItems() {
  const subject = subjects[state.currentSubject];
  const items = getCurrentLevelData()[state.currentMode];
  return getOrderedIndices().map((index) => items[index]);
}

function renderStats() {
  const levelData = getCurrentLevelData();
  const items = levelData[state.currentMode];
  const stats = getQuestionStats();
  if (state.currentMode === "flashcards") {
    return `
      <div class="stats-row">
        <div class="stat-card">
          <strong>Flashcards</strong>
          <span>${state.currentIndex + 1} / ${items.length}</span>
        </div>
        <div class="stat-card">
          <strong>Current topic</strong>
          <span>${levelData.topics[state.currentIndex % levelData.topics.length]}</span>
        </div>
        <div class="stat-card">
          <strong>Deck</strong>
          <span>${items.length} cards</span>
        </div>
      </div>
    `;
  }
  return `
    <div class="stats-row">
      <div class="stat-card">
        <strong>Question</strong>
        <span>${state.currentIndex + 1} / ${items.length}</span>
      </div>
      <div class="stat-card">
        <strong>Correct</strong>
        <span>${stats.correct}</span>
      </div>
      <div class="stat-card">
        <strong>Attempts</strong>
        <span>${stats.attempts}</span>
      </div>
    </div>
  `;
}

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function updateSummaryPanel() {
  const subject = subjects[state.currentSubject];
  const levelData = getCurrentLevelData();
  const learnedCount = getLearnedSet().size;
  const questionStats = getQuestionStats();
  summarySubject.textContent = subject.title;
  summaryLevel.textContent = levelLabels[state.currentLevel];
  summaryLearned.textContent = `${learnedCount} / ${levelData.flashcards.length}`;
  summaryCorrect.textContent = `${questionStats.correct} / ${questionStats.attempts}`;
  updateBookmarkCount();
  renderAchievements();
}

function renderContent() {
  const subject = subjects[state.currentSubject];
  const levelData = getCurrentLevelData();
  const orderedIndices = getOrderedIndices();
  const rawItems = levelData[state.currentMode];
  const visibleIndices = getVisibleIndices(orderedIndices, rawItems);
  if (visibleIndices.length === 0) {
    contentArea.innerHTML = `
      <section class="card">
        <h3>No matching cards found</h3>
        <p>Try a different search term, subject, level, or switch modes.</p>
      </section>
    `;
    return;
  }
  if (state.currentIndex >= visibleIndices.length) {
    state.currentIndex = visibleIndices.length - 1;
  }
  const currentIndex = visibleIndices[state.currentIndex];
  const item = rawItems[currentIndex];
  const statsHtml = renderStats();
  const learned = getLearnedSet().has(currentIndex);

  if (state.currentMode === "flashcards") {
    contentArea.innerHTML = `
      <section class="card">
        <h3>Flashcard ${state.currentIndex + 1} of ${visibleIndices.length}</h3>
        <p>${item.prompt}</p>
        ${learned ? `<div class="card-tag">Learned</div>` : ""}
        ${state.showAnswer ? `<div class="feedback"><strong>Answer:</strong> ${item.answer}</div>` : ""}
        <div class="flash-actions">
          <button id="toggle-answer">${state.showAnswer ? "Hide Answer" : "Show Answer"}</button>
          <button id="toggle-bookmark">${state.bookmarks.has(getCardKey(currentIndex)) ? "★ Bookmarked" : "☆ Bookmark"}</button>
          <button id="mark-learned">${learned ? "Mark for review" : "Mark as learned"}</button>
          <button id="prev-card" ${state.currentIndex === 0 ? "disabled" : ""}>Previous</button>
          <button id="next-card" ${state.currentIndex === visibleIndices.length - 1 ? "disabled" : ""}>Next</button>
          <button id="shuffle-deck">Shuffle Deck</button>
        </div>
        ${statsHtml}
      </section>
    `;

    document.getElementById("toggle-answer").addEventListener("click", () => {
      state.showAnswer = !state.showAnswer;
      renderContent();
    });
    document.getElementById("mark-learned").addEventListener("click", () => {
      const learnedSet = getLearnedSet();
      if (learned) {
        learnedSet.delete(currentIndex);
      } else {
        learnedSet.add(currentIndex);
      }
      persistCurrentUserProgress();
      if (state.revisionOptions.autoAdvance && state.currentIndex < visibleIndices.length - 1) {
        state.currentIndex += 1;
      }
      renderContent();
    });
    document.getElementById("prev-card").addEventListener("click", () => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.showAnswer = false;
        renderContent();
      }
    });
    document.getElementById("next-card").addEventListener("click", () => {
      if (state.currentIndex < visibleIndices.length - 1) {
        state.currentIndex += 1;
        state.showAnswer = false;
        renderContent();
      }
    });
    document.getElementById("shuffle-deck").addEventListener("click", () => {
      const subjectOrder = state.flashOrder[state.currentSubject][state.currentLevel];
      state.flashOrder[state.currentSubject][state.currentLevel] = shuffleArray(subjectOrder);
      state.currentIndex = 0;
      state.showAnswer = false;
      renderContent();
    });
    document.getElementById("toggle-bookmark").addEventListener("click", () => {
      toggleBookmark(currentIndex);
    });
  } else {
    const hint = state.revisionOptions.showHints ? `<div class="feedback"><strong>Hint:</strong> ${item.answer.split(" ").slice(0, 3).join(" ")}...</div>` : "";
    contentArea.innerHTML = `
      <section class="question-card">
        <h3>Question ${state.currentIndex + 1} of ${visibleIndices.length}</h3>
        <p>${item.question}</p>
        ${hint}
        <div class="question-actions">
          <input id="answer-input" type="text" placeholder="Type your answer here" autocomplete="off" />
          <button id="check-answer">Check Answer</button>
          <button id="next-question" ${state.currentIndex === visibleIndices.length - 1 ? "disabled" : ""}>Next Question</button>
          <button id="reset-score">Reset Score</button>
        </div>
        <div id="question-feedback"></div>
        ${statsHtml}
      </section>
    `;

    document.getElementById("check-answer").addEventListener("click", () => {
      const guess = document.getElementById("answer-input").value.trim().toLowerCase();
      const correct = item.answer.trim().toLowerCase();
      const feedback = document.getElementById("question-feedback");
      if (!guess) {
        feedback.innerHTML = `<div class="feedback">Please type an answer first.</div>`;
        return;
      }
      const stats = getQuestionStats();
      stats.attempts += 1;
      const isCorrect = correct.includes(guess) || guess.includes(correct);
      if (isCorrect) {
        stats.correct += 1;
      }
      persistCurrentUserProgress();
      feedback.innerHTML = isCorrect
        ? `<div class="feedback" style="background:#dcfce7;color:#166534"><strong>Correct!</strong> ${item.answer}</div>`
        : `<div class="feedback" style="background:#fee2e2;color:#991b1b"><strong>Try again.</strong> Answer: ${item.answer}</div>`;
      if (state.revisionOptions.autoAdvance && isCorrect && state.currentIndex < visibleIndices.length - 1) {
        state.currentIndex += 1;
        renderContent();
        return;
      }
      updateSummaryPanel();
    });

    document.getElementById("next-question").addEventListener("click", () => {
      if (state.currentIndex < visibleIndices.length - 1) {
        state.currentIndex += 1;
        renderContent();
      }
    });

    document.getElementById("reset-score").addEventListener("click", () => {
      const stats = getQuestionStats();
      stats.correct = 0;
      stats.attempts = 0;
      persistCurrentUserProgress();
      renderContent();
    });
  }

  updateSummaryPanel();
}

function unlockAdmin() {
  const code = adminCodeInput?.value.trim() || "";
  if (!state.currentUser) {
    adminStatus.textContent = "Please sign in before unlocking admin access.";
    return;
  }
  if (code !== ADMIN_CODE) {
    adminStatus.textContent = "Incorrect code. Try again.";
    return;
  }

  if (!state.currentUser.isAdmin) {
    state.tempAdmin = true;
  }
  state.adminPanelLocked = false;
  state.isAdmin = true;
  if (state.currentUser.isAdmin) {
    adminStatus.textContent = "Admin unlocked. You can manage users, export data, and control flashcards.";
  } else {
    adminStatus.textContent = "Admin access granted for this session.";
  }
  if (adminCodeInput) {
    adminCodeInput.value = "";
  }
  renderAdminPanel();
}

function lockAdminPanel() {
  if (!state.currentUser) return;
  state.adminPanelLocked = true;
  renderAdminPanel();
}

function addFlashcard() {
  const subject = document.getElementById("admin-subject-select").value;
  const prompt = document.getElementById("admin-prompt").value.trim();
  const answer = document.getElementById("admin-answer").value.trim();
  const feedback = document.getElementById("admin-add-feedback");
  if (!prompt || !answer) {
    feedback.textContent = "Please fill in both prompt and answer.";
    return;
  }
  const level = state.currentLevel || "ks3";
  if (!subjects[subject]?.levels?.[level]) {
    feedback.textContent = "Unable to save card for this subject and level.";
    return;
  }
  subjects[subject].levels[level].flashcards.push({ prompt, answer });
  const cards = getCustomFlashcards();
  cards.push({ subject, level, prompt, answer });
  saveCustomFlashcards(cards);
  feedback.textContent = "New flashcard added.";
  document.getElementById("admin-prompt").value = "";
  document.getElementById("admin-answer").value = "";
  if (state.currentSubject === subject && state.currentLevel === level) {
    updateSubject(subject);
  }
}

function initializeApp() {
  loadUsers();
  loadBookmarks();
  loadCustomFlashcards();
  wireEvents();
  const storedUser = loadCurrentUserFromStorage();
  if (storedUser) {
    state.currentUser = storedUser;
    updateCurrentUserActivity();
    updateUserPanel();
    renderAdminPanel();
    loadCurrentUserProgress();
    updateUserDashboard();
    authScreen.classList.add("hidden");
  } else {
    switchAuthTab("login");
    authScreen.classList.remove("hidden");
  }
  loadTheme();
  initializeSubject(state.currentSubject, state.currentLevel);
  updateSubject(state.currentSubject);
  updateMode(state.currentMode);
  showPage("home", menuItems[0]);
}

function wireEvents() {
  document.getElementById("switch-to-login").addEventListener("click", () => switchAuthTab("login"));
  document.getElementById("switch-to-signup").addEventListener("click", () => switchAuthTab("signup"));
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const adminCode = loginAdminCodeInput?.value.trim();
    loginUser(username, password, adminCode);
  });
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    signUpUser(username, password);
  });
  document.getElementById("logout-btn").addEventListener("click", signOut);
  if (drawerSignoutBtn) drawerSignoutBtn.addEventListener("click", signOut);
  document.getElementById("unlock-admin").addEventListener("click", unlockAdmin);
  if (adminLockPanelBtn) adminLockPanelBtn.addEventListener("click", lockAdminPanel);
  document.getElementById("save-card").addEventListener("click", addFlashcard);
  document.getElementById("admin-export-data").addEventListener("click", exportUsersData);
  if (adminUserSearch) {
    adminUserSearch.addEventListener("input", () => renderAdminUsersTable());
  }
  if (showAdminUnlockButton) {
    showAdminUnlockButton.addEventListener("click", () => {
      loginAdminCodeSection.classList.toggle("hidden");
      loginAdminFeedback.textContent = "";
      if (!loginAdminCodeSection.classList.contains("hidden")) {
        loginAdminCodeInput.focus();
      }
    });
  }
  if (loginAdminUnlockBtn) {
    loginAdminUnlockBtn.addEventListener("click", () => {
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();
      const adminCode = loginAdminCodeInput.value.trim();
      if (!username || !password) {
        loginAdminFeedback.textContent = "Enter username and password first.";
        return;
      }
      if (!adminCode) {
        loginAdminFeedback.textContent = "Enter the admin unlock code.";
        return;
      }
      loginUser(username, password, adminCode);
    });
  }
  document.getElementById("admin-reset-all").addEventListener("click", () => {
    state.users.forEach((user) => {
      user.progress = { learned: {}, questionStats: {} };
    });
    saveUsers();
    if (state.currentUser) {
      loadCurrentUserProgress();
      updateSummaryPanel();
      updateUserDashboard();
    }
    renderAdminUsersTable();
  });
  menuItems.forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page, button));
  });
  if (homeStartStudy) {
    homeStartStudy.addEventListener("click", () => showPage("subjects", document.querySelector('[data-page="subjects"]')));
  }
  if (homeViewProgress) {
    homeViewProgress.addEventListener("click", () => showPage("options", document.querySelector('[data-page="options"]')));
  }
  drawerOpenBtn.addEventListener("click", openDrawer);
  drawerCloseBtn.addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);
  document.getElementById("auto-advance").addEventListener("change", (event) => {
    state.revisionOptions.autoAdvance = event.target.checked;
  });
  document.getElementById("show-hints").addEventListener("change", (event) => {
    state.revisionOptions.showHints = event.target.checked;
    renderContent();
  });
  if (themeToggle) {
    themeToggle.addEventListener("change", (event) => {
      const theme = event.target.checked ? "dark" : "light";
      applyTheme(theme);
      saveTheme(theme);
    });
  }
  const startButton = document.getElementById("start-timer");
  const pauseButton = document.getElementById("pause-timer");
  const resetButton = document.getElementById("reset-timer");
  if (startButton) startButton.addEventListener("click", startTimer);
  if (pauseButton) pauseButton.addEventListener("click", pauseTimer);
  if (resetButton) resetButton.addEventListener("click", resetTimer);
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.searchTerm = event.target.value;
      state.currentIndex = 0;
      renderContent();
    });
  }
  document.getElementById("study-focus").addEventListener("change", (event) => {
    state.revisionOptions.focus = event.target.value;
    state.currentIndex = 0;
    renderContent();
  });
  document.getElementById("reset-progress").addEventListener("click", () => {
    if (!state.currentUser) return;
    state.currentUser.progress.learned = {};
    state.currentUser.progress.questionStats = {};
    saveUsers();
    loadCurrentUserProgress();
    renderContent();
  });
  document.getElementById("shuffle-global").addEventListener("click", () => {
    const key = state.currentMode === "flashcards" ? "flashOrder" : "questionOrder";
    state[key][state.currentSubject][state.currentLevel] = shuffleArray(state[key][state.currentSubject][state.currentLevel]);
    state.currentIndex = 0;
    renderContent();
  });
  subjectButtons.forEach((button) => {
    button.addEventListener("click", () => updateSubject(button.dataset.subject));
  });
  levelButtons.forEach((button) => {
    button.addEventListener("click", () => updateLevel(button.dataset.level));
  });
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => updateMode(button.dataset.mode));
  });
}

function loginUser(username, password, adminCode = "") {
  loginFeedback.textContent = "";
  if (loginAdminFeedback) loginAdminFeedback.textContent = "";
  const user = state.users.find((entry) => entry.username === username && entry.password === password);
  if (!user) {
    loginFeedback.textContent = "Invalid username or password.";
    return;
  }
  const adminUnlock = adminCode === ADMIN_CODE;
  if (user.isLocked && !adminUnlock) {
    loginFeedback.textContent = "This account is locked. Contact an admin to unlock it.";
    return;
  }
  state.currentUser = user;
  state.tempAdmin = false;
  state.isAdmin = Boolean(user.isAdmin) || adminUnlock;
  if (adminUnlock && !user.isAdmin) {
    state.tempAdmin = true;
  }
  if (adminCode) {
    if (adminUnlock) {
      if (state.tempAdmin) {
        loginAdminFeedback.textContent = user.isLocked
          ? "Locked account temporarily allowed by admin code."
          : "Admin access granted for this session.";
      } else if (loginAdminFeedback) {
        loginAdminFeedback.textContent = "Admin access granted.";
      }
    } else if (loginAdminFeedback) {
      loginAdminFeedback.textContent = "Admin code is incorrect.";
    }
  }
  loginFeedback.textContent = "";
  updateCurrentUserActivity();
  saveCurrentUserName();
  updateUserPanel();
  renderAdminPanel();
  loadCurrentUserProgress();
  updateUserDashboard();
  authScreen.classList.add("hidden");
  renderContent();
}

function signUpUser(username, password) {
  if (state.users.some((entry) => entry.username === username)) {
    signupFeedback.textContent = "Username already exists.";
    return;
  }
  const today = normalizeDay();
  const newUser = {
    username,
    password,
    isAdmin: false,
    isLocked: false,
    profile: {
      createdAt: today,
      lastLogin: today,
      lastActiveDay: today,
      streak: 1
    },
    progress: {
      learned: {},
      questionStats: {}
    }
  };
  state.users.push(newUser);
  saveUsers();
  state.currentUser = newUser;
  state.isAdmin = false;
  signupFeedback.textContent = "Account created. You are logged in.";
  saveCurrentUserName();
  updateUserPanel();
  renderAdminPanel();
  loadCurrentUserProgress();
  updateUserDashboard();
  authScreen.classList.add("hidden");
  renderContent();
}

function signOut() {
  if (state.currentUser) {
    if (!confirm("Are you sure you want to sign out?")) return;
  }
  logoutUser();
  closeDrawer();
}

function logoutUser() {
  state.currentUser = null;
  state.isAdmin = false;
  state.tempAdmin = false;
  clearCurrentUserName();
  updateUserPanel();
  renderAdminPanel();
  authScreen.classList.remove("hidden");
  if (loginAdminCodeSection) {
    loginAdminCodeSection.classList.add("hidden");
    loginAdminFeedback.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
