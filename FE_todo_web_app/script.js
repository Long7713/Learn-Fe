// ===== 1. CẤU HÌNH LƯỚI LỊCH =====
const START_HOUR = 7; // Lịch bắt đầu lúc 07:00
const END_HOUR = 18; // và kết thúc lúc 18:00
const SLOT_MINUTES = 30; // Mỗi ô trên lưới = 30 phút
const SLOT_HEIGHT = 100; // Chiều cao (px) của 1 ô 30 phút
const PX_PER_MINUTE = SLOT_HEIGHT / SLOT_MINUTES;

// ===== 2. DOM =====
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");
const todoApp = document.getElementById("todo-app");
const menuItems = document.querySelectorAll(".menu li");

const searchInput = document.getElementById("search-input");
const filterChips = document.querySelectorAll(".filter-chip");

const addBtn = document.getElementById("add-btn");
const refreshBtn = document.getElementById("refresh-btn");
const editBtn = document.getElementById("edit-btn");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const dateBtn = document.getElementById("btn-date");
const dateRangeEl = document.getElementById("date-range");
const weekPicker = document.getElementById("week-picker");
const viewButtons = document.querySelectorAll(".view-btn");

const calendarScroll = document.getElementById("calendar-scroll");
const weekView = document.getElementById("week-view");
const monthView = document.getElementById("month-view");
const weekNumberEl = document.getElementById("week-number");
const headerCells = document.querySelectorAll(".grid-header .header-cell[data-day]");
const gridBody = document.getElementById("grid-body");
const timeCol = document.getElementById("time-col");
const nowLine = document.getElementById("now-line");
const nowLabel = document.getElementById("now-label");

const modal = document.getElementById("event-modal");
const form = document.getElementById("event-form");
const modalTitle = document.getElementById("modal-title");
const typeSelect = document.getElementById("type-select");
const tagField = document.getElementById("tag-field");
const formError = document.getElementById("form-error");
const deleteBtn = document.getElementById("delete-btn");

const toast = document.getElementById("toast");

let dayColumns = [];

// ===== 3. STATE =====
let events = []; // Nạp qua storage.js khi trang mở
let currentDate = new Date(); // Ngày "neo" để biết đang xem tuần/tháng nào
let currentView = "week";
let searchQuery = "";
const activeCategories = new Set();
let editMode = false;
let editingId = null;

document.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.style.setProperty("--slot-height", `${SLOT_HEIGHT}px`);
  buildGrid();
  buildTypeOptions();
  bindEvents();
  autoCollapseSidebar();
  render(); // Vẽ khung trống trước trong lúc chờ dữ liệu

  await reloadEvents();
  scrollToNow();

  // Mỗi phút vẽ lại để đường giờ hiện tại và nút Join luôn đúng
  setInterval(() => {
    if (currentView === "week") renderWeek();
  }, 60 * 1000);
});

// ===== 4. GỌI LƯU TRỮ (storage.js) =====
// Nạp lại toàn bộ sự kiện rồi vẽ lại. Trả về true nếu nạp thành công.
async function reloadEvents() {
  try {
    events = await loadEvents();
    return true;
  } catch (error) {
    console.error("Không tải được sự kiện:", error);
    showToast("Couldn't load events");
    return false;
  } finally {
    render();
  }
}

// Chạy 1 thao tác lưu (add/update/remove), lỗi thì báo cho người dùng
async function persist(action) {
  try {
    await action();
  } catch (error) {
    console.error("Không lưu được thay đổi:", error);
    showToast("Couldn't save your change");
  }
}

// ===== 5. DỰNG KHUNG LƯỚI (chạy 1 lần) =====
function buildGrid() {
  // Cột giờ: 07:00, 07:30, 08:00, ...
  const slotCount = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.innerHTML = `<span>${toTime(START_HOUR * 60 + i * SLOT_MINUTES)}</span>`;
    timeCol.appendChild(slot);
  }

  // 7 cột ngày, mỗi cột chứa các thẻ sự kiện
  dayColumns = DAY_NAMES.map((_, index) => {
    const column = document.createElement("div");
    column.className = "day-column";
    if (index === 6) column.classList.add("sunday");
    column.dataset.index = index;
    gridBody.insertBefore(column, nowLine);
    return column;
  });
}

