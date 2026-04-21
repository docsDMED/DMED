// ── DOCUMENTS ──────────────────────────────────────────────────────────
// Fix: PIN 1308 now shows dmed1.jpg (image) instead of PDF.
// To add a new document, just add one line here.
const DOCS = {
  "5174": { src: "dmed.jpg",  download: "DMED.jpg"  },
  "1308": { src: "dmed1.jpg", download: "DMED1.jpg" }
};

// ── LANGUAGE STRINGS ───────────────────────────────────────────────────
const LANG = {
  ru: { title: "Введите PIN-код для просмотра документа", btn: "Открыть", wrong: "Неверный PIN-код"  },
  en: { title: "Enter PIN code to view document",         btn: "Open",    wrong: "Wrong PIN code"    },
  uz: { title: "Hujjatni ko'rish uchun PIN kodni kiriting", btn: "Ochish", wrong: "PIN kod noto'g'ri" }
};

let currentLang = "ru";
let currentPin  = null; // Fix #2: store active doc instead of re-searching viewers

// ── PIN INPUTS ──────────────────────────────────────────────────────────
const inputs   = Array.from(document.querySelectorAll(".pin-container input"));
const openBtn  = document.getElementById("openBtn");
const errorMsg = document.getElementById("errorMsg");

inputs.forEach((input, i) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(-1);
    errorMsg.textContent = "";
    if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
    openBtn.disabled = getPin().length < 4;
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && i > 0) {
      inputs[i - 1].focus();
      inputs[i - 1].value = "";
      openBtn.disabled = true;
    }
    if (e.key === "Enter" && !openBtn.disabled) checkPIN();
  });
});

function getPin() {
  return inputs.map(i => i.value).join("");
}

// ── CHECK PIN ───────────────────────────────────────────────────────────
function checkPIN() {
  const pin = getPin();
  const doc = DOCS[pin];

  if (!doc) {
    errorMsg.textContent = LANG[currentLang].wrong;
    inputs.forEach(i => i.value = "");
    inputs[0].focus();
    openBtn.disabled = true;
    return;
  }

  currentPin = pin;
  document.getElementById("pinPage").style.display = "none";
  document.getElementById("docPage").style.display  = "block";
  document.getElementById("docImg").src = doc.src;
}

// ── DOWNLOAD ─────────────────────────────────────────────────────────────
// Fix #1 & #2: dead code removed, currentPin used directly.
// Offer D: iOS Safari cannot trigger file downloads via anchor.click()
//           on relative paths — open the image in a new tab instead.
function downloadFile() {
  if (!currentPin) return;
  const doc = DOCS[currentPin];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    window.open(doc.src, "_blank");
    return;
  }

  const a = document.createElement("a");
  a.href     = doc.src;
  a.download = doc.download;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── LANGUAGE ───────────────────────────────────────────────────────────
document.getElementById("langBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const menu = document.getElementById("langMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => {
  document.getElementById("langMenu").style.display = "none";
});

function setLang(lang) {
  currentLang = lang;
  const s = LANG[lang];
  document.getElementById("title").textContent       = s.title;
  document.getElementById("btnText").textContent     = s.btn;
  document.getElementById("currentLang").textContent = lang.toUpperCase();
  document.getElementById("langMenu").style.display  = "none";
  // Fix #3: clear stale error message on language switch
  errorMsg.textContent = "";
  // Fix #9: keep <html lang> in sync for accessibility / SEO
  document.documentElement.lang = lang;
}
