// app.js - Entry point dell'applicazione SPA
// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Inizializzazione SPA Artly...");

  // Migra il carrello da localStorage a sessionStorage (se necessario)
  migrateCartStorage();

  // Verifica autenticazione utente
  await checkUserAuth();

  // Sottoscrivi agli aggiornamenti dello store
  store.subscribe((state) => {
    // Aggiorna il contatore del carrello
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.textContent = state.cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
    }
  });

  // Registra tutte le rotte dell'applicazione
  registerRoutes();

  // Hook prima del cambio rotta
  router.onBeforeRouteChange((from, to) => {
    // Chiudi eventuali dropdown o modal aperti
    const dropdowns = document.querySelectorAll(".show");
    dropdowns.forEach((el) => el.classList.remove("show"));

    // Chiudi mobile menu
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) mobileNav.style.display = "none";

    return true;
  });

  // Hook dopo il cambio rotta
  router.onAfterRouteChange((route, params) => {
    console.log("📍 Navigato a:", route, params);

    // Aggiorna header e footer
    headerComponent.update();

    // Gestisci gli anchor links (es. #hero, #collections)
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.getElementById(
          window.location.hash.substring(1),
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  });

  // Inizializza il router
  router.init();

  console.log("✅ SPA inizializzata con successo");
});

// Registra tutte le rotte dell'applicazione
function registerRoutes() {
  // Home page
  router.addRoute("/home", async () => {
    await loadView("home");
  });

  // Prodotti
  router.addRoute("/prodotti", async () => {
    await loadView("prodotti");
  });

  // Dettaglio prodotto
  router.addRoute("/dettaglio-prodotto", async (params) => {
    await loadView("dettaglio-prodotto", params);
  });

  // Carrello
  router.addRoute("/carrello", async () => {
    await loadView("carrello");
  });

  // Checkout
  router.addRoute("/checkout", async () => {
    // Verifica che l'utente sia autenticato
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per procedere");
      router.navigate("/login?redirect=/checkout");
      return;
    }

    // Verifica che il carrello non sia vuoto
    if (store.getCart().length === 0) {
      showToast("Il carrello è vuoto");
      router.navigate("/carrello");
      return;
    }

    await loadView("checkout");
  });

  // Login
  router.addRoute("/login", async (params) => {
    // Se già autenticato, reindirizza alla home
    if (store.isAuthenticated()) {
      router.navigate("/home");
      return;
    }
    await loadView("login", params);
  });

  // Registrazione
  router.addRoute("/registrazione", async () => {
    // Se già autenticato, reindirizza alla home
    if (store.isAuthenticated()) {
      router.navigate("/home");
      return;
    }
    await loadView("registrazione");
  });

  // Profilo
  router.addRoute("/profilo", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per accedere al profilo");
      router.navigate("/login?redirect=/profilo");
      return;
    }
    await loadView("profilo");
  });

  // Preferiti
  router.addRoute("/preferiti", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per vedere i preferiti");
      router.navigate("/login?redirect=/preferiti");
      return;
    }
    await loadView("preferiti");
  });

  // Admin
  router.addRoute("/admin", async () => {
    // Verifica autenticazione
    if (!store.isAuthenticated()) {
      showToast("Effettua il login per accedere");
      router.navigate("/login?redirect=/admin");
      return;
    }

    // Verifica se l'utente è admin
    if (!store.isAdmin()) {
      showToast("Accesso negato: solo gli amministratori possono accedere");
      router.navigate("/home");
      return;
    }

    await loadView("admin");
  });

  // Order success
  router.addRoute("/order-success", async () => {
    await loadView("order-success");
  });

  // 404 - Pagina non trovata
  router.addRoute("/404", async () => {
    await loadView("404");
  });

  // Rotta di default (redirect alla home)
  router.addRoute("/", async () => {
    router.navigate("/home", false);
  });
}

