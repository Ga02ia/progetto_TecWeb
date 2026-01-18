// Gestione Carrello
document.addEventListener("DOMContentLoaded", function () {
  // Verifica se siamo sulla pagina carrello
  const cartItemsList = document.getElementById("cartItemsList");
  if (!cartItemsList) return;

  const cartEmpty = document.getElementById("cartEmpty");
  const cartItemsCount = document.getElementById("cartItemsCount");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const discountRow = document.getElementById("discountRow");
  const discountEl = document.getElementById("discount");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const applyPromoBtn = document.getElementById("applyPromoBtn");
  const promoInput = document.getElementById("promoInput");
  const recommendedProducts = document.getElementById("recommendedProducts");

  let cart = [];
  let shippingCost = 4.9;
  let discountAmount = 0;
  const FREE_SHIPPING_THRESHOLD = 50;

  // Carica il carrello dal localStorage
  function loadCart() {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {
        cart = [];
      }
    }
    renderCart();
    updateCartCount();
  }

  // Salva il carrello nel localStorage
  function saveCart() {
    localStorage.setItem("artly_cart", JSON.stringify(cart));
  }

  // Renderizza il carrello
  function renderCart() {
    if (cart.length === 0) {
      cartItemsList.innerHTML = "";
      cartEmpty.style.display = "flex";
      cartItemsCount.textContent = "0";
      updateTotals();
      loadRecommendedProducts();
      return;
    }

    cartEmpty.style.display = "none";
    cartItemsList.innerHTML = "";
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    cartItemsCount.textContent = totalItems;

    cart.forEach((item, index) => {
      const cartItem = createCartItemElement(item, index);
      cartItemsList.appendChild(cartItem);
    });

    updateTotals();
    loadRecommendedProducts();
  }

  // Crea l'elemento HTML per un prodotto nel carrello
  function createCartItemElement(item, index) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    // Immagine
    const imageDiv = document.createElement("div");
    imageDiv.className = "cart-item-image";

    if (item.image_path && item.image_path.includes("pinterest.com")) {
      const colors = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      ];
      const colorIndex = item.id % colors.length;
      imageDiv.style.background = colors[colorIndex];
      imageDiv.innerHTML =
        '<span style="font-size: 2rem; opacity: 0.7">🖼️</span>';
    } else if (item.image_path) {
      imageDiv.style.backgroundImage = `url('${item.image_path}')`;
      imageDiv.style.backgroundSize = "cover";
      imageDiv.style.backgroundPosition = "center";
    } else {
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    // Info prodotto
    const infoDiv = document.createElement("div");
    infoDiv.className = "cart-item-info";

    const title = document.createElement("h4");
    title.textContent = item.titolo;

    const author = document.createElement("p");
    author.className = "cart-item-author";
    author.textContent = `by ${item.autore}`;

    const category = document.createElement("span");
    category.className = "tag";
    category.textContent = item.categoria_nome || "Generale";

    infoDiv.appendChild(title);
    infoDiv.appendChild(author);
    infoDiv.appendChild(category);

    // Controlli quantità
    const quantityDiv = document.createElement("div");
    quantityDiv.className = "cart-item-quantity";

    const minusBtn = document.createElement("button");
    minusBtn.className = "quantity-btn";
    minusBtn.textContent = "-";
    minusBtn.onclick = () => updateQuantity(index, -1);

    const quantitySpan = document.createElement("span");
    quantitySpan.className = "quantity-value";
    quantitySpan.textContent = item.quantity || 1;

    const plusBtn = document.createElement("button");
    plusBtn.className = "quantity-btn";
    plusBtn.textContent = "+";
    plusBtn.onclick = () => updateQuantity(index, 1);

    quantityDiv.appendChild(minusBtn);
    quantityDiv.appendChild(quantitySpan);
    quantityDiv.appendChild(plusBtn);

    // Prezzo
    const priceDiv = document.createElement("div");
    priceDiv.className = "cart-item-price";
    const itemTotal = (parseFloat(item.prezzo) * (item.quantity || 1)).toFixed(
      2,
    );
    priceDiv.textContent = `€${itemTotal}`;

    // Bottone rimuovi
    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-item-remove";
    removeBtn.innerHTML = "🗑️";
    removeBtn.setAttribute("aria-label", "Rimuovi dal carrello");
    removeBtn.onclick = () => removeFromCart(index);

    // Assembla l'item
    itemDiv.appendChild(imageDiv);
    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(quantityDiv);
    itemDiv.appendChild(priceDiv);
    itemDiv.appendChild(removeBtn);

    return itemDiv;
  }

  // Aggiorna la quantità di un prodotto
  function updateQuantity(index, change) {
    if (!cart[index]) return;

    const newQuantity = (cart[index].quantity || 1) + change;

    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    cart[index].quantity = newQuantity;
    saveCart();
    renderCart();
  }

  // Rimuovi prodotto dal carrello
  function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();

    if (typeof showToast === "function") {
      showToast(`"${item.titolo}" rimosso dal carrello`);
    }
  }

  // Svuota il carrello
  function clearCart() {
    if (cart.length === 0) return;

    if (confirm("Sei sicuro di voler svuotare il carrello?")) {
      cart = [];
      saveCart();
      renderCart();
      updateCartCount();

      if (typeof showToast === "function") {
        showToast("Carrello svuotato");
      }
    }
  }

  // Aggiorna i totali
  function updateTotals() {
    let subtotal = 0;

    cart.forEach((item) => {
      subtotal += parseFloat(item.prezzo) * (item.quantity || 1);
    });

    // Spedizione gratuita sopra una certa soglia
    let shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;

    if (shipping === 0 && subtotal > 0) {
      shippingEl.innerHTML = '<span style="color: var(--accent)">GRATIS</span>';
    } else {
      shippingEl.textContent = `€${shipping.toFixed(2)}`;
    }

    // Applica sconto
    let total = subtotal + shipping - discountAmount;
    if (total < 0) total = 0;

    subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
    totalEl.textContent = `€${total.toFixed(2)}`;

    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-€${discountAmount.toFixed(2)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  // Applica codice sconto
  function applyPromoCode() {
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
      if (typeof showMessage === "function") {
        showMessage("Inserisci un codice sconto", "error");
      }
      return;
    }

    // Codici sconto di esempio
    const promoCodes = {
      ARTLY10: 10,
      BENVENUTO: 5,
      SCONTO20: 20,
    };

    if (promoCodes[code]) {
      discountAmount = promoCodes[code];
      updateTotals();

      if (typeof showMessage === "function") {
        showMessage(`Sconto di €${discountAmount} applicato!`, "success");
      }
      promoInput.value = "";
      promoInput.disabled = true;
      applyPromoBtn.textContent = "Applicato ✓";
      applyPromoBtn.disabled = true;
    } else {
      if (typeof showMessage === "function") {
        showMessage("Codice sconto non valido", "error");
      }
    }
  }

  // Aggiorna il contatore carrello nell'header
  function updateCartCount() {
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      cartCountEl.textContent = totalItems;
    }
  }

  // Procedi al checkout
  function proceedToCheckout() {
    if (cart.length === 0) {
      if (typeof showMessage === "function") {
        showMessage("Il carrello è vuoto", "error");
      }
      return;
    }

    // Qui puoi implementare la logica per procedere al checkout
    if (typeof showMessage === "function") {
      showMessage("Funzione checkout in arrivo! 🚀", "success");
    }

    // Esempio: reindirizza a una pagina di checkout
    // window.location.href = 'checkout.html';
  }

  // Carica prodotti consigliati (ultimi 4 prodotti diversi da quelli nel carrello)
  function loadRecommendedProducts() {
    fetch("get_prodotti.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          const cartIds = cart.map((item) => item.id);
          const recommended = data.data
            .filter((p) => !cartIds.includes(p.id))
            .slice(0, 4);

          displayRecommendedProducts(recommended);
        }
      })
      .catch((error) => {
        console.error(
          "Errore nel caricamento dei prodotti consigliati:",
          error,
        );
      });
  }

  // Mostra prodotti consigliati
  function displayRecommendedProducts(products) {
    if (!recommendedProducts) return;
    recommendedProducts.innerHTML = "";

    products.forEach((product) => {
      const card = createRecommendedProductCard(product);
      recommendedProducts.appendChild(card);
    });
  }

  // Crea card prodotto consigliato (versione semplificata)
  function createRecommendedProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    if (product.image_path && product.image_path.includes("pinterest.com")) {
      const colors = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      ];
      const colorIndex = product.id % colors.length;
      imageDiv.style.background = colors[colorIndex];
      const overlay = document.createElement("div");
      overlay.className = "product-image-overlay";
      overlay.innerHTML = `<span>🖼️</span>`;
      imageDiv.appendChild(overlay);
    } else if (product.image_path) {
      imageDiv.style.backgroundImage = `url('${product.image_path}')`;
    }

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    const title = document.createElement("h3");
    title.textContent = product.titolo;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `€${parseFloat(product.prezzo).toFixed(2)}`;

    const addButton = document.createElement("button");
    addButton.className = "btn btn-sm";
    addButton.textContent = "Aggiungi";
    addButton.onclick = () => addRecommendedToCart(product);

    bodyDiv.appendChild(title);
    bodyDiv.appendChild(price);
    bodyDiv.appendChild(addButton);

    card.appendChild(imageDiv);
    card.appendChild(bodyDiv);

    return card;
  }

  // Aggiungi prodotto consigliato al carrello
  function addRecommendedToCart(product) {
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    renderCart();
    updateCartCount();

    if (typeof showToast === "function") {
      showToast(`"${product.titolo}" aggiunto al carrello ✅`);
    }
  }

  // Event listeners
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", clearCart);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", proceedToCheckout);
  }

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", applyPromoCode);
  }

  if (promoInput) {
    promoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyPromoCode();
      }
    });
  }

  // Inizializza
  loadCart();
});
