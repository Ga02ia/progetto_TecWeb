# 🧪 Guida al Testing della SPA

## Come testare che tutto funzioni correttamente

### 1. Avvia il server XAMPP

```bash
# Assicurati che Apache e MySQL siano avviati
```

### 2. Apri il browser e vai a:

```
http://localhost/progetto_TecWeb/
```

### 3. Test Checklist

#### ✅ Test di Base

- [ ] La home page carica correttamente
- [ ] L'header è visibile e funziona
- [ ] Il footer è visibile
- [ ] La navigazione tra le pagine funziona senza ricaricare la pagina
- [ ] L'URL cambia correttamente quando si naviga

#### ✅ Test Pagina Prodotti

**Percorso**: Clicca su "Prodotti" nel menu

**Cosa verificare**:

- [ ] I prodotti dal database vengono visualizzati (griglia di card)
- [ ] Se non ci sono prodotti, mostra "Nessun prodotto trovato"
- [ ] I filtri per categoria funzionano
- [ ] La ricerca funziona
- [ ] Il sorting (prezzo, novità) funziona

**Console**: Verifica che non ci siano errori rossi

**Network**:

- Dovrebbe esserci una chiamata a `get_prodotti.php`
- La risposta dovrebbe essere un JSON con `success: true`

#### ✅ Test Dettaglio Prodotto

**Percorso**: Clicca su un prodotto dalla griglia

**Cosa verificare**:

- [ ] L'URL diventa `/progetto_TecWeb/dettaglio-prodotto?id=XXX`
- [ ] I dettagli del prodotto vengono caricati
- [ ] L'immagine/placeholder è visibile
- [ ] Il pulsante "Aggiungi al carrello" funziona
- [ ] Il contatore del carrello nell'header si aggiorna

#### ✅ Test Carrello

**Percorso**: Aggiungi alcuni prodotti e clicca sull'icona carrello

**Cosa verificare**:

- [ ] Gli item aggiunti sono visibili
- [ ] I prezzi sono corretti
- [ ] Il totale viene calcolato correttamente
- [ ] Si possono modificare le quantità
- [ ] Si possono rimuovere item
- [ ] Il pulsante "Svuota carrello" funziona
- [ ] I prodotti consigliati appaiono (se implementato)

#### ✅ Test Autenticazione

**Login**:

1. Clicca su "Accedi" nell'header
2. Inserisci credenziali valide
3. Verifica che:
   - [ ] Il login funziona
   - [ ] Vieni reindirizzato alla home
   - [ ] L'header mostra il nome utente
   - [ ] Il dropdown profilo è accessibile

**Registrazione**:

1. Clicca su "Registrati"
2. Compila il form
3. Verifica che:
   - [ ] La validazione funziona
   - [ ] La registrazione va a buon fine
   - [ ] Vieni loggato automaticamente

#### ✅ Test Checkout

**Percorso**: Con carrello pieno e utente loggato, clicca "Procedi al checkout"

**Cosa verificare**:

- [ ] Il form di checkout si carica
- [ ] I dati utente sono pre-compilati
- [ ] Il riepilogo ordine è corretto
- [ ] La validazione funziona
- [ ] L'ordine viene elaborato correttamente
- [ ] Vieni reindirizzato a pagina successo

#### ✅ Test Profilo

**Percorso**: User dropdown → "Profilo"

**Cosa verificare**:

- [ ] I dati personali vengono caricati
- [ ] Gli ordini precedenti sono visibili (se ci sono)
- [ ] Si possono modificare i dati
- [ ] Il logout funziona

#### ✅ Test Preferiti

**Percorso**: User dropdown → "Preferiti"

**Cosa verificare**:

- [ ] La pagina carica i preferiti salvati
- [ ] Si possono aggiungere prodotti ai preferiti
- [ ] Si possono rimuovere dai preferiti
- [ ] Il contatore preferiti si aggiorna

#### ✅ Test Admin Dashboard

**Requisiti**: Utente con `is_admin = 1` nel database

**Percorso**: Accedi come admin, vai a `/admin`

**Cosa verificare**:

- [ ] La dashboard carica correttamente
- [ ] Le statistiche sono visibili
- [ ] La lista prodotti viene caricata da `admin_prodotti.php`
- [ ] La lista utenti viene caricata da `admin_utenti.php`
- [ ] Si possono aggiungere nuovi prodotti
- [ ] Si possono modificare prodotti esistenti
- [ ] Si possono eliminare prodotti
- [ ] Si possono bloccare/sbloccare utenti

