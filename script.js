const STORAGE_KEY = "michael-application-jobs";
const TABLE_NAME = "application_jobs";

const jobList = document.querySelector("#job-list");
const jobForm = document.querySelector("#job-form");
const config = window.SUPABASE_CONFIG || {};
const canUseSupabase = Boolean(
  config.url &&
  config.anonKey &&
  window.supabase &&
  window.supabase.createClient
);
const db = canUseSupabase
  ? window.supabase.createClient(config.url, config.anonKey)
  : null;

const defaultJobs = Array.from(document.querySelectorAll(".job-card")).map((card, index) => ({
  id: card.dataset.jobId,
  label: `Link ${index + 1}`,
  title: card.querySelector("h3").textContent.trim(),
  url: card.querySelector(".external-link").href,
  linkText: card.querySelector(".external-link").textContent.trim(),
  motivation: card.querySelector(".motivation-box p").textContent.trim(),
  applied: false,
  featured: card.classList.contains("featured"),
  sortOrder: index + 1
}));

let jobs = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toUiJob(row) {
  return {
    id: row.id,
    label: row.label,
    title: row.title,
    url: row.url,
    linkText: row.link_text || row.linkText || "Stelle öffnen",
    motivation: row.motivation,
    applied: Boolean(row.applied),
    featured: Boolean(row.featured),
    sortOrder: row.sort_order || row.sortOrder || 999
  };
}

function toDbJob(job) {
  return {
    label: job.label,
    title: job.title,
    url: job.url,
    link_text: job.linkText,
    motivation: job.motivation,
    applied: job.applied,
    featured: job.featured,
    sort_order: job.sortOrder
  };
}

function loadLocalJobs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultJobs;
  } catch {
    return defaultJobs;
  }
}

function saveLocalJobs(nextJobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextJobs));
}

async function loadJobs() {
  if (!db) {
    jobs = loadLocalJobs();
    renderJobs();
    return;
  }

  const { data, error } = await db
    .from(TABLE_NAME)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase konnte nicht geladen werden:", error);
    jobs = loadLocalJobs();
  } else {
    jobs = data.length ? data.map(toUiJob) : defaultJobs;
  }

  renderJobs();
}

function renderJobs() {
  jobList.innerHTML = "";

  jobs.forEach((job, index) => {
    const card = document.createElement("article");
    card.className = `job-card${job.featured ? " featured" : ""}${job.applied ? " is-applied" : ""}`;
    card.dataset.jobId = job.id;

    card.innerHTML = `
      ${job.applied ? '<div class="job-status">Beworben</div>' : ""}
      <div class="job-meta">
        <span>${escapeHtml(job.label || `Link ${index + 1}`)}</span>
        <a class="external-link" href="${escapeHtml(job.url)}" rel="noreferrer">${escapeHtml(job.linkText || "Stelle öffnen")}</a>
      </div>
      <h3>${escapeHtml(job.title)}</h3>
      <div class="motivation-box">
        <strong>Warum ich mich dort bewerben möchte</strong>
        <p>${escapeHtml(job.motivation)}</p>
      </div>
      <div class="status-actions" aria-label="Bewerbungsstatus">
        <button type="button" data-action="toggle-status">
          ${job.applied ? "Als offen markieren" : "Als beworben markieren"}
        </button>
        <button type="button" data-action="remove-job">Entfernen</button>
      </div>
    `;

    jobList.append(card);
  });
}

async function addJob(job) {
  if (!db) {
    jobs = [...jobs, job];
    saveLocalJobs(jobs);
    renderJobs();
    return;
  }

  const { data, error } = await db
    .from(TABLE_NAME)
    .insert(toDbJob(job))
    .select()
    .single();

  if (error) {
    console.error("Stelle konnte nicht gespeichert werden:", error);
    return;
  }

  jobs = [...jobs, toUiJob(data)];
  renderJobs();
}

async function updateJob(id, changes) {
  if (!db) {
    jobs = jobs.map((job) => (job.id === id ? { ...job, ...changes } : job));
    saveLocalJobs(jobs);
    renderJobs();
    return;
  }

  const dbChanges = {};
  if ("applied" in changes) {
    dbChanges.applied = changes.applied;
  }

  const { error } = await db.from(TABLE_NAME).update(dbChanges).eq("id", id);
  if (error) {
    console.error("Status konnte nicht gespeichert werden:", error);
    return;
  }

  jobs = jobs.map((job) => (job.id === id ? { ...job, ...changes } : job));
  renderJobs();
}

async function removeJob(id) {
  if (!db) {
    jobs = jobs.filter((job) => job.id !== id);
    saveLocalJobs(jobs);
    renderJobs();
    return;
  }

  const { error } = await db.from(TABLE_NAME).delete().eq("id", id);
  if (error) {
    console.error("Stelle konnte nicht entfernt werden:", error);
    return;
  }

  jobs = jobs.filter((job) => job.id !== id);
  renderJobs();
}

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(jobForm);
  const title = formData.get("company").trim();
  const url = formData.get("url").trim();
  const motivation = formData.get("motivation").trim();

  if (!title || !url || !motivation) {
    return;
  }

  await addJob({
    id: `job-${Date.now()}`,
    label: `Link ${jobs.length + 1}`,
    title,
    url,
    linkText: "Stelle öffnen",
    motivation,
    applied: false,
    featured: false,
    sortOrder: jobs.length + 1
  });

  jobForm.reset();
});

jobList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const card = button.closest(".job-card");
  const id = card.dataset.jobId;
  const action = button.dataset.action;
  const job = jobs.find((currentJob) => currentJob.id === id);

  if (!job) {
    return;
  }

  if (action === "toggle-status") {
    await updateJob(id, { applied: !job.applied });
  }

  if (action === "remove-job") {
    await removeJob(id);
  }
});

loadJobs();
