# Ghi chú học FE – dự án Intelly (FE_todo_web_app)

Mục lục
- [Phần 1 – HTML](#phần-1--html)
  - [1.1 Thẻ (tag)](#11-thẻ-tag)
  - [1.2 Thuộc tính (attribute)](#12-thuộc-tính-attribute)
- [Phần 2 – JavaScript](#phần-2--javascript)
  - [2.1 Cú pháp](#21-cú-pháp)
  - [2.2 Hàm & đối tượng có sẵn của JS](#22-hàm--đối-tượng-có-sẵn-của-js)
  - [2.3 DOM – JS điều khiển HTML](#23-dom--js-điều-khiển-html)
  - [2.4 Hàm tự viết trong dự án](#24-hàm-tự-viết-trong-dự-án)
  - [2.5 Biến / hằng quan trọng](#25-biến--hằng-quan-trọng)
- [Phần 3 – Supabase (lưu dữ liệu online)](#phần-3--supabase-lưu-dữ-liệu-online)

---

## Phần 1 – HTML

### 1.1 Thẻ (tag)

Thẻ viết dạng `<tên>...</tên>`. Một số thẻ không có thẻ đóng (`<meta>`, `<link>`, `<input>`).

**Khung trang**

| Thẻ | Tên đầy đủ | Dùng để làm gì | Trong dự án |
| --- | --- | --- | --- |
| `<html>` | HTML | Thẻ gốc, bọc toàn bộ trang | `<html lang="en">` |
| `<head>` | Head | Phần thông tin trang (không hiện ra màn hình) | chứa meta, title, link |
| `<meta>` | Metadata | Khai báo bảng mã, kích thước màn hình điện thoại | `charset`, `viewport` |
| `<title>` | Title | Tên trang hiện trên tab trình duyệt | "Intelly Dashboard" |
| `<link>` | Link | Nạp file bên ngoài (CSS, font) | `index.css`, Google Fonts, Font Awesome |
| `<body>` | Body | Phần nội dung hiện ra màn hình | |
| `<script>` | Script | Nạp / chạy JavaScript | thư viện supabase-js (CDN), `config.js`, `utils.js`, `data.js`, `storage.js`, `script.js` |

**Bố cục có ý nghĩa (semantic)** – giống `<div>` nhưng cho biết vai trò của vùng đó

| Thẻ | Dùng để làm gì | Trong dự án |
| --- | --- | --- |
| `<div>` | Hộp chứa chung, không có ý nghĩa riêng | dùng nhiều nhất (khung app, lưới lịch…) |
| `<aside>` | Phần phụ bên cạnh nội dung chính | sidebar đen bên trái |
| `<nav>` | Vùng menu điều hướng | menu General / Tools |
| `<main>` | Nội dung chính của trang (mỗi trang 1 cái) | toàn bộ phần bên phải |
| `<header>` | Phần đầu của một vùng | thanh tìm kiếm + nút tài khoản |
| `<section>` | Một khu vực nội dung | dòng "Stay up to date, Long" |
| `<article>` | Một khối nội dung độc lập | mỗi thẻ sự kiện (tạo bằng JS) |

**Chữ**

| Thẻ | Tên đầy đủ | Dùng để làm gì | Trong dự án |
| --- | --- | --- | --- |
| `<h1>` `<h2>` `<h3>` | Heading 1–3 | Tiêu đề, số càng nhỏ càng quan trọng | h1: lời chào, h2: logo, h3: tiêu đề modal |
| `<p>` | Paragraph | Định nghĩa các đoạn văn | "General", "Tools", mô tả bài viết |
| `<span>` | Span | Bọc 1 đoạn chữ nhỏ nằm trên cùng dòng | ngày `--/--`, avatar, nhãn "Offline" |
| `<small>` | Small | Chữ phụ, cỡ nhỏ (ghi chú, cảnh báo) | câu báo lỗi dưới từng ô trong form |
| `<i>` | Idiomatic Text / Icon | Gốc là chữ in nghiêng, nhưng ngày nay chủ yếu dùng để chèn icon bằng thư viện như Font Awesome | `<i class="fa-solid fa-gear">` |

**Danh sách & liên kết**

| Thẻ | Tên đầy đủ | Dùng để làm gì | Trong dự án |
| --- | --- | --- | --- |
| `<ul>` | Unordered list | Tạo 1 danh sách không đánh số thứ tự | 2 nhóm menu |
| `<li>` | List Item | Từng mục trong danh sách. **Bắt buộc** nằm trong `<ul>` (hoặc `<ol>`) | Dashboard, Schedule… |
| `<a>` | Anchor | Link tới trang / web khác | "Log out", file "Agenda.pdf" |

**Form & nút**

| Thẻ | Dùng để làm gì | Trong dự án |
| --- | --- | --- |
| `<button>` | Nút bấm | Add event, Today/Week/Month, ⋮, Join… |
| `<form>` | Bọc các ô nhập, gửi đi khi bấm nút `type="submit"` | form thêm/sửa sự kiện |
| `<label>` | Nhãn của ô nhập; bấm vào nhãn là focus vào ô | Title, Type, Date… |
| `<input>` | Ô nhập 1 dòng, kiểu do `type` quyết định | `search`, `date`, `time`, chữ thường |
| `<select>` + `<option>` | Danh sách thả xuống + từng lựa chọn | chọn loại sự kiện (option tạo bằng JS) |
| `<textarea>` | Ô nhập nhiều dòng | Description |

### 1.2 Thuộc tính (attribute)

Thuộc tính viết bên trong thẻ mở: `<thẻ tên="giá trị">`.

**Dùng chung cho mọi thẻ**

| Thuộc tính | Ý nghĩa | Ví dụ trong dự án |
| --- | --- | --- |
| `id` | Tên **duy nhất** trên trang, để JS/CSS tìm đúng 1 phần tử | `id="add-btn"` → `getElementById("add-btn")` |
| `class` | Tên nhóm (nhiều phần tử dùng chung), chủ yếu để CSS tạo kiểu | `class="event-card yellow"` |
| `title` | Chữ hiện ra khi rê chuột vào | `title="Refresh"` |
| `hidden` | Ẩn phần tử | modal, nút Delete khi thêm mới |
| `style` | Viết CSS trực tiếp trên thẻ | màu nền avatar (tạo bằng JS) |
| `tabindex` | Có cho phím Tab đi tới hay không (`-1` = bỏ qua) | ô chọn ngày ẩn |
| `lang` | Ngôn ngữ của trang | `<html lang="en">` |

**Link & nạp file**

| Thuộc tính | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `href` | Đường dẫn của link / file CSS | `href="index.css"`, `href="#"` (link chưa đi đâu) |
| `src` | Đường dẫn file script / ảnh | `src="script.js"` |
| `rel` | Quan hệ của file được nạp | `rel="stylesheet"`, `rel="preconnect"` |
| `crossorigin` | Cho phép nạp tài nguyên từ trang khác | Google Fonts |
| `charset` | Bảng mã chữ | `charset="UTF-8"` (hiện được tiếng Việt) |
| `name` + `content` | Cặp thông tin của `<meta>` | `name="viewport"` |
| `target` | Mở link ở đâu (**chưa dùng** trong dự án) | xem bên dưới |

`target` có các giá trị:
- `_self` (mặc định): mở liên kết ở chính trang đang mở
- `_blank`: mở qua tab mới
- `_parent`: mở trong khung cha hiện tại; nếu không có khung cha thì mở ở trang chính
- `_top`: mở đè lên toàn bộ cửa sổ, thoát khỏi mọi khung

**Form**

| Thuộc tính | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `type` | Kiểu ô nhập / nút | `type="date"`, `type="time"`, `type="search"`, `type="submit"`, `type="button"` |
| `name` | Tên ô, dùng khi đọc dữ liệu form bằng JS | `name="title"` → `fd.get("title")` |
| `placeholder` | Chữ gợi ý mờ khi ô trống | `placeholder="Search"` |
| `required` | Bắt buộc nhập | Title, Date, Start, End |
| `maxlength` | Số ký tự tối đa | `maxlength="60"` |
| `step` | Bước nhảy của ô số / giờ (giây) | `step="300"` = 5 phút |
| `rows` | Số dòng hiển thị của textarea | `rows="2"` |
| `novalidate` | Tắt kiểm tra mặc định của trình duyệt (để tự kiểm tra bằng JS) | `<form novalidate>` |
| `disabled` | Khoá nút, không bấm được | nút "Ended" |

**Trợ năng (cho người dùng trình đọc màn hình)**

| Thuộc tính | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `aria-label` | Tên đọc lên cho nút chỉ có icon | `aria-label="Close"` |
| `aria-hidden` | Ẩn khỏi trình đọc màn hình | ô chọn ngày ẩn |
| `aria-live` | Đọc lên khi nội dung thay đổi | toast thông báo |
| `aria-invalid` | Báo ô nhập đang sai | JS gán `"true"` khi ô có lỗi |
| `role` | Vai trò của phần tử | `role="status"` |

**Thuộc tính tự đặt `data-*`** – gắn thêm dữ liệu vào thẻ, JS đọc bằng `element.dataset`

| Thuộc tính | JS đọc | Dùng để |
| --- | --- | --- |
| `data-day="1"` | `cell.dataset.day` | đánh dấu cột ngày ở header |
| `data-view="week"` | `btn.dataset.view` | biết nút Today / Week / Month |
| `data-category="patients"` | `chip.dataset.category` | nút lọc "In:" |
| `data-close` | `querySelectorAll("[data-close]")` | các nút đóng modal |
| `data-id` | `card.dataset.id` | id sự kiện trên thẻ (gán bằng JS) |
| `data-action="delete"` | `...dataset.action` | biết bấm nút nào trong thẻ (edit/delete/join) |
| `data-date="2026-10-19"` | `cell.dataset.date` | ô ngày trong chế độ Month |
| `data-error-for="title"` | `el.dataset.errorFor` | chỗ hiện lỗi này thuộc ô nào trong form |

---

## Phần 2 – JavaScript

### 2.1 Cú pháp

| Cú pháp | Ý nghĩa | Ví dụ trong dự án |
| --- | --- | --- |
| `const` / `let` | Biến không gán lại được / gán lại được | `const START_HOUR = 7`, `let events = []` |
| `` `...${x}...` `` | Template literal, chèn biến vào chuỗi | `` `${monthName} ${formatShortDate(monday)}` `` |
| `const [a, b] = arr` | Destructuring mảng, tách mảng ra từng biến | `const [h, m] = time.split(":")` |
| `({ a, b }) => ...` | Destructuring object trong tham số | `({ ev, lane, lanes }) => ...` |
| `[...arr]`, `{ ...obj }` | Spread, sao chép / gộp mảng hoặc object | `{ ...events[index], ...data }` |
| `(x) => ...` | Arrow function, hàm viết gọn | `(ev) => ev.date === dateKey` |
| `function f(a = {})` | Tham số mặc định | `openModal(ev, preset = {})` |
| `a ? b : c` | Toán tử ba ngôi (if/else rút gọn) | `ev ? "Edit event" : "Add event"` |
| `a \|\| b` | Lấy `b` nếu `a` là falsy (`0`, `""`, `null`, `undefined`…) | `ev.tag \|\| "Education"` |
| `a?.b` | Optional chaining: `a` không có thì trả `undefined`, không báo lỗi | `window.crypto?.randomUUID` |
| `!` / `===` / `%` | Phủ định / so sánh bằng (cả kiểu) / chia lấy dư | `minutes % 60` |
| `/.../g` | Biểu thức chính quy (regex), cờ `g` là thay toàn bộ | `/&/g`, `/^\+\d+$/` |
| `for (...) { break; }` | Vòng lặp, `break` để thoát sớm | vẽ lưới tháng |
| `for (const x of arr)` | Duyệt từng phần tử, dùng được `return` để dừng hẳn hàm | `checkParticipants` |
| `while (điều kiện)` | Lặp khi điều kiện còn đúng | đẩy lần lượt hàng chờ lên Supabase |
| `const { a, ...rest } = obj` | Tách 1 trường ra, phần còn lại gom vào `rest` | bỏ `participantsText` khỏi dữ liệu form |
| `/[\p{L}\d]/u` | Regex có cờ `u`: `\p{L}` là mọi chữ cái (kể cả tiếng Việt) | kiểm tra tên viết tắt |
| `new X()` | Tạo object mới | `new Date()`, `new Set()`, `new FormData(form)` |
| `async` / `await` | Hàm bất đồng bộ / chờ kết quả (dùng khi lưu dữ liệu) | `events = await loadEvents()` |
| `try / catch / finally` | Thử chạy / bắt lỗi / luôn chạy cuối | `reloadEvents()`, `persist()` |

### 2.2 Hàm & đối tượng có sẵn của JS

**Ngày giờ – `Date`**

| Dùng | Ý nghĩa |
| --- | --- |
| `new Date()` | Thời điểm hiện tại |
| `new Date(y, m, d)` | Tạo ngày cụ thể (**tháng tính từ 0**: 0 = tháng 1) |
| `getFullYear()` / `getMonth()` / `getDate()` | Năm / tháng (0–11) / ngày trong tháng |
| `getDay()` | Thứ trong tuần (0 = Chủ Nhật, 1 = Thứ 2…) |
| `getHours()` / `getMinutes()` | Giờ / phút |
| `setDate()` / `setMinutes()` | Đổi ngày / phút (tự nhảy tháng nếu vượt) |
| `toDateString()` | Ngày dạng chữ, dùng để so 2 ngày |
| `Date.now()` | Số mili-giây hiện tại |
| `Date.UTC()`, `getUTCDay()`, `setUTCDate()`… | Bản theo giờ quốc tế, dùng khi tính số tuần |

**Chuỗi – `String`**

| Dùng | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `String(x)` | Đổi sang chuỗi | `String(7)` → `"7"` |
| `padStart(n, "0")` | Thêm ký tự vào đầu cho đủ độ dài | `"7".padStart(2, "0")` → `"07"` |
| `split(",")` | Cắt chuỗi thành mảng | `"07:30".split(":")` → `["07", "30"]` |
| `trim()` | Bỏ khoảng trắng 2 đầu | |
| `slice(0, 3)` | Lấy 1 đoạn | `"Monday".slice(0, 3)` → `"Mon"` |
| `replace(/x/g, "y")` | Thay thế | dùng trong `escapeHtml` |
| `toLowerCase()` / `toUpperCase()` | Chữ thường / chữ hoa | tìm kiếm, tên viết tắt |
| `includes("x")` | Có chứa không | lọc tìm kiếm |
| `charCodeAt(i)` | Mã số của ký tự | chọn màu avatar |

**Mảng – `Array`**

| Dùng | Ý nghĩa |
| --- | --- |
| `push(x)` | Thêm vào cuối |
| `splice(i, n)` / `splice(i, 0, x)` | Xoá n phần tử tại vị trí i / chèn x vào vị trí i |
| `map` / `filter` / `forEach` | Biến đổi / lọc / duyệt từng phần tử |
| `find` / `findIndex` | Tìm phần tử / tìm vị trí (không thấy thì `-1`) |
| `sort((a, b) => ...)` | Sắp xếp |
| `reduce` | Gộp cả mảng thành 1 giá trị (cộng mã ký tự) |
| `join(", ")` | Nối mảng thành chuỗi |
| `slice(0, 4)` | Lấy 4 phần tử đầu |
| `length` | Số phần tử |

**Khác**

| Dùng | Ý nghĩa |
| --- | --- |
| `Math.floor` / `Math.ceil` / `Math.max` / `Math.min` / `Math.random` | Làm tròn xuống / lên, lớn nhất, nhỏ nhất, số ngẫu nhiên |
| `Number(x)` | Đổi sang số |
| `Object.entries(obj)` / `Object.keys(obj)` | Object → mảng các cặp `[key, value]` / mảng các key |
| `new Set()` + `add` / `delete` / `has` / `size` | Tập hợp không trùng (bộ lọc đang bật) |
| `JSON.stringify` / `JSON.parse` | Object → chuỗi / chuỗi → object (để lưu localStorage) |
| `crypto.randomUUID()` | Tạo id ngẫu nhiên không trùng |
| `setTimeout` / `clearTimeout` / `setInterval` | Chạy sau x ms / huỷ / lặp lại mỗi x ms |
| `console.warn` / `console.error` | In cảnh báo / lỗi ra Console (F12) |
| `localStorage.getItem` / `setItem` | Đọc / ghi dữ liệu lưu trên trình duyệt |
| `fetch(url, options)` | Gửi request lên server (supabase-js dùng bên trong) |
| `new AbortController()` + `abort()` | Huỷ 1 request đang chờ (dùng để giới hạn 8 giây) |
| `navigator.onLine` | Trình duyệt có đang báo là có mạng không |
| `promise.finally(fn)` | Chạy `fn` khi Promise xong, dù thành công hay lỗi |

### 2.3 DOM – JS điều khiển HTML

**Tìm & tạo phần tử**

| Dùng | Ý nghĩa |
| --- | --- |
| `document.getElementById("id")` | Tìm 1 phần tử theo `id` |
| `document.querySelector(".class")` | Tìm phần tử **đầu tiên** khớp CSS selector |
| `document.querySelectorAll(".class")` | Tìm **tất cả** phần tử khớp |
| `document.createElement("div")` | Tạo thẻ mới (chưa hiện ra) |
| `parent.appendChild(el)` / `append(el)` | Gắn vào cuối phần tử cha |
| `parent.insertBefore(el, ref)` | Gắn vào trước phần tử `ref` |
| `el.closest(".class")` | Đi ngược lên tìm phần tử cha gần nhất khớp |

**Thuộc tính của phần tử**

| Dùng | Ý nghĩa |
| --- | --- |
| `el.textContent` | Đặt chữ (an toàn, không hiểu HTML) |
| `el.innerHTML` | Đặt cả HTML bên trong (chữ người dùng phải qua `escapeHtml`) |
| `el.className` | Đặt toàn bộ class |
| `el.classList.add / remove / toggle / contains` | Thêm / bỏ / bật-tắt / kiểm tra 1 class |
| `el.dataset.xxx` | Đọc / ghi thuộc tính `data-xxx` |
| `el.style.top = "10px"` | Đặt CSS trực tiếp |
| `el.hidden = true` | Ẩn / hiện |
| `el.value` | Giá trị ô nhập |
| `el.tabIndex` | Cho phép Tab tới |
| `el.focus()` / `el.click()` | Đặt con trỏ vào / giả lập bấm |
| `el.setAttribute("aria-invalid", "true")` | Đặt 1 thuộc tính HTML |
| `el.getBoundingClientRect()` | Vị trí, kích thước trên màn hình |
| `el.scrollTo({ top })` | Cuộn tới vị trí |
| `input.showPicker()` | Mở bảng chọn ngày của trình duyệt |
| `document.documentElement.style.setProperty("--x", v)` | Đặt biến CSS |

**Sự kiện (event)**

| Dùng | Ý nghĩa |
| --- | --- |
| `el.addEventListener("click", fn)` | Chạy `fn` khi có sự kiện |
| `"DOMContentLoaded"` | HTML đã nạp xong |
| `"click"` / `"input"` / `"change"` / `"submit"` / `"keydown"` | Bấm / gõ chữ / đổi giá trị / gửi form / nhấn phím |
| `e.target` | Phần tử bị bấm |
| `e.key` | Phím được nhấn (`"Enter"`, `"Escape"`) |
| `e.clientY` | Toạ độ dọc của chuột |
| `e.preventDefault()` | Chặn hành động mặc định (ví dụ form tải lại trang) |
| `form.elements["title"]` | Lấy ô nhập trong form theo `name` |
| `new FormData(form)` + `fd.get("title")` | Đọc toàn bộ dữ liệu form |
| `window.matchMedia("(max-width: 1000px)")` | Kiểm tra kích thước màn hình (giống `@media` trong CSS) |
| `window.addEventListener("online", fn)` | Trình duyệt báo vừa có mạng lại |
| `window.dispatchEvent(new Event("tên"))` | Tự phát 1 "tín hiệu" để file khác nghe (storage.js → script.js) |

### 2.4 Hàm tự viết trong dự án

Thứ tự nạp trong `index.html`: supabase-js (CDN) → `config.js` → `utils.js` → `data.js` → `storage.js` → `script.js`
(file được dùng đặt trước, file đi dùng đặt sau)

**`config.js` – thông tin kết nối Supabase** (bạn tự điền, xem [Phần 3](#phần-3--supabase-lưu-dữ-liệu-online))

| Hằng | Làm gì |
| --- | --- |
| `SUPABASE_URL` | Địa chỉ project, dạng `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Publishable key (`sb_publishable_...`) hoặc anon key |

**`utils.js` – hàm tiện ích (chỉ tính toán, không đụng HTML)**

| Hàm | Làm gì | Ví dụ |
| --- | --- | --- |
| `pad(n)` | Thêm số 0 phía trước cho đủ 2 chữ số | `pad(7)` → `"07"` |
| `toDateKey(date)` | Date → chuỗi ngày | → `"2026-10-19"` |
| `fromDateKey(key)` | Chuỗi ngày → Date | `"2026-10-19"` → Date |
| `toMinutes(time)` | Giờ → số phút từ 00:00 | `"07:30"` → `450` |
| `toTime(minutes)` | Số phút → giờ | `450` → `"07:30"` |
| `nowMinutes()` | Số phút từ 00:00 đến bây giờ | lúc 07:30 → `450` |
| `formatShortDate(date)` | Date → "ngày/tháng" | → `"19/10"` |
| `addDays(date, n)` | Cộng thêm n ngày | |
| `isSameDay(a, b)` | 2 ngày có trùng không | `true` / `false` |
| `getMonday(date)` | Tìm Thứ 2 của tuần | |
| `getWeekNumber(date)` | Số tuần trong năm (chuẩn ISO) | → `43` |
| `escapeHtml(text)` | Chống chèn HTML khi hiện chữ người dùng nhập | `"<b>"` → `"&lt;b&gt;"` |
| `layoutDayEvents(list)` | Chia làn cho các sự kiện trùng giờ | → `[{ ev, lane, lanes }]` |
| `createId()` | Tạo id không trùng cho sự kiện mới | → `"8151a767-…"` |
| `checkParticipants(text)` | Kiểm tra ô Participants, trả về câu báo lỗi (hợp lệ thì `""`) | `"TY, ABCD"` → `"\"ABCD\" is not valid..."` |
| `parseParticipants(text)` | Đọc ô Participants (sau khi đã kiểm tra) | `"TY, AB, +3"` → `{ participants: ["TY","AB"], extra: 3 }` |

**`data.js` – dữ liệu cố định & dữ liệu mẫu**

| Hàm / hằng | Làm gì |
| --- | --- |
| `DAY_NAMES`, `MONTH_NAMES` | Tên thứ, tên tháng |
| `EVENT_TYPES` | 8 loại sự kiện: tên, icon, màu, nhóm lọc |
| `AVATAR_COLORS` | Màu nền avatar |
| `getEventType(ev)` | Lấy thông tin loại của 1 sự kiện (loại lạ → `emergency`) |
| `createSampleEvents()` | Tạo 29 sự kiện mẫu trong tuần hiện tại (**hiện chưa dùng**: đã chọn bảng trống thì lịch trống) |

**`storage.js` – lưu trữ (Supabase + bản sao trên máy)**

| Nhóm | Hàm | Làm gì |
| --- | --- | --- |
| script.js gọi | `loadEvents()` | Lấy toàn bộ sự kiện từ Supabase (mất mạng → lấy bản sao trên máy) |
| | `addEvent(ev)` / `updateEvent(ev)` | Thêm / sửa 1 sự kiện (đều dùng "upsert") |
| | `removeEvent(id)` | Xoá 1 sự kiện |
| Lưu | `save(change)` | Cập nhật bản sao, gửi lên Supabase; mất mạng thì cho vào hàng chờ |
| | `send(change)` | Gửi 1 thay đổi: `true` = xong, `false` = mất mạng, ném lỗi = database từ chối |
| Đồng bộ | `syncPending()` / `pushPending()` | Đẩy lần lượt hàng chờ lên Supabase (không cho chạy 2 lần cùng lúc) |
| | `tryReconnect()` | Có mạng lại (hoặc mỗi 30 giây) thì thử kết nối, đẩy hàng chờ, báo `storage-online` |
| | `goOffline()` | Chuyển sang Offline, báo `storage-offline` |
| Kết nối | `createDatabaseClient()` | Tạo kết nối Supabase (chưa điền config / không tải được thư viện → `null`) |
| | `fetchWithTimeout()` | `fetch` có giới hạn 8 giây |
| | `isNetworkError(error, status)` | Phân biệt lỗi mạng với lỗi database từ chối |
| Đổi tên trường | `toRow(ev)` / `fromRow(row)` | `start/end` ↔ `start_time/end_time`, cắt giây `"07:30:00"` → `"07:30"` |
| Trên máy | `applyToCache` / `readCache` / `writeCache` | Bản sao dữ liệu trong localStorage |
| | `readPending` / `writePending` / `readJson` | Hàng chờ các thay đổi chưa đẩy lên |

**`script.js` – giao diện**

| Nhóm | Hàm | Làm gì |
| --- | --- | --- |
| Lưu trữ | `reloadEvents()` | Nạp lại dữ liệu rồi vẽ lại, lỗi thì báo |
| | `persist(action)` | Chạy 1 thao tác lưu; database từ chối thì nạp lại dữ liệu thật rồi báo |
| Dựng khung | `buildGrid()` | Tạo cột giờ + 7 cột ngày |
| | `buildTypeOptions()` | Tạo các `<option>` loại sự kiện |
| Vẽ | `render()` | Vẽ lại theo chế độ Week / Month |
| | `renderDateLabel()` | Chữ trên nút ngày ("Oct 19/10 - 25/10") |
| | `renderWeek()` / `renderMonth()` | Vẽ lịch tuần / tháng |
| | `createEventCard(ev)` | Tạo 1 thẻ sự kiện |
| | `createAvatars(ev)` | Tạo hàng avatar người tham gia |
| | `createJoinButton(ev)` | Nút Join / In progress… / Ended theo giờ |
| | `updateNowLine()` / `scrollToNow()` | Đường kẻ giờ hiện tại / cuộn tới giờ hiện tại |
| Lọc | `matchesFilters(ev)` | Sự kiện có khớp ô tìm kiếm + nút lọc không |
| Modal | `openModal(ev, preset)` / `closeModal()` | Mở / đóng form thêm-sửa |
| | `defaultDateKey()` | Ngày mặc định khi thêm mới |
| | `updateTagField()` | Chỉ hiện ô Tag khi loại là bài viết |
| | `readForm()` | Đọc dữ liệu đang nhập trong form (chưa kiểm tra) |
| | `handleFormInput(e)` | Kiểm tra ngay khi người dùng gõ / chọn |
| | `validateForm(data)` | Kiểm tra từng ô theo đúng luật của bảng `events`, trả về `{ tên ô: "câu báo lỗi" }` |
| | `showFieldErrors(errors)` | Hiện lỗi đỏ ngay dưới ô sai (chỉ ô người dùng đã đụng tới) |
| | `handleSubmit(e)` | Bấm Save: còn lỗi thì báo + đưa con trỏ tới ô sai, **không lưu**; hợp lệ mới lưu |
| | `deleteEvent(id)` | Xoá sự kiện (có Undo) |
| Khác | `showToast(message, action)` | Thông báo nhỏ ở đáy màn hình |
| | `autoCollapseSidebar()` | Màn hình nhỏ thì thu gọn sidebar |
| | `bindEvents()` | Gắn tất cả sự kiện click / input… |
| | `moveDate(step)` | Lùi / tiến 1 tuần hoặc 1 tháng |

### 2.5 Biến / hằng quan trọng

| Tên | File | Ý nghĩa |
| --- | --- | --- |
| `START_HOUR`, `END_HOUR` | script.js | Lịch từ 07:00 đến 18:00 |
| `SLOT_MINUTES`, `SLOT_HEIGHT` | script.js | Mỗi ô 30 phút cao 100px |
| `PX_PER_MINUTE` | script.js | Số px cho 1 phút (để đặt vị trí thẻ) |
| `SUPABASE_URL`, `SUPABASE_KEY` | config.js | Thông tin kết nối Supabase |
| `CACHE_KEY` | storage.js | Khoá bản sao dữ liệu trong localStorage: `"intelly-events"` |
| `PENDING_KEY` | storage.js | Khoá hàng chờ trong localStorage: `"intelly-pending"` |
| `REQUEST_TIMEOUT`, `RETRY_INTERVAL` | storage.js | Chờ tối đa 8 giây / Offline thì 30 giây thử lại 1 lần |
| `db`, `isOffline` | storage.js | Kết nối Supabase / đang Offline hay không |
| `events` | script.js | Danh sách sự kiện đang hiển thị |
| `currentDate`, `currentView` | script.js | Đang xem ngày nào, chế độ Week hay Month |
| `searchQuery`, `activeCategories` | script.js | Chữ đang tìm, các nút lọc đang bật |
| `editMode`, `editingId` | script.js | Đang bật chế độ xoá nhanh? Đang sửa sự kiện nào? |
| `touchedFields` | script.js | Các ô trong form người dùng đã đụng tới (để biết hiện lỗi ở đâu) |

---

## Phần 3 – Supabase (lưu dữ liệu online)

### 3.1 Điền thông tin kết nối

Mở `FE_todo_web_app/config.js`, thêm 2 dòng:

```js
const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE"; // ví dụ: https://abcxyz.supabase.co
const SUPABASE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE"; // ví dụ: sb_publishable_xxxxxxxx
```

Lấy ở Supabase: **Project Settings → API Keys** (hoặc nút **Connect** ở đầu dashboard).

- Chỉ dùng **Publishable key** (`sb_publishable_...`) hoặc **anon key**. Key này được thiết kế để nằm trong code web, lên GitHub cũng được; dữ liệu được bảo vệ bằng RLS.
- **Không bao giờ** dán **secret key** (`sb_secret_...`), **service_role key** hay mật khẩu database.
- Chưa điền thì web vẫn chạy ở chế độ Offline (chỉ lưu trên máy).

### 3.2 Web lưu dữ liệu thế nào

```
Online :  script.js ──> storage.js ──> Supabase (bảng events)
                                   └─> bản sao trên máy (localStorage)
Offline:  script.js ──> storage.js ──> bản sao trên máy + hàng chờ
Có mạng lại: hàng chờ ──> Supabase, rồi tải lại dữ liệu mới nhất
```

- **Kiểm tra trước khi lưu:** form kiểm tra từng ô theo đúng luật của bảng `events` (độ dài, giờ, loại, người tham gia…). Sai thì báo đỏ ngay dưới ô và **không gửi đi**.
- **Offline:** nhãn hồng "Offline – changes are saved on this device" hiện cạnh nút chọn ngày. Thêm / sửa / xoá vẫn làm được, được xếp vào hàng chờ.
- **Có mạng lại:** khi trình duyệt báo có mạng, hoặc cứ mỗi 30 giây, web tự đẩy hàng chờ lên Supabase, tải lại dữ liệu và báo "Back online – changes synced".
- **Bảng trống thì lịch trống** (không tự tạo dữ liệu mẫu).

### 3.3 Kiểm tra sau khi điền config

1. Mở web → không thấy nhãn Offline, lịch trống (bảng còn trống).
2. Thêm 1 sự kiện → Supabase **Table Editor → events** có thêm 1 dòng.
3. Mở web bằng trình duyệt khác / tab ẩn danh → thấy đúng sự kiện đó.
4. Xoá 1 dòng trực tiếp trên Supabase → bấm nút Refresh trên web → sự kiện biến mất.
5. Tắt mạng (DevTools F12 → Network → Offline) → thêm sự kiện → nhãn Offline hiện.
   Bật mạng lại → vài giây sau báo "Back online", Supabase có dòng mới.

### 3.4 Giới hạn (bản tạm)

- Chưa có đăng nhập: **ai có link web đều xem / sửa / xoá được**.
- 2 người sửa cùng 1 sự kiện: người lưu sau thắng.
- Sửa khi Offline một sự kiện mà người khác đã xoá → khi có mạng, sự kiện đó được tạo lại.