// Carica una view dinamicamente
async function loadView(viewName, params = {}) {
  const appContainer = document.getElementById("app");

  if (!appContainer) {
    console.error("Container #app non trovato");
    return;
  }

  try {
    // Mostra loader
    appContainer.innerHTML = '<div class="page-loader">Caricamento...</div>';

    // Carica il template HTML della view
    const response = await fetch(`views/${viewName}.html`);

    if (!response.ok) {
      throw new Error(`View non trovata: ${viewName}`);
    }

    const html = await response.text();

    console.log("📄 HTML caricato, lunghezza:", html.length, "caratteri");
    console.log("🔍 Contiene orderItems?", html.includes("orderItems"));

    // Costruisci il contenuto completo PRIMA di inserirlo
    const fullHTML =
      '<div id="header-container"></div>' +
      '<main id="main-content">' +
      html +
      "</main>" +
      '<div id="footer-container">' +
      footerComponent.render() +
      "</div>" +
      '<div class="toast" id="toast"></div>';

    // Inserisci tutto in una volta
    appContainer.innerHTML = fullHTML;

    // Render header
    const headerContainer = document.getElementById("header-container");
    headerContainer.innerHTML = headerComponent.render();
    headerComponent.attachEvents();

    // IMPORTANTE: Aspetta 2 frame del browser per assicurarsi che il DOM sia renderizzato
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );

    // Carica e inizializza il controller della view
    await initViewController(viewName, params);
  } catch (error) {
    console.error("Errore caricamento view:", error);
    appContainer.innerHTML = `
      <div class="error-page">
        <h1>😕 Errore</h1>
        <p>Impossibile caricare la pagina richiesta.</p>
        <a href="/home" data-link class="btn">Torna alla home</a>
      </div>
    `;
  }
}

// Inizializza il controller della view
async function initViewController(viewName, params) {
  // Mapping tra view e controller
  const controllers = {
    home: initHomeView,
    prodotti: initProdottiView,
    "dettaglio-prodotto": initDettaglioProdottoView,
    carrello: initCarrelloView,
    checkout: initCheckoutView,
    login: initLoginView,
    registrazione: initRegistrazioneView,
    profilo: initProfiloView,
    preferiti: initPreferitiView,
    admin: initAdminView,
    "order-success": initOrderSuccessView,
  };

  const controller = controllers[viewName];

  if (controller) {
    try {
      await controller(params);
    } catch (error) {
      console.error(`Errore inizializzazione controller ${viewName}:`, error);
    }
  }
}

// ==================== VIEW CONTROLLERS ====================

// Controller per la home
function initHomeView() {
  // Newsletter form
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

  // Upload button (simulazione)
  const uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      showToast("Funzione upload in arrivo 😉");
    });
  }

  // Search bar nella home
  const searchInput = document.getElementById("searchInput");
  const searchSubmit = document.getElementById("searchSubmit");

  if (searchSubmit && searchInput) {
    searchSubmit.addEventListener("click", () => {
      const q = searchInput.value.trim();
      if (!q) {
        showToast("Inserisci una parola chiave per cercare 🔎");
        return;
      }
      // Naviga alla pagina prodotti
      router.navigate("/prodotti");
    });
  }
}

// Controller per la pagina prodotti
async function initProdottiView() {
  console.log("🎯 initProdottiView chiamato");

  // Carica lo script se non è già caricato
  if (!window.initProdottiPage) {
    console.log(
      "📥 window.initProdottiPage non trovato, caricamento script...",
    );
    // Aggiungi timestamp per evitare cache
    await loadScript("prodotti.js?v=" + Date.now());
    console.log(
      "📜 Script caricato, window.initProdottiPage =",
      typeof window.initProdottiPage,
    );
  } else {
    console.log("✅ window.initProdottiPage già disponibile");
  }

  // Aspetta che il DOM sia renderizzato prima di inizializzare
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Esegui l'inizializzazione
  if (window.initProdottiPage) {
    console.log("🚀 Chiamata a window.initProdottiPage()");
    window.initProdottiPage();
  } else {
    console.error("❌ window.initProdottiPage non è una funzione!");
  }
}

