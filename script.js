const STORAGE_KEY = "michael-application-jobs";

const jobList = document.querySelector("#job-list");
const jobForm = document.querySelector("#job-form");

const defaultJobs = Array.from(document.querySelectorAll(".job-card")).map((card, index) => ({
  id: card.dataset.jobId,
  label: `Link ${index + 1}`,
  title: card.querySelector("h3").textContent.trim(),
  url: card.querySelector(".external-link").href,
  linkText: card.querySelector(".external-link").textContent.trim(),
  motivation: card.querySelector(".motivation-box p").textContent.trim(),
  applied: false,
  featured: card.classList.contains("featured")
}));

function loadJobs() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : defaultJobs;
  } catch {
    return defaultJobs;
  }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderJobs(jobs) {
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

let jobs = loadJobs();
renderJobs(jobs);

jobForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(jobForm);
  const title = formData.get("company").trim();
  const url = formData.get("url").trim();
  const motivation = formData.get("motivation").trim();

  if (!title || !url || !motivation) {
    return;
  }

  jobs = [
    ...jobs,
    {
      id: `job-${Date.now()}`,
      label: `Link ${jobs.length + 1}`,
      title,
      url,
      linkText: "Stelle öffnen",
      motivation,
      applied: false,
      featured: false
    }
  ];

  saveJobs(jobs);
  renderJobs(jobs);
  jobForm.reset();
});

jobList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const card = button.closest(".job-card");
  const id = card.dataset.jobId;
  const action = button.dataset.action;

  if (action === "toggle-status") {
    jobs = jobs.map((job) => (
      job.id === id ? { ...job, applied: !job.applied } : job
    ));
  }

  if (action === "remove-job") {
    jobs = jobs.filter((job) => job.id !== id);
  }

  saveJobs(jobs);
  renderJobs(jobs);
});
