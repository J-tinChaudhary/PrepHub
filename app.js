const STORAGE_KEY = "prephub-mvp-v1";

const initialState = {
  tasks: [
    {
      id: "task-arrays",
      title: "Review array & string patterns",
      time: "9:00 AM · 45 min",
      category: "Study",
      done: false,
    },
    {
      id: "task-story",
      title: "Practice your “tell me about yourself”",
      time: "10:00 AM · 20 min",
      category: "Interview",
      done: false,
    },
    {
      id: "task-system-design",
      title: "Read system design notes",
      time: "1:30 PM · 30 min",
      category: "Review",
      done: true,
    },
  ],
  resources: [
    {
      id: "resource-patterns",
      title: "Coding interview patterns",
      description: "A practical guide to the patterns behind common problems.",
      category: "Guide",
      source: "neetcode.io",
      url: "https://neetcode.io/",
      saved: true,
    },
    {
      id: "resource-behavioral",
      title: "Behavioral interview playbook",
      description: "Shape clear, memorable stories with the STAR framework.",
      category: "Interview",
      source: "hbr.org",
      url: "https://www.themuse.com/advice/star-interview-method",
      saved: true,
    },
    {
      id: "resource-system-design",
      title: "System design primer",
      description: "A friendly starting point for designing scalable systems.",
      category: "Guide",
      source: "github.com",
      url: "https://github.com/donnemartin/system-design-primer",
      saved: true,
    },
    {
      id: "resource-javascript",
      title: "JavaScript fundamentals",
      description: "Build a stronger foundation with a structured course.",
      category: "Course",
      source: "javascript.info",
      url: "https://javascript.info/",
      saved: false,
    },
    {
      id: "resource-resume",
      title: "Resume review checklist",
      description: "A quick pass for making every bullet count.",
      category: "Interview",
      source: "themuse.com",
      url: "https://www.themuse.com/advice/your-resume-needs-a-checklist",
      saved: true,
    },
    {
      id: "resource-focus",
      title: "Make time for deep work",
      description: "Simple techniques for more focused study sessions.",
      category: "Guide",
      source: "calnewport.com",
      url: "https://www.calnewport.com/blog/",
      saved: false,
    },
  ],
  weeklyStudyMinutes: [50, 75, 45, 90, 35, 60, 0],
  applications: [
    { id: "application-1", type: "Job", company: "Northstar Labs", role: "Frontend Engineer", status: "Interview", date: "2026-10-12" },
    { id: "application-2", type: "Job", company: "Fieldnote", role: "Product Engineer", status: "No response", date: "2026-10-16" },
    { id: "application-3", type: "Internship", company: "Brightside", role: "Software Engineering Intern", status: "Sent", date: "2026-10-14" },
    { id: "application-4", type: "Internship", company: "Orbit Works", role: "Product Design Intern", status: "Offer", date: "2026-10-17" },
    { id: "application-7", type: "Internship", company: "Pinecone Studio", role: "UX Engineering Intern", status: "Rejected", date: "2026-10-18" },
    { id: "application-5", type: "Cold email", company: "Maya Chen · Atlas", role: "Product team introduction", status: "Sent", date: "2026-10-15" },
    { id: "application-6", type: "Cold email", company: "Theo Park · Ledger", role: "Engineering team introduction", status: "No response", date: "2026-10-18" },
  ],
  answers: {},
};

const pageContent = document.querySelector("#page-content");
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
const globalSearch = document.querySelector("#global-search");
const toast = document.querySelector("#toast");
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector("#theme-color");
const navLinks = [...document.querySelectorAll(".nav-link")];
const views = {
  dashboard: "Overview",
  interviews: "Interview prep",
  questions: "Practice Questions",
  applications: "Applications & Outreach",
  opportunities: "Opportunities",
  resume: "Resume ↔ Job Description",
  adaptive: "Adaptive preparation plan",
  planner: "Study planner",
  resources: "My resources",
};

let state = loadState();
let currentView = getViewFromHash();
let resourceFilter = "All";
let applicationFilter = "All";
let activeQuestionIndex = 0;
let questionTypeFilter = "All";
let questionDifficultyFilter = "All";
let toastTimeout;
let analysisResult = null;

const interviewQuestions = [
  {
    type: "Behavioral",
    prompt: "Tell me about a time you had to work through a challenging problem.",
    tip: "Set the scene, explain your actions, and finish with a measurable result.",
  },
  {
    type: "Behavioral",
    prompt: "What is a project you’re proud of, and what was your role in it?",
    tip: "Show your specific contribution and what you learned along the way.",
  },
  {
    type: "Technical",
    prompt: "How would you explain the trade-offs between an array and a linked list?",
    tip: "Think about access, insertion, memory, and the use case you would choose.",
  },
];

