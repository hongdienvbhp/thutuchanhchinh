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
  // Do not let a duplicated/stale UUID route two distinct procedure codes to one record.
  const formalityIdCounts = new Map();
  for (const item of rows) {
    const formalityId = String(item.formalityId || "").trim();
    if (formalityId) formalityIdCounts.set(formalityId, (formalityIdCounts.get(formalityId) || 0) + 1);
  }
  const keywordFallbackHref = item => {
    const code = String(item.ma || "").trim();
    const fallback = String(item.dvcKeywordUrl || "").trim();
    if (fallback) {
      try {
        const url = new URL(fallback);
        if (
          url.origin === "https://dichvucong.gov.vn" &&
          url.pathname === "/tim-kiem-thu-tuc-hanh-chinh" &&
          url.searchParams.get("keyword") === code
        ) return url.href;
      } catch {
        // Invalid/non-canonical link falls through to a deterministic code search.
      }
    }
    return `https://dichvucong.gov.vn/tim-kiem-thu-tuc-hanh-chinh?keyword=${encodeURIComponent(code)}`;
  };
  const procedureHref = item => {
    const formalityId = String(item.formalityId || "").trim();
    const mappingStatus = String(item.priority51MappingStatus || "").toLowerCase();
    const forcedKeywordFallback = mappingStatus === "verified_keyword_fallback";
    if (formalityId && formalityIdCounts.get(formalityId) === 1 && !forcedKeywordFallback) {
      return `https://dichvucong.gov.vn/tim-kiem-thu-tuc-hanh-chinh?formalityId=${encodeURIComponent(formalityId)}`;
    }
    return keywordFallbackHref(item);
  };
  container.innerHTML = rows.map((item, index) => {
    const href = procedureHref(item);
    return `<div class="card"><div class="number-tag">${index + 1}</div><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="btn-link" data-code="${escapeHtml(item.ma)}">${escapeHtml(item.ten)}</a></div>`;
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