// Controller per il dettaglio prodotto
async function initDettaglioProdottoView(params) {
  const productId = params.id;

  if (!productId) {
    showToast("Prodotto non trovato");
    router.navigate("/prodotti");
    return;
  }

  if (!window.initDettaglioProdottoPage) {
    await loadScript("dettaglio-prodotto.js");
  }

  if (window.initDettaglioProdottoPage) {
    window.initDettaglioProdottoPage(productId);
  }
}

// Controller per il carrello
async function initCarrelloView() {
  if (!window.initCarrelloPage) {
    await loadScript("carrello.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initCarrelloPage) {
    window.initCarrelloPage();
  }
}

// Controller per il checkout
async function initCheckoutView() {
  console.log("🔧 initCheckoutView chiamato");

  if (!window.initCheckoutPage) {
    console.log("📥 Caricamento checkout.js...");
    await loadScript("checkout.js");
  }

  // Aspetta che il DOM sia completamente renderizzato
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (window.initCheckoutPage) {
    console.log("✅ Chiamata a initCheckoutPage()");
    window.initCheckoutPage();
  } else {
    console.error("❌ initCheckoutPage non trovata!");
  }
}

// Controller per il login
function initLoginView(params) {
  initPasswordToggles();
  setupForgotPasswordModal();

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const loginBtn = document.querySelector("#loginForm .auth-btn");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

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

    try {
      const response = await fetch("api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage(data.message, "success");

        // Aggiorna lo store con i dati utente
        await checkUserAuth();

        setTimeout(() => {
          // Reindirizza alla pagina originale se presente il parametro redirect
          let redirectTo = params.redirect || "/home";

          // Se il redirect contiene caratteri codificati (come %3F per ?), decodificali
          redirectTo = decodeURIComponent(redirectTo);

          // Verifica se l'utente è admin e sta cercando di accedere all'admin
          if (redirectTo === "/admin" && !store.isAdmin()) {
            showToast("Accesso negato: non hai i permessi di amministratore");
            redirectTo = "/home";
          }

          router.navigate(redirectTo);
        }, 1000);
      } else {
        showMessage(data.message, "error");
      }
    } catch (error) {
      console.error("Errore:", error);
      showMessage("Errore connessione. Riprova.", "error");
    } finally {
      loginBtn.textContent = "Accedi";
      loginBtn.disabled = false;
    }
  });
}

