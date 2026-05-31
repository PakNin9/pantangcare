import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, set, onValue, get } from "firebase/database";

// ─── FIREBASE SYNC ────────────────────────────────────────────────────────────
function genRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PC-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Firebase converts arrays to objects — this converts them back
function toArr(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
}

async function saveRoom(roomCode, data) {
  try {
    await set(ref(db, "rooms/" + roomCode), { ...data, _ts: Date.now() });
  } catch(e) { console.warn("Firebase save error:", e); }
}

async function loadRoom(roomCode) {
  try {
    const snap = await get(ref(db, "rooms/" + roomCode));
    return snap.exists() ? snap.val() : null;
  } catch(e) { return null; }
}

function subscribeRoom(roomCode, callback) {
  return onValue(ref(db, "rooms/" + roomCode), (snap) => {
    if (snap.exists()) callback(snap.val());
  });
}

function buildShareUrl(roomCode) {
  return window.location.origin + window.location.pathname + "?room=" + roomCode;
}

function getUrlRoom() {
  try { return new URLSearchParams(window.location.search).get("room"); }
  catch(e) { return null; }
}





// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  pemakanan: { color: "#E8A87C", bg: "#FDF3EC", icon: "🍚" },
  penjagaan: { color: "#7CB8E8", bg: "#EDF5FD", icon: "👶" },
  senaman:   { color: "#A8E87C", bg: "#F0FDE8", icon: "🤸" },
  rehat:     { color: "#C47CE8", bg: "#F5EDFD", icon: "😴" },
  perubatan: { color: "#E87C7C", bg: "#FDEEED", icon: "💊" },
};

const ROLES = {
  suami:   { color: "#2D6A4F", bg: "#D8F3DC", avatar: "👨" },
  isteri:  { color: "#9B2335", bg: "#FADDE1", avatar: "👩" },
  bersama: { color: "#7B5EA7", bg: "#E8E0F5", avatar: "👫" },
};

const INITIAL_TASKS = [
  { id: 1, assignedTo: "isteri", category: "pemakanan", title: "Minum air halia merah", time: "07:00", desc: "Rebus halia merah, minum panas-panas sebelum sarapan", done: false, comments: [{ by: "suami", text: "Dah siapkan halia dalam periuk ya sayang 💚", time: "06:45" }] },
  { id: 2, assignedTo: "suami",  category: "penjagaan", title: "Tukar lampin & mandikan baby", time: "08:00", desc: "Lap badan, tukar lampin, pakaikan baju baby", done: false, comments: [] },
  { id: 3, assignedTo: "isteri", category: "senaman",   title: "Urut perut pantang", time: "10:00", desc: "Urut lembut mengikut arahan mak bidan, 15 minit", done: false, comments: [] },
  { id: 4, assignedTo: "suami",  category: "pemakanan", title: "Masak bubur nasi + ikan haruan", time: "11:30", desc: "Bubur pekat untuk isteri, tambah halia dan bawang putih", done: true, comments: [{ by: "isteri", text: "Sedap sangat! Terima kasih abang ❤️", time: "12:10" }] },
  { id: 5, assignedTo: "isteri", category: "rehat",     title: "Tidur tengah hari", time: "13:00", desc: "Rehat sekurang-kurangnya 1 jam. Jangan stress.", done: false, comments: [] },
  { id: 6, assignedTo: "suami",  category: "penjagaan", title: "Susukan bayi (botol EBM)", time: "14:00", desc: "Ambil EBM dari peti, suamkan, susu baby", done: false, comments: [] },
  { id: 7, assignedTo: "bersama",category: "perubatan", title: "Minum supplement Shaklee", time: "15:00", desc: "Isteri: Vivix + ESP. Suami: Vita-E + B-Complex", done: false, comments: [] },
];

const INITIAL_MENU = [
  { id: 1, meal: "sarapan",   title: "Bubur nasi ikan haruan", bahan: ["Beras", "Ikan haruan", "Halia", "Bawang putih"], tag: "galak", masak: true, komen: [{ by: "isteri", text: "Sedap dan mengenyangkan 😊", time: "08:30" }] },
  { id: 2, meal: "tengahari", title: "Ayam masak kunyit", bahan: ["Ayam kampung", "Kunyit hidup", "Serai", "Halia"], tag: "galak", masak: false, komen: [] },
  { id: 3, meal: "malam",     title: "Sup tulang + sayur bayam", bahan: ["Tulang sapi", "Bayam", "Bawang putih", "Garam"], tag: "galak", masak: false, komen: [] },
  { id: 4, meal: "snek",      title: "Air rebusan akar kayu", bahan: ["Akar kayu pantang", "Air", "Gula melaka sedikit"], tag: "hati", masak: true, komen: [] },
];

const INITIAL_LOG = [
  { id: 1, date: "Hari 7", mood: "😊", sakit: "Rendah", demam: false, pumping: "180ml", berat: "58.5", nota: "Rasa lebih bertenaga hari ni" },
];

const INITIAL_BIDAN = [
  { id: 1, kategori: "Pemakanan", arahan: "Elakkan makanan sejuk dan bergas. Makan makanan hangat sahaja semasa pantang.", penting: true },
  { id: 2, kategori: "Aktiviti", arahan: "Jangan angkat benda berat melebihi 2kg dalam 2 minggu pertama. Rehat adalah ubat.", penting: true },
  { id: 3, kategori: "Urutan", arahan: "Urut perut setiap pagi dan petang menggunakan minyak kelapa dara. Tekan lembut ke atas.", penting: false },
  { id: 4, kategori: "Penjagaan Luka", arahan: "Lap kawasan jahitan dengan kain lembut selepas mandi. Jangan guna sabun beralkohol.", penting: true },
  { id: 5, kategori: "Supplement", arahan: "Minum Vivix dan ESP Shaklee setiap hari untuk pemulihan tenaga dan susu badan.", penting: false },
];

const PANTANG_LARANG = [
  { bahan: "Ais & minuman sejuk", sebab: "Melambatkan kecutan rahim", status: "larang" },
  { bahan: "Sayur kobis & kembang kol", sebab: "Menyebabkan gas berlebihan", status: "larang" },
  { bahan: "Makanan pedas", sebab: "Boleh mempengaruhi rasa susu badan", status: "hati" },
  { bahan: "Ikan haruan", sebab: "Mempercepatkan penyembuhan luka", status: "galak" },
  { bahan: "Halia & kunyit", sebab: "Memanaskan badan dan anti-radang", status: "galak" },
  { bahan: "Daging merah", sebab: "Makan secara sederhana sahaja", status: "hati" },
];

// ─── DATA KHAS CAESAR ─────────────────────────────────────────────────────────
const CZER_EXTRA_TASKS = [
  { id: 901, assignedTo: "isteri", category: "perubatan", title: "Periksa luka czer pagi", time: "08:30", desc: "Semak luka — pastikan tiada bengkak, kemerahan, atau nanah. Minta suami bantu semak bahagian yang susah nampak.", done: false, comments: [], czerOnly: true },
  { id: 902, assignedTo: "suami",  category: "penjagaan", title: "Bantu isteri ke tandas", time: "07:30", desc: "Isteri czer susah bergerak sendiri pada minggu pertama. Bantu bangkit perlahan dari katil, sokong pinggang.", done: false, comments: [], czerOnly: true },
  { id: 903, assignedTo: "isteri", category: "perubatan", title: "Minum ubat tahan sakit", time: "09:00", desc: "Ambil ubat yang ditetapkan doktor. Jangan skip walaupun rasa dah okay — luka dalam masih proses sembuh.", done: false, comments: [], czerOnly: true },
  { id: 904, assignedTo: "bersama",category: "perubatan", title: "Lap & keringkan luka czer", time: "11:00", desc: "Selepas mandi, lap kawasan luka perlahan dengan kain lembut bersih. Pastikan kering sepenuhnya. Elak gosok.", done: false, comments: [], czerOnly: true },
  { id: 905, assignedTo: "suami",  category: "penjagaan", title: "Pastikan isteri tak angkat berat", time: "14:00", desc: "Isteri dilarang angkat benda melebihi 2kg. Suami ambil alih semua tugas angkat — termasuk baby dari buaian.", done: false, comments: [], czerOnly: true },
  { id: 906, assignedTo: "isteri", category: "perubatan", title: "Semak luka malam — tanda jangkitan", time: "21:00", desc: "Tanda bahaya: bengkak makin teruk, kemerahan melebar, keluar cecair/nanah, demam melebihi 38°C. Terus ke klinik.", done: false, comments: [], czerOnly: true },
];

const CZER_PANTANG_TAMBAHAN = [
  { bahan: "Angkat benda melebihi 2kg", sebab: "Boleh menyebabkan jahitan longgar atau luka terbuka semula", status: "larang", czerOnly: true },
  { bahan: "Membungkuk pinggang mendadak", sebab: "Tekanan pada kawasan luka czer boleh menyebabkan jahitan terhela", status: "larang", czerOnly: true },
  { bahan: "Naik tangga berulang kali", sebab: "Pergerakan berulang memberi tekanan pada luka bawah perut", status: "larang", czerOnly: true },
  { bahan: "Meneran semasa buang air besar", sebab: "Boleh menekan kawasan jahitan. Minum air banyak, makan serat, ambil julap jika perlu", status: "larang", czerOnly: true },
  { bahan: "Urut perut (minggu 1-3)", sebab: "Urut perut hanya boleh dimulakan selepas luka sembuh — tanya doktor dulu, biasanya selepas 6 minggu", status: "larang", czerOnly: true },
  { bahan: "Mandi rendaman / berendam", sebab: "Luka czer mesti kekal kering. Mandi shower sahaja, jangan rendamkan luka dalam air", status: "larang", czerOnly: true },
  { bahan: "Pakaian ketat / bengkung terlalu kuat", sebab: "Tekanan berlebihan pada luka boleh lambatkan penyembuhan. Pakai longgar dulu 2-3 minggu pertama", status: "hati", czerOnly: true },
  { bahan: "Protein tinggi (ikan haruan, telur, ayam)", sebab: "Sangat digalakkan — mempercepatkan pembentukan tisu baru dan penyembuhan luka dalaman", status: "galak", czerOnly: true },
  { bahan: "Vitamin C (buah-buahan)", sebab: "Membantu pembentukan kolagen untuk penyembuhan parut czer lebih cepat", status: "galak", czerOnly: true },
  { bahan: "Zink (kacang, bijan, biji labu)", sebab: "Sokongan penting untuk penyembuhan luka pembedahan dari dalam", status: "galak", czerOnly: true },
];

