// CAMPUSFLOW - MAIN JAVASCRIPT

// Save and load information from browser storage

function loadData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

let tasks = loadData("campusTasks");
let classes = loadData("campusClasses");
let sessions = loadData("campusSessions");
let notes = loadData("campusNotes");

// DATE

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// NAVIGATION

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");

function showPage(pageName) {
    pages.forEach(page => {
        page.classList.toggle("active", page.id === pageName);
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    const selectedLink = [...navLinks].find(
        link => link.dataset.page === pageName
    );

    pageTitle.textContent = selectedLink
        ? selectedLink.textContent.replace(/^[^\w]+/, "").trim()
        : "Dashboard";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        showPage(link.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.go);
    });
});

// DASHBOARD

function updateDashboard() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;

    const percentage = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage + "%";

    const recent = document.getElementById("recentTasks");

    if (tasks.length === 0) {
        recent.textContent = "No tasks yet. Add your first task!";
    } else {
        recent.innerHTML = tasks.slice(-3).reverse().map(task => `
            <div class="task-item ${task.completed ? "completed" : ""}">
                <div class="task-info">
                    <span>${task.completed ? "✓" : "○"}</span>
                    <div>
                        <h4>${escapeHTML(task.name)}</h4>
                        <p>${escapeHTML(task.category)}</p>
                    </div>
                </div>
            </div>
        `).join("");
    }
}

// Prevent user-entered text from being treated as HTML

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// TASK MANAGER

const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("taskName").value.trim();
    const date = document.getElementById("taskDate").value;
    const category = document.getElementById("taskCategory").value;

    if (!name) return;

    tasks.push({
        id: Date.now(),
        name,
        date,
        category,
        completed: false
    });

    saveData("campusTasks", tasks);

    taskForm.reset();
    renderTasks();
});

function renderTasks() {
    const list = document.getElementById("taskList");

    if (tasks.length === 0) {
        list.innerHTML = '<div class="empty-state">Your task list is empty.</div>';
    } else {
        list.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? "completed" : ""}">
                <div class="task-info">
                    <input class="task-check" type="checkbox"
                        data-id="${task.id}"
                        ${task.completed ? "checked" : ""}>

                    <div>
                        <h4>${escapeHTML(task.name)}</h4>
                        <p>
                            ${escapeHTML(task.category)}
                            ${task.date ? " • Due: " + escapeHTML(task.date) : ""}
                        </p>
                    </div>
                </div>

                <button class="delete-button"
                    data-delete-task="${task.id}">
                    Delete
                </button>
            </div>
        `).join("");
    }

    updateDashboard();
}

document.getElementById("taskList").addEventListener("change", function(event) {
    if (event.target.classList.contains("task-check")) {
        const id = Number(event.target.dataset.id);

        tasks = tasks.map(task =>
            task.id === id
                ? { ...task, completed: event.target.checked }
                : task
        );

        saveData("campusTasks", tasks);
        renderTasks();
    }
});

document.getElementById("taskList").addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-task]");

    if (button) {
        const id = Number(button.dataset.deleteTask);

        tasks = tasks.filter(task => task.id !== id);

        saveData("campusTasks", tasks);
        renderTasks();
    }
});

// TIMETABLE

document.getElementById("classForm").addEventListener("submit", function(event) {
    event.preventDefault();

    classes.push({
        id: Date.now(),
        name: document.getElementById("className").value.trim(),
        day: document.getElementById("classDay").value,
        time: document.getElementById("classTime").value
    });

    saveData("campusClasses", classes);

    this.reset();
    renderClasses();
});

function renderClasses() {
    const list = document.getElementById("classList");

    if (classes.length === 0) {
        list.innerHTML = '<div class="empty-state">No classes added yet.</div>';
        return;
    }

    const dayOrder = [
        "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday", "Sunday"
    ];

    const sorted = [...classes].sort((a, b) =>
        dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        || a.time.localeCompare(b.time)
    );

    list.innerHTML = sorted.map(item => `
        <div class="task-item">
            <div class="task-info">
                <div>
                    <h4>${escapeHTML(item.name)}</h4>
                    <p>${escapeHTML(item.day)} • ${escapeHTML(item.time)}</p>
                </div>
            </div>
            <button class="delete-button"
                data-delete-class="${item.id}">
                Delete
            </button>
        </div>
    `).join("");
}

document.getElementById("classList").addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-class]");

    if (button) {
        const id = Number(button.dataset.deleteClass);

        classes = classes.filter(item => item.id !== id);

        saveData("campusClasses", classes);
        renderClasses();
    }
});

// STUDY PLANNER

document.getElementById("studyForm").addEventListener("submit", function(event) {
    event.preventDefault();

    sessions.push({
        id: Date.now(),
        subject: document.getElementById("studySubject").value.trim(),
        date: document.getElementById("studyDate").value,
        duration: document.getElementById("studyDuration").value
    });

    saveData("campusSessions", sessions);

    this.reset();
    renderSessions();
});

function renderSessions() {
    const list = document.getElementById("studyList");

    if (sessions.length === 0) {
        list.innerHTML = '<div class="empty-state">No study sessions planned.</div>';
        return;
    }

    const sorted = [...sessions].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    list.innerHTML = sorted.map(session => `
        <div class="task-item">
            <div class="task-info">
                <div>
                    <h4>${escapeHTML(session.subject)}</h4>
                    <p>
                        ${escapeHTML(session.date)}
                        • ${escapeHTML(session.duration)}
                    </p>
                </div>
            </div>
            <button class="delete-button"
                data-delete-session="${session.id}">
                Delete
            </button>
        </div>
    `).join("");
}

document.getElementById("studyList").addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-session]");

    if (button) {
        const id = Number(button.dataset.deleteSession);

        sessions = sessions.filter(item => item.id !== id);

        saveData("campusSessions", sessions);
        renderSessions();
    }
});

// NOTES

document.getElementById("noteForm").addEventListener("submit", function(event) {
    event.preventDefault();

    notes.push({
        id: Date.now(),
        title: document.getElementById("noteTitle").value.trim(),
        content: document.getElementById("noteContent").value.trim()
    });

    saveData("campusNotes", notes);

    this.reset();
    renderNotes();
});

function renderNotes() {
    const list = document.getElementById("notesList");

    if (notes.length === 0) {
        list.innerHTML = '<div class="empty-state">No notes saved yet.</div>';
        return;
    }

    list.innerHTML = notes.map(note => `
        <div class="note-card">
            <h3>${escapeHTML(note.title)}</h3>
            <p>${escapeHTML(note.content)}</p>

            <button class="delete-button"
                data-delete-note="${note.id}">
                Delete Note
            </button>
        </div>
    `).join("");
}

document.getElementById("notesList").addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-note]");

    if (button) {
        const id = Number(button.dataset.deleteNote);

        notes = notes.filter(note => note.id !== id);

        saveData("campusNotes", notes);
        renderNotes();
    }
});

// INITIALISE THE WEBSITE

renderTasks();
renderClasses();
renderSessions();
renderNotes();

console.log("CampusFlow is ready!");