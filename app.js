// ── DOCUMENTS ──────────────────────────────────────────────────────────
// All images live inside the images/ folder.
// To add a new document, add one entry here — nothing else to change.
const DOCS = {
  "5174": { src: "images/dmed.jpg",    download: "dmed.pdf"    },
  "1308": { src: "images/dmed1.jpg",   download: "dmed.pdf"   },
  "8761": { src: "images/dmed_tm.jpg", download: "dmed.pdf" }
};

// ── LANGUAGE STRINGS ───────────────────────────────────────────────────
const LANG = {
  ru: { title: "Введите PIN-код для просмотра документа", btn: "Открыть", wrong: "Неверный PIN-код"   },
  en: { title: "Enter PIN code to view document",         btn: "Open",    wrong: "Wrong PIN code"     },
  uz: { title: "Hujjatni ko'rish uchun PIN kodni kiriting", btn: "Ochish", wrong: "PIN kod noto'g'ri" }
};

let currentLang = "ru";
let currentPin  = null;

// ── PIN INPUTS ─────────────────────────────────────────────────────────
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

// ── CHECK PIN ──────────────────────────────────────────────────────────
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
  document.getElementById("docPage").style.display = "block";
  document.getElementById("docImg").src = doc.src;
}

// ── DOWNLOAD ───────────────────────────────────────────────────────────
// Converts the current image to a PDF (A4, portrait) and saves it.
// iOS Safari fix: anchor.click() doesn't trigger downloads — open new tab.
function downloadFile() {
  if (!currentPin) return;
  const doc = DOCS[currentPin];

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = doc.src;

  img.onload = () => {
    // A4 in mm: 210 × 297. jsPDF uses mm by default.
    const A4_W = 210;
    const A4_H = 297;

    // Scale image to fit A4 width, preserving aspect ratio.
    const ratio    = img.naturalHeight / img.naturalWidth;
    const imgW     = A4_W;
    const imgH     = Math.min(A4_W * ratio, A4_H);
    const offsetY  = (A4_H - imgH) / 2; // vertical centering

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    pdf.addImage(img, "JPEG", 0, offsetY, imgW, imgH);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      // iOS: open PDF blob in new tab (anchor.click download not supported)
      const blob = pdf.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
    } else {
      pdf.save(doc.download);
    }
  };
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
  errorMsg.textContent                               = "";
  document.documentElement.lang                      = lang;
}