const codingQuestions = [
  {
    type: "Coding",
    difficulty: "Easy",
    prompt: "Two Sum",
    tip: "Use a hash map to look for the complement as you scan the array.",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/two-sum/",
    videos: [
      { label: "NeetCode walkthrough", url: "https://www.youtube.com/watch?v=KLlXCPA6TnQ" },
      { label: "More video solutions", url: "https://www.youtube.com/results?search_query=Two+Sum+LeetCode+solution" },
    ],
  },
  {
    type: "Coding",
    difficulty: "Medium",
    prompt: "Longest Substring Without Repeating Characters",
    tip: "Try a sliding window and track the most recent index for each character.",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    videos: [
      { label: "NeetCode walkthrough", url: "https://www.youtube.com/watch?v=wiGpQwVHdE0" },
      { label: "More video solutions", url: "https://www.youtube.com/results?search_query=Longest+Substring+Without+Repeating+Characters+LeetCode+solution" },
    ],
  },
  {
    type: "Coding",
    difficulty: "Easy",
    prompt: "Valid Parentheses",
    tip: "Use a stack to match each closing bracket with the most recent opening bracket.",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/valid-parentheses/",
    videos: [
      { label: "NeetCode walkthrough", url: "https://www.youtube.com/watch?v=WTzjTskDFMg" },
      { label: "More video solutions", url: "https://www.youtube.com/results?search_query=Valid+Parentheses+LeetCode+solution" },
    ],
  },
  {
    type: "Coding",
    difficulty: "Hard",
    prompt: "Merge k Sorted Lists",
    tip: "Compare a min-heap approach with divide and conquer to merge the sorted lists efficiently.",
    platform: "LeetCode",
    platformUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    videos: [
      { label: "Heap solution videos", url: "https://www.youtube.com/results?search_query=Merge+k+Sorted+Lists+LeetCode+min+heap+solution" },
      { label: "Divide-and-conquer videos", url: "https://www.youtube.com/results?search_query=Merge+k+Sorted+Lists+LeetCode+divide+and+conquer+solution" },
    ],
  },
];

const practiceQuestions = [...interviewQuestions, ...codingQuestions];

const opportunities = [
  { id: "opportunity-frontend", type: "Job", company: "Juniper Labs", role: "Frontend Engineer", location: "Remote · North America", note: "Build thoughtful product experiences with a small, collaborative team." },
  { id: "opportunity-data", type: "Internship", company: "Common Ground", role: "Software Engineering Intern", location: "New York, NY · Hybrid", note: "A summer role focused on customer-facing tools and mentorship." },
  { id: "opportunity-platform", type: "Job", company: "Horizon Health", role: "Platform Engineer", location: "Boston, MA · Hybrid", note: "Help improve reliable systems for a growing digital health platform." },
];

function getFilteredPracticeQuestions() {
  return practiceQuestions.filter((item) =>
    (questionTypeFilter === "All" || item.type === questionTypeFilter) &&
    (questionDifficultyFilter === "All" || item.difficulty === questionDifficultyFilter),
  );
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialState);
    const parsed = JSON.parse(saved);
    if (
      !parsed ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.resources) ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    ) {
      throw new Error("Saved PrepHub data has an unexpected format.");
    }
    return {
      ...structuredClone(initialState),
      ...parsed,
      applications: Array.isArray(parsed.applications)
        ? parsed.applications.map((application) => ({
            ...application,
            status: application.status === "Responded" ? "Reply received" : application.status,
          }))
        : structuredClone(initialState.applications),
      weeklyStudyMinutes: Array.isArray(parsed.weeklyStudyMinutes) ? parsed.weeklyStudyMinutes : structuredClone(initialState.weeklyStudyMinutes),
    };
  } catch (error) {
    console.error("Could not load saved PrepHub data.", error);
    return structuredClone(initialState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Could not save PrepHub data.", error);
    showToast("Your change is visible, but couldn’t be saved in this browser.");
    return false;
  }
}

function getViewFromHash() {
  const view = window.location.hash.slice(1);
  return Object.hasOwn(views, view) ? view : "dashboard";
}

function formatToday() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function getNextWeekday(weekday) {
  const date = new Date();
  const daysUntil = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntil);
  return date;
}

function formatInterviewDay(weekday) {
  const date = getNextWeekday(weekday);
  return `${new Intl.DateTimeFormat("en", { weekday: "short" }).format(date).toUpperCase()}<br>${date.getDate()}`;
}

function renderWeekBars() {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;
  const minutes = state.weeklyStudyMinutes;
  const maxMinutes = Math.max(...minutes, 1);
  return minutes
    .map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - todayIndex + index);
      const day = new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)[0];
      const isToday = index === todayIndex;
      const height = Math.max(4, (minutes[index] / maxMinutes) * 100);
      return `<div class="week-column"><div class="week-bar-track"><div class="week-bar${isToday ? " is-today" : ""}" style="height:${height}%"></div></div><span class="week-day${isToday ? " is-today" : ""}">${day}</span></div>`;
    })
    .join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function safeExternalURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function setTheme(theme, persist = false) {
  if (theme !== "light" && theme !== "dark") {
    throw new Error(`Unsupported PrepHub theme: ${theme}`);
  }

  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeColor.setAttribute("content", theme === "dark" ? "#131a16" : "#f7f8fb");

  if (persist) {
    try {
      localStorage.setItem("prephub-theme", theme);
    } catch (error) {
      console.error("Could not save your theme preference.", error);
      showToast("Theme changed, but couldn’t be saved in this browser.");
    }
  }
}

function getTaskMarkup(task, includeDelete = false) {
  const categoryClass = `tag-${task.category.toLowerCase()}`;
  return `
    <div class="plan-item${task.done ? " is-done" : ""}">
      <button class="plan-check" type="button" data-action="toggle-task" data-id="${escapeHTML(task.id)}" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}: ${escapeHTML(task.title)}" aria-pressed="${task.done}">
        <svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2 6 2.5 2.5L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <div class="plan-copy">
        <strong>${escapeHTML(task.title)}</strong>
        <span>${escapeHTML(task.time)}</span>
      </div>
      <span class="task-tag ${categoryClass}">${escapeHTML(task.category)}</span>
      ${includeDelete ? `<button class="icon-action" type="button" data-action="delete-task" data-id="${escapeHTML(task.id)}" aria-label="Delete ${escapeHTML(task.title)}">×</button>` : ""}
    </div>`;
}