const CZER_NOTA_BIDAN_TAMBAHAN = [
  { id: 901, kategori: "🏥 Luka Czer", arahan: "Periksa luka setiap hari — pastikan tiada bengkak, kemerahan, atau nanah. Pergi klinik segera jika ada tanda jangkitan.", penting: true, czerOnly: true },
  { id: 902, kategori: "🏥 Luka Czer", arahan: "Luka czer mengambil masa 6 minggu untuk sembuh sepenuhnya. Jangan judge tahap pemulihan ikut rasa sakit sahaja.", penting: true, czerOnly: true },
  { id: 903, kategori: "⚠️ Larangan Czer", arahan: "Dilarang keras angkat benda berat, membungkuk mendadak, atau meneran kuat semasa buang air besar dalam 6 minggu pertama.", penting: true, czerOnly: true },
  { id: 904, kategori: "🩺 Rawatan Czer", arahan: "Urut perut HANYA boleh dimulakan selepas dapat kebenaran doktor — biasanya selepas 6 minggu. Jangan ikut cakap orang, ikut doktor.", penting: true, czerOnly: true },
  { id: 905, kategori: "😔 Emosi Czer", arahan: "Ibu yang bersalin czer kecemasan mungkin lebih sensitif emosi. Rasa bersalah adalah normal. Suami perlu beri sokongan emosi tambahan.", penting: false, czerOnly: true },
  { id: 906, kategori: "📅 Temu Janji", arahan: "Wajib balik hospital selepas 2 minggu untuk semak luka. Kemudian semak semula pada 6 minggu selepas bersalin.", penting: true, czerOnly: true },
];


// ─── SUPPLEMENT DATA ──────────────────────────────────────────────────────────
const INITIAL_SUPPS = {
  isteri: [],
  suami: [],
};

// ─── BIDAN CHECKLIST DATA ─────────────────────────────────────────────────────
const INITIAL_BIDAN_CHECKLIST = [
  { id: "b1", task: "Urut badan penuh", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b2", task: "Urut perut & susutkan rahim", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b3", task: "Bengkung / barut perut", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b4", task: "Tungku badan", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b5", task: "Sapu param / pilis kepala", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b6", task: "Urut payudara (bantu susu lancar)", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b7", task: "Semak luka / jahitan", siapa: null, tarikhSiap: null, nota: "" },
  { id: "b8", task: "Mandi wap / bertungku", siapa: null, tarikhSiap: null, nota: "" },
];

