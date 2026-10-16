// ===== 1. CẤU HÌNH =====
const START_HOUR = 7; // Lịch bắt đầu lúc 07:00
const END_HOUR = 18; // và kết thúc lúc 18:00
const SLOT_MINUTES = 30; // Mỗi ô trên lưới = 30 phút
const SLOT_HEIGHT = 100; // Chiều cao (px) của 1 ô 30 phút
const PX_PER_MINUTE = SLOT_HEIGHT / SLOT_MINUTES;
const STORAGE_KEY = "intelly-events";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Mỗi loại sự kiện có icon, màu thẻ, màu icon và nhóm (dùng cho bộ lọc "In:")
const EVENT_TYPES = {
  emergency: { label: "Emergency visit", icon: "fa-stethoscope", color: "beige", iconColor: "pink", category: "patients" },
  online: { label: "Online visit", icon: "fa-desktop", color: "beige", iconColor: "pink", category: "patients", joinable: true },
  followup: { label: "Follow-up", icon: "fa-stethoscope", color: "beige", iconColor: "pink", category: "patients" },
  diagnostic: { label: "Diagnostic test", icon: "fa-syringe", color: "beige", iconColor: "blue", category: "tests" },
  prescription: { label: "Prescription", icon: "fa-prescription-bottle-medical", color: "beige", iconColor: "pink", category: "prescriptions" },
  team: { label: "Team meeting", icon: "fa-people-group", color: "yellow", iconColor: "yellow", category: "tests" },
  interns: { label: "Interns visit", icon: "fa-people-group", color: "blue", iconColor: "blue", category: "education" },
  article: { label: "Education / article", icon: "fa-book-open", color: "beige", category: "education", isArticle: true },
};

const AVATAR_COLORS = ["#f6d867", "#a9b98a", "#b9c9ef", "#f4b6d2", "#e7c39c"];

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
let events = loadEvents();
let currentDate = new Date(); // Ngày "neo" để biết đang xem tuần/tháng nào
let currentView = "week";
let searchQuery = "";
const activeCategories = new Set();
let editMode = false;
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.style.setProperty("--slot-height", `${SLOT_HEIGHT}px`);
  buildGrid();
  buildTypeOptions();
  bindEvents();
  autoCollapseSidebar();
  render();
  scrollToNow();

  // Mỗi phút vẽ lại để đường giờ hiện tại và nút Join luôn đúng
  setInterval(() => {
    if (currentView === "week") renderWeek();
  }, 60 * 1000);
});

// ===== 4. HÀM TIỆN ÍCH NGÀY GIỜ =====
function pad(n) {
  return String(n).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatShortDate(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

function addDays(date, amount) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// Tìm ngày Thứ 2 của tuần chứa `date`
function getMonday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0: Chủ Nhật, 1: T2, ..., 6: T7
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

// Số tuần theo chuẩn ISO (tuần bắt đầu từ Thứ 2)
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Chống chèn HTML khi hiển thị chữ người dùng nhập
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== 5. LƯU TRỮ DỮ LIỆU =====
function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn("Không đọc được dữ liệu đã lưu", error);
  }
  return createSampleEvents();
}

function saveEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn("Không lưu được dữ liệu", error);
  }
}

