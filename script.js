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
          0,
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
checkUserAuth();

// Verifica lo stato di autenticazione dell'utente
function checkUserAuth() {
  fetch("check_session.php")
    .then((response) => response.json())
    .then((data) => {
      updateHeaderAuth(data);
    })
    .catch((error) => {
      console.error("Errore verifica autenticazione:", error);
    });
}

// Aggiorna l'header in base allo stato di autenticazione
function updateHeaderAuth(authData) {
  const loginBtn = document.querySelector(
    '.header-actions a[href="login.html"]',
  );

  if (authData.authenticated && authData.nome && authData.cognome) {
    // Utente loggato: mostra il cerchietto con le iniziali
    if (loginBtn) {
      const iniziali = (
        authData.nome.charAt(0) + authData.cognome.charAt(0)
      ).toUpperCase();

      const profileCircle = document.createElement("div");
      profileCircle.className = "user-profile-circle";
      profileCircle.textContent = iniziali;
      profileCircle.title = `${authData.nome} ${authData.cognome}`;

      // Crea dropdown menu
      const dropdown = document.createElement("div");
      dropdown.className = "user-dropdown";
      dropdown.innerHTML = `
        <div class="user-dropdown-header">
          <strong>${authData.nome} ${authData.cognome}</strong>
          <span>${authData.email}</span>
        </div>
        <div class="user-dropdown-item" onclick="window.location.href='profilo.html'">
          <span>Il mio profilo</span>
        </div>
        <div class="user-dropdown-item" id="logoutBtn">
          <span>Logout</span>
        </div>
      `;

      const wrapper = document.createElement("div");
      wrapper.className = "user-profile-wrapper";
      wrapper.appendChild(profileCircle);
      wrapper.appendChild(dropdown);

      // Toggle dropdown
      profileCircle.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });

      // Chiudi dropdown cliccando fuori
      document.addEventListener("click", () => {
        dropdown.classList.remove("show");
      });

      // Logout handler
      const logoutBtn = dropdown.querySelector("#logoutBtn");
      logoutBtn.addEventListener("click", handleLogout);

      loginBtn.replaceWith(wrapper);
    }
  } else {
    // Utente non loggato: mostra il pulsante Accedi
    // (già presente di default)
  }
}

// Gestisce il logout
function handleLogout() {
  fetch("logout.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Logout effettuato ✓");
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      }
    })
    .catch((error) => {
      console.error("Errore logout:", error);
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
  // Gestione toggle password
  const passwordToggles = document.querySelectorAll(".password-toggle");
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const icon = this.querySelector(".eye-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "👁️‍🗨️";
      } else {
        input.type = "password";
        icon.textContent = "👁️";
      }
    });
  });

  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return; // se non è la pagina di registrazione, esci

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("firstName").value.trim();
    const cognome = document.getElementById("lastName").value.trim();
    const mail = document.getElementById("registerEmail").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const via = document.getElementById("via").value.trim();
    const citta = document.getElementById("citta").value.trim();
    const provincia = document
      .getElementById("provincia")
      .value.trim()
      .toUpperCase();
    const cap = document.getElementById("cap").value.trim();
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = document.getElementById(
      "registerPasswordConfirm",
    ).value;
    const terms = document.getElementById("terms").checked;

    const registerBtn = document.querySelector("#registerForm .auth-btn");

    if (!terms) {
      showMessage("Accetta i termini e condizioni", "error");
      return;
    }

    if (
      !nome ||
      !cognome ||
      !mail ||
      !telefono ||
      !via ||
      !citta ||
      !provincia ||
      !cap ||
      !password
    ) {
      showMessage("Compila tutti i campi", "error");
      return;
    }

    if (!mail.includes("@")) {
      showMessage("Email non valida", "error");
      return;
    }

    if (provincia.length !== 2) {
      showMessage("Provincia deve essere di 2 caratteri (es. MI)", "error");
      return;
    }

    if (cap.length !== 5 || isNaN(cap)) {
      showMessage("CAP non valido (5 cifre)", "error");
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
        cognome,
      )}&mail=${encodeURIComponent(mail)}&telefono=${encodeURIComponent(
        telefono,
      )}&via=${encodeURIComponent(via)}&citta=${encodeURIComponent(
        citta,
      )}&provincia=${encodeURIComponent(provincia)}&cap=${encodeURIComponent(
        cap,
      )}&password=${encodeURIComponent(
        password,
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
        password,
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
