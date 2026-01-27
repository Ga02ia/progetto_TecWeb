// Admin Dashboard JavaScript

let currentUser = null;
let allProducts = [];
let allUsers = [];
let allCategories = [];

// Funzione di inizializzazione principale
async function initAdminPage() {
  console.log("🔧 Inizializzazione Admin Dashboard...");

  // Ottieni dati utente dallo store
  const user = store.getUser();
  if (user) {
    console.log("👤 Admin:", user.nome, user.cognome);
    currentUser = user;
  }

  await loadCategories();
  await loadDashboardData();
  setupNavigation();
  setupProductForm();
}

// Esponi globalmente per la SPA
window.initAdminPage = initAdminPage;

// Inizializzazione per compatibilità con vecchio modo
document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("admin-dashboard")) {
    await initAdminPage();
  }
});

// Carica categorie
async function loadCategories() {
  try {
    const response = await fetch("api/catalogo/categorie.php");
    const data = await response.json();
    if (data.success) {
      allCategories = data.data; // Corretto da data.categorie a data.data
      populateCategorySelect();
    }
  } catch (error) {
    console.error("Errore caricamento categorie:", error);
  }
}

function populateCategorySelect() {
  const select = document.getElementById("product-categoria");
  if (!select) {
    console.warn("⚠️ Select categoria non trovato");
    return;
  }
  select.innerHTML = '<option value="">-- Seleziona una categoria --</option>';

  if (allCategories.length === 0) {
    select.innerHTML =
      '<option value="">Nessuna categoria disponibile</option>';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  allCategories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

// Carica dati dashboard
async function loadDashboardData() {
  await Promise.all([loadProducts(), loadUsers()]);
  updateDashboardStats();
}

function updateDashboardStats() {
  const totalProducts = document.getElementById("total-products");
  const totalUsers = document.getElementById("total-users");
  const totalAdmins = document.getElementById("total-admins");
  const totalBlocked = document.getElementById("total-blocked");

  if (totalProducts) totalProducts.textContent = allProducts.length;
  if (totalUsers) totalUsers.textContent = allUsers.length;
  if (totalAdmins)
    totalAdmins.textContent = allUsers.filter((u) => u.ruolo == 1).length;
  if (totalBlocked)
    totalBlocked.textContent = allUsers.filter((u) => u.blocked == 1).length;
}

// ===== GESTIONE PRODOTTI =====

async function loadProducts() {
  try {
    const response = await fetch("api/admin/prodotti.php");
    const data = await response.json();

    if (data.success) {
      allProducts = data.prodotti;
      displayProducts();
    } else {
      showError("Errore caricamento prodotti");
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore caricamento prodotti");
  }
}

function displayProducts() {
  const container = document.getElementById("prodotti-list");

  if (!container) {
    console.warn("⚠️ Container prodotti-list non trovato");
    return;
  }

  if (allProducts.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun prodotto trovato</p></div>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Titolo</th>
                    <th>Categoria</th>
                    <th>Prezzo</th>
                    <th>Autore</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
    `;

  allProducts.forEach((product) => {
    const categoriaBadge = product.categoria_nome
      ? `<span class="badge-category">${product.categoria_nome}</span>`
      : '<span class="badge-category no-category">Senza categoria</span>';

    html += `
            <tr>
                <td>${product.id}</td>
                <td>${product.titolo}</td>
                <td>${categoriaBadge}</td>
                <td>€${parseFloat(product.prezzo).toFixed(2)}</td>
                <td>${product.autore}</td>
                <td>
                    <button class="btn btn-edit" onclick="openEditProductModal(${product.id})">Modifica</button>
                    <button class="btn btn-delete" onclick="deleteProduct(${product.id})">Elimina</button>
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function openAddProductModal() {
  document.getElementById("productModalTitle").textContent =
    "Aggiungi Prodotto";
  document.getElementById("product-id").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("product-autore").value = "sconosciuto";

  // Ripopola le categorie per essere sicuri che siano aggiornate
  populateCategorySelect();

  document.getElementById("productModal").style.display = "block";
}

function openEditProductModal(productId) {
  const product = allProducts.find((p) => p.id == productId);
  if (!product) return;

  document.getElementById("productModalTitle").textContent =
    "Modifica Prodotto";
  document.getElementById("product-id").value = product.id;
  document.getElementById("product-titolo").value = product.titolo;
  document.getElementById("product-descrizione").value = product.descrizione;
  document.getElementById("product-autore").value = product.autore;
  document.getElementById("product-prezzo").value = product.prezzo;
  document.getElementById("product-image").value = product.image_path;

  // Ripopola le categorie per essere sicuri che siano aggiornate
  populateCategorySelect();

  // Imposta la categoria selezionata
  document.getElementById("product-categoria").value =
    product.id_categoria || "";

  document.getElementById("productModal").style.display = "block";
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
}

function setupProductForm() {
  const productForm = document.getElementById("productForm");
  if (!productForm) {
    console.warn("⚠️ Product form non trovato");
    return;
  }

  // Rimuove eventuali listener precedenti per evitare duplicati
  const newProductForm = productForm.cloneNode(true);
  productForm.parentNode.replaceChild(newProductForm, productForm);

  newProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("product-id").value;
    const productData = {
      titolo: document.getElementById("product-titolo").value,
      descrizione: document.getElementById("product-descrizione").value,
      autore: document.getElementById("product-autore").value,
      prezzo: document.getElementById("product-prezzo").value,
      image_path: document.getElementById("product-image").value,
      id_categoria: document.getElementById("product-categoria").value || null,
    };

    try {
      let response;
      if (productId) {
        //modifica (PATCH)
        productData.id = productId;
        response = await fetch("api/admin/prodotti.php", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      } else {
        //creazione (POST)
        response = await fetch("api/admin/prodotti.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
      }

      const data = await response.json();

      if (data.success) {
        closeProductModal();
        await loadProducts();
        showToast(data.message || "Prodotto salvato con successo!", "success");
      } else {
        showError("Errore: " + data.message, "error");
      }
    } catch (error) {
      console.error("Errore:", error);
      showError("Errore di connessione durante il salvataggio", "error");
    }
  });
}
async function deleteProduct(productId) {
  if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;

  try {
    const response = await fetch("api/admin/prodotti.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    const data = await response.json();

    if (data.success) {
      closeProductModal();
      await loadProducts();
      showToast(data.message || "Prodotto eliminato con successo!", "success");
    } else {
      showError("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore durante l'eliminazione del prodotto");
  }
}

// ===== GESTIONE UTENTI =====

async function loadUsers() {
  try {
    const response = await fetch("api/admin/utenti.php");
    const data = await response.json();

    if (data.success) {
      allUsers = data.utenti;
      displayUsers();
    } else {
      showError("Errore caricamento utenti");
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore caricamento utenti");
  }
}

function displayUsers() {
  const container = document.getElementById("utenti-list");

  if (!container) {
    console.warn("⚠️ Container utenti-list non trovato");
    return;
  }

  if (allUsers.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p>Nessun utente trovato</p></div>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Ruolo</th>
                    <th>Stato</th>
                    <th>Ordini</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>
    `;
  allUsers.forEach((user) => {
    const isCurrentUser = currentUser && user.id == currentUser.id_utente;
    const roleBadge =
      user.ruolo == 1
        ? '<span class="badge badge-admin">Admin</span>'
        : '<span class="badge badge-user">Utente</span>';
    const isBlocked = user.blocked == 1;
    const statusBadge = isBlocked
      ? '<span class="badge badge-blocked">Bloccato</span>'
      : '<span class="badge badge-active">Attivo</span>';

    html += `
            <tr ${isBlocked ? 'class="blocked-user"' : ""}>
                <td>${user.id}</td>
                <td>${user.nome} ${user.cognome}</td>
                <td>${user.mail}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${user.num_ordini || 0}</td>
                <td class="actions-cell">
                    ${
                      !isCurrentUser
                        ? `
                        ${
                          user.ruolo == 1
                            ? `<button class="btn btn-small btn-secondary" onclick="toggleAdminRole(${user.id}, 0)">Rimuovi Admin</button>`
                            : `<button class="btn btn-small btn-success" onclick="toggleAdminRole(${user.id}, 1)">Rendi Admin</button>`
                        }
                        ${
                          isBlocked
                            ? `<button class="btn btn-small btn-success" onclick="toggleBlockUser(${user.id}, 0)">Sblocca</button>`
                            : `<button class="btn btn-small btn-danger" onclick="toggleBlockUser(${user.id}, 1)">Blocca</button>`
                        }
                    `
                        : '<span class="current-user-badge">Tu</span>'
                    }
                </td>
            </tr>
        `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

async function viewUserDetail(userId) {
  try {
    const response = await fetch(`api/admin/utenti.php?id=${userId}`);
    const data = await response.json();

    if (data.success) {
      displayUserDetail(data.utente, data.ordini);
    } else {
      alert("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante il caricamento dei dettagli utente");
  }
}

function displayUserDetail(user, ordini) {
  const roleBadge =
    user.ruolo == 1
      ? '<span class="badge badge-admin">Admin</span>'
      : '<span class="badge badge-user">Utente</span>';
  const statusBadge = '<span class="badge badge-active">Attivo</span>';

  let html = `
        <div class="user-detail">
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Nome Completo</strong>
                    <span>${user.nome} ${user.cognome}</span>
                </div>
                <div class="detail-item">
                    <strong>Email</strong>
                    <span>${user.mail}</span>
                </div>
                <div class="detail-item">
                    <strong>Telefono</strong>
                    <span>${user.telefono || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Città</strong>
                    <span>${user.citta || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Provincia</strong>
                    <span>${user.provincia || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>CAP</strong>
                    <span>${user.cap || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Via</strong>
                    <span>${user.via || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Ruolo</strong>
                    ${roleBadge}
                </div>
                <div class="detail-item">
                    <strong>Stato</strong>
                    ${statusBadge}
                </div>
                <div class="detail-item">
                    <strong>Totale Ordini</strong>
                    <span>${user.num_ordini || 0}</span>
                </div>
            </div>
            
            <div class="orders-list">
                <h4>Storico Ordini</h4>
    `;

  if (ordini.length === 0) {
    html += '<p style="color: var(--text-soft);">Nessun ordine effettuato</p>';
  } else {
    html += `
            <table>
                <thead>
                    <tr>
                        <th>ID Ordine</th>
                        <th>Data</th>
                        <th>Totale</th>
                        <th>N° Prodotti</th>
                    </tr>
                </thead>
                <tbody>
        `;

    ordini.forEach((ordine) => {
      const data = new Date(ordine.data).toLocaleDateString("it-IT");
      html += `
                <tr>
                    <td>#${ordine.id}</td>
                    <td>${data}</td>
                    <td>€${parseFloat(ordine.totale).toFixed(2)}</td>
                    <td>${ordine.num_prodotti}</td>
                </tr>
            `;
    });

    html += "</tbody></table>";
  }

  html += "</div></div>";

  document.getElementById("userDetail").innerHTML = html;
  document.getElementById("userModal").style.display = "block";
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

async function toggleBlockUser(userId, blocked) {
  const action = blocked == 1 ? "bloccare" : "sbloccare";
  if (!confirm(`Sei sicuro di voler ${action} questo utente?`)) return;

  try {
    const response = await fetch("api/admin/utenti.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, blocked: blocked }),
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message);
      await loadUsers();
      updateDashboardStats();
    } else {
      showError("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore durante l'operazione");
  }
}

async function toggleAdminRole(userId, ruolo) {
  const action =
    ruolo == 1
      ? "rendere amministratore"
      : "rimuovere i privilegi di amministratore a";
  if (!confirm(`Sei sicuro di voler ${action} questo utente?`)) return;

  try {
    const response = await fetch("api/admin/utenti.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, ruolo: ruolo }),
    });

    const data = await response.json();

    if (data.success) {
      showToast(data.message);
      await loadUsers();
      updateDashboardStats();
    } else {
      showError("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    showError("Errore durante l'operazione");
  }
}

// ===== NAVIGAZIONE =====

function setupNavigation() {
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = document.querySelectorAll(".admin-section-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Rimuovi active da tutti
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Aggiungi active al tab cliccato
      tab.classList.add("active");

      // Mostra la sezione corrispondente
      const tabName = tab.dataset.tab;
      const sectionId = tabName + "-section";
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add("active");
      }
    });
  });

  // Event listener per pulsante Aggiungi Prodotto
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openAddProductModal();
    });
  }

  // Event listener per chiusura modal prodotto
  const closeProductModalBtn = document.getElementById("closeProductModal");
  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener("click", closeProductModal);
  }

  const cancelProductBtn = document.getElementById("cancelProductBtn");
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", closeProductModal);
  }

  // Event listener per chiusura modal utente
  const closeUserModalBtn = document.getElementById("closeUserModal");
  if (closeUserModalBtn) {
    closeUserModalBtn.addEventListener("click", closeUserModal);
  }
}

// ===== UTILITY =====

function showError(message) {
  alert(message);
}

function logout() {
  if (confirm("Sei sicuro di voler uscire?")) {
    // Usa il metodo di logout dell'header component
    fetch("api/auth/logout.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          store.logout();
          router.navigate("/home");
        }
      })
      .catch((error) => {
        console.error("Errore logout:", error);
      });
  }
}

// Chiudi modal cliccando fuori
window.onclick = function (event) {
  const productModal = document.getElementById("productModal");
  const userModal = document.getElementById("userModal");

  if (event.target == productModal) {
    closeProductModal();
  }
  if (event.target == userModal) {
    closeUserModal();
  }
};
