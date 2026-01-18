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
        (p) => p.id_categoria === parseInt(selectedCategory)
      );
    }

    // Filtro per ricerca testuale
    const searchTerm = productSearch.value.toLowerCase().trim();
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.titolo.toLowerCase().includes(searchTerm) ||
          (p.descrizione && p.descrizione.toLowerCase().includes(searchTerm)) ||
          (p.autore && p.autore.toLowerCase().includes(searchTerm))
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
    if (e.target.classList.contains("add-to-cart")) {
      const productId = e.target.getAttribute("data-id");
      addToCart(productId);
    }
  });

  // Funzione per aggiungere al carrello (placeholder)
  function addToCart(productId) {
    const product = allProducts.find((p) => p.id == productId);
    if (product) {
      // Incrementa il contatore del carrello
      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        let count = parseInt(cartCountEl.textContent) || 0;
        count++;
        cartCountEl.textContent = count;
      }

      // Mostra notifica
      if (typeof showToast === "function") {
        showToast(`"${product.titolo}" aggiunto al carrello ✅`);
      } else if (typeof showMessage === "function") {
        showMessage(`"${product.titolo}" aggiunto al carrello`, "success");
      }
    }
  }

  // Carica i prodotti all'avvio
  loadCategories();
  loadProducts();
});
