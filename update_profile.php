<?php
require_once __DIR__ . '/dbConnection.php';
require_once __DIR__ . '/classes/Utente.php';

require_once __DIR__ . '/src/support/response.php';
require_once __DIR__ . '/src/support/auth.php';

Auth::requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Metodo non consentito", 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    Response::error("Dati non validi", 400);
}

try {
    $utente = new Utente($conn, (int)$_SESSION['id_utente']);
    if ($utente->getId() === null) {
        Response::error("Utente non trovato", 404);
    }

    // Campi aggiornabili dall'utente
    $datiAggiornamento = [];

    if (array_key_exists('nome', $data)) {
        $datiAggiornamento['nome'] = trim((string)$data['nome']);
    }
    if (array_key_exists('cognome', $data)) {
        $datiAggiornamento['cognome'] = trim((string)$data['cognome']);
    }
    if (array_key_exists('mail', $data)) {
        $datiAggiornamento['mail'] = trim((string)$data['mail']);
    }
    if (array_key_exists('telefono', $data)) {
        $datiAggiornamento['telefono'] = trim((string)$data['telefono']);
    }
    if (array_key_exists('via', $data)) {
        $datiAggiornamento['via'] = trim((string)$data['via']);
    }
    if (array_key_exists('citta', $data)) {
        $datiAggiornamento['citta'] = trim((string)$data['citta']);
    }
    if (array_key_exists('provincia', $data)) {
        $datiAggiornamento['provincia'] = strtoupper(trim((string)$data['provincia']));
    }
    if (array_key_exists('cap', $data)) {
        $datiAggiornamento['cap'] = trim((string)$data['cap']);
    }

    // Se vuoi permettere cambio password da qui:
    if (!empty($data['password'] ?? '')) {
        $datiAggiornamento['password'] = (string)$data['password'];
    }

    if (empty($datiAggiornamento)) {
        Response::error("Nessun dato da aggiornare", 400);
    }

    // Validazioni minime (come nel tuo file originale)
    if (isset($datiAggiornamento['nome']) && $datiAggiornamento['nome'] === '') {
        Response::error("Nome obbligatorio", 400);
    }
    if (isset($datiAggiornamento['cognome']) && $datiAggiornamento['cognome'] === '') {
        Response::error("Cognome obbligatorio", 400);
    }
    if (isset($datiAggiornamento['mail']) && !filter_var($datiAggiornamento['mail'], FILTER_VALIDATE_EMAIL)) {
        Response::error("Formato email non valido", 400);
    }

    if ($utente->aggiorna($datiAggiornamento)) {
        // se la mail è cambiata, aggiorna sessione
        if (isset($datiAggiornamento['mail'])) {
            $_SESSION['email'] = $datiAggiornamento['mail'];
        }

        Response::json([
            "success" => true,
            "message" => "Profilo aggiornato con successo"
        ]);
    }

    Response::error("Errore durante l'aggiornamento del profilo", 500);
} catch (PDOException $e) {
    Response::error("Errore del database", 500);
} catch (Exception $e) {
    Response::error("Errore del server", 500);
}
