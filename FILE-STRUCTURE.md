# Struttura File Progetto SPA Artly

## File Principali SPA

### Entry Point
- **index.html** - Unico file HTML della SPA, punto di ingresso dell'applicazione
- **index.php** - Redirect a index.html per compatibilità
- **.htaccess** - Configurazione Apache per routing SPA

### JavaScript Core (cartella /js/)
- **app.js** - Controller principale, registra rotte e gestisce navigazione
- **router.js** - Router client-side con History API
- **store.js** - State management centralizzato (carrello, utente, preferiti)
- **utils.js** - Funzioni utility riutilizzabili

### Componenti Riutilizzabili (cartella /components/)
- **header.js** - Componente header con navigazione e user dropdown
- **footer.js** - Componente footer

### Views (cartella /views/)
Template HTML per ogni pagina:
- home.html
- prodotti.html
- dettaglio-prodotto.html
- carrello.html
- checkout.html
- login.html
- registrazione.html
- profilo.html
- preferiti.html
- admin.html
- order-success.html
- 404.html

### Controller Pagine (root)
Script JavaScript per logica specifica delle pagine:
- **prodotti.js** - Gestione pagina prodotti
- **admin.js** - Gestione dashboard admin
- **carrello.js** - Gestione carrello
- **checkout.js** - Gestione checkout
- **profilo.js** - Gestione profilo utente
- **preferiti.js** - Gestione preferiti
- **dettaglio-prodotto.js** - Gestione dettaglio prodotto

## File Backend PHP

### Autenticazione
- **login.php** - Gestisce login utente
- **logout.php** - Gestisce logout
- **registrazione.php** - Gestisce registrazione nuovo utente
- **check_session.php** - Verifica sessione corrente

### API Dati
- **get_prodotti.php** - Recupera lista prodotti
- **get_categorie.php** - Recupera categorie
- **get_preferiti.php** - Recupera preferiti utente
- **get_ordini.php** - Recupera ordini utente
- **manage_preferiti.php** - Gestisce aggiungi/rimuovi preferiti
- **process_order.php** - Elabora ordini

### Admin
- **admin_check.php** - Verifica permessi admin
- **admin_prodotti.php** - CRUD prodotti
- **admin_utenti.php** - Gestione utenti

### Database
- **dbConnection.php** - Connessione database
- **artly.sql** - Schema database
- **add_blocked_column.sql** - Migrazione colonna blocked
- **create_preferiti_table.sql** - Creazione tabella preferiti

## Styling
- **style.css** - Tutti gli stili dell'applicazione

## Asset
- **img/** - Immagini e risorse grafiche

## Documentazione
- **README-SPA.md** - Guida principale
- **SPA-ARCHITECTURE.md** - Architettura tecnica
- **TRANSFORMATION-COMPARISON.md** - Confronto prima/dopo
- **QUICK-START.md** - Guida rapida
- **SUMMARY.md** - Riepilogo progetto
- **CHANGELOG.md** - Log modifiche
- **TESTING-GUIDE.md** - Guida testing
- **FILE-STRUCTURE.md** - Questo file

## File da NON Modificare
I seguenti file NON devono più essere usati (sono stati eliminati):
- ❌ Vecchie pagine HTML nella root (erano duplicate)
- ❌ script.js (sostituito da app.js + componenti)
- ❌ File *-old-backup.html

## Flusso Applicazione

1. Utente naviga a `localhost/progetto_TecWeb/`
2. Apache carica `index.html`
3. `index.html` carica gli script core: utils, store, router, header, footer, app
4. `app.js` inizializza la SPA e registra le rotte
5. `router.js` gestisce la navigazione senza ricaricare la pagina
6. Quando cambia rotta:
   - `router.js` intercetta la navigazione
   - `app.js` carica la view HTML corrispondente da `/views/`
   - Header e footer vengono renderizzati
   - Il controller specifico (es. prodotti.js) viene caricato e inizializzato
7. Lo `store.js` mantiene lo stato globale (carrello, utente, ecc.)

## Vantaggi Architettura SPA

✅ Navigazione istantanea senza reload
✅ Un solo punto di ingresso (index.html)
✅ Componenti riutilizzabili (header, footer)
✅ State management centralizzato
✅ Separazione views/logica
✅ Nessun codice duplicato
✅ SEO-friendly con History API