function buildTypeOptions() {
  typeSelect.innerHTML = Object.entries(EVENT_TYPES)
    .map(([key, type]) => `<option value="${key}">${type.label}</option>`)
    .join("");
}

// ===== 6. VẼ GIAO DIỆN =====
function render() {
  const isMonth = currentView === "month";
  weekView.hidden = isMonth;
  monthView.hidden = !isMonth;
  if (isMonth) renderMonth();
  else renderWeek();

  renderDateLabel();
  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === currentView);
  });
}

function renderDateLabel() {
  if (currentView === "month") {
    dateRangeEl.textContent = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    return;
  }
  const monday = getMonday(currentDate);
  const sunday = addDays(monday, 6);
  const monthName = MONTH_NAMES[monday.getMonth()].slice(0, 3);
  dateRangeEl.textContent = `${monthName} ${formatShortDate(monday)} - ${formatShortDate(sunday)}`;
}

function renderWeek() {
  const monday = getMonday(currentDate);
  const today = new Date();
  weekNumberEl.textContent = getWeekNumber(monday);

  // Điền ngày vào header và tô đen ngày hôm nay
  headerCells.forEach((cell, index) => {
    const date = addDays(monday, index);
    cell.querySelector(".day-date").textContent = formatShortDate(date);
    cell.classList.toggle("active-day", isSameDay(date, today));
  });

  // Vẽ thẻ sự kiện cho từng cột ngày
  dayColumns.forEach((column, index) => {
    const dateKey = toDateKey(addDays(monday, index));
    const dayEvents = events.filter((ev) => ev.date === dateKey);
    column.innerHTML = "";

    layoutDayEvents(dayEvents).forEach(({ ev, lane, lanes }) => {
      const startMin = Math.max(toMinutes(ev.start), START_HOUR * 60);
      const endMin = Math.min(toMinutes(ev.end), END_HOUR * 60);
      if (endMin <= startMin) return; // nằm ngoài khung giờ

      const card = createEventCard(ev);
      const width = 100 / lanes;
      card.style.top = `${(startMin - START_HOUR * 60) * PX_PER_MINUTE + 3}px`;
      card.style.height = `${(endMin - startMin) * PX_PER_MINUTE - 6}px`;
      card.style.left = `calc(${lane * width}% + ${lane ? 2 : 0}px)`;
      card.style.width = `calc(${width}% - ${lanes > 1 ? 2 : 0}px)`;
      column.appendChild(card);
    });
  });

  updateNowLine();
}

function createEventCard(ev) {
  const type = getEventType(ev);
  const duration = toMinutes(ev.end) - toMinutes(ev.start);
  const hasParticipants = ev.participants.length > 0 || ev.extra > 0;
  const timeHtml = `<div class="card-time">${ev.start} - ${ev.end}</div>`;

  const card = document.createElement("article");
  card.className = `event-card ${type.color}`;
  if (duration <= 15) card.classList.add("tiny");
  else if (duration < 30) card.classList.add("compact");
  if (!matchesFilters(ev)) card.classList.add("dimmed");
  card.dataset.id = ev.id;
  card.tabIndex = 0;

  const parts = [];

  if (type.isArticle) {
    parts.push(`<span class="card-tag">${escapeHtml(ev.tag || "Education")}</span>`);
    parts.push(`<div class="card-title">${escapeHtml(ev.title)}</div>`);
    if (ev.description) parts.push(`<p class="card-desc">${escapeHtml(ev.description)}</p>`);
    parts.push(`<div class="card-image"><i class="fa-solid fa-user-doctor"></i></div>`);
    parts.push(createJoinButton(ev));
  } else {
    parts.push(`
      <div class="card-top">
        <span class="card-icon ${type.iconColor}"><i class="fa-solid ${type.icon}"></i></span>
        <button class="card-more" data-action="edit" aria-label="Edit event">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>`);
    parts.push(`<div class="card-title">${escapeHtml(ev.title)}</div>`);
    if (ev.location) parts.push(`<div class="card-sub">${escapeHtml(ev.location)}</div>`);
    if (ev.attachment) {
      parts.push(`<a href="#" class="card-attach" data-action="attachment">
        <i class="fa-regular fa-file-lines"></i>${escapeHtml(ev.attachment)}</a>`);
    }

    // Thẻ "Join" (online) hiện giờ ở trên; thẻ có người tham gia hiện giờ ở dưới cùng
    if (!hasParticipants || type.joinable) parts.push(timeHtml);
    if (hasParticipants) {
      parts.push(`<div class="card-label">Participants</div>`);
      parts.push(createAvatars(ev));
    }
    if (type.joinable) parts.push(createJoinButton(ev));
    else if (hasParticipants) parts.push(timeHtml);
  }

  parts.push(`<button class="card-delete" data-action="delete" aria-label="Delete event">
    <i class="fa-solid fa-xmark"></i></button>`);

  card.innerHTML = parts.join("");
  return card;
}

