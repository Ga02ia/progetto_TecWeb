// Verifica autenticazione all'avvio
let currentUserData = null;

function initProfiloPage() {
  checkAuthAndLoadProfile();
  setupEditProfileModal();
  setupChangePasswordModal();
}

window.initProfiloPage = initProfiloPage;

function checkAuthAndLoadProfile() {
  fetch("check_session.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.authenticated) {
        // Se non è loggato, reindirizza al login
        window.location.href = "login.html";
        return;
      }
      // Salva i dati utente
      currentUserData = data;
      // Carica i dati del profilo
      loadUserProfile(data);
      loadUserOrders();
    })
    .catch((error) => {
      console.error("Errore verifica autenticazione:", error);
      window.location.href = "login.html";
    });
}

// Carica i dati personali dell'utente
function loadUserProfile(userData) {
  document.getElementById("userNome").textContent = userData.nome || "-";
  document.getElementById("userCognome").textContent = userData.cognome || "-";
  document.getElementById("userEmail").textContent = userData.email || "-";
  document.getElementById("userTelefono").textContent =
    userData.telefono || "-";
  document.getElementById("userIndirizzo").textContent = userData.via || "-";
  document.getElementById("userCitta").textContent = userData.citta || "-";
  document.getElementById("userProvincia").textContent =
    userData.provincia || "-";
  document.getElementById("userCap").textContent = userData.cap || "-";
}

// Setup modale di modifica profilo
function setupEditProfileModal() {
  const editBtn = document.getElementById("editProfileBtn");
  const modal = document.getElementById("editProfileModal");
  const closeBtn = document.getElementById("closeEditModal");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const form = document.getElementById("editProfileForm");

  // Apri modale
  editBtn.addEventListener("click", () => {
    openEditModal();
  });

  // Chiudi modale
  closeBtn.addEventListener("click", closeEditModal);
  cancelBtn.addEventListener("click", closeEditModal);

  // Chiudi cliccando fuori dalla modale
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeEditModal();
    }
  });

  // Submit form
  form.addEventListener("submit", handleProfileUpdate);
}

// Apri modale e popola i campi
function openEditModal() {
  const modal = document.getElementById("editProfileModal");

  // Popola i campi con i dati attuali
  if (currentUserData) {
    document.getElementById("editNome").value = currentUserData.nome || "";
    document.getElementById("editCognome").value =
      currentUserData.cognome || "";
    document.getElementById("editEmail").value = currentUserData.email || "";
    document.getElementById("editTelefono").value =
      currentUserData.telefono || "";
    document.getElementById("editVia").value = currentUserData.via || "";
    document.getElementById("editCitta").value = currentUserData.citta || "";
    document.getElementById("editProvincia").value =
      currentUserData.provincia || "";
    document.getElementById("editCap").value = currentUserData.cap || "";
  }

  // Reset messaggi
  document.getElementById("editErrorMessage").style.display = "none";
  document.getElementById("editSuccessMessage").style.display = "none";

  modal.style.display = "flex";
}

// Chiudi modale
function closeEditModal() {
  const modal = document.getElementById("editProfileModal");
  modal.style.display = "none";
}

// Gestisci aggiornamento profilo
async function handleProfileUpdate(e) {
  e.preventDefault();

  const errorMsg = document.getElementById("editErrorMessage");
  const successMsg = document.getElementById("editSuccessMessage");
  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  // Raccogli i dati dal form
  const formData = {
    nome: document.getElementById("editNome").value.trim(),
    cognome: document.getElementById("editCognome").value.trim(),
    mail: document.getElementById("editEmail").value.trim(),
    telefono: document.getElementById("editTelefono").value.trim(),
    via: document.getElementById("editVia").value.trim(),
    citta: document.getElementById("editCitta").value.trim(),
    provincia: document
      .getElementById("editProvincia")
      .value.trim()
      .toUpperCase(),
    cap: document.getElementById("editCap").value.trim(),
  };

  // Aggiungi password solo se è stata inserita
  const password = document.getElementById("editPassword").value;
  if (password) {
    formData.password = password;
  }

  // Validazione base
  if (!formData.nome || !formData.cognome || !formData.mail) {
    errorMsg.textContent = "Nome, cognome ed email sono obbligatori";
    errorMsg.style.display = "block";
    return;
  }

  try {
    const response = await fetch("update_profile.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      successMsg.textContent = "Profilo aggiornato con successo!";
      successMsg.style.display = "block";

      // Ricarica i dati del profilo
      setTimeout(() => {
        closeEditModal();
        checkAuthAndLoadProfile();
      }, 1500);
    } else {
      errorMsg.textContent = data.message || "Errore durante l'aggiornamento";
      errorMsg.style.display = "block";
    }
  } catch (error) {
    console.error("Errore:", error);
    errorMsg.textContent = "Errore di connessione al server";
    errorMsg.style.display = "block";
  }
}

// Carica lo storico ordini
function loadUserOrders() {
  fetch("get_ordini.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayOrders(data.ordini);
      } else {
        document.getElementById("ordersContainer").innerHTML =
          '<p class="no-orders">Nessun ordine trovato.</p>';
      }
    })
    .catch((error) => {
      console.error("Errore caricamento ordini:", error);
      document.getElementById("ordersContainer").innerHTML =
        '<p class="error-message">Errore nel caricamento degli ordini.</p>';
    });
}

