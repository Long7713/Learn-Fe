// ===== LƯU TRỮ DỮ LIỆU =====
// "Ổ cắm" giữa giao diện và nơi lưu dữ liệu. script.js chỉ gọi 4 hàm:
// loadEvents, addEvent, updateEvent, removeEvent — không cần biết dữ liệu nằm ở đâu.
//
// Online : đọc/ghi bảng "events" trên Supabase, đồng thời giữ 1 bản sao trên máy (cache).
// Offline: (mất mạng, chưa điền config.js, Supabase không phản hồi)
//          đọc/ghi bản sao trên máy, các thay đổi được xếp vào hàng chờ (pending)
//          và tự đẩy lên Supabase khi có mạng lại.
//
// File này không đụng tới giao diện. Khi đổi trạng thái, nó phát 2 tín hiệu cho script.js:
//   "storage-offline": vừa chuyển sang Offline
//   "storage-online" : có mạng lại và đã đẩy xong các thay đổi
// Khi database từ chối dữ liệu, hàm sẽ ném lỗi (throw) để script.js báo cho người dùng.

const CACHE_KEY = "intelly-events"; // bản sao dữ liệu trên máy
const PENDING_KEY = "intelly-pending"; // các thay đổi chưa đẩy lên Supabase
const REQUEST_TIMEOUT = 8000; // quá 8 giây không phản hồi thì coi như mất mạng
const RETRY_INTERVAL = 30 * 1000; // khi Offline, cứ 30 giây thử kết nối lại 1 lần

const db = createDatabaseClient();
let isOffline = false;
let syncing = null; // đang đẩy hàng chờ thì giữ Promise ở đây để không đẩy 2 lần cùng lúc

// Có mạng lại (trình duyệt báo) hoặc tới giờ thử lại thì kết nối lại
window.addEventListener("online", tryReconnect);
setInterval(tryReconnect, RETRY_INTERVAL);

// ----- 4 hàm script.js dùng -----

// Lấy toàn bộ sự kiện. Bảng trống thì trả về mảng rỗng (không tự tạo dữ liệu mẫu).
async function loadEvents() {
  if (db && (await syncPending())) {
    const { data, error, status } = await db
      .from("events")
      .select("*")
      .order("date")
      .order("start_time")
      .retry(false); // không để thư viện tự thử lại (mất tới ~40 giây); việc thử lại do file này lo

    if (!error) {
      const list = data.map(fromRow);
      writeCache(list);
      isOffline = false;
      return list;
    }
    if (!isNetworkError(error, status)) throw new Error(error.message);
  }

  goOffline();
  return readCache();
}

// Thêm và sửa đều dùng "upsert": có id rồi thì sửa, chưa có thì thêm.
// Nhờ vậy gửi lại 1 thay đổi 2 lần (khi mạng chập chờn) cũng không bị trùng.
async function addEvent(ev) {
  await save({ op: "upsert", event: ev });
}

async function updateEvent(ev) {
  await save({ op: "upsert", event: ev });
}

async function removeEvent(id) {
  await save({ op: "delete", id });
}

// ----- Lưu 1 thay đổi -----
// change = { op: "upsert", event } hoặc { op: "delete", id }
async function save(change) {
  applyToCache(change); // bản sao trên máy luôn cập nhật ngay

  if (db && !isOffline && (await send(change))) return;

  // Mất mạng: giữ lại trong hàng chờ, có mạng sẽ đẩy lên
  const pending = readPending();
  pending.push(change);
  writePending(pending);
  goOffline();
}

// Gửi 1 thay đổi lên Supabase.
// Trả về true nếu thành công, false nếu mất mạng; ném lỗi nếu database từ chối.
async function send(change) {
  const query =
    change.op === "delete"
      ? db.from("events").delete().eq("id", change.id)
      : db.from("events").upsert(toRow(change.event));

  const { error, status } = await query;
  if (!error) return true;
  if (isNetworkError(error, status)) return false;
  throw new Error(error.message);
}

// ----- Đồng bộ khi có mạng lại -----

