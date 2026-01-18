// Gestione pagina prodotti
document.addEventListener("DOMContentLoaded", function () {
  // Verifica se siamo sulla pagina prodotti
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;

  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const emptyMessage = document.getElementById("emptyMessage");
  const productsCount = document.getElementById("productsCount");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const productSearch = document.getElementById("productSearch");
  const cartModal = document.getElementById("cartModal");
  const cartModalProductsList = document.getElementById(
    "cartModalProductsList",
  );
  const cartModalItems = document.getElementById("cartModalItems");
  const cartModalSubtotal = document.getElementById("cartModalSubtotal");
  const cartModalShipping = document.getElementById("cartModalShipping");
  const cartModalTotal = document.getElementById("cartModalTotal");

  let allProducts = [];
  let filteredProducts = [];

  // Carica le categorie dal database
  function loadCategories() {
    fetch("get_categorie.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          populateCategoryFilter(data.data);
        }
      })
      .catch((error) => {
        console.error("Errore nel caricamento delle categorie:", error);
      });
  }

  // Popola il filtro delle categorie
  function populateCategoryFilter(categories) {
    categoryFilter.innerHTML = '<option value="">Tutte</option>';
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.nome;
      categoryFilter.appendChild(option);
    });
  }

  // Carica i prodotti dal database
  function loadProducts() {
    fetch("get_prodotti.php")
      .then((response) => response.json())
      .then((data) => {
        loadingMessage.style.display = "none";

        if (data.success && data.data && data.data.length > 0) {
          allProducts = data.data;
          filteredProducts = [...allProducts];
          displayProducts(filteredProducts);
          updateProductsCount(filteredProducts.length);
        } else {
          productsGrid.innerHTML = "";
          emptyMessage.style.display = "block";
          updateProductsCount(0);
        }
      })
      .catch((error) => {
        console.error("Errore:", error);
        loadingMessage.style.display = "none";
        errorMessage.style.display = "block";
        productsGrid.innerHTML = "";
      });
  }

  // Mostra i prodotti nella griglia
  function displayProducts(products) {
    productsGrid.innerHTML = "";
    emptyMessage.style.display = "none";
    errorMessage.style.display = "none";

    if (products.length === 0) {
      emptyMessage.style.display = "block";
      return;
    }

    products.forEach((product) => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });
  }

  // Crea una card prodotto
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";

    // Rendi l'intera card cliccabile (escluso il pulsante aggiungi)
    card.addEventListener("click", (e) => {
      // Se il click è sul pulsante, non fare nulla (sarà gestito dall'event delegation)
      if (e.target.closest(".add-to-cart")) {
        return;
      }
      // Altrimenti vai alla pagina dettaglio
      window.location.href = `dettaglio-prodotto.html?id=${product.id}`;
    });

    // Immagine del prodotto
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    // Gestisce URL Pinterest o path locali
    let imagePath = product.image_path;

    // Se è un URL Pinterest, usa un placeholder o estrai l'ID per usare un'immagine diretta
    if (imagePath && imagePath.includes("pinterest.com")) {
      // Usa un'immagine placeholder colorata basata sull'ID del prodotto
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

      // Aggiungi un overlay con il titolo
      const overlay = document.createElement("div");
      overlay.className = "product-image-overlay";
      overlay.innerHTML = `<span>🖼️</span>`;
      imageDiv.appendChild(overlay);
    } else if (imagePath) {
      // Path locale o URL diretto
      imageDiv.style.backgroundImage = `linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${imagePath}')`;
    } else {
      // Nessuna immagine
      imageDiv.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }

    // Body della card
    const bodyDiv = document.createElement("div");
    bodyDiv.className = "product-body";

    // Titolo
    const title = document.createElement("h3");
    title.textContent = product.titolo;

    // Descrizione
    const desc = document.createElement("p");
    desc.className = "product-desc";
    desc.textContent = product.descrizione || "Stampa digitale di alta qualità";

    // Meta (categoria e prezzo)
    const metaDiv = document.createElement("div");
    metaDiv.className = "product-meta";

    // Tag categoria
    const categoryTag = document.createElement("span");
    categoryTag.className = "tag";
    categoryTag.textContent = product.categoria_nome || "Generale";

    // Autore
    const author = document.createElement("p");
    author.className = "product-author";
    author.textContent = `by ${product.autore}`;

    metaDiv.appendChild(categoryTag);

    // Prezzo
    const priceDiv = document.createElement("div");
    priceDiv.className = "product-price-container";

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `€${parseFloat(product.prezzo).toFixed(2)}`;

    priceDiv.appendChild(price);

    // Bottone
    const addButton = document.createElement("button");
    addButton.className = "btn btn-sm add-to-cart";
    addButton.textContent = "Aggiungi";
    addButton.setAttribute("data-id", product.id);

    // Aggiungi tutto al body
    bodyDiv.appendChild(title);
    bodyDiv.appendChild(desc);
    bodyDiv.appendChild(author);
    bodyDiv.appendChild(metaDiv);
    bodyDiv.appendChild(priceDiv);
    bodyDiv.appendChild(addButton);

    // Assembla la card
    card.appendChild(imageDiv);
    card.appendChild(bodyDiv);

    return card;
  }

  // Aggiorna il contatore dei prodotti
  function updateProductsCount(count) {
    if (productsCount) {
      productsCount.textContent = `${count} prodott${count !== 1 ? "i" : "o"} disponibil${count !== 1 ? "i" : "e"}`;
    }
  }

  // Filtra e ordina i prodotti
  function filterAndSortProducts() {
    let result = [...allProducts];

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
      result = result.filter(
        (p) => p.id_categoria === parseInt(selectedCategory),
      );
    }

    // Filtro per ricerca testuale
    const searchTerm = productSearch.value.toLowerCase().trim();
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.titolo.toLowerCase().includes(searchTerm) ||
          (p.descrizione && p.descrizione.toLowerCase().includes(searchTerm)) ||
          (p.autore && p.autore.toLowerCase().includes(searchTerm)),
      );
    }

    // Ordinamento
    const sortValue = sortFilter.value;
    if (sortValue === "prezzo-asc") {
      result.sort((a, b) => parseFloat(a.prezzo) - parseFloat(b.prezzo));
    } else if (sortValue === "prezzo-desc") {
      result.sort((a, b) => parseFloat(b.prezzo) - parseFloat(a.prezzo));
    } else if (sortValue === "nome") {
      result.sort((a, b) => a.titolo.localeCompare(b.titolo));
    }

    filteredProducts = result;
    displayProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
  }

  // Event listeners per i filtri
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterAndSortProducts);
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", filterAndSortProducts);
  }

  if (productSearch) {
    productSearch.addEventListener("input", filterAndSortProducts);
  }

  // Event delegation per i bottoni "Aggiungi al carrello"
  productsGrid.addEventListener("click", function (e) {
    const button = e.target.closest(".add-to-cart");
    if (!button) return;
    const productId = button.getAttribute("data-id");
    addToCart(productId);
  });

  // Funzione per aggiungere al carrello
  function addToCart(productId) {
    const product = allProducts.find((p) => p.id == productId);
    if (!product) return;

    // Recupera il carrello dal localStorage
    let cart = [];
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {
        cart = [];
      }
    }

    // Verifica se il prodotto è già nel carrello
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex >= 0) {
      // Incrementa la quantità
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      // Aggiungi nuovo prodotto
      cart.push({ ...product, quantity: 1 });
    }

    // Salva il carrello
    localStorage.setItem("artly_cart", JSON.stringify(cart));

    // Aggiorna il contatore del carrello nell'header
    updateCartCountDisplay(cart);

    // Mostra modale riepilogo
    showCartModal(product, cart);

    // Mostra notifica
    if (typeof showToast === "function") {
      showToast(`"${product.titolo}" aggiunto al carrello ✅`);
    } else if (typeof showMessage === "function") {
      showMessage(`"${product.titolo}" aggiunto al carrello`, "success");
    }
  }

  function formatPrice(value) {
    return `€${value.toFixed(2).replace(".", ",")}`;
  }

  function createCartProductHTML(product) {
    const qty = product.quantity || 1;
    let imageHTML = "";

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
      imageHTML = `<div class="cart-modal-image" style="background: ${colors[colorIndex]}">
        <span style="font-size: 2.2rem; opacity: 0.75">🖼️</span>
      </div>`;
    } else if (product.image_path) {
      imageHTML = `<div class="cart-modal-image" style="background-image: linear-gradient(135deg, rgba(5, 8, 22, 0.4), transparent), url('${product.image_path}'); background-size: cover; background-position: center;"></div>`;
    } else {
      imageHTML = `<div class="cart-modal-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"></div>`;
    }

    return `
      <div class="cart-modal-product">
        ${imageHTML}
        <div class="cart-modal-info">
          <p class="cart-modal-title">${product.titolo}</p>
          <p class="cart-modal-author">by ${product.autore || "Artly"}</p>
          <div class="cart-modal-meta">
            <span>${formatPrice(parseFloat(product.prezzo))}</span>
            <span>Qtà: ${qty}</span>
          </div>
        </div>
      </div>
    `;
  }

  function calculateCartTotals(cart) {
    const itemsCount = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
    const subtotal = cart.reduce(
      (sum, item) => sum + parseFloat(item.prezzo) * (item.quantity || 1),
      0,
    );
    const shipping = subtotal >= 50 ? 0 : cart.length > 0 ? 4.9 : 0;
    const total = subtotal + shipping;

    return { itemsCount, subtotal, shipping, total };
  }

  function showCartModal(product, cart) {
    if (!cartModal || !cartModalProductsList) return;

    console.log("Prodotti nel carrello:", cart.length);
    console.log("Carrello completo:", cart);

    const totals = calculateCartTotals(cart);

    // Genera HTML per tutti i prodotti nel carrello
    let productsHTML = "";
    cart.forEach((item) => {
      productsHTML += createCartProductHTML(item);
    });

    // Inserisci i prodotti nella lista
    cartModalProductsList.innerHTML = productsHTML;

    // Aggiorna i totali
    if (cartModalItems) cartModalItems.textContent = totals.itemsCount;
    if (cartModalSubtotal)
      cartModalSubtotal.textContent = formatPrice(totals.subtotal);
    if (cartModalShipping) {
      cartModalShipping.textContent =
        totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping);
    }
    if (cartModalTotal) cartModalTotal.textContent = formatPrice(totals.total);

    cartModal.classList.add("is-open");
    cartModal.style.display = "block";
    cartModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeCartModal() {
    if (!cartModal) return;
    cartModal.classList.remove("is-open");
    cartModal.style.display = "none";
    cartModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  if (cartModal) {
    cartModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.dataset && target.dataset.close === "true") {
        closeCartModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cartModal.classList.contains("is-open")) {
        closeCartModal();
      }
    });
  }

  // Aggiorna il contatore del carrello nell'header
  function updateCartCountDisplay(cart) {
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
      const totalItems = cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
      cartCountEl.textContent = totalItems;
    }
  }

  // Inizializza il contatore del carrello all'avvio
  function initCartCount() {
    const savedCart = localStorage.getItem("artly_cart");
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        updateCartCountDisplay(cart);
      } catch (e) {
        // Ignora errori
      }
    }
  }

  // Carica i prodotti all'avvio
  initCartCount();
  loadCategories();
  loadProducts();
});