// Mostra gli ordini
function displayOrders(ordini) {
  const container = document.getElementById("ordersContainer");

  if (ordini.length === 0) {
    container.innerHTML = '<p class="no-orders">Nessun ordine trovato.</p>';
    return;
  }

  let html = "";

  ordini.forEach((ordine) => {
    const dataOrdine = new Date(ordine.data).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    html += `
      <div class="order-card">
        <div class="order-card-header">
          <div class="order-card-info">
            <span class="order-id">Ordine #${ordine.id}</span>
            <span class="order-date">${dataOrdine}</span>
          </div>
          <span class="order-total">€${parseFloat(ordine.totale).toFixed(2)}</span>
        </div>
        <div class="order-card-body">
          <div class="order-products">
            ${ordine.prodotti
              .map(
                (prodotto) => `
              <div class="order-product-item">
                <img src="${prodotto.image_path}" alt="${prodotto.titolo}" class="order-product-img" />
                <div class="order-product-info">
                  <h4>${prodotto.titolo}</h4>
                  <p class="order-product-author">${prodotto.autore}</p>
                  <p class="order-product-price">€${parseFloat(prodotto.prezzo).toFixed(2)}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
        <div class="order-card-footer">
          <button class="btn btn-outline btn-reorder" onclick="reorderItems(${ordine.id})">
            🔄 Riordina
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Funzione per riordinare (aggiunge tutti i prodotti dell'ordine al carrello)
function reorderItems(orderId) {
  fetch("get_ordini.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        showToast("Errore nel recupero dell'ordine");
        return;
      }

      // Trova l'ordine specifico
      const ordine = data.ordini.find((o) => o.id === orderId);
      if (!ordine) {
        showToast("Ordine non trovato");
        return;
      }

      // Ottieni il carrello attuale
      let cart = [];
      const savedCart = localStorage.getItem("artly_cart");
      if (savedCart) {
        try {
          cart = JSON.parse(savedCart);
        } catch (e) {
          cart = [];
        }
      }

      // Aggiungi tutti i prodotti dell'ordine al carrello
      ordine.prodotti.forEach((prodotto) => {
        const existingIndex = cart.findIndex((item) => item.id === prodotto.id);
        if (existingIndex !== -1) {
          // Prodotto già nel carrello, incrementa quantità
          cart[existingIndex].quantity =
            (cart[existingIndex].quantity || 1) + 1;
        } else {
          // Aggiungi nuovo prodotto al carrello
          cart.push({
            id: prodotto.id,
            titolo: prodotto.titolo,
            autore: prodotto.autore,
            prezzo: prodotto.prezzo,
            image_path: prodotto.image_path,
            quantity: 1,
          });
        }
      });

      // Salva il carrello aggiornato
      localStorage.setItem("artly_cart", JSON.stringify(cart));

      // Aggiorna il contatore del carrello
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        cartCountEl.textContent = totalItems;
      }

      showToast(
        `${ordine.prodotti.length} prodott${ordine.prodotti.length > 1 ? "i aggiunti" : "o aggiunto"} al carrello!`,
      );

      // Dopo 1.5 secondi reindirizza al carrello
      setTimeout(() => {
        window.location.href = "carrello.html";
      }, 1500);
    })
    .catch((error) => {
      console.error("Errore nel riordino:", error);
      showToast("Errore nel riordino");
    });
}

// Setup modale cambio password
function setupChangePasswordModal() {
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const modal = document.getElementById("changePasswordModal");
  const closeBtn = document.getElementById("closeChangePasswordModal");
  const cancelBtn = document.getElementById("cancelChangePasswordBtn");
  const form = document.getElementById("changePasswordForm");

  // Apri modale
  changePasswordBtn.addEventListener("click", () => {
    openChangePasswordModal();
  });

  // Chiudi modale
  closeBtn.addEventListener("click", closeChangePasswordModal);
  cancelBtn.addEventListener("click", closeChangePasswordModal);

  // Chiudi cliccando fuori dalla modale
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeChangePasswordModal();
    }
  });

  // Submit form
  form.addEventListener("submit", handleChangePassword);
}

// Apri modale cambio password
function openChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");

  // Precompila email con i dati dell'utente
  if (currentUserData && currentUserData.email) {
    document.getElementById("changePasswordEmail").value =
      currentUserData.email;
  }

  // Reset campi password
  document.getElementById("changePasswordNew").value = "";
  document.getElementById("changePasswordConfirm").value = "";

  // Reset messaggi
  document.getElementById("changePasswordError").style.display = "none";
  document.getElementById("changePasswordSuccess").style.display = "none";

  modal.style.display = "flex";
}

// Chiudi modale cambio password
function closeChangePasswordModal() {
  const modal = document.getElementById("changePasswordModal");
  modal.style.display = "none";
}

// Gestisci cambio password
async function handleChangePassword(e) {
  e.preventDefault();

  const errorMsg = document.getElementById("changePasswordError");
  const successMsg = document.getElementById("changePasswordSuccess");
  errorMsg.style.display = "none";
  successMsg.style.display = "none";

  const email = document.getElementById("changePasswordEmail").value;
  const newPassword = document.getElementById("changePasswordNew").value;
  const confirmPassword = document.getElementById(
    "changePasswordConfirm",
  ).value;

  // Validazione
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
      successMsg.textContent = "Password modificata con successo!";
      successMsg.style.display = "block";

      // Reset form e chiudi modale dopo 2 secondi
      setTimeout(() => {
        closeChangePasswordModal();
      }, 2000);
    } else {
      errorMsg.textContent =
        data.message || "Errore durante il cambio password";
      errorMsg.style.display = "block";
    }
  } catch (error) {
    console.error("Errore:", error);
    errorMsg.textContent = "Errore di connessione al server";
    errorMsg.style.display = "block";
  }
}
