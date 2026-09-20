const CANONICAL_URL = "https://raw.githubusercontent.com/hongdienvbhp/BangNiemYetVinhBao/main/data/thu-tuc.json";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

async function renderCanonicalPriorityView() {
  const container = document.querySelector(".container");
  if (!container) return;
  const response = await fetch(CANONICAL_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.format !== "bangniemyet-vinhbao-master-data" || !data.dataset_version || !data.source_commit) {
    throw new Error("Canonical contract không hợp lệ");
  }
  const rows = (data.thuTuc || []).filter(item => item.priority51 === true);
  document.querySelector("h1").textContent = `Danh mục ${rows.length} thủ tục hành chính trọng điểm`;
  const version = document.createElement("p");
  version.id = "dataset-version";
  version.style.textAlign = "center";
  version.textContent = `Dữ liệu: ${data.dataset_version} · nguồn ${data.source_commit.slice(0, 12)}`;
  document.querySelector("h1").after(version);
  container.innerHTML = rows.map((item, index) => {
    const href = item.formalityId
      ? `https://dichvucong.gov.vn/tim-kiem-thu-tuc-hanh-chinh?formalityId=${encodeURIComponent(item.formalityId)}`
      : "#";
    return `<div class="card"><div class="number-tag">${index + 1}</div><a href="${href}" target="_blank" rel="noopener noreferrer" class="btn-link" data-code="${escapeHtml(item.ma)}">${escapeHtml(item.ten)}</a></div>`;
  }).join("");
}

renderCanonicalPriorityView().catch(error => {
  console.error("Không tải được canonical TTHC.", error);
  const container = document.querySelector(".container");
  const heading = document.querySelector("h1");
  if (heading) heading.textContent = "Chưa tải được dữ liệu thủ tục hành chính";
  if (container) {
    container.innerHTML = '<p class="canonical-error">Không thể tải nguồn dữ liệu canonical. Vui lòng thử lại sau; trang không hiển thị dữ liệu cũ thay thế.</p>';
  }
});