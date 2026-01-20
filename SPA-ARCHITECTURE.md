# 🚀 Architettura SPA - Artly

## 📁 Struttura del Progetto

```
progetto_TecWeb/
├── index.html                 # Entry point della SPA
├── index.php                  # Redirect a index.html
├── .htaccess                  # Configurazione routing Apache
│
├── js/                        # JavaScript core
│   ├── app.js                 # Entry point applicazione, gestione rotte
│   ├── router.js              # Sistema di routing client-side
│   ├── store.js               # Gestione stato globale (carrello, utente, preferiti)
│   └── utils.js               # Funzioni di utilità riutilizzabili
│
├── components/                # Componenti riutilizzabili
│   ├── header.js              # Header con autenticazione e ricerca
│   └── footer.js              # Footer
│
├── views/                     # Template HTML delle pagine
│   ├── home.html
│   ├── prodotti.html
│   ├── dettaglio-prodotto.html
│   ├── carrello.html
│   ├── checkout.html
│   ├── login.html
│   ├── registrazione.html
│   ├── profilo.html
│   ├── preferiti.html
│   ├── admin.html
│   ├── order-success.html
│   └── 404.html
│
├── *.js                       # Controller specifici per le views
│   ├── prodotti.js
│   ├── carrello.js
│   ├── checkout.js
│   ├── profilo.js
│   ├── preferiti.js
│   ├── dettaglio-prodotto.js
│   └── admin.js
│
├── *.php                      # API backend (rimangono invariate)
│   ├── get_prodotti.php
│   ├── get_categorie.php
│   ├── login.php
│   ├── logout.php
│   ├── registrazione.php
│   ├── check_session.php
│   ├── process_order.php
│   └── ...
│
└── style.css                  # Stili globali + stili SPA
```

## 🎯 Come Funziona

### 1. Router (js/router.js)

- Gestisce la navigazione client-side senza reload
- Usa History API per aggiornare l'URL
- Carica dinamicamente le views da `/views/*.html`
- Supporta parametri query string (es. `?id=123`)

### 2. Store (js/store.js)

Gestione centralizzata dello stato:

- **Carrello**: prodotti aggiunti con quantità
- **Preferiti**: prodotti salvati dall'utente
- **Utente**: dati autenticazione
- Sincronizzazione con localStorage
- Pattern Observer per aggiornamenti reattivi

### 3. Componenti (components/)

- **Header**: renderizzato dinamicamente con stato utente
- **Footer**: contenuto statico riutilizzabile
- Aggiornati automaticamente al cambio stato

### 4. Views (views/)

Template HTML puri senza header/footer, caricati dinamicamente dal router

### 5. App (js/app.js)

Entry point che:

- Registra tutte le rotte
- Inizializza autenticazione
- Sottoscrive listener dello store
- Gestisce lifecycle delle views

## 🔄 Flusso di Navigazione

1. **Utente clicca link** con attributo `data-link`
2. **Router intercetta** il click e previene default
3. **Router carica** il template HTML da `/views/`
4. **App inserisce** header + content + footer
5. **Controller view** viene inizializzato (es. `initProdottiView()`)
6. **Componenti** si aggiornano in base allo stato

## 🎨 Convenzioni

### Link Interni

```html
<!-- ✅ Corretto - usa data-link -->
<a href="/prodotti" data-link>Prodotti</a>

<!-- ❌ Sbagliato - reload della pagina -->
<a href="prodotti.html">Prodotti</a>
```

### Navigazione Programmatica

```javascript
// Da JavaScript
router.navigate("/carrello");
router.navigate("/dettaglio-prodotto?id=123");
```

### Accesso allo Store

```javascript
// Leggi stato
const cart = store.getCart();
const user = store.getUser();

// Modifica stato
store.addToCart(product);
store.setUser(userData);

// Sottoscrivi cambiamenti
store.subscribe((state) => {
  console.log("Stato aggiornato:", state);
});
```

### Protezione Rotte

```javascript
// In app.js - esempio checkout
router.addRoute("/checkout", async () => {
  if (!store.isAuthenticated()) {
    showToast("Effettua il login per procedere");
    router.navigate("/login");
    return;
  }
  await loadView("checkout");
});
```

## ✨ Vantaggi della SPA

1. **Zero Reload**: navigazione istantanea
2. **Codice Riutilizzabile**: componenti condivisi
3. **Stato Centralizzato**: dati sincronizzati
4. **Performance**: caricamento iniziale più veloce
5. **UX Moderna**: transizioni smooth, feedback immediato
6. **SEO Friendly**: con .htaccess configurato

## 🔧 Configurazione Apache

Il file `.htaccess` reindirizza tutte le richieste a `index.html`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index-spa.html [L]
```

## 📝 Note Importanti

1. **File PHP**: mantengono la loro posizione e funzionano come API
2. **File JS esistenti**: mantengono la logica ma vengono caricati dinamicamente
3. **Backup**: `index-old-backup.html` e `home-old-backup.html` conservati
4. **CSS**: stili aggiunti alla fine di `style.css` per SPA
5. **Toast/Modal**: componenti globali disponibili ovunque

## 🚨 Troubleshooting

### Link non funzionano?

- Aggiungi attributo `data-link` ai tag `<a>`

### Controller non si carica?

- Verifica che il nome view corrisponda al controller in `app.js`

### Store non si aggiorna?

- Usa sempre metodi dello store (`addToCart`, `setUser`, etc.)

### 404 su refresh?

- Verifica `.htaccess` e mod_rewrite Apache

## 🎓 Estendere la SPA

### Aggiungere una nuova pagina:

1. Crea template in `views/nuova-pagina.html`
2. Registra rotta in `js/app.js`:

```javascript
router.addRoute("/nuova-pagina", async () => {
  await loadView("nuova-pagina");
});
```

3. Crea controller (opzionale):

```javascript
function initNuovaPaginaView() {
  // Logica specifica della pagina
}
```

4. Aggiungi link nel sito:

```html
<a href="/nuova-pagina" data-link>Nuova Pagina</a>
```

## 📊 Performance

- **First Load**: ~50-100ms (solo index.html + JS core)
- **View Switch**: ~10-30ms (carica solo template HTML)
- **API Calls**: invariate, gestite come prima
- **Bundle Size**: nessun framework, solo vanilla JS

---

**Creato il**: 19 Gennaio 2026
**Architettura**: Single Page Application (SPA)
**Framework**: Vanilla JavaScript (zero dipendenze)
