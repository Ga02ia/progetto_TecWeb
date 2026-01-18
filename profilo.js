// Verifica autenticazione all'avvio
checkAuthAndLoadProfile();

function checkAuthAndLoadProfile() {
  fetch("check_session.php")
    .then((response) => response.json())
    .then((data) => {
      if (!data.authenticated) {
        // Se non è loggato, reindirizza al login
        window.location.href = "login.html";
        return;
      }
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
