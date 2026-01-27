// Utils - Funzioni di utilità riutilizzabili

//variabile globale per definizione del percorso delle immagini
window.image_path = "/progetto_TecWeb/img/";

// Toast notifications
let toastTimeout;

function showToast(message, type = "normal") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;

  // Resetta le classi per evitare che rimanga rosso
  toast.className = "toast";

  // Aggiunge classe specifica se è un errore
  if (type === "error") {
    toast.classList.add("toast--error");
  }

  toast.classList.add("toast--visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 2200);
}
// Mostra messaggi nei form
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

// Verifica autenticazione utente
async function checkUserAuth() {
  try {
    const response = await fetch("api/me.php");
    const data = await response.json();

    if (data.authenticated) {
      //utente loggato aggiorna dati utenti
      const userData = {
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        is_admin: data.is_admin || false,
        ruolo: data.is_admin ? "admin" : "user", // Aggiungi campo ruolo per compatibilità
      };
      store.setUser(userData);
    } else {
      // Verifica se l'utente è stato bloccato
      if (data.blocked) {
        showToast(
          "Il tuo account è stato bloccato dall'amministratore.",
          "error",
        );
        store.logout(); // Svuota carrello e dati utente
        router.navigate("/home");
      } else {
        // mantiene carrello locale
        store.clearUser();
      }
    }

    return data;
  } catch (error) {
    console.error("Errore verifica autenticazione:", error);
    return { authenticated: false };
  }
}

// Formatta prezzo
function formatPrice(price) {
  return `€${parseFloat(price).toFixed(2)}`;
}

// Genera stile immagine prodotto
function getProductImageStyle(product) {
  if (product.image_path && product.image_path.includes("pinterest.com")) {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ];
    return `background: ${colors[product.id % colors.length]};`;
  } else if (product.image_path) {
    return `background-image: url('${product.image_path}');`;
  }
  return "";
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Gestione toggle password
function initPasswordToggles() {
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
}

// Carica script dinamicamente
function loadScript(src) {
  return new Promise((resolve, reject) => {
    console.log(`📜 Caricamento script: ${src}`);

    // Controlla se lo script è già stato caricato
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      console.log(`✅ Script già caricato: ${src}`);
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log(`✅ Script caricato con successo: ${src}`);
      resolve();
    };
    script.onerror = (error) => {
      console.error(`❌ Errore caricamento script: ${src}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Sanitizza HTML per prevenire XSS
function sanitizeHTML(str) {
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
