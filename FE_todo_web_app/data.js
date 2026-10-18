// ===== DỮ LIỆU CỐ ĐỊNH & DỮ LIỆU MẪU =====
// Cần utils.js được nạp trước (dùng getMonday, addDays, toDateKey).
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

// Lấy thông tin loại của 1 sự kiện (loại lạ thì coi như "emergency")
function getEventType(ev) {
  return EVENT_TYPES[ev.type] || EVENT_TYPES.emergency;
}

const AVATAR_COLORS =["#f6d867", "#a9b98a", "#b9c9ef", "#f4b6d2", "#e7c39c"];

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
