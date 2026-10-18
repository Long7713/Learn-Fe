// ===== LƯU TRỮ DỮ LIỆU =====
// "Ổ cắm" giữa giao diện và nơi lưu dữ liệu.
// script.js chỉ gọi 4 hàm bên dưới, không cần biết dữ liệu nằm ở đâu.
//
// Ngày 2: lưu bằng localStorage (trên máy người dùng).
// Ngày 3: thay ruột 4 hàm sang Supabase, tên hàm và cách gọi giữ nguyên.
//
// Cả 4 hàm đều là async (trả về Promise) vì Supabase gọi qua mạng, phải chờ.
// Khi lưu thất bại, hàm sẽ "ném lỗi" (throw) để script.js bắt và báo cho người dùng.

const STORAGE_KEY = "intelly-events";

// Lấy toàn bộ sự kiện. Lần đầu chưa có gì thì ghi dữ liệu mẫu vào trước.
async function loadEvents() {
  let list = readAll();
  if (!list) {
    list = createSampleEvents();
    writeAll(list);
  }
  return list;
}

async function addEvent(ev) {
  const list = readAll() || [];
  list.push(ev);
  writeAll(list);
}

async function updateEvent(ev) {
  const list = (readAll() || []).map((item) => (item.id === ev.id ? ev : item));
  writeAll(list);
}

async function removeEvent(id) {
  const list = (readAll() || []).filter((item) => item.id !== id);
  writeAll(list);
}

// ----- Đọc / ghi localStorage (chỉ dùng trong file này) -----
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Không đọc được dữ liệu đã lưu:", error);
    return null;
  }
}

// Không bắt lỗi ở đây: nếu ghi thất bại (bộ nhớ đầy, trình duyệt chặn...)
// thì lỗi sẽ được chuyển lên script.js để hiện thông báo
function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