function getResourceMarkup(resource) {
  const safeURL = safeExternalURL(resource.url);
  return `
    <article class="resource-card" data-category="${escapeHTML(resource.category)}">
      <div class="resource-card-top">
        <span class="resource-type"><span class="resource-type-icon" aria-hidden="true">${resource.category === "Interview" ? "✳" : resource.category === "Course" ? "▷" : "▤"}</span>${escapeHTML(resource.category)}</span>
        <button class="icon-action" type="button" data-action="toggle-save" data-id="${escapeHTML(resource.id)}" aria-label="${resource.saved ? "Remove from saved resources" : "Save resource"}" aria-pressed="${resource.saved}">${resource.saved ? "♥" : "♡"}</button>
      </div>
      <h3>${escapeHTML(resource.title)}</h3>
      <p>${escapeHTML(resource.description)}</p>
      <div class="resource-card-footer">
        <span>${escapeHTML(resource.source)}</span>
        ${safeURL ? `<a href="${escapeHTML(safeURL)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>` : "<span>Link unavailable</span>"}
      </div>
    </article>`;
}

function getStudyHours() {
  return state.weeklyStudyMinutes.reduce((total, minutes) => total + minutes, 0) / 60;
}

function getApplicationMetrics(type) {
  const records = state.applications.filter((application) => application.type === type);
  const sent = records.filter((application) => ["Sent", "No response", "Reply received", "Interview", "Offer", "Rejected"].includes(application.status)).length;
  const responses = records.filter((application) => ["Reply received", "Interview", "Offer", "Rejected"].includes(application.status)).length;
  const positiveOutcomes = records.filter((application) => ["Interview", "Offer"].includes(application.status)).length;
  return { sent, responses, positiveOutcomes, rate: sent ? Math.round((responses / sent) * 100) : 0 };
}

function renderApplicationSummary() {
  return ["Job", "Internship", "Cold email"].map((type) => {
    const metrics = getApplicationMetrics(type);
    const label = type === "Cold email" ? "Cold emails" : `${type}s`;
    return `
      <button class="application-metric" type="button" data-action="filter-applications" data-filter="${escapeHTML(type)}">
        <span class="application-metric-heading">${label}<span aria-hidden="true">→</span></span>
        <span class="application-metric-values"><strong>${metrics.sent}</strong> sent <span>·</span> <strong>${metrics.responses}</strong> replies received</span>
        <span class="application-positive">${metrics.positiveOutcomes} positive outcome${metrics.positiveOutcomes === 1 ? "" : "s"} (interview / offer)</span>
        <span class="application-rate">${metrics.rate}% response rate</span>
      </button>`;
  }).join("");
}

function renderDashboard() {
  const completedCount = state.tasks.filter((task) => task.done).length;
  const totalCount = state.tasks.length;
  const answeredCount = practiceQuestions.filter((question) => String(state.answers[question.prompt] ?? "").trim()).length;
  const readiness = Math.round(((totalCount ? completedCount / totalCount : 0) + answeredCount / practiceQuestions.length) * 50);
  const studyHours = getStudyHours();
  return `
    <section class="page-heading">
      <div>
        <p class="eyebrow">${formatToday()} · Demo workspace</p>
        <h1>Your next move, all in one place.</h1>
        <p>Study, practice, track applications, and find opportunities from one workspace.</p>
      </div>
      <button class="primary-button" type="button" data-action="navigate" data-view="planner"><span class="button-plus" aria-hidden="true">+</span> Add a study session</button>
    </section>
    <section class="stats-grid" aria-label="Your progress">
      <article class="stat-card">
        <div class="stat-top"><span class="stat-label">Study hours</span><span class="stat-icon green" aria-hidden="true">◷</span></div>
        <div class="stat-value-row"><strong class="stat-value">${studyHours.toFixed(1)}</strong><span class="stat-change">hours</span></div>
        <p class="stat-caption">Demo sample · this week</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span class="stat-label">Sessions done</span><span class="stat-icon violet" aria-hidden="true">✓</span></div>
        <div class="stat-value-row"><strong class="stat-value">${completedCount}<span class="stat-caption"> / ${totalCount}</span></strong><span class="stat-change">today</span></div>
        <p class="stat-caption">Demo plan sessions</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span class="stat-label">Interview readiness estimate</span><span class="stat-icon peach" aria-hidden="true">✳</span></div>
        <div class="stat-value-row"><strong class="stat-value">${readiness}%</strong><span class="stat-change">estimate</span></div>
        <p class="stat-caption">Average of plan completion and answered prompts</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span class="stat-label">Practice questions</span><span class="stat-icon blue" aria-hidden="true">?</span></div>
        <div class="stat-value-row"><strong class="stat-value">${answeredCount}</strong><span class="stat-change">answered</span></div>
        <p class="stat-caption">Of ${practiceQuestions.length} demo prompts</p>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel">
        <header class="panel-header">
          <div><h2>Today’s plan</h2><p class="panel-subtitle">${completedCount} of ${totalCount} sessions completed</p></div>
          <button class="text-button" type="button" data-action="navigate" data-view="planner">View planner <span aria-hidden="true">→</span></button>
        </header>
        <div class="plan-list">${state.tasks.length ? state.tasks.slice(0, 4).map((task) => getTaskMarkup(task)).join("") : '<p class="empty-state">Your day is clear. Add a session to get started.</p>'}</div>
        <footer class="panel-footer"><button class="text-button" type="button" data-action="navigate" data-view="planner"><span aria-hidden="true">＋</span> Add to today</button></footer>
      </article>

      <article class="panel week-panel">
        <header class="panel-header"><div><h2>Your study rhythm</h2><p class="panel-subtitle">Sample weekly activity · demo data</p></div><span class="task-tag tag-study">This week</span></header>
        <div class="week-total"><strong>${studyHours.toFixed(1)}</strong><span>hours this week</span></div>
        <div class="week-bars" aria-label="Study hours each day this week">${renderWeekBars()}</div>
      </article>
    </section>

    <section class="panel applications-dashboard">
      <header class="panel-header"><div><h2>Applications &amp; outreach</h2><p class="panel-subtitle">Sample tracking data · select a metric to view its records</p></div><button class="text-button" type="button" data-action="navigate" data-view="applications">Open tracker <span aria-hidden="true">→</span></button></header>
      <div class="application-metrics">${renderApplicationSummary()}</div>
    </section>

    <section class="focus-banner section-spacer">
      <div class="focus-copy"><p class="eyebrow">Make your next move</p><h2>Prep with the role in mind.</h2><p>Compare a resume with a job description, then get a focused preparation plan based on your progress.</p></div>
      <div class="banner-actions">
        <button class="primary-button" type="button" data-action="navigate" data-view="resume">Analyze resume <span aria-hidden="true">→</span></button>
        <button class="secondary-button" type="button" data-action="navigate" data-view="adaptive">Adaptive plan</button>
      </div>
    </section>

    <section class="dashboard-grid section-spacer">
      <article class="panel content-panel">
        <header class="panel-header" style="padding:0 0 14px"><div><h2>Pick up where you left off</h2><p class="panel-subtitle">A few good resources, ready when you are</p></div><button class="text-button" type="button" data-action="navigate" data-view="resources">All resources <span aria-hidden="true">→</span></button></header>
        <div class="resource-grid">${state.resources.filter((resource) => resource.saved).slice(0, 2).map(getResourceMarkup).join("")}</div>
      </article>
      <article class="panel content-panel">
        <header class="panel-header" style="padding:0 0 12px"><div><h2>Explore your workspace</h2><p class="panel-subtitle">Quick access to the rest of your prep</p></div></header>
        <div class="workspace-shortcuts">
          <button type="button" data-action="navigate" data-view="questions">Practice interview questions <span aria-hidden="true">→</span></button>
          <button type="button" data-action="navigate" data-view="opportunities">Browse opportunities <span aria-hidden="true">→</span></button>
          <button type="button" data-action="navigate" data-view="adaptive">Build an adaptive plan <span aria-hidden="true">→</span></button>
        </div>
      </article>
    </section>`;
}

function renderInterviews() {
  return `
    <section class="page-heading">
      <div><p class="eyebrow">A practical space for your next conversation</p><h1>Interview prep</h1><p>Practice, plan, and keep your preparation connected to the roles you want.</p></div>
      <button class="primary-button" type="button" data-action="navigate" data-view="questions">Practice questions <span aria-hidden="true">→</span></button>
    </section>
    <section class="feature-grid">
      <article class="panel feature-card"><span class="feature-icon">?</span><p class="eyebrow">Practice</p><h2>Build confident answers</h2><p>Work through behavioral and technical prompts. Your notes save in this browser.</p><button class="text-button" type="button" data-action="navigate" data-view="questions">Open Practice Questions →</button></article>
      <article class="panel feature-card"><span class="feature-icon">↗</span><p class="eyebrow">Tailor</p><h2>Prepare for a specific role</h2><p>Compare your resume with a job description and identify relevant skill keywords.</p><button class="text-button" type="button" data-action="navigate" data-view="resume">Analyze resume ↔ job description →</button></article>
      <article class="panel feature-card"><span class="feature-icon">▦</span><p class="eyebrow">Adapt</p><h2>Know what to do next</h2><p>Use your unfinished study sessions and unanswered prompts to focus your next steps.</p><button class="text-button" type="button" data-action="navigate" data-view="adaptive">Open adaptive plan →</button></article>
    </section>`;
}

function renderQuestions() {
  const questions = getFilteredPracticeQuestions();
  const question = questions[activeQuestionIndex % questions.length] ?? questions[0];
  const answer = question ? state.answers[question.prompt] ?? "" : "";
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Demo question library</p><h1>Practice Questions</h1><p>Explore behavioral prompts and coding problems. Notes are saved in this browser.</p></div>
      <button class="primary-button" type="button" data-action="next-question"><span class="button-plus" aria-hidden="true">↻</span> New question</button>
    </section>
    <section class="panel content-panel question-filters">
      <label class="field-label" for="question-type-filter">Question type
        <select class="field-select" id="question-type-filter" data-action="filter-questions">
          ${["All", "Behavioral", "Technical", "Coding"].map((type) => `<option${questionTypeFilter === type ? " selected" : ""}>${type}</option>`).join("")}
        </select>
      </label>
      <label class="field-label" for="question-difficulty-filter">Difficulty
        <select class="field-select" id="question-difficulty-filter" data-action="filter-difficulty">
          ${["All", "Easy", "Medium", "Hard"].map((difficulty) => `<option${questionDifficultyFilter === difficulty ? " selected" : ""}>${difficulty}</option>`).join("")}
        </select>
      </label>
      <span class="question-count">${questions.length} demo ${questions.length === 1 ? "question" : "questions"}</span>
    </section>
    ${question ? `<section class="content-panel panel">
      <div class="question-meta"><span class="question-label">${escapeHTML(question.type)} question</span>${question.difficulty ? `<span class="difficulty-label difficulty-${question.difficulty.toLowerCase()}">${escapeHTML(question.difficulty)}</span>` : ""}</div>
      <h3>${escapeHTML(question.prompt)}</h3>
      <p>${escapeHTML(question.tip)}</p>
      ${question.platformUrl ? `<div class="coding-resources"><a class="secondary-button" href="${escapeHTML(question.platformUrl)}" target="_blank" rel="noopener noreferrer">Open on ${escapeHTML(question.platform)} ↗</a><div class="video-solutions"><strong>Video solutions</strong>${question.videos.map((video) => `<a href="${escapeHTML(video.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(video.label)} ↗</a>`).join("")}</div></div>` : ""}
      <label class="field-label" for="answer-notes">Your answer notes</label>
      <textarea class="question-textarea" id="answer-notes" placeholder="Jot down your answer or use this as a starting point...">${escapeHTML(answer)}</textarea>
      <div class="practice-footer"><span>Your notes save automatically as you type.</span><button class="secondary-button" type="button" data-action="next-question">Next question <span aria-hidden="true">→</span></button></div>
    </section>` : '<section class="panel content-panel empty-state">No demo questions match these filters. Try another difficulty or type.</section>'}`;
}

function renderApplications() {
  const types = ["All", "Job", "Internship", "Cold email"];
  const records = state.applications.filter((application) => applicationFilter === "All" || application.type === applicationFilter);
  const metrics = ["Job", "Internship", "Cold email"].map((type) => {
    const result = getApplicationMetrics(type);
    return `<article class="stat-card"><div class="stat-top"><span class="stat-label">${type === "Cold email" ? "Cold emails" : `${type}s`} sent</span><span class="stat-icon violet" aria-hidden="true">↗</span></div><div class="stat-value-row"><strong class="stat-value">${result.sent}</strong></div><p class="stat-caption">${result.responses} replies · ${result.positiveOutcomes} positive outcomes</p><p class="stat-caption">${result.rate}% response rate</p></article>`;
  }).join("");
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Sample records · demo workspace</p><h1>Applications &amp; Outreach</h1><p>Track applications, cold outreach, and responses in one place. Select a status to update a record.</p></div>
      <button class="primary-button" type="button" data-action="navigate" data-view="opportunities"><span class="button-plus" aria-hidden="true">+</span> Find opportunities</button>
    </section>
    <section class="stats-grid applications-stats">${metrics}</section>
    <section class="panel content-panel">
      <div class="resource-toolbar">
        <div class="filter-tabs" role="group" aria-label="Filter application records">
          ${types.map((type) => `<button class="filter-tab${applicationFilter === type ? " is-selected" : ""}" type="button" data-action="filter-applications" data-filter="${type}" aria-pressed="${applicationFilter === type}">${type === "All" ? "All records" : type === "Cold email" ? "Cold emails" : `${type}s`}</button>`).join("")}
        </div>
        <span class="record-count">${records.length} demo ${records.length === 1 ? "record" : "records"}</span>
      </div>
      <div class="application-table-wrap">
        <table class="application-table">
          <thead><tr><th scope="col">Company / contact</th><th scope="col">Role / outreach</th><th scope="col">Type</th><th scope="col">Date</th><th scope="col">Status</th></tr></thead>
          <tbody>${records.length ? records.map((application) => `
            <tr>
              <td><strong>${escapeHTML(application.company)}</strong></td>
              <td>${escapeHTML(application.role)}</td>
              <td><span class="task-tag ${application.type === "Cold email" ? "tag-interview" : "tag-study"}">${escapeHTML(application.type)}</span></td>
              <td>${escapeHTML(application.date)}</td>
              <td><label class="visually-hidden" for="status-${escapeHTML(application.id)}">Status for ${escapeHTML(application.company)}</label><select class="status-select" id="status-${escapeHTML(application.id)}" data-action="update-application" data-id="${escapeHTML(application.id)}">${["Saved", "Sent", "No response", "Reply received", "Interview", "Offer", "Rejected"].map((status) => `<option${application.status === status ? " selected" : ""}>${status}</option>`).join("")}</select></td>
            </tr>`).join("") : '<tr><td colspan="5" class="empty-state">No records in this category yet. Browse opportunities to add one.</td></tr>'}</tbody>
        </table>
      </div>
      <p class="form-hint">A reply includes “Reply received”, “Interview”, “Offer”, or “Rejected”. Positive outcomes count interviews and offers only. Response rate = replies ÷ records sent (including “No response”). Demo data is saved locally in this browser.</p>
    </section>`;
}

function renderOpportunities() {
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Example listings · demo workspace</p><h1>Opportunities</h1><p>Explore sample roles and add interesting ones to your application tracker.</p></div>
      <button class="secondary-button" type="button" data-action="navigate" data-view="applications">View tracked records <span aria-hidden="true">→</span></button>
    </section>
    <section class="opportunity-grid">
      ${opportunities.map((opportunity) => {
        const tracked = state.applications.some((application) => application.opportunityId === opportunity.id);
        return `<article class="panel opportunity-card"><div class="opportunity-top"><span class="task-tag ${opportunity.type === "Job" ? "tag-study" : "tag-interview"}">${escapeHTML(opportunity.type)}</span><span>${escapeHTML(opportunity.location)}</span></div><p class="eyebrow">${escapeHTML(opportunity.company)}</p><h2>${escapeHTML(opportunity.role)}</h2><p>${escapeHTML(opportunity.note)}</p><button class="${tracked ? "secondary-button" : "primary-button"}" type="button" data-action="track-opportunity" data-id="${escapeHTML(opportunity.id)}" ${tracked ? "disabled" : ""}>${tracked ? "Added to tracker" : "Track opportunity"}</button></article>`;
      }).join("")}
    </section>
    <p class="form-hint">These are example listings, not live job postings.</p>`;
}

function renderResumeAnalysis() {
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Tailor your preparation</p><h1>Resume ↔ Job Description</h1><p>Compare text locally to spot keywords you may want to address. This quick demo is not an ATS score or hiring prediction.</p></div>
    </section>
    <section class="panel content-panel">
      <form id="resume-analysis-form">
        <div class="form-grid analysis-form">
          <label class="field-label" for="resume-text">Resume text
            <textarea class="question-textarea" id="resume-text" name="resume" placeholder="Paste resume text here..." required></textarea>
          </label>
          <label class="field-label" for="job-description-text">Job description
            <textarea class="question-textarea" id="job-description-text" name="description" placeholder="Paste the job description here..." required></textarea>
          </label>
        </div>
        <p class="form-hint">Text is analyzed in this browser and is not saved to your PrepHub profile.</p>
        <div class="form-actions"><button class="primary-button" type="submit">Compare keywords <span aria-hidden="true">→</span></button></div>
      </form>
    </section>
    ${analysisResult ? `<section class="panel content-panel section-spacer analysis-result" aria-live="polite"><p class="eyebrow">Quick keyword overlap · demo analysis</p><h2>${analysisResult.matchCount} of ${analysisResult.totalCount} job-description keywords found</h2><div class="keyword-list">${analysisResult.matches.map((term) => `<span class="keyword-chip">${escapeHTML(term)}</span>`).join("") || "<span>No matching terms found.</span>"}</div><p class="form-hint">This simple text comparison can miss context, synonyms, and qualifications. Review the role and resume yourself before making changes.</p></section>` : ""}`;
}

function renderAdaptivePlan() {
  const openTasks = state.tasks.filter((task) => !task.done);
  const unanswered = practiceQuestions.filter((question) => !String(state.answers[question.prompt] ?? "").trim());
  const nextTask = openTasks[0];
  const nextQuestion = unanswered[0];
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Based on your current demo workspace</p><h1>Adaptive preparation plan</h1><p>Focus suggestions update as you complete sessions and save practice answers.</p></div>
      <button class="primary-button" type="button" data-action="navigate" data-view="planner">Open study planner <span aria-hidden="true">→</span></button>
    </section>
    <section class="panel content-panel adaptive-overview">
      <p class="eyebrow">Your next focus</p>
      <h2>${nextTask ? escapeHTML(nextTask.title) : nextQuestion ? "Practice one interview question" : "Your demo plan is up to date"}</h2>
      <p>${nextTask ? `${escapeHTML(nextTask.category)} · ${escapeHTML(nextTask.time)}. Finish a planned session to keep your preparation moving.` : nextQuestion ? "Your planned sessions are complete. Draft an answer to an unanswered question next." : "You have no unfinished demo sessions or unanswered questions."}</p>
      <button class="secondary-button" type="button" data-action="navigate" data-view="${nextTask ? "planner" : "questions"}">${nextTask ? "Go to study planner" : "Practice a question"} <span aria-hidden="true">→</span></button>
    </section>
    <section class="adaptive-columns section-spacer">
      <article class="panel content-panel"><p class="eyebrow">Study sessions · ${openTasks.length} remaining</p><h2>Work through your plan</h2>${openTasks.length ? `<ul class="suggestion-list">${openTasks.map((task) => `<li><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.category)} · ${escapeHTML(task.time)}</span></li>`).join("")}</ul>` : '<p class="panel-subtitle">All planned demo sessions are complete.</p>'}</article>
      <article class="panel content-panel"><p class="eyebrow">Practice questions · ${unanswered.length} to try</p><h2>Build your answer bank</h2>${unanswered.length ? `<ul class="suggestion-list">${unanswered.map((question) => `<li><strong>${escapeHTML(question.prompt)}</strong><span>${escapeHTML(question.type)}</span></li>`).join("")}</ul>` : '<p class="panel-subtitle">You have notes for every demo prompt.</p>'}</article>
    </section>
    <p class="form-hint">This is a transparent demo rule: prioritize the first unfinished session, then unanswered prompts. It is not a personalized AI assessment.</p>`;
}

function renderPlanner() {
  return `
    <section class="page-heading">
      <div><p class="eyebrow">Make a little room for what matters</p><h1>Study planner</h1><p>Keep your next steps clear, manageable, and yours.</p></div>
    </section>
    <div class="planner-layout">
      <section class="panel">
        <header class="panel-header"><div><h2>Your sessions</h2><p class="panel-subtitle">Check off each step as you go</p></div><span class="task-tag tag-study">${state.tasks.filter((task) => task.done).length} done</span></header>
        <div class="planner-tasks">${state.tasks.length ? state.tasks.map((task) => getTaskMarkup(task, true)).join("") : '<p class="empty-state">No sessions yet. Add one to start your plan.</p>'}</div>
      </section>
      <section class="panel content-panel">
        <header class="panel-header" style="padding:0 0 15px"><div><h2>Add a session</h2><p class="panel-subtitle">Small, focused sessions work best.</p></div></header>
        <form id="task-form">
          <div class="form-grid">
            <label class="field-label full-width" for="task-title">What would you like to work on?
              <input class="field-input" id="task-title" name="title" maxlength="80" placeholder="e.g. Review recursion patterns" required />
            </label>
            <label class="field-label" for="task-time">Time
              <input class="field-input" id="task-time" name="time" maxlength="40" placeholder="e.g. 10:00 AM · 30 min" required />
            </label>
            <label class="field-label" for="task-category">Type
              <select class="field-select" id="task-category" name="category"><option>Study</option><option>Interview</option><option>Review</option></select>
            </label>
          </div>
          <div class="form-actions"><button class="primary-button" type="submit"><span class="button-plus" aria-hidden="true">+</span> Add session</button></div>
        </form>
      </section>
    </div>
    <section class="panel content-panel section-spacer">
      <header class="panel-header" style="padding:0 0 13px"><div><h2>This week</h2><p class="panel-subtitle">Your consistency is the real win.</p></div></header>
      <div class="week-bars" aria-label="Study hours each day this week">${renderWeekBars()}</div>
    </section>`;
}

function renderResources() {
  const query = globalSearch.value.trim().toLowerCase();
  const filteredResources = state.resources.filter((resource) => {
    const matchesFilter = resourceFilter === "All" || (resourceFilter === "Saved" ? resource.saved : resource.category === resourceFilter);
    const matchesSearch = !query || `${resource.title} ${resource.description} ${resource.category} ${resource.source}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const filters = ["All", "Saved", "Guide", "Interview", "Course"];
  return `
    <section class="page-heading">
      <div><p class="eyebrow">The good stuff, all in one place</p><h1>My resources</h1><p>Keep your go-to guides and learning links close at hand.</p></div>
    </section>
    <div class="resource-toolbar">
      <div class="filter-tabs" role="group" aria-label="Filter resources">
        ${filters.map((filter) => `<button class="filter-tab${resourceFilter === filter ? " is-selected" : ""}" type="button" data-action="filter-resources" data-filter="${filter}" aria-pressed="${resourceFilter === filter}">${filter}</button>`).join("")}
      </div>
      <button class="primary-button" type="button" data-action="show-resource-form"><span class="button-plus" aria-hidden="true">+</span> Add a resource</button>
    </div>
    <section class="panel content-panel" id="resource-form-panel" hidden>
      <header class="panel-header" style="padding:0 0 15px"><div><h2>Add a resource</h2><p class="panel-subtitle">Save a useful link for later.</p></div><button class="icon-action" type="button" data-action="hide-resource-form" aria-label="Close form">×</button></header>
      <form id="resource-form">
        <div class="form-grid">
          <label class="field-label" for="resource-title">Title
            <input class="field-input" id="resource-title" name="title" maxlength="80" placeholder="e.g. Frontend interview guide" required />
          </label>
          <label class="field-label" for="resource-category">Type
            <select class="field-select" id="resource-category" name="category"><option>Guide</option><option>Interview</option><option>Course</option></select>
          </label>
          <label class="field-label full-width" for="resource-url">Link (http or https)
            <input class="field-input" id="resource-url" name="url" type="url" maxlength="500" placeholder="https://example.com/guide" required />
          </label>
          <label class="field-label full-width" for="resource-description">Short description
            <input class="field-input" id="resource-description" name="description" maxlength="160" placeholder="What makes this resource useful?" />
          </label>
        </div>
        <div class="form-actions"><button class="primary-button" type="submit"><span class="button-plus" aria-hidden="true">+</span> Save resource</button></div>
        <p class="form-hint">Only http and https links can be saved. Links open in a new tab.</p>
      </form>
    </section>
    <section class="resource-grid section-spacer" id="resource-grid">
      ${filteredResources.length ? filteredResources.map(getResourceMarkup).join("") : '<div class="panel empty-state" style="grid-column:1/-1">No resources match. Try another filter or add a link to your library.</div>'}
    </section>`;
}

function render() {
  currentView = Object.hasOwn(views, currentView) ? currentView : "dashboard";
  breadcrumbCurrent.textContent = views[currentView];
  navLinks.forEach((link) => {
    const active = link.dataset.view === currentView;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  globalSearch.closest(".search-box").hidden = currentView !== "resources";
  pageContent.innerHTML = {
    dashboard: renderDashboard,
    interviews: renderInterviews,
    questions: renderQuestions,
    applications: renderApplications,
    opportunities: renderOpportunities,
    resume: renderResumeAnalysis,
    adaptive: renderAdaptivePlan,
    planner: renderPlanner,
    resources: renderResources,
  }[currentView]();
}

function navigate(view) {
  if (!Object.hasOwn(views, view)) return;
  if (window.location.hash === `#${view}`) {
    currentView = view;
    render();
  } else {
    window.location.hash = view;
  }
}

function handleTaskForm(form) {
  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const category = String(formData.get("category") ?? "Study");
  if (!title || !time || !["Study", "Interview", "Review"].includes(category)) return;
  state.tasks.push({
    id: `task-${crypto.randomUUID()}`,
    title,
    time,
    category,
    done: false,
  });
  const saved = saveState();
  render();
  if (saved) showToast("Study session added to your plan.");
}

function handleResourceForm(form) {
  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "Guide");
  const rawURL = String(formData.get("url") ?? "").trim();
  const url = safeExternalURL(rawURL);
  if (!title || !url || !["Guide", "Interview", "Course"].includes(category)) {
    showToast("Enter a title and a valid http or https link.");
    return;
  }
  const parsedURL = new URL(url);
  state.resources.unshift({
    id: `resource-${crypto.randomUUID()}`,
    title,
    description: description || "A resource you saved for your prep.",
    category,
    source: parsedURL.hostname.replace(/^www\./, ""),
    url,
    saved: true,
  });
  const saved = saveState();
  resourceFilter = "All";
  globalSearch.value = "";
  render();
  if (saved) showToast("Resource saved to your library.");
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
  if (!target) return;
  const { action, id, view, filter } = target.dataset;

  if (action === "navigate") navigate(view);
  if (action === "notifications") showToast("You’re all caught up.");
  if (action === "toggle-theme") {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  }
  if (action === "toggle-task") {
    const task = state.tasks.find((item) => item.id === id);
    if (task) {
      task.done = !task.done;
      saveState();
      setTheme(document.documentElement.dataset.theme);
      render();
    }
  }
  if (action === "delete-task") {
    state.tasks = state.tasks.filter((item) => item.id !== id);
    saveState();
    render();
    showToast("Session removed from your plan.");
  }
  if (action === "toggle-save") {
    const resource = state.resources.find((item) => item.id === id);
    if (resource) {
      resource.saved = !resource.saved;
      saveState();
      render();
      showToast(resource.saved ? "Resource added to your saved list." : "Resource removed from your saved list.");
    }
  }
  if (action === "filter-resources") {
    resourceFilter = filter;
    render();
  }
  if (action === "filter-applications") {
    applicationFilter = filter;
    navigate("applications");
  }
  if (action === "next-question") {
    const questions = getFilteredPracticeQuestions();
    activeQuestionIndex = questions.length ? (activeQuestionIndex + 1) % questions.length : 0;
    render();
    document.querySelector("#answer-notes")?.focus();
  }
  if (action === "track-opportunity") {
    const opportunity = opportunities.find((item) => item.id === id);
    if (opportunity && !state.applications.some((application) => application.opportunityId === id)) {
      state.applications.unshift({
        id: `application-${crypto.randomUUID()}`,
        opportunityId: opportunity.id,
        type: opportunity.type,
        company: opportunity.company,
        role: opportunity.role,
        status: "Saved",
        date: new Date().toISOString().slice(0, 10),
      });
      const saved = saveState();
      render();
      if (saved) showToast("Opportunity added to your tracker.");
    }
  }
  if (action === "show-resource-form") {
    const panel = document.querySelector("#resource-form-panel");
    panel.hidden = false;
    panel.classList.add("section-spacer");
    document.querySelector("#resource-title").focus();
  }
  if (action === "hide-resource-form") {
    const panel = document.querySelector("#resource-form-panel");
    panel.hidden = true;
    panel.classList.remove("section-spacer");
  }
});

