const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");
const todoApp = document.querySelector(".todo-app");

document.addEventListener("DOMContentLoaded", () => {
  if (toggleBtn && sidebar && todoApp) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      todoApp.classList.toggle("collapsed-mode");
    });
  }
  renderCurrentWeek();
});

// Hàm tính và hiển thị ngày tháng thực tế
function renderCurrentWeek() {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0: Chủ Nhật, 1: T2, ..., 6: T7

  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);

  // Tìm tất cả các ô tiêu đề có chứa attribute data-day
  const dayCells = document.querySelectorAll(
    ".grid-header .header-cell[data-day]",
  );

  dayCells.forEach((cell, index) => {
    // Cộng số ngày tương ứng từ Thứ 2 đến Thứ 7
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + index);

    // Định dạng chuỗi ngày/tháng (ví dụ: 09/09)
    const dayString = String(nextDay.getDate()).padStart(2, "0");
    const monthString = String(nextDay.getMonth() + 1).padStart(2, "0");

    // Điền ngày vào thẻ span.day-date
    const dateSpan = cell.querySelector(".day-date");
    if (dateSpan) {
      dateSpan.textContent = `${dayString}/${monthString}`;
    }

    // Tự động tô đen (active-day) nếu cột trùng với ngày hôm nay
    if (nextDay.toDateString() === today.toDateString()) {
      cell.classList.add("active-day");
    } else {
      cell.classList.remove("active-day");
    }
  });
}
