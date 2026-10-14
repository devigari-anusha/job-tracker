(function () {
  "use strict";

  var STORAGE_KEY = "jobTracker.applications.v1";
  var STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

  var board = document.getElementById("board");
  var statsEl = document.getElementById("stats");
  var searchEl = document.getElementById("search");
  var filterEl = document.getElementById("filter");
  var dialog = document.getElementById("dialog");
  var form = document.getElementById("form");
  var dialogTitle = document.getElementById("dialogTitle");

  var fields = {
    company: document.getElementById("company"),
    role: document.getElementById("role"),
    link: document.getElementById("link"),
    date: document.getElementById("date"),
    status: document.getElementById("status"),
    notes: document.getElementById("notes")
  };

  var editingId = null;
  var apps = load();

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function sampleData() {
    return [
      { id: uid(), company: "Infosys", role: "Systems Engineer", link: "", date: daysAgo(12), status: "Applied", notes: "Applied via campus portal." },
      { id: uid(), company: "TCS", role: "Digital Developer", link: "", date: daysAgo(10), status: "Interview", notes: "Technical round on Friday." },
      { id: uid(), company: "Zoho", role: "Frontend Developer", link: "", date: daysAgo(8), status: "Interview", notes: "Prepare JavaScript and CSS basics." },
      { id: uid(), company: "Wipro", role: "Project Engineer", link: "", date: daysAgo(20), status: "Offer", notes: "Offer letter received." },
      { id: uid(), company: "Capgemini", role: "Analyst", link: "", date: daysAgo(25), status: "Rejected", notes: "Did not clear aptitude round." },
      { id: uid(), company: "Freshworks", role: "Web Developer Intern", link: "", date: daysAgo(3), status: "Applied", notes: "Sent portfolio link." }
    ];
  }

  function uid() {
    return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* storage unavailable or corrupted */ }
    var seed = sampleData();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch (e) { /* ignore */ }
    return seed;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apps)); } catch (e) { /* ignore */ }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function matches(app) {
    var q = searchEl.value.trim().toLowerCase();
    var f = filterEl.value;
    if (f !== "All" && app.status !== f) return false;
    if (!q) return true;
    return (app.company + " " + app.role + " " + (app.notes || "")).toLowerCase().indexOf(q) !== -1;
  }

  function renderStats() {
    statsEl.textContent = "";
    var total = el("div", "stat");
    total.appendChild(el("div", "num", String(apps.length)));
    total.appendChild(el("div", "label", "Total"));
    statsEl.appendChild(total);

    STATUSES.forEach(function (s) {
      var count = apps.filter(function (a) { return a.status === s; }).length;
      var box = el("div", "stat " + s);
      box.appendChild(el("div", "num", String(count)));
      box.appendChild(el("div", "label", s));
      statsEl.appendChild(box);
    });
  }

  function renderCard(app) {
    var card = el("article", "card");
    card.draggable = true;
    card.dataset.id = app.id;

    card.appendChild(el("h3", "", app.company));
    card.appendChild(el("div", "role", app.role));
    card.appendChild(el("div", "meta", "Applied: " + app.date));

    if (app.link) {
      var a = el("a", "", "View posting");
      a.href = app.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      card.appendChild(a);
    }
    if (app.notes) card.appendChild(el("p", "notes", app.notes));

    var actions = el("div", "card-actions");
    var edit = el("button", "", "Edit");
    edit.type = "button";
    edit.addEventListener("click", function () { openDialog(app.id); });
    var del = el("button", "del", "Delete");
    del.type = "button";
    del.addEventListener("click", function () {
      if (confirm("Delete the application to " + app.company + "?")) {
        apps = apps.filter(function (x) { return x.id !== app.id; });
        save();
        render();
      }
    });
    actions.appendChild(edit);
    actions.appendChild(del);
    card.appendChild(actions);

    card.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", app.id);
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", function () {
      card.classList.remove("dragging");
    });

    return card;
  }

  function renderBoard() {
    board.textContent = "";
    STATUSES.forEach(function (status) {
      var col = el("section", "column " + status);
      col.dataset.status = status;

      var visible = apps.filter(function (a) { return a.status === status && matches(a); });

      var head = el("h2", "", status);
      head.appendChild(el("span", "count", String(visible.length)));
      col.appendChild(head);

      if (visible.length === 0) {
        col.appendChild(el("div", "empty", "No applications"));
      }
      visible.forEach(function (a) { col.appendChild(renderCard(a)); });

      col.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        col.classList.add("over");
      });
      col.addEventListener("dragleave", function () { col.classList.remove("over"); });
      col.addEventListener("drop", function (e) {
        e.preventDefault();
        col.classList.remove("over");
        var id = e.dataTransfer.getData("text/plain");
        var app = apps.find(function (x) { return x.id === id; });
        if (app && app.status !== status) {
          app.status = status;
          save();
          render();
        }
      });

      board.appendChild(col);
    });
  }

  function render() {
    renderStats();
    renderBoard();
  }

  function openDialog(id) {
    editingId = id || null;
    form.reset();
    if (editingId) {
      var app = apps.find(function (x) { return x.id === editingId; });
      if (!app) return;
      dialogTitle.textContent = "Edit application";
      fields.company.value = app.company;
      fields.role.value = app.role;
      fields.link.value = app.link || "";
      fields.date.value = app.date;
      fields.status.value = app.status;
      fields.notes.value = app.notes || "";
    } else {
      dialogTitle.textContent = "Add application";
      fields.date.value = new Date().toISOString().slice(0, 10);
      fields.status.value = "Applied";
    }
    dialog.showModal();
    fields.company.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      company: fields.company.value.trim(),
      role: fields.role.value.trim(),
      link: fields.link.value.trim(),
      date: fields.date.value,
      status: fields.status.value,
      notes: fields.notes.value.trim()
    };
    if (!data.company || !data.role) return;

    if (editingId) {
      var app = apps.find(function (x) { return x.id === editingId; });
      if (app) Object.assign(app, data);
    } else {
      data.id = uid();
      apps.unshift(data);
    }
    save();
    dialog.close();
    render();
  });

  document.getElementById("addBtn").addEventListener("click", function () { openDialog(null); });
  document.getElementById("cancelBtn").addEventListener("click", function () { dialog.close(); });
  document.getElementById("resetBtn").addEventListener("click", function () {
    if (confirm("Reset to the sample demo data? Your current entries will be replaced.")) {
      apps = sampleData();
      save();
      searchEl.value = "";
      filterEl.value = "All";
      render();
    }
  });
  searchEl.addEventListener("input", renderBoard);
  filterEl.addEventListener("change", renderBoard);

  render();
})();