// Đẩy lần lượt các thay đổi trong hàng chờ lên Supabase.
// Trả về true nếu đã đẩy hết, false nếu vẫn mất mạng.
function syncPending() {
  if (!syncing) syncing = pushPending().finally(() => (syncing = null));
  return syncing;
}

async function pushPending() {
  const pending = readPending();
  while (pending.length) {
    try {
      if (!(await send(pending[0]))) return false;
    } catch (error) {
      // Database từ chối (không bao giờ thành công được) thì bỏ qua để không kẹt hàng chờ
      console.error("Bỏ qua 1 thay đổi bị Supabase từ chối:", pending[0], error);
    }
    pending.shift();
    writePending(pending);
  }
  return true;
}

let reconnecting = false;

async function tryReconnect() {
  if (!db || !isOffline || reconnecting) return;
  reconnecting = true;
  try {
    // Hỏi thử Supabase 1 câu nhẹ để biết đã có mạng thật chưa
    const { error, status } = await db.from("events").select("id").limit(1).retry(false);
    if (error && isNetworkError(error, status)) return;
    if (!(await syncPending())) return;

    isOffline = false;
    window.dispatchEvent(new Event("storage-online"));
  } finally {
    reconnecting = false;
  }
}

function goOffline() {
  if (isOffline) return;
  isOffline = true;
  window.dispatchEvent(new Event("storage-offline"));
}

// ----- Kết nối Supabase -----

function createDatabaseClient() {
  const configured =
    typeof SUPABASE_URL === "string" &&
    SUPABASE_URL.startsWith("https://") &&
    typeof SUPABASE_KEY === "string" &&
    !SUPABASE_KEY.startsWith("PASTE_");

  if (!configured) {
    console.warn("Chưa điền SUPABASE_URL / SUPABASE_KEY trong config.js → chạy Offline");
    return null;
  }
  if (!window.supabase) {
    console.warn("Không tải được thư viện supabase-js (mất mạng?) → chạy Offline");
    return null;
  }
  return supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }, // chưa có đăng nhập nên không cần lưu phiên
    global: { fetch: fetchWithTimeout },
  });
}

// fetch có giới hạn thời gian: Supabase không trả lời thì huỷ, coi như mất mạng
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Lỗi do mạng (status 0, trình duyệt báo offline, không gọi được fetch...)
// khác với lỗi do database từ chối dữ liệu (status 400, 401, 409...)
function isNetworkError(error, status) {
  return status === 0 || !navigator.onLine || /fetch|network|abort/i.test(error?.message || "");
}

// ----- Đổi tên trường giữa JS và database -----
// JS dùng start/end, database dùng start_time/end_time ("end" là từ khoá của SQL)

function toRow(ev) {
  return {
    id: ev.id,
    type: ev.type,
    title: ev.title,
    date: ev.date,
    start_time: ev.start,
    end_time: ev.end,
    location: ev.location,
    participants: ev.participants,
    extra: ev.extra,
    attachment: ev.attachment,
    tag: ev.tag,
    description: ev.description,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    date: row.date,
    start: row.start_time.slice(0, 5), // "07:30:00" -> "07:30"
    end: row.end_time.slice(0, 5),
    location: row.location,
    participants: row.participants || [],
    extra: row.extra,
    attachment: row.attachment,
    tag: row.tag,
    description: row.description,
  };
}

// ----- Bản sao & hàng chờ trên máy (localStorage) -----

function applyToCache(change) {
  const id = change.op === "delete" ? change.id : change.event.id;
  const list = readCache().filter((ev) => ev.id !== id);
  if (change.op === "upsert") list.push(change.event);
  writeCache(list);
}

function readCache() {
  return readJson(CACHE_KEY);
}

// Bản sao chỉ để dự phòng: ghi lỗi thì bỏ qua, không làm hỏng việc lưu lên Supabase
function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Không ghi được bản sao trên máy:", error);
  }
}

function readPending() {
  return readJson(PENDING_KEY);
}

// Không bắt lỗi: Offline mà không ghi được hàng chờ thì thay đổi sẽ mất,
// nên để lỗi chuyển lên script.js báo cho người dùng
function writePending(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    console.warn(`Không đọc được ${key}:`, error);
    return [];
  }
}
