/* Bản đồ ăn chơi Việt Nam — vanilla JS + Leaflet */
const LOAI = {
  choi: { label: "Chơi", emoji: "🌄", color: "#2e7d32" },
  an:   { label: "Ăn",   emoji: "🍜", color: "#e8590c" },
  uong: { label: "Uống", emoji: "☕", color: "#1565c0" },
};

const state = { data: [], loai: "all", vung: "all", q: "", markers: new Map(), active: null };

let map = null, layer = null;
const hasLeaflet = typeof L !== "undefined";
if (hasLeaflet) {
  try {
    map = L.map("map", { zoomControl: true }).setView([16.2, 107.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
  } catch (e) {
    console.warn("Không khởi tạo được bản đồ:", e);
  }
}
if (!map) {
  const el = document.getElementById("map");
  if (el) el.innerHTML = '<div style="padding:20px;color:#6b7280">Không tải được bản đồ (mất kết nối). Danh sách và tìm kiếm bên trái vẫn dùng được.</div>';
}

function pinIcon(loai) {
  const c = (LOAI[loai] || {}).color || "#555";
  const e = (LOAI[loai] || {}).emoji || "📍";
  return L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${c}"><span>${e}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

function stars(n) {
  if (!n && n !== 0) return "";
  const full = Math.round(n);
  return `<span class="stars">${"★".repeat(full)}${"☆".repeat(Math.max(0, 5 - full))} ${Number(n).toFixed(1)}</span>`;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

function popupHtml(d) {
  const meta = [d.tinh, d.vung].filter(Boolean).join(" · ");
  const img = (d.anh && d.anh[0]) ? `<img src="${esc(d.anh[0])}" alt="${esc(d.ten)}" loading="lazy">` : "";
  const acts = [];
  if (d.googleMap) acts.push(`<a class="btn" href="${esc(d.googleMap)}" target="_blank" rel="noopener">📍 Google Map</a>`);
  else if (d.toado) acts.push(`<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${d.toado[0]},${d.toado[1]}" target="_blank" rel="noopener">📍 Google Map</a>`);
  if (d.video) acts.push(`<a class="btn alt" href="${esc(d.video)}" target="_blank" rel="noopener">▶️ Video</a>`);
  return `<div class="popup">
    <h4>${(LOAI[d.loai]||{}).emoji||""} ${esc(d.ten)}</h4>
    <div class="meta">${esc(meta)} ${d.danhgia ? "· " + stars(d.danhgia) : ""}</div>
    ${img}
    ${d.mota ? `<div>${esc(d.mota)}</div>` : ""}
    <div class="acts">${acts.join("")}</div>
  </div>`;
}

function matches(d) {
  if (state.loai !== "all" && d.loai !== state.loai) return false;
  if (state.vung !== "all" && d.vung !== state.vung) return false;
  if (state.q) {
    const hay = [d.ten, d.tinh, d.vung, d.mota, (d.tags || []).join(" ")].join(" ").toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}

function render() {
  if (layer) layer.clearLayers();
  state.markers.clear();
  const list = document.getElementById("list");
  list.innerHTML = "";
  const shown = state.data.filter(matches);

  shown.forEach((d, i) => {
    if (layer && Array.isArray(d.toado) && d.toado.length === 2) {
      const m = L.marker(d.toado, { icon: pinIcon(d.loai) }).bindPopup(popupHtml(d));
      m.on("popupopen", () => setActive(d._id));
      layer.addLayer(m);
      state.markers.set(d._id, m);
    }
    const c = (LOAI[d.loai] || {});
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = d._id;
    card.innerHTML = `
      <div class="row">
        <span class="dot" style="background:${c.color || "#555"}"></span>
        <h4>${esc(d.ten)}</h4>
      </div>
      <div class="meta">${c.emoji || ""} ${esc([d.tinh, d.vung].filter(Boolean).join(" · "))} ${d.danhgia ? "· " + stars(d.danhgia) : ""}</div>
      ${d.mota ? `<div class="desc">${esc(d.mota)}</div>` : ""}`;
    card.addEventListener("click", () => focus(d._id));
    list.appendChild(card);
  });

  document.getElementById("count").textContent = `${shown.length} địa điểm`;
}

function setActive(id) {
  state.active = id;
  document.querySelectorAll(".card").forEach((c) => c.classList.toggle("on", c.dataset.id === id));
  const el = document.querySelector(`.card[data-id="${id}"]`);
  if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function focus(id) {
  const d = state.data.find((x) => x._id === id);
  if (!d) return;
  if (map && d.toado) map.flyTo(d.toado, Math.max(map.getZoom(), 13), { duration: 0.6 });
  const m = state.markers.get(id);
  if (m) m.openPopup();
  setActive(id);
}

/* Filters + search */
function wireChips(containerId, key) {
  document.getElementById(containerId).addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    document.querySelectorAll(`#${containerId} .chip`).forEach((c) => c.classList.remove("active"));
    b.classList.add("active");
    state[key] = b.dataset[key];
    render();
  });
}
wireChips("loaiFilters", "loai");
wireChips("vungFilters", "vung");

let t;
document.getElementById("search").addEventListener("input", (e) => {
  clearTimeout(t);
  t = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); render(); }, 150);
});

/* Modal */
document.getElementById("btnAdd").addEventListener("click", () => (document.getElementById("modal").hidden = false));
document.getElementById("modalClose").addEventListener("click", () => (document.getElementById("modal").hidden = true));
document.getElementById("modal").addEventListener("click", (e) => { if (e.target.id === "modal") e.target.hidden = true; });

/* Load data */
fetch("data/diadiem.json?v=" + Date.now())
  .then((r) => r.json())
  .then((rows) => {
    state.data = rows.map((d, i) => ({ ...d, _id: "p" + i }));
    render();
    const pts = state.data.filter((d) => Array.isArray(d.toado));
    if (map && pts.length) {
      const b = L.latLngBounds(pts.map((d) => d.toado));
      map.fitBounds(b.pad(0.15));
    }
  })
  .catch((err) => {
    document.getElementById("list").innerHTML = `<div class="card">Không tải được dữ liệu: ${esc(err.message)}</div>`;
  });
