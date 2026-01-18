// Gestione pagina checkout
document.addEventListener("DOMContentLoaded", function () {
  const checkoutForm = document.getElementById("checkoutForm");
  const orderItems = document.getElementById("orderItems");
  const orderSubtotal = document.getElementById("orderSubtotal");
  const orderShipping = document.getElementById("orderShipping");
  const orderTotal = document.getElementById("orderTotal");
  const submitBtn = document.getElementById("submitOrder");

  let cart = [];
  const FREE_SHIPPING_THRESHOLD = 50;

  // Carica il carrello
  function loadCart() {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {
        cart = [];
      }
    }

    if (cart.length === 0) {
      window.location.href = "carrello.html";
      return;
    }

    displayOrderSummary();
    loadUserData();
  }

  // Carica i dati utente se loggato
  function loadUserData() {
    fetch("check_session.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) {
          // Pre-compila i campi con i dati utente
          document.getElementById("nome").value = data.nome || "";
          document.getElementById("cognome").value = data.cognome || "";
          document.getElementById("email").value = data.email || "";
        }
      })
      .catch((error) => {
        console.error("Errore caricamento dati utente:", error);
      });
  }

  // Visualizza il riepilogo ordine
  function displayOrderSummary() {
    orderItems.innerHTML = "";

    cart.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "order-item";

      const qty = item.quantity || 1;
      const itemTotal = parseFloat(item.prezzo) * qty;

      itemDiv.innerHTML = `
        <div class="order-item-info">
          <p class="order-item-title">${item.titolo}</p>
          <p class="order-item-meta">Quantità: ${qty}</p>
        </div>
        <p class="order-item-price">€${itemTotal.toFixed(2).replace(".", ",")}</p>
      `;

      orderItems.appendChild(itemDiv);
    });

    updateTotals();
  }

  // Aggiorna i totali
  function updateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
    const total = subtotal + shipping;

    orderSubtotal.textContent = `€${subtotal.toFixed(2).replace(".", ",")}`;
    orderShipping.textContent =
      shipping === 0 ? "Gratis" : `€${shipping.toFixed(2).replace(".", ",")}`;
    orderTotal.textContent = `€${total.toFixed(2).replace(".", ",")}`;
  }

  // Submit dell'ordine
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validazione
    const nome = document.getElementById("nome").value.trim();
    const cognome = document.getElementById("cognome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const via = document.getElementById("via").value.trim();
    const citta = document.getElementById("citta").value.trim();
    const provincia = document
      .getElementById("provincia")
      .value.trim()
      .toUpperCase();
    const cap = document.getElementById("cap").value.trim();
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    ).value;
    const note = document.getElementById("note").value.trim();

    if (
      !nome ||
      !cognome ||
      !email ||
      !telefono ||
      !via ||
      !citta ||
      !provincia ||
      !cap
    ) {
      showToast("Compila tutti i campi obbligatori");
      return;
    }

    if (provincia.length !== 2) {
      showToast("Provincia deve essere di 2 caratteri");
      return;
    }

    if (cap.length !== 5 || isNaN(cap)) {
      showToast("CAP non valido");
      return;
    }

    // Calcola totale
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 4.9;
    const total = subtotal + shipping;

    // Prepara i dati dell'ordine
    const orderData = {
      nome,
      cognome,
      email,
      telefono,
      via,
      citta,
      provincia,
      cap,
      paymentMethod,
      note,
      totale: total.toFixed(2),
      prodotti: cart.map((item) => ({
        id_poster: item.id,
        prezzo: item.prezzo,
        quantita: item.quantity || 1,
      })),
    };

    // Disabilita il bottone
    submitBtn.textContent = "Elaborazione ordine...";
    submitBtn.disabled = true;

    // Invia l'ordine
    fetch("process_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Svuota il carrello
          localStorage.removeItem("artly_cart");

          // Salva i dati dell'ordine per la pagina di conferma
          localStorage.setItem(
            "order_confirmation",
            JSON.stringify({
              orderId: data.orderId,
              totale: total,
              data: new Date().toISOString(),
            }),
          );

          // Redirect alla pagina di successo
          window.location.href = "order-success.html";
        } else {
          showToast(data.message || "Errore durante la creazione dell'ordine");
          submitBtn.textContent = "Completa l'ordine";
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        showToast("Errore di connessione. Riprova.");
        submitBtn.textContent = "Completa l'ordine";
        submitBtn.disabled = false;
      });
  });

  // Inizializza
  loadCart();
});
