// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.style.display === "block";
    mobileNav.style.display = isOpen ? "none" : "block";
  });
}

// Inizializza il contatore del carrello all'avvio
function initCartCounter() {
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        const totalItems = cart.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        cartCountEl.textContent = totalItems;
      } catch (e) {
        cartCountEl.textContent = "0";
      }
    }
  }
}

// Toast notifications
const toast = document.getElementById("toast");
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

// Inizializza all'avvio
initCartCounter();

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

// ---------- MESSAGGI FORM COMUNI ----------
function showMessage(message, type) {
  const oldMsg = document.querySelector(".form-message");
  if (oldMsg) oldMsg.remove();

  const msgDiv = document.createElement("div");
  msgDiv.className = `form-message ${type}`;
  msgDiv.textContent = message;
  msgDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
  `;

  if (type === "success") {
    msgDiv.style.background = "#d4edda";
    msgDiv.style.color = "#155724";
    msgDiv.style.border = "1px solid #c3e6cb";
  } else {
    msgDiv.style.background = "#f8d7da";
    msgDiv.style.color = "#721c24";
    msgDiv.style.border = "1px solid #f5c6cb";
  }

  const form = document.querySelector(".auth-form");
  if (form) form.insertBefore(msgDiv, form.firstChild);
}
// ---------- REGISTRAZIONE (solo se esiste registerForm) ----------
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return; // se non è la pagina di registrazione, esci

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("firstName").value.trim();
    const cognome = document.getElementById("lastName").value.trim();
    const mail = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = document.getElementById(
      "registerPasswordConfirm"
    ).value;
    const terms = document.getElementById("terms").checked;

    const registerBtn = document.querySelector("#registerForm .auth-btn");

    if (!terms) {
      showMessage("Accetta i termini e condizioni", "error");
      return;
    }

    if (!nome || !cognome || !mail || !password) {
      showMessage("Compila tutti i campi", "error");
      return;
    }

    if (!mail.includes("@")) {
      showMessage("Email non valida", "error");
      return;
    }

    if (password !== passwordConfirm) {
      showMessage("Le password non coincidono", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password troppo corta (min 6 caratteri)", "error");
      return;
    }

    registerBtn.textContent = "Registrazione...";
    registerBtn.disabled = true;

    fetch("registrazione.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "same-origin",
      body: `nome=${encodeURIComponent(nome)}&cognome=${encodeURIComponent(
        cognome
      )}&mail=${encodeURIComponent(mail)}&password=${encodeURIComponent(
        password
      )}&password_confirm=${encodeURIComponent(passwordConfirm)}`,
    })
      .then((response) => response.json())
      .then((data) => {
        showMessage(data.message, data.success ? "success" : "error");

        if (data.success) {
          setTimeout(() => {
            // Reindirizza alla home dopo registrazione
            window.location.href = "home.html";
          }, 1500);
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        showMessage("Errore connessione", "error");
      })
      .finally(() => {
        registerBtn.textContent = "Crea account";
        registerBtn.disabled = false;
      });
  });
});

// ---------- LOGIN (solo se esiste loginForm) ----------
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return; // se non è la pagina di login, esci

  const loginBtn = document.querySelector("#loginForm .auth-btn");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    const rememberMe = document.getElementById("rememberMe")?.checked;

    if (!email || !password) {
      showMessage("Inserisci email e password", "error");
      return;
    }

    if (!email.includes("@")) {
      showMessage("Email non valida", "error");
      return;
    }

    loginBtn.textContent = "Accesso...";
    loginBtn.disabled = true;

    fetch("login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "same-origin",
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
        password
      )}`,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showMessage(data.message, "success");

          if (rememberMe) {
            localStorage.setItem("rememberMe", email);
          }

          setTimeout(() => {
            window.location.href = "home.html";
          }, 1000);
        } else {
          showMessage(data.message, "error");
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        showMessage("Errore connessione. Riprova.", "error");
      })
      .finally(() => {
        loginBtn.textContent = "Accedi";
        loginBtn.disabled = false;
      });
  });
});
