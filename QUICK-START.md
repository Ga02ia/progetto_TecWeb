# 🚀 Guida Rapida - Come Usare la Nuova SPA

## ✅ Cosa Funziona Già

Tutto il tuo sito è stato trasformato in una SPA e **funziona esattamente come prima**, ma molto più velocemente!

---

## 🌐 Come Navigare

### Nel Browser

Apri semplicemente: `http://localhost/progetto_TecWeb/`

Tutte queste URL funzionano:

```
http://localhost/progetto_TecWeb/
http://localhost/progetto_TecWeb/home
http://localhost/progetto_TecWeb/prodotti
http://localhost/progetto_TecWeb/carrello
http://localhost/progetto_TecWeb/login
http://localhost/progetto_TecWeb/profilo
http://localhost/progetto_TecWeb/admin
```

---

## 🔗 Come Creare Link

### ✅ Modo Corretto (SPA)

```html
<a href="/prodotti" data-link>Vai ai Prodotti</a>
<a href="/carrello" data-link>Carrello</a>
<a href="/dettaglio-prodotto?id=5" data-link>Dettaglio</a>
```

**Importante**: Aggiungi sempre `data-link` ai link interni!

### ❌ Da Evitare

```html
<!-- NO! Questo ricaricherà la pagina -->
<a href="prodotti.html">Prodotti</a>
```

---

## 📝 Come Modificare una Pagina

### 1. Modifica il Contenuto

I file HTML delle pagine sono in `/views/`:

```
views/
├── home.html          → Modifica la home page
├── prodotti.html      → Modifica la pagina prodotti
├── carrello.html      → Modifica il carrello
└── ...
```

**Importante**: Questi file contengono SOLO il contenuto della pagina, NON header/footer!

### 2. Modifica Header o Footer

```
components/
├── header.js    → Modifica l'header (una volta, vale ovunque)
└── footer.js    → Modifica il footer (una volta, vale ovunque)
```

### 3. Modifica la Logica

I file JavaScript specifici per ogni pagina:

```
prodotti.js       → Logica pagina prodotti
carrello.js       → Logica carrello
checkout.js       → Logica checkout
profilo.js        → Logica profilo
...
```

---

## 🛠️ Task Comuni

### Aggiungere una Nuova Pagina

**1. Crea il template HTML**

```bash
# Crea views/nuova-pagina.html
```

**2. Registra la rotta**
Apri `js/app.js` e aggiungi:

```javascript
router.addRoute("/nuova-pagina", async () => {
  await loadView("nuova-pagina");
});
```

**3. Aggiungi un link nel menu**
Apri `components/header.js` e aggiungi:

```html
<li><a href="/nuova-pagina" data-link>Nuova Pagina</a></li>
```

**Fatto!** La tua pagina è accessibile su `/nuova-pagina`

---

### Cambiare il Logo

Apri `components/header.js` e modifica:

```javascript
<div class="logo">
  <a href="/home" data-link>
    <img src="img/logo.png" alt="Artly Logo" />
    <span class="logo-text">Artly</span>
  </a>
</div>
```

---

### Aggiungere un Link nel Footer

Apri `components/footer.js` e aggiungi:

```javascript
<ul>
  <li><a href="/contatti" data-link>Contatti</a></li>
  <li><a href="/privacy" data-link>Privacy</a></li>
  <!-- Aggiungi qui il tuo link -->
</ul>
```

---

## 🔒 Proteggere una Rotta

Per rendere una pagina accessibile solo agli utenti loggati:

Apri `js/app.js` e modifica la rotta:

```javascript
router.addRoute("/pagina-protetta", async () => {
  // Verifica autenticazione
  if (!store.isAuthenticated()) {
    showToast("Devi effettuare il login");
    router.navigate("/login");
    return;
  }

  await loadView("pagina-protetta");
});
```

---

## 📦 Gestione Carrello

### In Qualsiasi File JavaScript

```javascript
// Aggiungi prodotto al carrello
store.addToCart(product);

// Ottieni carrello
const cart = store.getCart();

// Aggiorna quantità
store.updateCartQuantity(productId, newQuantity);

// Rimuovi prodotto
store.removeFromCart(productId);

// Svuota carrello
store.clearCart();

// Conta articoli
const count = store.getCartCount();

// Calcola totale
const total = store.getCartTotal();
```

---

## ❤️ Gestione Preferiti

```javascript
// Aggiungi ai preferiti
store.addToPreferiti(product);

// Rimuovi dai preferiti
store.removeFromPreferiti(productId);

// Verifica se è nei preferiti
if (store.isInPreferiti(productId)) {
  // È nei preferiti
}

// Ottieni tutti i preferiti
const preferiti = store.getPreferiti();
```

---

## 👤 Gestione Utente

```javascript
// Verifica se è loggato
if (store.isAuthenticated()) {
  // Utente loggato
}

// Ottieni dati utente
const user = store.getUser();
console.log(user.nome, user.email);

// Imposta utente (dopo login)
store.setUser({
  nome: "Mario",
  cognome: "Rossi",
  email: "mario@example.com",
  is_admin: false,
});

// Logout
store.logout();
```

---

## 🔔 Mostrare Notifiche

```javascript
// Notifica successo
showToast("Prodotto aggiunto al carrello! ✓");

// Notifica errore
showToast("Errore: riprova più tardi");
```

---

## 🚀 Navigare da JavaScript

```javascript
// Naviga a una pagina
router.navigate("/prodotti");

// Naviga con parametri
router.navigate("/dettaglio-prodotto?id=123");

// Ottieni rotta corrente
const currentRoute = router.getCurrentRoute();
```

---

## 🐛 Risoluzione Problemi

### La pagina è bianca?

1. Apri la console del browser (F12)
2. Guarda gli errori
3. Verifica che XAMPP sia in esecuzione

### I link non funzionano?

- Hai aggiunto `data-link`?

```html
<a href="/prodotti" data-link>Prodotti</a>
```

### Il carrello non si aggiorna?

- Stai usando `store.addToCart()` invece di modificare localStorage direttamente?

### 404 quando ricarico?

- Verifica che il file `.htaccess` esista nella cartella del progetto
- Assicurati che `mod_rewrite` sia abilitato in Apache

---

## 📱 Test Mobile

La SPA è completamente responsive. Testa su:

- Chrome DevTools (F12 → Device Toolbar)
- Safari (iPhone)
- Vari dispositivi

---

## 📚 Documenti di Riferimento

- **README-SPA.md**: Panoramica completa
- **SPA-ARCHITECTURE.md**: Architettura tecnica
- **TRANSFORMATION-COMPARISON.md**: Prima vs Dopo

---

## ✨ Pro Tips

1. **Usa sempre data-link** per i link interni
2. **Usa lo store** per gestire lo stato (carrello, user, preferiti)
3. **Modifica i componenti** invece di duplicare codice
4. **Testa in locale** prima di deployare
5. **Apri la console** (F12) per vedere eventuali errori

---

## 🎯 Quick Commands

```bash
# Avvia XAMPP
sudo /Applications/XAMPP/xamppfiles/xampp start

# Apri il progetto
open http://localhost/progetto_TecWeb/

# Vedi i log
tail -f /Applications/XAMPP/xamppfiles/logs/error_log
```

---

## 💬 Hai Bisogno di Aiuto?

1. Controlla i file markdown di documentazione
2. Apri la console del browser per errori
3. Verifica che i file siano nella posizione corretta
4. Assicurati che XAMPP sia attivo

---

**Tutto pronto!** Il tuo sito è ora una moderna Single Page Application! 🚀