function createAvatars(ev) {
  const shown = ev.participants.slice(0, 4);
  const extra = ev.participants.length - shown.length + (ev.extra || 0);

  const html = shown.map((name) => {
    const code = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const color = AVATAR_COLORS[code % AVATAR_COLORS.length];
    return `<span class="avatar" style="background:${color}">${escapeHtml(name)}</span>`;
  });
  if (extra > 0) html.push(`<span class="avatar more">+${extra}</span>`);

  return `<div class="avatars">${html.join("")}</div>`;
}

// Trạng thái nút Join dựa theo giờ hiện tại
function createJoinButton(ev) {
  const now = new Date();
  const start = fromDateKey(ev.date);
  start.setMinutes(toMinutes(ev.start));
  const end = fromDateKey(ev.date);
  end.setMinutes(toMinutes(ev.end));

  if (now >= end) {
    return `<button class="btn-join muted" disabled>Ended</button>`;
  }
  if (now >= start) {
    return `<button class="btn-join live" data-action="join">In progress...</button>`;
  }
  const extraClass = getEventType(ev).isArticle ? "" : "muted";
  return `<button class="btn-join ${extraClass}" data-action="join">Join</button>`;
}

function updateNowLine() {
  const minutes = nowMinutes() - START_HOUR * 60; // số phút tính từ đầu lưới (07:00)
  const isThisWeek = isSameDay(getMonday(new Date()), getMonday(currentDate));
  const inRange = minutes >= 0 && minutes <= (END_HOUR - START_HOUR) * 60;

  nowLine.hidden = !(currentView === "week" && isThisWeek && inRange);
  if (nowLine.hidden) return;

  nowLine.style.top = `${minutes * PX_PER_MINUTE}px`;
  nowLabel.textContent = toTime(nowMinutes());
}

function scrollToNow() {
  const minutes = nowMinutes() - START_HOUR * 60;
  const top = Math.max(0, minutes * PX_PER_MINUTE - SLOT_HEIGHT);
  calendarScroll.scrollTo({ top: currentView === "week" ? top : 0, behavior: "smooth" });
}

function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const start = getMonday(new Date(year, month, 1));
  const today = new Date();

  let html = DAY_NAMES.map((name) => `<div class="month-head">${name.slice(0, 3)}</div>`).join("");

  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    // Bỏ hàng cuối nếu cả hàng thuộc tháng sau
    if (i === 35 && date.getMonth() !== month) break;

    const dateKey = toDateKey(date);
    const dayEvents = events
      .filter((ev) => ev.date === dateKey)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    const classes = ["month-cell"];
    if (date.getMonth() !== month) classes.push("other-month");
    if (isSameDay(date, today)) classes.push("is-today");

    const items = dayEvents.slice(0, 3).map((ev) => {
      const color = getEventType(ev).color;
      const dimmed = matchesFilters(ev) ? "" : "dimmed";
      return `<span class="month-event ${color} ${dimmed}">${ev.start} ${escapeHtml(ev.title)}</span>`;
    });
    if (dayEvents.length > 3) items.push(`<span class="month-more">+${dayEvents.length - 3} more</span>`);

    html += `
      <button class="${classes.join(" ")}" data-date="${dateKey}">
        <span class="month-date">${date.getDate()}</span>
        ${items.join("")}
      </button>`;
  }

  monthView.innerHTML = html;
}