document.addEventListener("submit", (event) => {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (event.target.id === "task-form") handleTaskForm(event.target);
  if (event.target.id === "resource-form") handleResourceForm(event.target);
  if (event.target.id === "resume-analysis-form") handleResumeAnalysis(event.target);
});

function handleResumeAnalysis(form) {
  const formData = new FormData(form);
  const resume = String(formData.get("resume") ?? "");
  const description = String(formData.get("description") ?? "");
  const ignoredTerms = new Set(["about", "after", "also", "been", "being", "build", "built", "from", "have", "into", "more", "over", "that", "their", "there", "this", "with", "your", "will", "work", "years"]);
  const extractTerms = (text) => new Set(
    text.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g)?.filter((term) => !ignoredTerms.has(term)) ?? [],
  );
  const resumeTerms = extractTerms(resume);
  const descriptionTerms = [...extractTerms(description)];
  const matches = descriptionTerms.filter((term) => resumeTerms.has(term)).slice(0, 30);
  analysisResult = {
    matches,
    matchCount: matches.length,
    totalCount: Math.min(descriptionTerms.length, 30),
  };
  render();
  document.querySelector(".analysis-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.dataset.action === "filter-questions") {
    questionTypeFilter = target.value;
    activeQuestionIndex = 0;
    render();
    return;
  }
  if (target.dataset.action === "filter-difficulty") {
    questionDifficultyFilter = target.value;
    activeQuestionIndex = 0;
    render();
    return;
  }
  if (target.dataset.action !== "update-application") return;
  const application = state.applications.find((item) => item.id === target.dataset.id);
  if (!application || !["Saved", "Sent", "No response", "Reply received", "Interview", "Offer", "Rejected"].includes(target.value)) return;
  application.status = target.value;
  const saved = saveState();
  render();
  if (saved) showToast("Application status updated.");
});

document.addEventListener("input", (event) => {
  if (event.target instanceof HTMLTextAreaElement && event.target.id === "answer-notes") {
    const questions = getFilteredPracticeQuestions();
    const question = questions[activeQuestionIndex % questions.length];
    if (!question) return;
    state.answers[question.prompt] = event.target.value;
    saveState();
  }
});

globalSearch.addEventListener("input", () => {
  if (currentView === "resources") render();
});

window.addEventListener("hashchange", () => {
  currentView = getViewFromHash();
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
    if (currentView !== "resources") navigate("resources");
    globalSearch.focus();
    event.preventDefault();
  }
});

render();