// Controller per la registrazione
function initRegistrazioneView() {
  initPasswordToggles();

  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  const inputs = registerForm.querySelectorAll("input");

  // 1. DEFINIZIONE REGOLE DI VALIDAZIONE
  const validators = {
    nome: (val) => (val.trim().length > 0 ? "" : "Inserisci il tuo nome"),
    cognome: (val) => (val.trim().length > 0 ? "" : "Inserisci il tuo cognome"),
    mail: (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        ? ""
        : "Inserisci un'email valida",
    telefono: (val) =>
      /^\d{10}$/.test(val) ? "" : "Inserisci un numero di 10 cifre",
    via: (val) => (val.trim().length > 0 ? "" : "Indirizzo richiesto"),
    citta: (val) => (val.trim().length > 0 ? "" : "Città richiesta"),
    provincia: (val) =>
      /^[a-zA-Z]{2}$/.test(val) ? "" : "2 lettere (es. MI)",
    cap: (val) => (/^\d{5}$/.test(val) ? "" : "CAP di 5 cifre"),
    password: (val) => (val.length >= 6 ? "" : "Minimo 6 caratteri"),
    password_confirm: (val) => {
      const pass = document.getElementById("registerPassword").value;
      return val === pass && val.length >= 6
        ? ""
        : "Le password non coincidono";
    },
  };

  // 2. FUNZIONE DI CONTROLLO SINGOLO CAMPO
  // Ritorna true se c'è un errore, false se è tutto ok
  function checkInput(input) {
    const name = input.name;
    const val = input.value;
    // Cerca il div .error-message nel genitore .form-group
    const errorDiv = input
      .closest(".form-group")
      .querySelector(".error-message");

    const errorText = validators[name](val);

    if (errorText) {
      // Mostra errore
      errorDiv.textContent = errorText;
      errorDiv.classList.add("visible");
      input.classList.add("input-error");
      return true; // Trovato errore
    } else {
      // Nascondi errore
      errorDiv.textContent = "";
      errorDiv.classList.remove("visible");
      input.classList.remove("input-error");
      return false; // Nessun errore
    }
  }

  // 3. ASSEGNAZIONE EVENT LISTENER (BLUR & INPUT)
  inputs.forEach((input) => {
    // Quando esci dal campo -> Controlla
    input.addEventListener("blur", () => checkInput(input));

    // Mentre scrivi -> Se c'era rosso, ricontrolla per toglierlo
    input.addEventListener("input", () => {
      if (input.classList.contains("input-error")) {
        checkInput(input);
      }
      // Caso speciale: se scrivo nella password, ricontrollo la conferma
      if (input.name === "password") {
        const confirmInput = document.getElementById("registerPasswordConfirm");
        if (confirmInput.value !== "") checkInput(confirmInput);
      }
    });
  });

  // 4. GESTIONE SUBMIT DEL FORM
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const registerBtn = document.querySelector("#registerForm .auth-btn");
    const terms = document.getElementById("terms").checked;

    // Check validazione visuale su TUTTI i campi
    let hasVisualErrors = false;
    inputs.forEach((input) => {
      // Esegue il controllo e se torna true (errore), aggiorna il flag
      if (checkInput(input)) hasVisualErrors = true;
    });

    if (hasVisualErrors) {
      showMessage("Compila correttamente i campi evidenziati in rosso", "error");
      return;
    }

    if (!terms) {
      showMessage("Accetta i termini e condizioni", "error");
      return;
    }

    // Raccogli i dati (ora siamo sicuri che siano validi)
    const formData = {
      nome: document.getElementById("firstName").value.trim(),
      cognome: document.getElementById("lastName").value.trim(),
      mail: document.getElementById("registerEmail").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      via: document.getElementById("via").value.trim(),
      citta: document.getElementById("citta").value.trim(),
      provincia: document.getElementById("provincia").value.trim().toUpperCase(),
      cap: document.getElementById("cap").value.trim(),
      password: document.getElementById("registerPassword").value,
      password_confirm: document.getElementById("registerPasswordConfirm").value,
    };

    registerBtn.textContent = "Registrazione...";
    registerBtn.disabled = true;

    try {
      const response = await fetch("api/auth/registrazione.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      showMessage(data.message, data.success ? "success" : "error");

      if (data.success) {
        // Aggiorna lo store con i dati utente
        await checkUserAuth();

        setTimeout(() => {
          router.navigate("/home");
        }, 1500);
      }
    } catch (error) {
      console.error("Errore:", error);
      showMessage("Errore connessione", "error");
    } finally {
      registerBtn.textContent = "Crea account";
      registerBtn.disabled = false;
    }
  });
}