// Dữ liệu mẫu giống ảnh Example.jpg, luôn nằm ở tuần hiện tại
function createSampleEvents() {
  const monday = getMonday(new Date());
  const day = (offset) => toDateKey(addDays(monday, offset));
  const team = ["TY", "AB", "NR", "SS"];

  const list = [
    // Thứ 2
    { type: "emergency", title: "Emergency visit", date: day(0), start: "07:00", end: "07:30", location: "West camp, Room 312" },
    { type: "diagnostic", title: "Diagnostic test", date: day(0), start: "07:30", end: "07:55", location: "West camp, Room 312" },
    { type: "team", title: "Team planning", date: day(0), start: "08:00", end: "09:00", location: "East camp, Room 200", attachment: "Agenda.pdf", participants: team, extra: 3 },
    { type: "emergency", title: "Emergency visit", date: day(0), start: "09:00", end: "09:30", location: "West camp, Room 312" },
    { type: "followup", title: "Follow-up", date: day(0), start: "10:30", end: "11:00", location: "West camp, Room 312" },
    // Thứ 3
    { type: "online", title: "Online visit", date: day(1), start: "07:00", end: "08:00", location: "West camp, Room 312", participants: ["TY"] },
    { type: "diagnostic", title: "Diagnostic test", date: day(1), start: "08:00", end: "08:15", location: "West camp, Room 312" },
    { type: "article", title: "Health systems in practice", date: day(1), start: "08:30", end: "10:00", tag: "Clinical Immunology", description: "Do you know how to optimally manage moderate to severe asthma in your patients?" },
    // Thứ 4
    { type: "followup", title: "Follow-up", date: day(2), start: "07:30", end: "08:00", location: "West camp, Room 312" },
    { type: "interns", title: "Interns visit", date: day(2), start: "08:30", end: "09:30", location: "West camp, Conference room 404", participants: team, extra: 12 },
    { type: "emergency", title: "Emergency visit", date: day(2), start: "09:40", end: "10:10", location: "West camp, Room 312" },
    { type: "prescription", title: "Prescription review", date: day(2), start: "11:00", end: "11:30", location: "Pharmacy, Room 105" },
    // Thứ 5
    { type: "online", title: "Online visit", date: day(3), start: "07:00", end: "08:00", location: "West camp, Room 312", participants: ["TY"] },
    { type: "article", title: "Chronic Kidney Disease", date: day(3), start: "08:15", end: "09:45", tag: "Primary Care", description: "What tools can you leverage to help maximize a co-management approach to caring for people with CKD" },
    { type: "diagnostic", title: "Diagnostic test", date: day(3), start: "10:00", end: "10:30", location: "East camp, Lab 2" },
    // Thứ 6
    { type: "team", title: "Team results", date: day(4), start: "07:00", end: "08:00", location: "East camp, Room 200", attachment: "Agenda.pdf", participants: team, extra: 3 },
    { type: "emergency", title: "Emergency visit", date: day(4), start: "08:00", end: "08:30", location: "West camp, Room 312" },
    { type: "diagnostic", title: "Diagnostic test", date: day(4), start: "08:30", end: "08:55", location: "West camp, Room 312" },
    { type: "interns", title: "Interns visit", date: day(4), start: "09:00", end: "10:00", location: "West camp, Conference room 404", participants: team, extra: 12 },
    // Thứ 7
    { type: "online", title: "Online visit", date: day(5), start: "07:30", end: "08:30", location: "West camp, Room 312", participants: ["TY"] },
    { type: "followup", title: "Follow-up", date: day(5), start: "09:00", end: "09:30", location: "West camp, Room 312" },
    // Buổi chiều
    { type: "team", title: "Weekly sync", date: day(0), start: "14:00", end: "15:00", location: "East camp, Room 200", participants: ["AB", "NR"] },
    { type: "online", title: "Online visit", date: day(1), start: "15:30", end: "16:30", location: "West camp, Room 312", participants: ["SS"] },
    { type: "diagnostic", title: "Lab results", date: day(2), start: "14:30", end: "15:00", location: "East camp, Lab 2" },
    { type: "article", title: "Hypertension update", date: day(3), start: "15:00", end: "16:30", tag: "Cardiology", description: "New guidelines on blood pressure targets for elderly patients." },
    { type: "emergency", title: "Emergency visit", date: day(4), start: "13:30", end: "14:00", location: "West camp, Room 312" },
    { type: "online", title: "Online visit", date: day(4), start: "16:00", end: "17:00", location: "West camp, Room 312", participants: ["TY", "AB"] },
    { type: "interns", title: "Interns review", date: day(4), start: "15:00", end: "16:00", location: "West camp, Conference room 404", participants: team, extra: 5 },
    { type: "followup", title: "Follow-up", date: day(5), start: "14:00", end: "14:30", location: "West camp, Room 312" },
  ];

  return list.map((ev, index) => ({
    id: `sample-${index}`,
    location: "",
    participants: [],
    extra: 0,
    attachment: "",
    tag: "",
    description: "",
    ...ev,
  }));
}