// ===== 7. TÌM KIẾM & BỘ LỌC =====
function matchesFilters(ev) {
  const type = getEventType(ev);
  if (activeCategories.size && !activeCategories.has(type.category)) return false;
  if (!searchQuery) return true;

  const text = [ev.title, ev.location, ev.description, ev.tag, ev.attachment, ...ev.participants]
    .join(" ")
    .toLowerCase();
  return text.includes(searchQuery);
}

// ===== 8. MODAL THÊM / SỬA =====
function openModal(ev, preset = {}) {
  editingId = ev ? ev.id : null;
  modalTitle.textContent = ev ? "Edit event" : "Add event";
  deleteBtn.hidden = !ev;
  formError.hidden = true;

  const data = ev || {
    title: "",
    type: "emergency",
    date: preset.date || defaultDateKey(),
    start: preset.start || "09:00",
    end: preset.end || "09:30",
    location: "",
    participants: [],
    extra: 0,
    attachment: "",
    tag: "",
    description: "",
  };

  const fields = form.elements;
  fields["title"].value = data.title;
  fields["type"].value = data.type;
  fields["date"].value = data.date;
  fields["start"].value = data.start;
  fields["end"].value = data.end;
  fields["location"].value = data.location;
  fields["participants"].value = [...data.participants, ...(data.extra ? [`+${data.extra}`] : [])].join(", ");
  fields["attachment"].value = data.attachment;
  fields["tag"].value = data.tag;
  fields["description"].value = data.description;
  updateTagField();

  modal.hidden = false;
  fields["title"].focus();
}

function closeModal() {
  modal.hidden = true;
  editingId = null;
}

// Ngày mặc định khi thêm mới: hôm nay nếu đang xem tuần này, không thì Thứ 2 của tuần đang xem
function defaultDateKey() {
  const today = new Date();
  if (isSameDay(getMonday(today), getMonday(currentDate))) return toDateKey(today);
  return toDateKey(getMonday(currentDate));
}

function updateTagField() {
  tagField.hidden = typeSelect.value !== "article";
}

function handleSubmit(e) {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {
    title: fd.get("title").trim(),
    type: fd.get("type"),
    date: fd.get("date"),
    start: fd.get("start"),
    end: fd.get("end"),
    location: fd.get("location").trim(),
    attachment: fd.get("attachment").trim(),
    tag: fd.get("type") === "article" ? fd.get("tag").trim() : "",
    description: fd.get("description").trim(),
    ...parseParticipants(fd.get("participants")),
  };

  const error = validateForm(data);
  if (error) {
    formError.textContent = error;
    formError.hidden = false;
    return;
  }

  if (editingId) {
    const index = events.findIndex((ev) => ev.id === editingId);
    if (index === -1) return closeModal(); // sự kiện đã bị xoá trong lúc đang sửa
    const updated = { ...events[index], ...data };
    events[index] = updated;
    showToast(`Updated "${data.title}"`);
    persist(() => updateEvent(updated));
  } else {
    const created = { id: createId(), ...data };
    events.push(created);
    showToast(`Added "${data.title}"`);
    persist(() => addEvent(created));
  }

  closeModal();
  currentDate = fromDateKey(data.date);
  render();
}

function validateForm(data) {
  if (!data.title) return "Please enter a title.";
  if (!data.date) return "Please choose a date.";
  if (!data.start || !data.end) return "Please choose start and end time.";
  const start = toMinutes(data.start);
  const end = toMinutes(data.end);
  if (end <= start) return "End time must be after start time.";
  if (start < START_HOUR * 60 || end > END_HOUR * 60) {
    return `Time must be between ${toTime(START_HOUR * 60)} and ${toTime(END_HOUR * 60)}.`;
  }
  return "";
}

function deleteEvent(id) {
  const index = events.findIndex((ev) => ev.id === id);
  if (index === -1) return;

  const [removed] = events.splice(index, 1);
  render();
  showToast(`Deleted "${removed.title}"`, {
    label: "Undo",
    onClick: () => {
      events.splice(index, 0, removed);
      render();
      persist(() => addEvent(removed));
    },
  });
  persist(() => removeEvent(id));
}

// ===== 9. TOAST =====
let toastTimer;

function showToast(message, action) {
  toast.innerHTML = "";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(text);

  if (action) {
    const btn = document.createElement("button");
    btn.textContent = action.label;
    btn.addEventListener("click", () => {
      action.onClick();
      toast.classList.remove("show");
    });
    toast.append(btn);
  }

  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 4000);
}

