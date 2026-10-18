// ===== HÀM TIỆN ÍCH =====
// Các hàm "thuần": nhận dữ liệu vào, trả kết quả ra, không đụng tới HTML trên trang.
// ----- Ngày giờ -----
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

// "07:30" -> 450 (phút tính từ 00:00)
function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 450 -> "07:30"
function toTime(minutes) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

// Số phút từ 00:00 đến bây giờ (ví dụ đang 07:30 -> 450)
function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
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

// Số tuần theo chuẩn ISO
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

// ----- Xếp lịch -----
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

// ----- Form -----
// Tạo id không trùng cho sự kiện mới (dùng làm khoá chính trên Supabase)
function createId() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  // Trình duyệt cũ không có randomUUID thì ghép thời gian + số ngẫu nhiên
  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