#### ✅ Test Protezione Route

**Cosa verificare**:

- [ ] Accesso a `/checkout` senza login → redirect a `/login`
- [ ] Accesso a `/profilo` senza login → redirect a `/login`
- [ ] Accesso a `/preferiti` senza login → redirect a `/login`
- [ ] Accesso a `/admin` senza essere admin → redirect a `/home`
- [ ] Accesso a `/login` già loggati → redirect a `/home`

#### ✅ Test Navigazione

**Cosa verificare**:

- [ ] Pulsante indietro del browser funziona
- [ ] Pulsante avanti del browser funziona
- [ ] Link interni non ricaricano la pagina
- [ ] URL diretti funzionano (es. copia/incolla link)
- [ ] 404 page viene mostrata per route inesistenti

#### ✅ Test Responsive

**Cosa verificare**:

- [ ] Menu mobile funziona
- [ ] Layout si adatta a schermi piccoli
- [ ] Tutte le funzionalità sono accessibili su mobile

### 4. Debug Tools

#### Console del Browser (F12)

Controlla la tab "Console" per:

- Errori JavaScript (rossi)
- Warning (gialli)
- Log di navigazione (dovrebbero apparire emoji 📍🚀)

#### Network Tab

Controlla:

- Richieste a file PHP (devono ritornare 200 OK)
- Risposte JSON (devono avere `success: true`)
- Richieste a `views/*.html` (devono ritornare 200)

#### Application Tab

Controlla:

- LocalStorage → dovrebbero esserci:
  - `artly_cart` (array di prodotti)
  - `artly_user` (dati utente se loggato)
  - `artly_preferiti` (se usato)

### 5. Test di Performance

- [ ] La navigazione tra pagine è veloce (< 300ms)
- [ ] Gli script vengono caricati solo quando necessari
- [ ] Non ci sono ricaricamenti di script duplicati
- [ ] Le immagini caricano velocemente

### 6. Problemi Comuni e Soluzioni

#### Problema: "Pagina bianca"

**Soluzione**:

- Controlla console per errori
- Verifica che `index.html` si carichi
- Controlla `.htaccess` sia configurato correttamente

#### Problema: "Prodotti non si caricano"

**Soluzione**:

- Verifica che `get_prodotti.php` funzioni: `http://localhost/progetto_TecWeb/get_prodotti.php`
- Controlla la console per errori di fetch
- Verifica che il database abbia prodotti

#### Problema: "404 su ogni rotta"

**Soluzione**:

- Verifica che mod_rewrite sia abilitato in Apache
- Controlla che `.htaccess` sia nella root del progetto
- Verifica il base path in `router.js`

#### Problema: "Login non funziona"

**Soluzione**:

- Verifica che `login.php` funzioni
- Controlla che le sessioni PHP siano abilitate
- Verifica credenziali nel database

#### Problema: "Admin dashboard vuota"

**Soluzione**:

- Verifica di essere loggato come admin (`is_admin = 1`)
- Controlla che `admin_prodotti.php` e `admin_utenti.php` funzionino
- Controlla `admin_check.php` per verifica permessi

### 7. Test API Endpoints

Puoi testare gli endpoint direttamente nel browser o con strumenti come Postman:

```
# Test prodotti
http://localhost/progetto_TecWeb/get_prodotti.php

# Test categorie
http://localhost/progetto_TecWeb/get_categorie.php

# Test autenticazione
http://localhost/progetto_TecWeb/check_session.php

# Test prodotto specifico
http://localhost/progetto_TecWeb/get_prodotti.php?id=1

# Test preferiti (richiede sessione)
http://localhost/progetto_TecWeb/get_preferiti.php

# Test ordini (richiede sessione)
http://localhost/progetto_TecWeb/get_ordini.php
```

### 8. Report dei Test

Una volta completati i test, annota:

- ✅ Cosa funziona
- ❌ Cosa non funziona
- ⚠️ Cosa funziona parzialmente

Questo aiuterà a identificare eventuali problemi rimanenti.

---

**Nota**: Se trovi problemi, controlla sempre prima la Console del browser - la maggior parte degli errori JavaScript vengono segnalati lì con informazioni utili per il debug.