// ===== 10. GẮN SỰ KIỆN =====
function autoCollapseSidebar() {
  const media = window.matchMedia("(max-width: 1000px)");
  const apply = () => {
    sidebar.classList.toggle("collapsed", media.matches);
    todoApp.classList.toggle("collapsed-mode", media.matches);
  };
  apply();
  media.addEventListener("change", apply);
}

function bindEvents() {
  // Sidebar
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    todoApp.classList.toggle("collapsed-mode");
  });

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Tìm kiếm & bộ lọc
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    render();
  });

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const category = chip.dataset.category;
      if (activeCategories.has(category)) activeCategories.delete(category);
      else activeCategories.add(category);
      chip.classList.toggle("active");
      render();
    });
  });

  // Nút hành động
  addBtn.addEventListener("click", () => openModal(null));

  // Tải lại dữ liệu mới nhất (ví dụ người khác vừa thêm sự kiện)
  refreshBtn.addEventListener("click", async () => {
    currentDate = new Date();
    const ok = await reloadEvents();
    scrollToNow();
    if (ok) showToast("Calendar refreshed");
  });

  editBtn.addEventListener("click", () => {
    editMode = !editMode;
    editBtn.classList.toggle("active", editMode);
    weekView.classList.toggle("editing", editMode);
    showToast(editMode ? "Edit mode on: click × to delete an event" : "Edit mode off");
  });

  // Điều hướng tuần / tháng
  prevBtn.addEventListener("click", () => moveDate(-1));
  nextBtn.addEventListener("click", () => moveDate(1));

  dateBtn.addEventListener("click", () => {
    weekPicker.value = toDateKey(currentDate);
    try {
      weekPicker.showPicker();
    } catch {
      weekPicker.click();
    }
  });

  weekPicker.addEventListener("change", () => {
    if (!weekPicker.value) return;
    currentDate = fromDateKey(weekPicker.value);
    render();
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      if (view === "today") {
        currentDate = new Date();
        currentView = "week";
        render();
        scrollToNow();
        return;
      }
      currentView = view;
      render();
    });
  });

  // Click trên lưới tuần: mở thẻ, Join, xoá, hoặc thêm mới ở ô trống
  gridBody.addEventListener("click", (e) => {
    const card = e.target.closest(".event-card");

    if (!card) {
      const column = e.target.closest(".day-column");
      if (!column) return;
      const y = e.clientY - column.getBoundingClientRect().top;
      const startMin = START_HOUR * 60 + Math.floor(y / SLOT_HEIGHT) * SLOT_MINUTES;
      const endMin = Math.min(startMin + SLOT_MINUTES, END_HOUR * 60);
      const date = addDays(getMonday(currentDate), Number(column.dataset.index));
      openModal(null, { date: toDateKey(date), start: toTime(startMin), end: toTime(endMin) });
      return;
    }

    const ev = events.find((item) => item.id === card.dataset.id);
    if (!ev) return;
    const action = e.target.closest("[data-action]")?.dataset.action;

    if (action === "delete") deleteEvent(ev.id);
    else if (action === "join") showToast(`Joining "${ev.title}"...`);
    else if (action === "attachment") {
      e.preventDefault();
      showToast(`Opening ${ev.attachment}`);
    } else openModal(ev);
  });

  gridBody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !e.target.classList.contains("event-card")) return;
    const ev = events.find((item) => item.id === e.target.dataset.id);
    if (ev) openModal(ev);
  });

  // Click 1 ngày trong tháng => chuyển về tuần đó
  monthView.addEventListener("click", (e) => {
    const cell = e.target.closest(".month-cell");
    if (!cell) return;
    currentDate = fromDateKey(cell.dataset.date);
    currentView = "week";
    render();
    scrollToNow();
  });

  // Modal
  form.addEventListener("submit", handleSubmit);
  typeSelect.addEventListener("change", updateTagField);
  modal.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  deleteBtn.addEventListener("click", () => {
    const id = editingId;
    closeModal();
    deleteEvent(id);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

function moveDate(step) {
  if (currentView === "month") {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1);
  } else {
    currentDate = addDays(currentDate, step * 7);
  }
  render();
}
