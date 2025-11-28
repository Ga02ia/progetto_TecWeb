// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.style.display === "block";
    mobileNav.style.display = isOpen ? "none" : "block";
  });
}

// Fake cart counter + toast
const cartButtons = document.querySelectorAll(".add-to-cart");
const cartCountEl = document.getElementById("cartCount");
const toast = document.getElementById("toast");
let cartCount = cartCountEl ? parseInt(cartCountEl.textContent, 10) || 0 : 0;
let toastTimeout;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 2200);
}

if (cartButtons && cartButtons.length && cartCountEl) {
  cartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      cartCount++;
      cartCountEl.textContent = cartCount;
      showToast("Aggiunto al carrello ✅");
    });
  });
}

// Upload button (simulazione)
const uploadBtn = document.getElementById("uploadBtn");
if (uploadBtn) {
  uploadBtn.addEventListener("click", () => {
    showToast("Funzione upload in arrivo 😉");
  });
}

// Search bar (simulazione)
const searchInput = document.getElementById("searchInput");
const searchSubmit = document.getElementById("searchSubmit");

if (searchSubmit && searchInput) {
  searchSubmit.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if (!q) {
      showToast("Inserisci una parola chiave per cercare 🔎");
      return;
    }
    showToast(`Ricerca per “${q}” (demo)`);
  });
}

// Header search icon -> focus input
const searchBtn = document.getElementById("searchBtn");
if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => searchInput.focus(), 400);
  });
}

// Newsletter (simulazione invio)
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");

if (newsletterForm && newsletterEmail) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!newsletterEmail.value.trim()) return;
    showToast("Grazie! Controlla la tua email 📩");
    newsletterEmail.value = "";
  });
}

// Login form (demo)
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Accesso demo eseguito ✅");
    // qui in futuro potrai fare la chiamata al backend
  });
}

// Register form (demo)
const registerForm = document.getElementById("registerForm");
const registerPassword = document.getElementById("registerPassword");
const registerPasswordConfirm = document.getElementById(
  "registerPasswordConfirm"
);

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (registerPassword && registerPasswordConfirm) {
      if (registerPassword.value !== registerPasswordConfirm.value) {
        showToast("Le password non coincidono ❌");
        return;
      }
    }
    showToast("Registrazione demo completata 🎉");
    // qui in futuro potrai fare la chiamata al backend
  });
}

// Anno footer
const currentYearEl = document.getElementById("currentYear");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}
