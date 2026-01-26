// Gestione pagina checkout
function initCheckoutPage() {
  console.log("🛒 Inizializzazione checkout page");

  const checkoutForm = document.getElementById("checkoutForm");
  const orderItems = document.getElementById("orderItems");
  const orderSubtotal = document.getElementById("orderSubtotal");
  const orderShipping = document.getElementById("orderShipping");
  const orderTotal = document.getElementById("orderTotal");
  const submitBtn = document.getElementById("submitOrder");

  console.log("📦 Elementi trovati:", {
    checkoutForm: !!checkoutForm,
    orderItems: !!orderItems,
    orderSubtotal: !!orderSubtotal,
    orderShipping: !!orderShipping,
    orderTotal: !!orderTotal,
    submitBtn: !!submitBtn,
  });

  if (
    !checkoutForm ||
    !orderItems ||
    !orderSubtotal ||
    !orderShipping ||
    !orderTotal ||
    !submitBtn
  ) {
    console.error("❌ Elementi del checkout non trovati nel DOM");
    // Mostra tutti gli ID presenti nel DOM
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    console.log("🔍 ID presenti nel DOM:", allIds);
    return;
  }

  let cart = [];
  const FREE_SHIPPING_THRESHOLD = 50;

  // Carica il carrello
  function loadCart() {
    // Usa lo store invece di localStorage direttamente
    cart = store.getCart();

    console.log("🛍️ Carrello caricato:", cart);

    if (cart.length === 0) {
      showToast("Il carrello è vuoto");
      router.navigate("/carrello");
      return;
    }

    displayOrderSummary();
    loadUserData();
  }

  // Carica i dati utente se loggato
  function loadUserData() {
    console.log("👤 Caricamento dati utente...");
    fetch("api/me.php")
      .then((response) => response.json())
      .then((data) => {
        console.log("📥 Dati utente ricevuti:", data);
        if (data.authenticated) {
          // Pre-compila i campi con i dati utente
          if (data.nome) document.getElementById("nome").value = data.nome;
          if (data.cognome)
            document.getElementById("cognome").value = data.cognome;
          if (data.email) document.getElementById("email").value = data.email;
          if (data.telefono)
            document.getElementById("telefono").value = data.telefono;
          if (data.via) document.getElementById("via").value = data.via;
          if (data.citta) document.getElementById("citta").value = data.citta;
          if (data.provincia)
            document.getElementById("provincia").value = data.provincia;
          if (data.cap) document.getElementById("cap").value = data.cap;
          console.log("✅ Campi pre-compilati con successo");
        } else {
          console.log("⚠️ Utente non autenticato");
        }
      })
      .catch((error) => {
        console.error("❌ Errore caricamento dati utente:", error);
      });
  }

  // Visualizza il riepilogo ordine
  function displayOrderSummary() {
    console.log("📋 Visualizzazione riepilogo ordine...");
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

    console.log("✅ Articoli visualizzati:", cart.length);
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

    console.log("💰 Totali aggiornati:", { subtotal, shipping, total });
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
      prodotti: cart.map((item) => ({
        id_poster: item.id,
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
      .then(async (response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(text); // qui dentro trovi l'HTML dell'errore PHP
        }
      })
      .then((data) => {
        if (data.success) {
          store.clearCart();

          localStorage.setItem(
            "order_confirmation",
            JSON.stringify({
              orderId: data.orderId,
              totale: total,
              data: new Date().toISOString(),
            }),
          );

          router.navigate("/order-success");
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
}

window.initCheckoutPage = initCheckoutPage;