// Controller per il profilo
async function initProfiloView() {
  if (!window.initProfiloPage) {
    await loadScript("profilo.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initProfiloPage) {
    window.initProfiloPage();
  }
}

// Controller per i preferiti
async function initPreferitiView() {
  if (!window.initPreferitiPage) {
    await loadScript("preferiti.js");
  }

  await new Promise((resolve) => setTimeout(resolve, 10));

  if (window.initPreferitiPage) {
    window.initPreferitiPage();
  }
}

// Controller per l'admin
async function initAdminView() {
  if (!window.initAdminPage) {
    await loadScript("admin.js");
  }

  // Aspetta che gli elementi DOM siano presenti
  let attempts = 0;
  while (!document.getElementById("prodotti-list") && attempts < 20) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    attempts++;
  }

  if (!document.getElementById("prodotti-list")) {
    console.error(
      "❌ ERRORE: Elementi admin non trovati nel DOM dopo 1 secondo!",
    );
    console.log(
      "📋 Contenuto #main-content:",
      document.getElementById("main-content")?.innerHTML.substring(0, 200),
    );
    return;
  }

  console.log("✅ Elementi DOM trovati, inizializzo admin...");

  if (window.initAdminPage) {
    window.initAdminPage();
  }
}

// Controller per order success
function initOrderSuccessView() {
  // Mostra messaggio di successo
  setTimeout(() => {
    showToast("Ordine completato con successo! 🎉");
  }, 100);
}

// Migra il carrello e pulisce vecchi storage
function migrateCartStorage() {
  try {
    // Rimuovi eventuali dati del carrello da sessionStorage (vecchia implementazione)
    const sessionCart = sessionStorage.getItem("artly_cart");
    if (sessionCart) {
      console.log("🔄 Rimozione carrello da sessionStorage...");
      sessionStorage.removeItem("artly_cart");
      console.log("✅ Carrello rimosso da sessionStorage");
    }

    // Il carrello ora è sempre in localStorage
    console.log("✅ Storage configurato correttamente");
  } catch (error) {
    console.error("❌ Errore durante la pulizia dello storage:", error);
  }
}

// Setup modal recupero password
function setupForgotPasswordModal() {
  const forgotLink = document.getElementById("forgotPasswordLink");
  const modal = document.getElementById("forgotPasswordModal");
  const closeBtn = document.getElementById("closeForgotPasswordModal");
  const cancelBtn = document.getElementById("cancelResetBtn");
  const form = document.getElementById("forgotPasswordForm");

  if (!forgotLink || !modal) return;

  // Apri modal e precompila email
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();

    // Precompila l'email se presente nel form di login
    const loginEmail = document.getElementById("loginEmail");
    const resetEmail = document.getElementById("resetEmail");
    if (loginEmail && resetEmail && loginEmail.value.trim()) {
      resetEmail.value = loginEmail.value.trim();
    }

    modal.style.display = "flex";
  });

  // Chiudi modal
  const closeModal = () => {
    modal.style.display = "none";
    form.reset();
    document.getElementById("resetErrorMessage").style.display = "none";
    document.getElementById("resetSuccessMessage").style.display = "none";
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorMsg = document.getElementById("resetErrorMessage");
    const successMsg = document.getElementById("resetSuccessMessage");
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const email = document.getElementById("resetEmail").value.trim();
    const newPassword = document.getElementById("resetNewPassword").value;
    const confirmPassword = document.getElementById(
      "resetConfirmPassword",
    ).value;

    // Validazione
    if (!email || !email.includes("@")) {
      errorMsg.textContent = "Inserisci un'email valida";
      errorMsg.style.display = "block";
      return;
    }

    if (newPassword.length < 6) {
      errorMsg.textContent = "La password deve essere di almeno 6 caratteri";
      errorMsg.style.display = "block";
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMsg.textContent = "Le password non coincidono";
      errorMsg.style.display = "block";
      return;
    }

    try {
      const response = await fetch("reset_password.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        successMsg.textContent =
          "Password modificata con successo! Puoi effettuare il login.";
        successMsg.style.display = "block";

        // Chiudi modal dopo 2 secondi
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        errorMsg.textContent =
          data.message || "Errore durante il reset della password";
        errorMsg.style.display = "block";
      }
    } catch (error) {
      console.error("Errore:", error);
      errorMsg.textContent = "Errore di connessione al server";
      errorMsg.style.display = "block";
    }
  });
}