// ===== 6. DỰNG KHUNG LƯỚI (chạy 1 lần) =====
function buildGrid() {
  // Cột giờ: 07:00, 07:30, 08:00, ...
  const slotCount = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
  for (let i = 0; i < slotCount; i++) {
    const minutes = START_HOUR * 60 + i * SLOT_MINUTES;
    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.innerHTML = `<span>${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}</span>`;
    timeCol.appendChild(slot);
  }

  // 7 cột ngày, mỗi cột chứa các thẻ sự kiện
  dayColumns = DAY_NAMES.map((name, index) => {
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

// ===== 7. VẼ GIAO DIỆN =====
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

// Nếu 2 sự kiện trùng giờ thì chia cột ra làm nhiều "làn" nằm cạnh nhau
function layoutDayEvents(dayEvents) {
  const sorted = [...dayEvents].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const result = [];
  let cluster = [];
  let clusterEnd = -1;

  const flush = () => {
    const laneEnds = [];
    cluster.forEach((item) => {
      let lane = laneEnds.findIndex((end) => end <= toMinutes(item.ev.start));
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = toMinutes(item.ev.end);
      item.lane = lane;
    });
    cluster.forEach((item) => result.push({ ...item, lanes: laneEnds.length }));
    cluster = [];
  };

  sorted.forEach((ev) => {
    if (cluster.length && toMinutes(ev.start) >= clusterEnd) flush();
    cluster.push({ ev });
    clusterEnd = Math.max(clusterEnd, toMinutes(ev.end));
  });
  if (cluster.length) flush();

  return result;
}

function createEventCard(ev) {
  const type = EVENT_TYPES[ev.type] || EVENT_TYPES.emergency;
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
        <button class="card-more" data-action="edit" aria-label="Sửa sự kiện">
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

  parts.push(`<button class="card-delete" data-action="delete" aria-label="Xoá sự kiện">
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
  const extraClass = EVENT_TYPES[ev.type]?.isArticle ? "" : "muted";
  return `<button class="btn-join ${extraClass}" data-action="join">Join</button>`;
}

function updateNowLine() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
  const isThisWeek = isSameDay(getMonday(now), getMonday(currentDate));
  const inRange = minutes >= 0 && minutes <= (END_HOUR - START_HOUR) * 60;

  nowLine.hidden = !(currentView === "week" && isThisWeek && inRange);
  if (nowLine.hidden) return;

  nowLine.style.top = `${minutes * PX_PER_MINUTE}px`;
  nowLabel.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function scrollToNow() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
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
      const color = (EVENT_TYPES[ev.type] || EVENT_TYPES.emergency).color;
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

// ===== 8. TÌM KIẾM & BỘ LỌC =====
function matchesFilters(ev) {
  const type = EVENT_TYPES[ev.type] || EVENT_TYPES.emergency;
  if (activeCategories.size && !activeCategories.has(type.category)) return false;
  if (!searchQuery) return true;

  const text = [ev.title, ev.location, ev.description, ev.tag, ev.attachment, ...ev.participants]
    .join(" ")
    .toLowerCase();
  return text.includes(searchQuery);
}

// ===== 9. MODAL THÊM / SỬA =====
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

// "TY, AB, +3" => { participants: ["TY", "AB"], extra: 3 }
function parseParticipants(text) {
  const participants = [];
  let extra = 0;
  text.split(",").map((s) => s.trim()).filter(Boolean).forEach((token) => {
    if (/^\+\d+$/.test(token)) extra += Number(token.slice(1));
    else participants.push(token.slice(0, 3).toUpperCase());
  });
  return { participants, extra };
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

  const error = validateEvent(data);
  if (error) {
    formError.textContent = error;
    formError.hidden = false;
    return;
  }

  if (editingId) {
    const index = events.findIndex((ev) => ev.id === editingId);
    events[index] = { ...events[index], ...data };
    showToast(`Updated "${data.title}"`);
  } else {
    events.push({ id: `ev-${Date.now().toString(36)}`, ...data });
    showToast(`Added "${data.title}"`);
  }

  saveEvents();
  closeModal();
  currentDate = fromDateKey(data.date);
  render();
}

function validateEvent(data) {
  if (!data.title) return "Please enter a title.";
  if (!data.date) return "Please choose a date.";
  if (!data.start || !data.end) return "Please choose start and end time.";
  const start = toMinutes(data.start);
  const end = toMinutes(data.end);
  if (end <= start) return "End time must be after start time.";
  if (start < START_HOUR * 60 || end > END_HOUR * 60) {
    return `Time must be between ${pad(START_HOUR)}:00 and ${pad(END_HOUR)}:00.`;
  }
  return "";
}

function deleteEvent(id) {
  const index = events.findIndex((ev) => ev.id === id);
  if (index === -1) return;

  const [removed] = events.splice(index, 1);
  saveEvents();
  render();
  showToast(`Deleted "${removed.title}"`, {
    label: "Undo",
    onClick: () => {
      events.splice(index, 0, removed);
      saveEvents();
      render();
    },
  });
}

// ===== 10. TOAST =====
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

// ===== 11. GẮN SỰ KIỆN =====
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

  refreshBtn.addEventListener("click", () => {
    events = loadEvents();
    currentDate = new Date();
    render();
    scrollToNow();
    showToast("Calendar refreshed");
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
      openModal(null, {
        date: toDateKey(date),
        start: `${pad(Math.floor(startMin / 60))}:${pad(startMin % 60)}`,
        end: `${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}`,
      });
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
