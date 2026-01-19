// Admin Dashboard JavaScript

let currentUser = null;
let allProducts = [];
let allUsers = [];
let allCategories = [];

// Inizializzazione
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  await loadCategories();
  await loadDashboardData();
  setupNavigation();
  setupProductForm();
});

// Verifica autenticazione e permessi admin
async function checkAuth() {
  try {
    const response = await fetch("check_session.php");
    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = "login.html";
      return;
    }

    if (!data.is_admin) {
      alert(
        "Accesso negato. Solo gli amministratori possono accedere a questa pagina.",
      );
      window.location.href = "home.html";
      return;
    }

    currentUser = data;
    document.getElementById("admin-info").textContent =
      `${data.nome} ${data.cognome} (${data.email})`;
  } catch (error) {
    console.error("Errore verifica autenticazione:", error);
    window.location.href = "login.html";
  }
}

// Carica categorie
async function loadCategories() {
  try {
    const response = await fetch("get_categorie.php");
    const data = await response.json();
    if (data.success) {
      allCategories = data.categorie;
      populateCategorySelect();
    }
  } catch (error) {
    console.error("Errore caricamento categorie:", error);
  }
}

function populateCategorySelect() {
  const select = document.getElementById("product-categoria");
  select.innerHTML = '<option value="">Seleziona categoria</option>';
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
  document.getElementById("total-products").textContent = allProducts.length;
  document.getElementById("total-users").textContent = allUsers.length;
  document.getElementById("total-admins").textContent = allUsers.filter(
    (u) => u.ruolo == 1,
  ).length;
  // Blocked sarà sempre 0 finché non aggiungi la colonna nel DB
  document.getElementById("total-blocked").textContent = "0";
}

// ===== GESTIONE PRODOTTI =====

async function loadProducts() {
  try {
    const response = await fetch("admin_prodotti.php");
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
    html += `
            <tr>
                <td>${product.id}</td>
                <td>${product.titolo}</td>
                <td>${product.categoria_nome || "N/A"}</td>
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
  document.getElementById("product-categoria").value =
    product.id_categoria || "";

  document.getElementById("productModal").style.display = "block";
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
}

function setupProductForm() {
  document
    .getElementById("productForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const productId = document.getElementById("product-id").value;
      const productData = {
        titolo: document.getElementById("product-titolo").value,
        descrizione: document.getElementById("product-descrizione").value,
        autore: document.getElementById("product-autore").value,
        prezzo: document.getElementById("product-prezzo").value,
        image_path: document.getElementById("product-image").value,
        id_categoria:
          document.getElementById("product-categoria").value || null,
      };

      try {
        let response;
        if (productId) {
          // Modifica (PATCH)
          productData.id = productId;
          response = await fetch("admin_prodotti.php", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });
        } else {
          // Creazione (POST)
          response = await fetch("admin_prodotti.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });
        }

        const data = await response.json();

        if (data.success) {
          alert(data.message);
          closeProductModal();
          await loadProducts();
          updateDashboardStats();
        } else {
          alert("Errore: " + data.message);
        }
      } catch (error) {
        console.error("Errore:", error);
        alert("Errore durante il salvataggio del prodotto");
      }
    });
}

async function deleteProduct(productId) {
  if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;

  try {
    const response = await fetch("admin_prodotti.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productId }),
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      await loadProducts();
      updateDashboardStats();
    } else {
      alert("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante l'eliminazione del prodotto");
  }
}

// ===== GESTIONE UTENTI =====

async function loadUsers() {
  try {
    const response = await fetch("admin_utenti.php");
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
    const isCurrentUser = user.id == currentUser.id_utente;
    const roleBadge =
      user.ruolo == 1
        ? '<span class="badge badge-admin">Admin</span>'
        : '<span class="badge badge-user">Utente</span>';
    const statusBadge = '<span class="badge badge-active">Attivo</span>';

    html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.nome} ${user.cognome}</td>
                <td>${user.mail}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${user.num_ordini || 0}</td>
                <td>
                    <button class="btn btn-view" onclick="viewUserDetail(${user.id})">Dettagli</button>
                    ${
                      !isCurrentUser
                        ? `
                        ${
                          user.ruolo == 1
                            ? `<button class="btn btn-edit" onclick="toggleAdminRole(${user.id}, 0)">Rimuovi Admin</button>`
                            : `<button class="btn btn-admin" onclick="toggleAdminRole(${user.id}, 1)">Rendi Admin</button>`
                        }
                    `
                        : '<span style="color: #7f8c8d;">Tu</span>'
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
    const response = await fetch(`admin_utenti.php?id=${userId}`);
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
    const response = await fetch("admin_utenti.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, blocked: blocked }),
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      await loadUsers();
      updateDashboardStats();
    } else {
      alert("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante l'operazione");
  }
}

async function toggleAdminRole(userId, ruolo) {
  const action =
    ruolo == 1
      ? "rendere amministratore"
      : "rimuovere i privilegi di amministratore a";
  if (!confirm(`Sei sicuro di voler ${action} questo utente?`)) return;

  try {
    const response = await fetch("admin_utenti.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, ruolo: ruolo }),
    });

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      await loadUsers();
      updateDashboardStats();
    } else {
      alert("Errore: " + data.message);
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante l'operazione");
  }
}

// ===== NAVIGAZIONE =====

function setupNavigation() {
  const tabs = document.querySelectorAll(".admin-tab");
  const sections = document.querySelectorAll(".admin-section");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();

      // Rimuovi active da tutti
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Aggiungi active al tab cliccato
      tab.classList.add("active");

      // Mostra la sezione corrispondente
      const sectionId = tab.dataset.section;
      document.getElementById(sectionId).classList.add("active");
    });
  });
}

// ===== UTILITY =====

function showError(message) {
  alert(message);
}

function logout() {
  if (confirm("Sei sicuro di voler uscire?")) {
    window.location.href = "logout.php";
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