// ─── SUSU LOG DATA ────────────────────────────────────────────────────────────
// perahanLog: { id, masa, kuantiti_ml, nota }
// menyusuLog: { id, masa, durasi_minit, payudara ("kiri"|"kanan"|"dua"), nota }
const INITIAL_SUSU = {
  perahanLog: [],
  menyusuLog: [],
  jenisSusu: "breastfeed", // "breastfeed" | "pam" | "formula" | "campur"
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Avatar({ role, size = 32 }) {
  const r = ROLES[role] || ROLES.bersama;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: r.bg, border: `2px solid ${r.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.48, flexShrink: 0 }}>
      {r.avatar}
    </div>
  );
}

function ProgressRing({ pct, size = 60, color = "#2D6A4F" }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r, dash = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8EDE8" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" style={{ fontSize: 13, fontWeight: 800, fill: color, fontFamily: "inherit" }}>{pct}%</text>
    </svg>
  );
}

function ReminderBadge({ time }) {
  const [active, setActive] = useState(false);
  return (
    <button onClick={() => setActive(a => !a)} title="Reminder" style={{
      background: active ? "#FFF3CD" : "#F5F5F5", border: `1.5px solid ${active ? "#F0A500" : "#DDD"}`,
      borderRadius: 12, padding: "3px 9px", fontSize: 11, cursor: "pointer",
      color: active ? "#856404" : "#888", fontWeight: 600, display: "flex", alignItems: "center", gap: 4
    }}>
      🔔 {active ? time : "Set Reminder"}
    </button>
  );
}



// ─── ROOM LOBBY ──────────────────────────────────────────────────────────────
function RoomLobby({ onCreate, onJoin }) {
  const [mode, setMode] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function tryJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) { setErr("Sila masukkan Room Code."); return; }
    setLoading(true); setErr("");
    const data = await loadRoom(code);
    setLoading(false);
    if (!data) { setErr("Room Code tidak dijumpai. Minta suami/isteri share code dulu."); return; }
    onJoin(code, data);
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1A2E1A 0%,#2D6A4F 60%,#40916C 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, fontFamily:"Georgia,serif" }}>
      <div style={{ fontSize:52, marginBottom:6 }}>🌿</div>
      <h1 style={{ color:"#fff", fontSize:28, fontWeight:900, marginBottom:4, textAlign:"center" }}>PantangCare</h1>
      <p style={{ color:"#95D5B2", fontSize:14, marginBottom:36, textAlign:"center" }}>Pengurusan pantang bersama suami isteri 💚</p>

      {!mode && (
        <div style={{ width:"100%", maxWidth:340 }}>
          <button onClick={() => onCreate()} style={{ width:"100%", padding:18, borderRadius:18, border:"none", background:"#fff", color:"#2D6A4F", fontWeight:900, fontSize:16, cursor:"pointer", marginBottom:12, fontFamily:"inherit", boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }}>
            ✨ Buat Room Baru
          </button>
          <button onClick={() => setMode("join")} style={{ width:"100%", padding:18, borderRadius:18, border:"2px solid rgba(255,255,255,0.4)", background:"transparent", color:"#fff", fontWeight:800, fontSize:16, cursor:"pointer", fontFamily:"inherit" }}>
            🔗 Masuk Room Sedia Ada
          </button>
          <p style={{ color:"#95D5B2", fontSize:12, textAlign:"center", marginTop:20, lineHeight:1.7 }}>
            Suami buat room baru → share Room Code → isteri masuk guna code yang sama
          </p>
        </div>
      )}

      {mode === "join" && (
        <div style={{ background:"#fff", borderRadius:24, padding:28, width:"100%", maxWidth:340, boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:36 }}>🔗</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#1A2E1A" }}>Masuk Room</div>
            <div style={{ fontSize:13, color:"#888", marginTop:4 }}>Masukkan Room Code dari pasangan</div>
          </div>
          <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setErr(""); }}
            onKeyDown={e => e.key==="Enter" && tryJoin()}
            placeholder="Contoh: PC-AB3X7Y"
            style={{ width:"100%", border:"2px solid #E0E8E0", borderRadius:12, padding:"12px 16px", fontSize:18, outline:"none", boxSizing:"border-box", fontFamily:"monospace", textAlign:"center", letterSpacing:"0.15em", color:"#1A2E1A", marginBottom:10 }} />
          {err && <div style={{ fontSize:12, color:"#C0392B", marginBottom:10, textAlign:"center" }}>{err}</div>}
          <button onClick={tryJoin} disabled={loading}
            style={{ width:"100%", padding:14, borderRadius:14, border:"none", background:"linear-gradient(135deg,#2D6A4F,#40916C)", color:"#fff", fontWeight:800, fontSize:15, cursor:loading?"wait":"pointer", fontFamily:"inherit", opacity:loading?0.7:1 }}>
            {loading ? "Sedang semak..." : "Masuk Room →"}
          </button>
          <button onClick={() => { setMode(null); setErr(""); }} style={{ width:"100%", padding:10, marginTop:10, borderRadius:14, border:"none", background:"transparent", color:"#AAA", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>← Kembali</button>
        </div>
      )}
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────
function ShareModal({ roomCode, onClose }) {
  const url = buildShareUrl(roomCode);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    try { navigator.clipboard.writeText(roomCode); } catch(e) {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:9999 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:28, width:"100%", maxWidth:480, paddingBottom:40 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:22, fontWeight:900, color:"#1A2E1A" }}>🔗 Kongsi ke Pasangan</div>
          <div style={{ fontSize:13, color:"#888", marginTop:4 }}>Imbas QR atau masukkan Room Code</div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ padding:12, background:"#fff", borderRadius:16, border:"2px solid #E0E8E0", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
            <img src={qrUrl} alt="QR Code" width={160} height={160} style={{ display:"block", borderRadius:8 }} />
          </div>
        </div>
        <div style={{ background:"#EAF4EC", borderRadius:16, padding:16, textAlign:"center", marginBottom:14 }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:6, letterSpacing:"0.08em", textTransform:"uppercase" }}>Room Code</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#2D6A4F", letterSpacing:"0.2em", fontFamily:"monospace" }}>{roomCode}</div>
          <button onClick={copyCode} style={{ marginTop:8, background:"#2D6A4F", color:"#fff", border:"none", borderRadius:10, padding:"6px 16px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {copied ? "✓ Disalin!" : "Salin Code"}
          </button>
        </div>
        <div style={{ background:"#EAF4EC", border:"1px solid #95D5B2", borderRadius:12, padding:"10px 14px", fontSize:12, color:"#1A5276", lineHeight:1.7, marginBottom:16 }}>
          ✅ Sync realtime via Firebase — berfungsi antara device berbeza.<br/>
          ⚡ Data update dalam masa 1–2 saat bila pasangan buat perubahan.
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:13, borderRadius:14, border:"none", background:"#1A2E1A", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Tutup</button>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [names, setNames] = useState({ suami: "", isteri: "", tarikhBersalin: "", jenisBersalin: "" });

  function next() {
    if (step === 0 && !names.suami.trim()) return;
    if (step === 1 && !names.isteri.trim()) return;
    if (step === 3 && !names.jenisBersalin) return;
    if (step < 3) setStep(s => s + 1);
    else onDone(names);
  }

  const steps = [
    {
      icon: "👨", title: "Nama Suami",
      content: (<input autoFocus value={names.suami} onChange={e => setNames(n => ({ ...n, suami: e.target.value }))} onKeyDown={e => e.key === "Enter" && next()} placeholder="Contoh: Ahmad Faris" style={inputStyle} />)
    },
    {
      icon: "👩", title: "Nama Isteri",
      content: (<input autoFocus value={names.isteri} onChange={e => setNames(n => ({ ...n, isteri: e.target.value }))} onKeyDown={e => e.key === "Enter" && next()} placeholder="Contoh: Nurul Aisyah" style={inputStyle} />)
    },
    {
      icon: "🍼", title: "Tarikh Bersalin",
      content: (<input type="date" value={names.tarikhBersalin} onChange={e => setNames(n => ({ ...n, tarikhBersalin: e.target.value }))} style={inputStyle} />)
    },
    {
      icon: "🏥", title: "Jenis Bersalin",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", lineHeight: 1.6, textAlign: "center" }}>
            Pilihan ini penting — apps akan tambahkan penjagaan khas mengikut jenis bersalin.
          </p>
          {[
            { key: "normal", icon: "🌸", title: "Bersalin Normal", desc: "" },
            { key: "czer", icon: "🏥", title: "Bersalin Caesar (Czer)", desc: "" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setNames(n => ({ ...n, jenisBersalin: opt.key }))}
              style={{ padding: "14px 16px", borderRadius: 16, border: `2px solid ${names.jenisBersalin === opt.key ? "#2D6A4F" : "#E0E8E0"}`, background: names.jenisBersalin === opt.key ? "#EAF4EC" : "#FAFCFA", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: names.jenisBersalin === opt.key ? "#2D6A4F" : "#1A2E1A" }}>{opt.title}</div>
                </div>
                {names.jenisBersalin === opt.key && <span style={{ marginLeft: "auto", fontSize: 18, color: "#2D6A4F" }}>✓</span>}
              </div>
            </button>
          ))}
        </div>
      )
    },
  ];

  const s = steps[step];
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #2D6A4F 0%, #40916C 50%, #74C69D 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "Georgia, serif" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🌿</div>
      <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>PantangCare</h1>
      <p style={{ color: "#A8D5BC", fontSize: 14, marginBottom: 40, textAlign: "center" }}>Bersama, lebih mudah 💚</p>

      <div style={{ background: "#fff", borderRadius: 24, padding: 28, width: "100%", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1A2E1A" }}>{s.title}</div>
        </div>
        {s.content}
        <button onClick={next} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2D6A4F, #40916C)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 16, fontFamily: "inherit", opacity: (step === 3 && !names.jenisBersalin) ? 0.45 : 1 }}>
          {step < 3 ? "Seterusnya →" : "Mula Pantang 🌿"}
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: i === step ? "#2D6A4F" : "#D0E8D0", transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#AAA" }}>Langkah {step + 1} daripada 4</div>
      </div>
    </div>
  );
}
const inputStyle = { width: "100%", border: "1.5px solid #E0E8E0", borderRadius: 12, padding: "12px 16px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif", color: "#333" };
const addInputStyle = { width: "100%", border: "1.5px solid #E0E8E0", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif", color: "#333", background: "#fff" };

// ─── TASK CARD ────────────────────────────────────────────────────────────────
function TaskCard({ task, currentRole, names, onToggle, onComment }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const cat = CATEGORIES[task.category] || CATEGORIES.pemakanan;
  const roleR = ROLES[task.assignedTo] || ROLES.bersama;
  const canToggle = task.assignedTo === currentRole || task.assignedTo === "bersama";
  const assignLabel = task.assignedTo === "bersama" ? "Bersama" : (names[task.assignedTo] || task.assignedTo);

  function submit() {
    if (!comment.trim()) return;
    onComment(task.id, { by: currentRole, text: comment.trim(), time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) });
    setComment("");
  }

  return (
    <div style={{ background: task.done ? "#F8FAF8" : "#fff", border: `1.5px solid ${task.done ? "#D0E8D0" : cat.color}`, borderRadius: 16, marginBottom: 10, boxShadow: task.done ? "none" : "0 2px 10px rgba(0,0,0,0.05)", opacity: task.done ? 0.72 : 1, transition: "all 0.3s" }}>
      <div style={{ padding: "13px 14px", display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <button onClick={e => { e.stopPropagation(); if (canToggle) onToggle(task.id); }} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${canToggle ? cat.color : "#CCC"}`, background: task.done ? cat.color : "transparent", cursor: canToggle ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
          {task.done && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2E1A", textDecoration: task.done ? "line-through" : "none", textDecorationColor: "#999" }}>
            {cat.icon} {task.title}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
            <ReminderBadge time={task.time} />
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: roleR.color, background: roleR.bg }}>{assignLabel}</span>
            {task.comments.length > 0 && <span style={{ fontSize: 11, color: "#AAA" }}>💬 {task.comments.length}</span>}
          </div>
        </div>
        <span style={{ fontSize: 11, color: "#CCC", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #F0F0F0", padding: "12px 14px" }}>
          {task.desc && <p style={{ fontSize: 13, color: "#555", margin: "0 0 10px", lineHeight: 1.6 }}>{task.desc}</p>}
          {task.comments.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Avatar role={c.by} size={26} />
              <div style={{ background: "#F5F7F5", borderRadius: 10, padding: "6px 10px", flex: 1 }}>
                <div style={{ fontSize: 11, color: "#999" }}>{names[c.by] || c.by} · {c.time}</div>
                <div style={{ fontSize: 13, color: "#333" }}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
            <Avatar role={currentRole} size={26} />
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Tulis nota atau update..." style={{ flex: 1, border: "1.5px solid #E0E8E0", borderRadius: 20, padding: "7px 12px", fontSize: 13, outline: "none", background: "#FAFCFA", fontFamily: "inherit" }} />
            <button onClick={submit} style={{ background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 20, padding: "7px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUPPLEMENT TRACKER ──────────────────────────────────────────────────────
function SuppTracker({ supps, setSupps, currentRole, names }) {
  const [addTarget, setAddTarget] = useState(null); // "suami" | "isteri" | null
  const [form, setForm] = useState({ nama: "", waktu: "Pagi", dos: "" });
  const [msg, setMsg] = useState("");

  const waktuOpts = ["Pagi", "Tengahari", "Petang", "Malam", "Pagi & Malam", "3x sehari"];

  function toggleTaken(who, id) {
    setSupps(s => ({ ...s, [who]: s[who].map(x => x.id === id ? { ...x, taken: !x.taken } : x) }));
  }

  function addSupp(who) {
    if (!form.nama.trim()) { setMsg("Sila isi nama supplement."); return; }
    const prefix = who === "suami" ? "s" : "i";
    const newItem = { id: prefix + Date.now(), ...form, taken: false };
    setSupps(s => ({ ...s, [who]: [...s[who], newItem] }));
    setForm({ nama: "", waktu: "Pagi", dos: "" });
    setAddTarget(null);
    setMsg("");
  }

  function removeSupp(who, id) {
    setSupps(s => ({ ...s, [who]: s[who].filter(x => x.id !== id) }));
  }

  function resetAll() {
    setSupps(s => ({
      isteri: s.isteri.map(x => ({ ...x, taken: false })),
      suami:  s.suami.map(x => ({ ...x, taken: false })),
    }));
  }

  const panels = [
    { who: "isteri", color: "#9B2335", bg: "#FADDE1", lightBg: "#FFF5F7", icon: "👩" },
    { who: "suami",  color: "#2D6A4F", bg: "#D8F3DC", lightBg: "#F0FAF2", icon: "👨" },
  ];

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A5276, #2471A3)", borderRadius: 16, padding: "14px 16px", marginBottom: 14, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>💊 Checklist Supplement</div>
          <div style={{ fontSize: 12, color: "#AED6F1", marginTop: 2 }}>Pantau supplement suami & isteri setiap hari</div>
        </div>
        <button onClick={resetAll} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          🔄 Reset Hari
        </button>
      </div>

      {panels.map(({ who, color, bg, lightBg, icon }) => {
        const list = supps[who] || [];
        const done = list.filter(x => x.taken).length;
        const pct = list.length ? Math.round((done / list.length) * 100) : 0;
        const isMe = who === currentRole;

        return (
          <div key={who} style={{ background: "#fff", borderRadius: 20, marginBottom: 14, border: `1.5px solid ${bg}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            {/* Panel header */}
            <div style={{ background: lightBg, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1A2E1A" }}>{names[who] || who}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{done}/{list.length} supplement hari ini</div>
              </div>
              {/* Mini progress */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color }}>{pct}%</div>
                <div style={{ width: 60, height: 6, background: "#E0E0E0", borderRadius: 4, overflow: "hidden", marginTop: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
            </div>

            {/* Supplement list */}
            <div style={{ padding: "10px 14px" }}>
              {list.length === 0 && (
                <div style={{ textAlign: "center", color: "#BBB", fontSize: 13, padding: "16px 0" }}>Belum ada supplement. Tambah di bawah.</div>
              )}
              {list.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F5F5F5" }}>
                  {/* Checkbox — anyone can tick for anyone (visibility feature) */}
                  <button onClick={() => toggleTaken(who, item.id)}
                    style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${item.taken ? color : "#CCC"}`, background: item.taken ? color : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    {item.taken && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.taken ? "#AAA" : "#1A2E1A", textDecoration: item.taken ? "line-through" : "none" }}>
                      💊 {item.nama}
                    </div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
                      🕐 {item.waktu}{item.dos ? ` · ${item.dos}` : ""}
                    </div>
                  </div>

                  {item.taken && (
                    <span style={{ fontSize: 11, color, fontWeight: 700, background: bg, padding: "2px 8px", borderRadius: 20 }}>Dah ambil ✓</span>
                  )}

                  {/* Only owner or shared can delete */}
                  <button onClick={() => removeSupp(who, item.id)}
                    style={{ background: "transparent", border: "none", color: "#DDD", fontSize: 16, cursor: "pointer", padding: "2px 4px", lineHeight: 1 }}
                    title="Padam">×</button>
                </div>
              ))}

              {/* Add button */}
              {addTarget === who ? (
                <div style={{ marginTop: 12, padding: "14px", background: "#FAFAFA", borderRadius: 14, border: "1.5px dashed #DDD" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 10 }}>Tambah Supplement — {names[who] || who}</div>
                  <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                    placeholder="Nama supplement (contoh: Vivix)" style={{ ...addInputStyle, marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <select value={form.waktu} onChange={e => setForm(f => ({ ...f, waktu: e.target.value }))} style={{ ...addInputStyle, flex: 1 }}>
                      {waktuOpts.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                    <input value={form.dos} onChange={e => setForm(f => ({ ...f, dos: e.target.value }))}
                      placeholder="Dos (2 biji)" style={{ ...addInputStyle, flex: 1 }} />
                  </div>
                  {msg && <div style={{ fontSize: 12, color: "#C0392B", marginBottom: 6 }}>{msg}</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setAddTarget(null); setMsg(""); }} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1.5px solid #DDD", background: "#fff", color: "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                    <button onClick={() => addSupp(who)} style={{ flex: 2, padding: "8px", borderRadius: 10, border: "none", background: color, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Tambah</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setAddTarget(who); setForm({ nama: "", waktu: "Pagi", dos: "" }); setMsg(""); }}
                  style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 12, border: `1.5px dashed ${bg}`, background: "transparent", color, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  ➕ Tambah Supplement {names[who] || who}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Info note */}
      <div style={{ background: "#F0F7FF", border: "1px solid #D0E8FF", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#2471A3", lineHeight: 1.6 }}>
        💡 Siapa sahaja boleh tick supplement pasangan — supaya mudah pantau kalau pasangan lupa atau belum ambil.
      </div>
    </div>
  );
}


// ─── BIDAN CHECKLIST ──────────────────────────────────────────────────────────
function BidanChecklist({ checklist, setChecklist, currentRole, names, day }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [openNota, setOpenNota] = useState(null);
  const [notaInput, setNotaInput] = useState("");

  const done = checklist.filter(x => x.siapa).length;
  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;

  function tick(id) {
    setChecklist(c => c.map(x => {
      if (x.id !== id) return x;
      if (x.siapa) return { ...x, siapa: null, tarikhSiap: null }; // untick
      return { ...x, siapa: currentRole, tarikhSiap: `Hari ${day}` };
    }));
  }

  function saveNota(id) {
    setChecklist(c => c.map(x => x.id === id ? { ...x, nota: notaInput } : x));
    setOpenNota(null);
  }

  function addTask() {
    if (!newTask.trim()) return;
    setChecklist(c => [...c, { id: "u" + Date.now(), task: newTask.trim(), siapa: null, tarikhSiap: null, nota: "" }]);
    setNewTask("");
    setShowAdd(false);
  }

  function removeTask(id) {
    setChecklist(c => c.filter(x => x.id !== id));
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6C3483, #9B59B6)", borderRadius: 16, padding: "14px 16px", marginBottom: 14, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>🧕 Checklist Mak Bidan</div>
            <div style={{ fontSize: 12, color: "#D7BDE2", marginTop: 2 }}>Tandakan rawatan yang sudah disempurnakan</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{pct}%</div>
            <div style={{ fontSize: 11, color: "#D7BDE2" }}>{done}/{checklist.length} siap</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, height: 6, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#D7BDE2", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* List */}
      {checklist.map(item => (
        <div key={item.id} style={{ background: "#fff", borderRadius: 16, marginBottom: 8, border: `1.5px solid ${item.siapa ? "#D7BDE2" : "#EEE"}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", opacity: item.siapa ? 0.8 : 1 }}>
          <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => tick(item.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${item.siapa ? "#9B59B6" : "#CCC"}`, background: item.siapa ? "#9B59B6" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
              {item.siapa && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2E1A", textDecoration: item.siapa ? "line-through" : "none", textDecorationColor: "#AAA" }}>
                🧴 {item.task}
              </div>
              {item.siapa && (
                <div style={{ fontSize: 11, color: "#9B59B6", marginTop: 2 }}>
                  ✓ Siap — {item.tarikhSiap} · dicatat oleh {names[item.siapa] || item.siapa}
                </div>
              )}
              {item.nota ? (
                <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 2 }}>📝 {item.nota}</div>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setOpenNota(openNota === item.id ? null : item.id); setNotaInput(item.nota); }}
                style={{ background: "#F5EDFD", border: "none", color: "#9B59B6", borderRadius: 8, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>📝</button>
              <button onClick={() => removeTask(item.id)}
                style={{ background: "#FFF0F0", border: "none", color: "#CCC", borderRadius: 8, padding: "4px 8px", fontSize: 14, cursor: "pointer" }}>×</button>
            </div>
          </div>
          {openNota === item.id && (
            <div style={{ borderTop: "1px solid #F0F0F0", padding: "10px 14px", display: "flex", gap: 8 }}>
              <input value={notaInput} onChange={e => setNotaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && saveNota(item.id)}
                placeholder="Nota rawatan bidan (masa, catatan khas...)"
                style={{ flex: 1, border: "1.5px solid #E0D0F0", borderRadius: 10, padding: "7px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              <button onClick={() => saveNota(item.id)} style={{ background: "#9B59B6", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Simpan</button>
            </div>
          )}
        </div>
      ))}

      {/* Add task */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #D7BDE2", background: "transparent", color: "#9B59B6", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
          ➕ Tambah Rawatan Bidan
        </button>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, padding: 14, border: "1.5px solid #D7BDE2", marginTop: 4 }}>
          <input autoFocus value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Contoh: Urut tapak kaki..." style={{ ...addInputStyle, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 9, borderRadius: 10, border: "1.5px solid #DDD", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
            <button onClick={addTask} style={{ flex: 2, padding: 9, borderRadius: 10, border: "none", background: "#9B59B6", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Tambah</button>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ background: "#F9F0FF", border: "1px solid #E8D5F5", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#6C3483", lineHeight: 1.6, marginTop: 12 }}>
        💡 Suami atau isteri boleh tandakan rawatan ini selepas bidan selesai — supaya kedua-dua tahu status rawatan semasa.
      </div>
    </div>
  );
}


// ─── LOG SUSU ────────────────────────────────────────────────────────────────
function LogSusu({ susu, setSusu, currentRole, names }) {
  const [subTab, setSubTab] = useState("overview");
  const [showPerah, setShowPerah] = useState(false);
  const [showMenyusu, setShowMenyusu] = useState(false);
  const [formPerah, setFormPerah] = useState({ masa: "", kuantiti_ml: "", nota: "" });
  const [formMenyusu, setFormMenyusu] = useState({ masa: "", durasi_minit: "", payudara: "kiri", nota: "" });

  const now = () => new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" });
  const totalPerah = susu.perahanLog.reduce((a, x) => a + (parseInt(x.kuantiti_ml) || 0), 0);
  const totalMenyusu = susu.menyusuLog.reduce((a, x) => a + (parseInt(x.durasi_minit) || 0), 0);
  const jenisSusuLabel = { breastfeed: "🤱 Breastfeed Terus", pam: "🍼 Pam (EBM)", formula: "🥛 Formula", campur: "🔄 Campuran" };

  function addPerah() {
    if (!formPerah.kuantiti_ml) return;
    setSusu(s => ({ ...s, perahanLog: [{ id: Date.now(), masa: formPerah.masa || now(), ...formPerah }, ...s.perahanLog] }));
    setFormPerah({ masa: "", kuantiti_ml: "", nota: "" });
    setShowPerah(false);
  }

  function addMenyusu() {
    if (!formMenyusu.durasi_minit) return;
    setSusu(s => ({ ...s, menyusuLog: [{ id: Date.now(), masa: formMenyusu.masa || now(), ...formMenyusu }, ...s.menyusuLog] }));
    setFormMenyusu({ masa: "", durasi_minit: "", payudara: "kiri", nota: "" });
    setShowMenyusu(false);
  }

  const payudaraColor = { kiri: "#E8A87C", kanan: "#7CB8E8", dua: "#A8E87C" };
  const payudaraLabel = { kiri: "Kiri 🤱", kanan: "Kanan 🤱", dua: "Dua-dua 🤱" };

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A6B8A, #2E86AB)", borderRadius: 16, padding: "14px 16px", marginBottom: 12, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>🍼 Log Susu Badan</div>
        <div style={{ fontSize: 12, color: "#AED6F1", marginTop: 2 }}>Pantau pam susu & sesi menyusu baby</div>

        {/* Jenis Susu Toggle */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: "#AED6F1", marginBottom: 6 }}>Kaedah penyusuan:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(jenisSusuLabel).map(([k, v]) => (
              <button key={k} onClick={() => setSusu(s => ({ ...s, jenisSusu: k }))}
                style={{ padding: "4px 10px", borderRadius: 16, border: "none", background: susu.jenisSusu === k ? "#fff" : "rgba(255,255,255,0.15)", color: susu.jenisSusu === k ? "#1A6B8A" : "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 14px", textAlign: "center", border: "1.5px solid #D5EEF7" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#1A6B8A" }}>{totalPerah}<span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}>ml</span></div>
          <div style={{ fontSize: 11, color: "#888" }}>Jumlah pam hari ini</div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 14px", textAlign: "center", border: "1.5px solid #D5F5D5" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#2D6A4F" }}>{susu.menyusuLog.length}<span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}> sesi</span></div>
          <div style={{ fontSize: 11, color: "#888" }}>Sesi menyusu hari ini</div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 14px", textAlign: "center", border: "1.5px solid #EFE8F8" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#7B5EA7" }}>{totalMenyusu}<span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}>min</span></div>
          <div style={{ fontSize: 11, color: "#888" }}>Total masa menyusu</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          { key: "overview", label: "📊 Ringkasan" },
          { key: "perahan", label: "🍼 Log Perahan" },
          { key: "menyusu", label: "🤱 Log Menyusu" },
        ].map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{ flex: 1, padding: "8px 4px", borderRadius: 12, border: "none", background: subTab === t.key ? "#1A6B8A" : "#fff", color: subTab === t.key ? "#fff" : "#666", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", boxShadow: subTab === t.key ? "0 2px 8px rgba(26,107,138,0.25)" : "0 1px 4px rgba(0,0,0,0.05)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {subTab === "overview" && (
        <div>
          {susu.perahanLog.length === 0 && susu.menyusuLog.length === 0 ? (
            <div style={{ textAlign: "center", color: "#BBB", padding: "30px 0", fontSize: 14 }}>
              🍼 Belum ada rekod hari ini.<br />
              <span style={{ fontSize: 12 }}>Guna tab Log Perahan atau Log Menyusu untuk tambah.</span>
            </div>
          ) : (
            <div>
              {susu.menyusuLog.slice(0, 3).map(s => (
                <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", marginBottom: 8, border: "1.5px solid #D5F5D5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2D6A4F" }}>🤱 Menyusu · {s.masa}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{s.durasi_minit} minit · Payudara {payudaraLabel[s.payudara]}</div>
                  </div>
                </div>
              ))}
              {susu.perahanLog.slice(0, 3).map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", marginBottom: 8, border: "1.5px solid #D5EEF7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1A6B8A" }}>🍼 Perahan · {p.masa}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{p.kuantiti_ml} ml{p.nota ? ` · ${p.nota}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#1A6B8A" }}>{p.kuantiti_ml}ml</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setSubTab("perahan")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid #D5EEF7", background: "#F0F8FC", color: "#1A6B8A", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Log Perahan</button>
            <button onClick={() => setSubTab("menyusu")} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid #D5F5D5", background: "#F0FCF5", color: "#2D6A4F", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Log Menyusu</button>
          </div>
        </div>
      )}

      {/* LOG PERAHAN */}
      {subTab === "perahan" && (
        <div>
          {!showPerah ? (
            <button onClick={() => setShowPerah(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #AED6F1", background: "transparent", color: "#1A6B8A", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
              ➕ Rekod Perahan Baru
            </button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #AED6F1", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, color: "#1A6B8A", marginBottom: 12 }}>🍼 Rekod Perahan</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Masa pam</div>
                  <input type="time" value={formPerah.masa} onChange={e => setFormPerah(f => ({ ...f, masa: e.target.value }))} style={{ ...addInputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Jumlah (ml) *</div>
                  <input type="number" value={formPerah.kuantiti_ml} onChange={e => setFormPerah(f => ({ ...f, kuantiti_ml: e.target.value }))} placeholder="Contoh: 120" style={{ ...addInputStyle }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Nota (pilihan)</div>
              <input value={formPerah.nota} onChange={e => setFormPerah(f => ({ ...f, nota: e.target.value }))} placeholder="Contoh: Kiri 80ml, Kanan 40ml" style={{ ...addInputStyle, marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowPerah(false)} style={{ flex: 1, padding: 9, borderRadius: 10, border: "1.5px solid #DDD", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                <button onClick={addPerah} style={{ flex: 2, padding: 9, borderRadius: 10, border: "none", background: "#1A6B8A", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Simpan Rekod</button>
              </div>
            </div>
          )}
          {susu.perahanLog.length === 0 ? (
            <div style={{ textAlign: "center", color: "#BBB", padding: "20px 0", fontSize: 13 }}>Belum ada rekod perahan hari ini.</div>
          ) : (
            susu.perahanLog.map((p, i) => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: "1.5px solid #D5EEF7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1A6B8A" }}>🍼 Sesi #{susu.perahanLog.length - i}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>🕐 {p.masa}{p.nota ? ` · ${p.nota}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#1A6B8A" }}>{p.kuantiti_ml}<span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>ml</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* LOG MENYUSU */}
      {subTab === "menyusu" && (
        <div>
          {!showMenyusu ? (
            <button onClick={() => setShowMenyusu(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #A8E87C", background: "transparent", color: "#2D6A4F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
              ➕ Rekod Sesi Menyusu
            </button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #A8E87C", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, color: "#2D6A4F", marginBottom: 12 }}>🤱 Rekod Sesi Menyusu</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Masa mula</div>
                  <input type="time" value={formMenyusu.masa} onChange={e => setFormMenyusu(f => ({ ...f, masa: e.target.value }))} style={{ ...addInputStyle }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Tempoh (minit) *</div>
                  <input type="number" value={formMenyusu.durasi_minit} onChange={e => setFormMenyusu(f => ({ ...f, durasi_minit: e.target.value }))} placeholder="Contoh: 15" style={{ ...addInputStyle }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Payudara</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["kiri","kanan","dua"].map(p => (
                  <button key={p} onClick={() => setFormMenyusu(f => ({ ...f, payudara: p }))} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `1.5px solid ${formMenyusu.payudara === p ? payudaraColor[p] : "#DDD"}`, background: formMenyusu.payudara === p ? payudaraColor[p] + "33" : "#fff", color: formMenyusu.payudara === p ? "#333" : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    {payudaraLabel[p]}
                  </button>
                ))}
              </div>
              <input value={formMenyusu.nota} onChange={e => setFormMenyusu(f => ({ ...f, nota: e.target.value }))} placeholder="Nota (pilihan)..." style={{ ...addInputStyle, marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowMenyusu(false)} style={{ flex: 1, padding: 9, borderRadius: 10, border: "1.5px solid #DDD", background: "#fff", color: "#888", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                <button onClick={addMenyusu} style={{ flex: 2, padding: 9, borderRadius: 10, border: "none", background: "#2D6A4F", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Simpan Rekod</button>
              </div>
            </div>
          )}
          {susu.menyusuLog.length === 0 ? (
            <div style={{ textAlign: "center", color: "#BBB", padding: "20px 0", fontSize: 13 }}>Belum ada rekod sesi menyusu hari ini.</div>
          ) : (
            susu.menyusuLog.map((s, i) => (
              <div key={s.id} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${payudaraColor[s.payudara]}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#2D6A4F" }}>🤱 Sesi #{susu.menyusuLog.length - i}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>🕐 {s.masa} · {payudaraLabel[s.payudara]}</div>
                    {s.nota && <div style={{ fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 2 }}>{s.nota}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#2D6A4F" }}>{s.durasi_minit}<span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>min</span></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── DAPUR PANTANG ────────────────────────────────────────────────────────────
function DapurPantang({ menu, setMenu, currentRole, names, pantangLarang = PANTANG_LARANG, isCzer = false }) {
  const [dapurTab, setDapurTab] = useState("menu");
  const [showAdd, setShowAdd] = useState(false);
  const [newMenu, setNewMenu] = useState({ meal: "sarapan", title: "", bahan: "", tag: "galak" });
  const [commentInputs, setCommentInputs] = useState({});

  const mealLabel = { sarapan: "🌅 Sarapan", tengahari: "☀️ Tengahari", malam: "🌙 Malam", snek: "🍵 Snek/Minuman" };
  const tagInfo = {
    galak:  { label: "✅ Digalakkan", color: "#2D6A4F", bg: "#D8F3DC" },
    hati:   { label: "⚠️ Berhati-hati", color: "#856404", bg: "#FFF3CD" },
    larang: { label: "❌ Pantang Larang", color: "#9B2335", bg: "#FADDE1" },
  };

  function toggleMasak(id) {
    setMenu(m => m.map(x => x.id === id ? { ...x, masak: !x.masak } : x));
  }
  function addKomen(id, komen) {
    setMenu(m => m.map(x => x.id === id ? { ...x, komen: [...x.komen, komen] } : x));
    setCommentInputs(c => ({ ...c, [id]: "" }));
  }
  function addMenu() {
    if (!newMenu.title.trim()) return;
    setMenu(m => [...m, { ...newMenu, id: Date.now(), masak: false, komen: [], bahan: newMenu.bahan.split(",").map(b => b.trim()).filter(Boolean) }]);
    setNewMenu({ meal: "sarapan", title: "", bahan: "", tag: "galak" });
    setShowAdd(false);
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          { key: "menu", label: "📋 Menu Hari Ini" },
          { key: "pantang", label: "📖 Senarai Pantang" },
        ].map(t => (
          <button key={t.key} onClick={() => setDapurTab(t.key)} style={{ flex: 1, padding: "8px", borderRadius: 12, border: "none", background: dapurTab === t.key ? "#2D6A4F" : "#fff", color: dapurTab === t.key ? "#fff" : "#666", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      {dapurTab === "menu" && (
        <>
          {["sarapan","tengahari","malam","snek"].map(meal => {
            const items = menu.filter(m => m.meal === meal);
            if (!items.length) return null;
            return (
              <div key={meal} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#2D6A4F", marginBottom: 8, letterSpacing: "0.04em" }}>{mealLabel[meal]}</div>
                {items.map(item => {
                  const tg = tagInfo[item.tag];
                  const [openCard, setOpenCard] = useState(false);
                  return (
                    <div key={item.id} style={{ background: "#fff", border: `1.5px solid ${item.masak ? "#D0E8D0" : "#E8E8E8"}`, borderRadius: 16, marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", opacity: item.masak ? 0.75 : 1 }}>
                      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }} onClick={() => setOpenCard(o => !o)}>
                        <button onClick={e => { e.stopPropagation(); if (currentRole === "suami" || item.masak === false) toggleMasak(item.id); }} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${item.masak ? "#2D6A4F" : "#CCC"}`, background: item.masak ? "#2D6A4F" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {item.masak && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2E1A", textDecoration: item.masak ? "line-through" : "none" }}>🍽 {item.title}</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: tg.color, background: tg.bg }}>{tg.label}</span>
                            {item.komen.length > 0 && <span style={{ fontSize: 11, color: "#AAA" }}>💬 {item.komen.length}</span>}
                            {item.masak && <span style={{ fontSize: 11, color: "#2D6A4F", fontWeight: 600 }}>Dah masak ✓</span>}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: "#CCC" }}>{openCard ? "▲" : "▼"}</span>
                      </div>
                      {openCard && (
                        <div style={{ borderTop: "1px solid #F0F0F0", padding: "12px 14px" }}>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 700 }}>Bahan-bahan:</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {item.bahan.map((b, i) => (
                                <span key={i} style={{ background: "#F0F7F0", border: "1px solid #C8E6C9", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#2D6A4F" }}>{b}</span>
                              ))}
                            </div>
                          </div>
                          {item.komen.map((c, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                              <Avatar role={c.by} size={24} />
                              <div style={{ background: "#F5F7F5", borderRadius: 10, padding: "5px 10px", flex: 1 }}>
                                <div style={{ fontSize: 11, color: "#999" }}>{names[c.by] || c.by} · {c.time}</div>
                                <div style={{ fontSize: 13, color: "#333" }}>{c.text}</div>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <Avatar role={currentRole} size={24} />
                            <input value={commentInputs[item.id] || ""} onChange={e => setCommentInputs(c => ({ ...c, [item.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addKomen(item.id, { by: currentRole, text: commentInputs[item.id], time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) })}
                              placeholder="Sedap? Ada cadangan?" style={{ flex: 1, border: "1.5px solid #E0E8E0", borderRadius: 20, padding: "6px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                            <button onClick={() => addKomen(item.id, { by: currentRole, text: commentInputs[item.id] || "", time: new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" }) })} style={{ background: "#2D6A4F", color: "#fff", border: "none", borderRadius: 20, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Add Menu */}
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #C8E6C9", background: "transparent", color: "#2D6A4F", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              ➕ Tambah Menu
            </button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #C8E6C9" }}>
              <div style={{ fontWeight: 800, color: "#1A2E1A", marginBottom: 12 }}>Tambah Menu Baru</div>
              <select value={newMenu.meal} onChange={e => setNewMenu(n => ({ ...n, meal: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }}>
                {["sarapan","tengahari","malam","snek"].map(m => <option key={m} value={m}>{mealLabel[m]}</option>)}
              </select>
              <input value={newMenu.title} onChange={e => setNewMenu(n => ({ ...n, title: e.target.value }))} placeholder="Nama hidangan..." style={{ ...inputStyle, marginBottom: 10 }} />
              <input value={newMenu.bahan} onChange={e => setNewMenu(n => ({ ...n, bahan: e.target.value }))} placeholder="Bahan (pisahkan dengan koma)" style={{ ...inputStyle, marginBottom: 10 }} />
              <select value={newMenu.tag} onChange={e => setNewMenu(n => ({ ...n, tag: e.target.value }))} style={{ ...inputStyle, marginBottom: 12 }}>
                <option value="galak">✅ Digalakkan</option>
                <option value="hati">⚠️ Berhati-hati</option>
                <option value="larang">❌ Pantang Larang</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid #DDD", background: "#fff", color: "#666", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                <button onClick={addMenu} style={{ flex: 2, padding: 10, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2D6A4F, #40916C)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Tambah Menu</button>
              </div>
            </div>
          )}
        </>
      )}

      {dapurTab === "pantang" && (
        <>
          <div style={{ background: "linear-gradient(135deg, #2D6A4F, #40916C)", borderRadius: 16, padding: "14px 16px", marginBottom: 14, color: "#fff" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>📖 Panduan Pemakanan Pantang</div>
            <div style={{ fontSize: 12, color: "#A8D5BC" }}>Berdasarkan amalan tradisional Melayu & kajian kesihatan</div>
          </div>
          {pantangLarang.map((item, i) => {
            const tg = { galak: { color: "#2D6A4F", bg: "#D8F3DC", icon: "✅" }, hati: { color: "#856404", bg: "#FFF3CD", icon: "⚠️" }, larang: { color: "#9B2335", bg: "#FADDE1", icon: "❌" } }[item.status];
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${item.czerOnly ? "#FADDE1" : tg.bg}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                {item.czerOnly && <div style={{ fontSize: 10, fontWeight: 800, color: "#9B2335", letterSpacing: "0.06em", marginBottom: 4 }}>🏥 KHAS CZER</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2E1A", marginBottom: 3 }}>{tg.icon} {item.bahan}</div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{item.sebab}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, color: tg.color, background: tg.bg, flexShrink: 0 }}>
                    {item.status === "galak" ? "Galak" : item.status === "hati" ? "Hati-hati" : "Larang"}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── LOG HARIAN ───────────────────────────────────────────────────────────────
function LogHarian({ log, setLog, day }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mood: "😊", sakit: "Rendah", demam: false, pumping: "", berat: "", nota: "" });

  function simpan() {
    setLog(l => [...l, { ...form, id: Date.now(), date: `Hari ${day}` }]);
    setShowForm(false);
    setForm({ mood: "😊", sakit: "Rendah", demam: false, pumping: "", berat: "", nota: "" });
  }

  const moods = ["😊","😐","😔","😴","🤒"];
  const sakitLevel = ["Tiada","Rendah","Sederhana","Tinggi"];

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #9B2335, #C0392B)", borderRadius: 16, padding: "14px 16px", marginBottom: 14, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>📓 Log Kesihatan Isteri</div>
        <div style={{ fontSize: 12, color: "#FADDE1", marginTop: 2 }}>Rekod pemulihan harian untuk pantauan doktor</div>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #FADDE1", background: "transparent", color: "#9B2335", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 14 }}>
          ➕ Log Hari {day}
        </button>
      )}

      {showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #FADDE1", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: "#1A2E1A", marginBottom: 12 }}>Log Hari {day}</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Mood hari ini</div>
            <div style={{ display: "flex", gap: 10 }}>
              {moods.map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))} style={{ fontSize: 24, background: form.mood === m ? "#FFF3CD" : "transparent", border: `2px solid ${form.mood === m ? "#F0A500" : "transparent"}`, borderRadius: 12, width: 44, height: 44, cursor: "pointer" }}>{m}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Tahap kesakitan</div>
            <div style={{ display: "flex", gap: 6 }}>
              {sakitLevel.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, sakit: s }))} style={{ flex: 1, padding: "6px 4px", borderRadius: 10, border: `1.5px solid ${form.sakit === s ? "#9B2335" : "#DDD"}`, background: form.sakit === s ? "#FADDE1" : "#fff", color: form.sakit === s ? "#9B2335" : "#888", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Output pam susu (ml)</div>
              <input type="number" value={form.pumping} onChange={e => setForm(f => ({ ...f, pumping: e.target.value }))} placeholder="Contoh: 180" style={{ ...inputStyle }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Berat badan (kg)</div>
              <input type="number" step="0.1" value={form.berat} onChange={e => setForm(f => ({ ...f, berat: e.target.value }))} placeholder="Contoh: 58.5" style={{ ...inputStyle }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Ada demam?</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[false, true].map(v => (
                <button key={String(v)} onClick={() => setForm(f => ({ ...f, demam: v }))} style={{ flex: 1, padding: 8, borderRadius: 10, border: `1.5px solid ${form.demam === v ? "#9B2335" : "#DDD"}`, background: form.demam === v ? "#FADDE1" : "#fff", color: form.demam === v ? "#9B2335" : "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  {v ? "🤒 Ya" : "😊 Tidak"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Nota tambahan</div>
            <textarea value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} placeholder="Apa yang rasa hari ni..." rows={2} style={{ ...inputStyle, resize: "none" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid #DDD", background: "#fff", color: "#666", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
            <button onClick={simpan} style={{ flex: 2, padding: 10, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #9B2335, #C0392B)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Simpan Log</button>
          </div>
        </div>
      )}

      {[...log].reverse().map((l, i) => (
        <div key={l.id} style={{ background: "#fff", borderRadius: 14, padding: "14px", marginBottom: 8, border: "1.5px solid #F5E0E3", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, color: "#9B2335", fontSize: 14 }}>📅 {l.date}</span>
            <span style={{ fontSize: 22 }}>{l.mood}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: l.nota ? 8 : 0 }}>
            <span style={{ fontSize: 12, background: "#F5F5F5", borderRadius: 10, padding: "3px 8px", color: "#555" }}>🩺 Sakit: {l.sakit}</span>
            <span style={{ fontSize: 12, background: l.demam ? "#FADDE1" : "#D8F3DC", borderRadius: 10, padding: "3px 8px", color: l.demam ? "#9B2335" : "#2D6A4F" }}>🌡 {l.demam ? "Ada Demam" : "Tiada Demam"}</span>
            {l.pumping && <span style={{ fontSize: 12, background: "#EDF5FD", borderRadius: 10, padding: "3px 8px", color: "#2471A3" }}>🍼 {l.pumping}ml</span>}
            {l.berat && <span style={{ fontSize: 12, background: "#F5EDFD", borderRadius: 10, padding: "3px 8px", color: "#7B5EA7" }}>⚖️ {l.berat}kg</span>}
          </div>
          {l.nota && <div style={{ fontSize: 13, color: "#666", fontStyle: "italic", borderTop: "1px solid #F0F0F0", paddingTop: 6 }}>"{l.nota}"</div>}
        </div>
      ))}
    </div>
  );
}

// ─── NOTA MAK BIDAN ───────────────────────────────────────────────────────────
function NotaBidan({ bidan, setBidan, isCzer = false }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ kategori: "", arahan: "", penting: false });

  function tambah() {
    if (!form.arahan.trim()) return;
    setBidan(b => [...b, { ...form, id: Date.now() }]);
    setForm({ kategori: "", arahan: "", penting: false });
    setShowAdd(false);
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ background: "linear-gradient(135deg, #7B5EA7, #9B59B6)", borderRadius: 16, padding: "14px 16px", marginBottom: isCzer ? 8 : 14, color: "#fff" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>📝 Nota Mak Bidan</div>
        <div style={{ fontSize: 12, color: "#E8E0F5", marginTop: 2 }}>Arahan pantang dari mak bidan — simpan, semak bila-bila masa</div>
      </div>
      {isCzer && (
        <div style={{ background: "#FADDE1", border: "1.5px solid #F5C6CB", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏥</span>
          <div style={{ fontSize: 12, color: "#9B2335", fontWeight: 700, lineHeight: 1.5 }}>6 arahan khas czer telah ditambah di bawah — termasuk penjagaan luka dan pantang larang caesar.</div>
        </div>
      )}

      {bidan.filter(b => b.penting).length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#9B2335", marginBottom: 8, letterSpacing: "0.05em" }}>⚠️ PENTING — WAJIB IKUT</div>
          {bidan.filter(b => b.penting).map(b => (
            <div key={b.id} style={{ background: b.czerOnly ? "#FFF5F5" : "#FFF8F5", border: `1.5px solid ${b.czerOnly ? "#F5C6CB" : "#F5DDD6"}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
              {b.czerOnly && <div style={{ fontSize: 10, fontWeight: 800, color: "#9B2335", letterSpacing: "0.08em", marginBottom: 3 }}>🏥 KHAS CZER</div>}
              {b.kategori && <div style={{ fontSize: 11, fontWeight: 700, color: "#9B2335", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{b.kategori}</div>}
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{b.arahan}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#7B5EA7", marginBottom: 8, letterSpacing: "0.05em" }}>📋 SEMUA ARAHAN</div>
        {bidan.filter(b => !b.penting).map(b => (
          <div key={b.id} style={{ background: "#fff", border: "1.5px solid #E8E0F5", borderRadius: 14, padding: "12px 14px", marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            {b.kategori && <div style={{ fontSize: 11, fontWeight: 700, color: "#7B5EA7", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{b.kategori}</div>}
            <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{b.arahan}</div>
          </div>
        ))}
      </div>

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: 12, borderRadius: 14, border: "2px dashed #E8E0F5", background: "transparent", color: "#7B5EA7", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          ➕ Tambah Nota Bidan
        </button>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #E8E0F5" }}>
          <input value={form.kategori} onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))} placeholder="Kategori (Pemakanan, Aktiviti...)" style={{ ...inputStyle, marginBottom: 10 }} />
          <textarea value={form.arahan} onChange={e => setForm(f => ({ ...f, arahan: e.target.value }))} placeholder="Tulis arahan dari mak bidan..." rows={3} style={{ ...inputStyle, resize: "none", marginBottom: 10 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={form.penting} onChange={e => setForm(f => ({ ...f, penting: e.target.checked }))} style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 13, color: "#555" }}>Tandakan sebagai penting / wajib ikut</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1.5px solid #DDD", background: "#fff", color: "#666", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
            <button onClick={tambah} style={{ flex: 2, padding: 10, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7B5EA7, #9B59B6)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Simpan Nota</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function Progress({ tasks, role, names, day }) {
  const totalDays = 44;
  const partnerRole = role === "suami" ? "isteri" : "suami";
  const calc = (r) => {
    const mine = tasks.filter(t => t.assignedTo === r || t.assignedTo === "bersama");
    const done = mine.filter(t => t.done).length;
    return { done, total: mine.length, pct: mine.length ? Math.round((done/mine.length)*100) : 0 };
  };
  const me = calc(role), partner = calc(partnerRole);
  const all = { done: tasks.filter(t=>t.done).length, total: tasks.length };

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        {[{ r: role, data: me }, { r: partnerRole, data: partner }].map(({ r, data }) => (
          <div key={r} style={{ flex: 1, background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <ProgressRing pct={data.pct} size={64} color={ROLES[r].color} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
              <Avatar role={r} size={22} />
              <span style={{ fontWeight: 800, fontSize: 13, color: "#1A2E1A" }}>{names[r] || r}</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{data.done}/{data.total} tugas</div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg, #2D6A4F, #40916C)", borderRadius: 18, padding: "18px", marginBottom: 12, color: "#fff" }}>
        <div style={{ fontSize: 12, color: "#A8D5BC", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Keseluruhan Hari Ini</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><span style={{ fontSize: 36, fontWeight: 900 }}>{all.done}</span><span style={{ fontSize: 16, color: "#A8D5BC" }}>/{all.total}</span><div style={{ fontSize: 12, color: "#A8D5BC" }}>tugas selesai bersama 💚</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 36, fontWeight: 900 }}>{all.total ? Math.round((all.done/all.total)*100) : 0}%</div></div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, height: 8, marginTop: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${all.total ? (all.done/all.total)*100 : 0}%`, background: "#95D5B2", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Progress Pantang</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <ProgressRing pct={Math.round((day/totalDays)*100)} size={64} color="#F0A500" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1A2E1A" }}>Hari {day} <span style={{ fontSize: 14, color: "#888", fontWeight: 400 }}>/ {totalDays}</span></div>
            <div style={{ fontSize: 13, color: "#666" }}>{totalDays - day} hari lagi untuk sempurna</div>
            {day >= totalDays && <div style={{ fontSize: 13, color: "#2D6A4F", fontWeight: 700 }}>🎉 Tahniah! Pantang selesai!</div>}
          </div>
        </div>
        <div style={{ background: "#F5F5F5", borderRadius: 8, height: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(day/totalDays)*100}%`, background: "linear-gradient(90deg, #F0A500, #F39C12)", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
      </div>
    </div>
  );
}

// ─── ADD TASK ─────────────────────────────────────────────────────────────────
function AddTask({ tasks, setTasks, names }) {
  const [form, setForm] = useState({ title: "", time: "08:00", desc: "", category: "penjagaan", assignedTo: "suami" });
  const [msg, setMsg] = useState("");

  function add() {
    if (!form.title.trim()) { setMsg("Sila isi tajuk tugas."); return; }
    setTasks(ts => [...ts, { ...form, id: Date.now(), done: false, comments: [] }]);
    setForm({ title: "", time: "08:00", desc: "", category: "penjagaan", assignedTo: "suami" });
    setMsg("✅ Tugas berjaya ditambah!");
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2E1A", marginBottom: 16 }}>➕ Tambah Tugas Baru</div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>Tajuk Tugas *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Contoh: Minum ubat pagi..." style={{ ...inputStyle, marginBottom: 12 }} />
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>Masa Reminder</label>
        <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ ...inputStyle, marginBottom: 12 }} />
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>Penerangan</label>
        <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Arahan atau nota..." rows={2} style={{ ...inputStyle, resize: "none", marginBottom: 12 }} />
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Kategori</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button key={k} onClick={() => setForm(f => ({ ...f, category: k }))} style={{ padding: "5px 12px", borderRadius: 16, border: `1.5px solid ${form.category === k ? v.color : "#DDD"}`, background: form.category === k ? v.bg : "#fff", color: form.category === k ? v.color : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {v.icon} {k}
            </button>
          ))}
        </div>
        <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Ditugaskan Kepada</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["suami","isteri","bersama"].map(r => (
            <button key={r} onClick={() => setForm(f => ({ ...f, assignedTo: r }))} style={{ flex: 1, padding: 8, borderRadius: 12, border: `1.5px solid ${form.assignedTo === r ? ROLES[r].color : "#DDD"}`, background: form.assignedTo === r ? ROLES[r].bg : "#fff", color: form.assignedTo === r ? ROLES[r].color : "#888", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {ROLES[r].avatar} {r === "bersama" ? "Bersama" : (names[r] || r)}
            </button>
          ))}
        </div>
        {msg && <div style={{ fontSize: 13, color: msg.startsWith("✅") ? "#2D6A4F" : "#C0392B", marginBottom: 10, fontWeight: 600 }}>{msg}</div>}
        <button onClick={add} style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #2D6A4F, #40916C)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,106,79,0.3)", fontFamily: "inherit" }}>
          ➕ Tambah Tugas
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PantangCare() {
  // ── Room state ──
  const [roomCode, setRoomCode] = useState(null);
  const [inRoom, setInRoom] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const isSaving = useRef(false);
  const lastTs = useRef(0);

  // ── App state ──
  const [onboarded, setOnboarded] = useState(false);
  const [names, setNames] = useState({ suami: "Suami", isteri: "Isteri", tarikhBersalin: "", jenisBersalin: "normal" });
  const [role, setRole] = useState("suami");
  const [tab, setTab] = useState("tasks");
  const [day, setDay] = useState(7);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [czerTaskState, setCzerTaskState] = useState(CZER_EXTRA_TASKS);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [log, setLog] = useState(INITIAL_LOG);
  const [bidan, setBidan] = useState(INITIAL_BIDAN);
  const [filter, setFilter] = useState("semua");
  const [supps, setSupps] = useState(INITIAL_SUPPS);
  const [bidanChecklist, setBidanChecklist] = useState(INITIAL_BIDAN_CHECKLIST);
  const [susu, setSusu] = useState(INITIAL_SUSU);

  function packState() {
    return { onboarded, names, day, tasks, czerTaskState, menu, log, bidan, supps, bidanChecklist, susu };
  }
  function applyState(data) {
    if (!data) return;
    if (data.names) setNames(data.names);
    if (data.day != null) setDay(Number(data.day));
    if (data.tasks != null) setTasks(toArr(data.tasks).map(t => ({...t, comments: toArr(t.comments)})));
    if (data.czerTaskState != null) setCzerTaskState(toArr(data.czerTaskState).map(t => ({...t, comments: toArr(t.comments)})));
    if (data.menu != null) setMenu(toArr(data.menu).map(m => ({...m, komen: toArr(m.komen), bahan: toArr(m.bahan)})));
    if (data.log != null) setLog(toArr(data.log));
    if (data.bidan != null) setBidan(toArr(data.bidan));
    if (data.supps) setSupps({
      isteri: toArr(data.supps.isteri),
      suami: toArr(data.supps.suami),
    });
    if (data.bidanChecklist != null) setBidanChecklist(toArr(data.bidanChecklist));
    if (data.susu) setSusu({
      perahanLog: toArr(data.susu.perahanLog),
      menyusuLog: toArr(data.susu.menyusuLog),
      jenisSusu: data.susu.jenisSusu || "breastfeed",
    });
    if (data.onboarded != null) setOnboarded(data.onboarded);
  }

  // Auto-save setiap kali state berubah (debounced 2s)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!inRoom || !roomCode) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (isSaving.current) return;
      isSaving.current = true;
      setSyncStatus("syncing");
      await saveRoom(roomCode, packState());
      lastTs.current = Date.now();
      isSaving.current = false;
      setSyncStatus("ok");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }, 2000);
  }, [inRoom, roomCode, onboarded, names, day, tasks, czerTaskState, menu, log, bidan, supps, bidanChecklist, susu]);

  // Subscribe realtime updates dari Firebase
  useEffect(() => {
    if (!inRoom || !roomCode) return;
    const unsub = subscribeRoom(roomCode, (data) => {
      if (data._ts && data._ts > lastTs.current + 1500) {
        lastTs.current = data._ts;
        applyState(data);
        setSyncStatus("ok");
        setTimeout(() => setSyncStatus("idle"), 2000);
      }
    });
    return () => unsub();
  }, [inRoom, roomCode]);

  // Auto-join dari URL
  useEffect(() => {
    const urlRoom = getUrlRoom();
    if (urlRoom) {
      loadRoom(urlRoom).then(data => {
        if (data) { setRoomCode(urlRoom); applyState(data); setInRoom(true); }
      });
    }
  }, []);

  async function handleCreate() {
    const code = genRoomCode();
    setRoomCode(code);
    await saveRoom(code, packState());
    setInRoom(true);
    setShowShare(true);
  }

  function handleJoin(code, data) {
    setRoomCode(code);
    applyState(data);
    setInRoom(true);
  }

  if (!inRoom) return <RoomLobby onCreate={handleCreate} onJoin={handleJoin} />;

  const isCzer = names.jenisBersalin === "czer";
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeCzer = Array.isArray(czerTaskState) ? czerTaskState : [];
  const safeBidan = Array.isArray(bidan) ? bidan : [];
  const allTasks = isCzer ? [...safeTasks, ...safeCzer] : safeTasks;
  const allBidan = isCzer ? [...safeBidan, ...CZER_NOTA_BIDAN_TAMBAHAN] : safeBidan;
  const allPantangLarang = isCzer ? [...PANTANG_LARANG, ...CZER_PANTANG_TAMBAHAN] : PANTANG_LARANG;

  function handleToggle(id) {
    if (id >= 900) setCzerTaskState(ts => ts.map(x => x.id===id?{...x,done:!x.done}:x));
    else setTasks(ts => ts.map(x => x.id===id?{...x,done:!x.done}:x));
  }
  function handleComment(id, c) {
    if (id >= 900) setCzerTaskState(ts => ts.map(x => x.id===id?{...x,comments:[...x.comments,c]}:x));
    else setTasks(ts => ts.map(x => x.id===id?{...x,comments:[...x.comments,c]}:x));
  }

  if (!onboarded) return <Onboarding onDone={(n) => { setNames({ suami: n.suami, isteri: n.isteri, tarikhBersalin: n.tarikhBersalin, jenisBersalin: n.jenisBersalin || "normal" }); setOnboarded(true); }} />;

  const visible = (allTasks || []).filter(t => {
    if (filter === "semua") return true;
    if (filter === "saya") return t.assignedTo === role || t.assignedTo === "bersama";
    if (filter === "selesai") return t.done;
    if (filter === "belum") return !t.done;
    if (filter === "czer") return t.czerOnly === true;
    return true;
  }).sort((a,b) => a.time.localeCompare(b.time));

  const TABS = [
    { key: "tasks",   icon: "📋", label: "Tugas" },
    { key: "supp",    icon: "💊", label: "Supp" },
    { key: "susu",    icon: "🍼", label: "Susu" },
    { key: "bidan",   icon: "🧕", label: "Bidan" },
    { key: "dapur",   icon: "🍽", label: "Dapur" },
    { key: "log",     icon: "📓", label: "Log" },
    { key: "progress",icon: "📊", label: "Stats" },
    { key: "add",     icon: "➕", label: "+" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #EAF4EC 0%, #FDF6F0 60%, #F5EDF8 100%)", fontFamily: "Georgia, serif", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

      {showShare && <ShareModal roomCode={roomCode} onClose={() => setShowShare(false)} />}

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)", padding: "18px 18px 14px", borderRadius: "0 0 26px 26px", boxShadow: "0 4px 20px rgba(45,106,79,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: syncStatus==="ok" ? "#95D5B2" : syncStatus==="syncing" ? "#FFD166" : "#ffffff33", transition:"background 0.3s" }} />
            <span style={{ fontSize:10, color:"#A8D5BC" }}>{syncStatus==="syncing" ? "Menyimpan..." : syncStatus==="ok" ? "Sync ✓" : roomCode || ""}</span>
          </div>
          <button onClick={() => setShowShare(true)} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff", borderRadius:12, padding:"4px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            🔗 Kongsi
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#A8D5BC", letterSpacing: "0.1em", textTransform: "uppercase" }}>Log masuk sebagai</div>
            <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
              {["suami","isteri"].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ padding: "5px 14px", borderRadius: 20, border: "none", background: role === r ? "#fff" : "rgba(255,255,255,0.15)", color: role === r ? "#2D6A4F" : "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  {ROLES[r].avatar} {names[r]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#A8D5BC" }}>Hari Pantang</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginTop: 3 }}>
              <button onClick={() => setDay(d => Math.max(1,d-1))} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{day}</span>
              <button onClick={() => setDay(d => Math.min(44,d+1))} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <div style={{ fontSize: 11, color: "#A8D5BC" }}>/ 44 hari</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(day/44)*100}%`, background: "linear-gradient(90deg, #95D5B2, #fff)", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* TASK FILTERS — only show in tasks tab */}
      {tab === "tasks" && (
        <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto" }}>
          {[
            {key:"semua",label:"Semua"},
            {key:"saya",label:"Tugas Saya"},
            {key:"belum",label:"Belum"},
            {key:"selesai",label:"Selesai"},
            ...(isCzer ? [{key:"czer",label:"🏥 Czer"}] : [])
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid", borderColor: filter === f.key ? (f.key === "czer" ? "#9B2335" : "#2D6A4F") : "#DDD", background: filter === f.key ? (f.key === "czer" ? "#FADDE1" : "#EAF4EC") : "#fff", color: filter === f.key ? (f.key === "czer" ? "#9B2335" : "#2D6A4F") : "#888", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* CZER BANNER */}
      {isCzer && tab === "tasks" && (
        <div style={{ margin: "10px 16px 0", background: "linear-gradient(135deg, #9B2335, #C0392B)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Mod Pantang Caesar Aktif</div>
            <div style={{ fontSize: 11, color: "#FADDE1" }}>Termasuk 6 tugas penjagaan luka czer tambahan</div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {tab === "tasks" && (
        <div style={{ padding: "12px 16px" }}>
          {visible.length === 0
            ? <div style={{ textAlign: "center", color: "#AAA", padding: "40px 0", fontSize: 14 }}>Tiada tugas 🌿</div>
            : visible.map(t => (
              <div key={t.id}>
                {t.czerOnly && <div style={{ fontSize: 10, fontWeight: 800, color: "#9B2335", letterSpacing: "0.08em", marginBottom: 3, marginTop: 2, paddingLeft: 2 }}>🏥 KHAS CZER</div>}
                <TaskCard task={t} currentRole={role} names={names} onToggle={handleToggle} onComment={handleComment} />
              </div>
            ))
          }
        </div>
      )}
      {tab === "supp"     && <SuppTracker supps={supps} setSupps={setSupps} currentRole={role} names={names} />}
      {tab === "susu"     && <LogSusu susu={susu} setSusu={setSusu} currentRole={role} names={names} />}
      {tab === "dapur"    && <DapurPantang menu={menu} setMenu={setMenu} currentRole={role} names={names} pantangLarang={allPantangLarang} isCzer={isCzer} />}
      {tab === "log"      && <LogHarian log={log} setLog={setLog} day={day} />}
      {tab === "bidan"    && (
        <div>
          <BidanChecklist checklist={bidanChecklist} setChecklist={setBidanChecklist} currentRole={role} names={names} day={day} />
          <div style={{ margin: "0 16px 8px" }}>
            <div style={{ height: 1, background: "#EEE" }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7B5EA7", padding: "12px 0 8px", letterSpacing: "0.05em" }}>📝 NOTA & ARAHAN MAK BIDAN</div>
          </div>
          <NotaBidan bidan={allBidan} setBidan={setBidan} isCzer={isCzer} />
        </div>
      )}
      {tab === "progress" && <Progress tasks={allTasks} role={role} names={names} day={day} />}
      {tab === "add"      && <AddTask tasks={tasks} setTasks={setTasks} names={names} />}

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #E8E8E8", display: "flex", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "10px 0 8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit" }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: tab === t.key ? 800 : 500, color: tab === t.key ? "#2D6A4F" : "#AAA", letterSpacing: "0.03em" }}>{t.label}</span>
            {tab === t.key && <div style={{ width: 16, height: 3, background: "#2D6A4F", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
