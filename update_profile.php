<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';
require_once 'classes/Utente.php';

// Verifica autenticazione
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Non autenticato"]);
    exit();
}

// Accetta solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Metodo non consentito"]);
    exit();
}

try {
    // Leggi i dati JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dati non validi"]);
        exit();
    }
    
    // Carica l'utente corrente
    $utente = new Utente($conn, $_SESSION['id_utente']);
    
    if ($utente->getId() === null) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Utente non trovato"]);
        exit();
    }
    
    // Prepara i dati da aggiornare (solo i campi modificabili dall'utente)
    $datiAggiornamento = [];
    
    if (isset($data['nome'])) {
        $datiAggiornamento['nome'] = trim($data['nome']);
    }
    
    if (isset($data['cognome'])) {
        $datiAggiornamento['cognome'] = trim($data['cognome']);
    }
    
    if (isset($data['mail'])) {
        $datiAggiornamento['mail'] = trim($data['mail']);
    }
    
    if (isset($data['telefono'])) {
        $datiAggiornamento['telefono'] = trim($data['telefono']);
    }
    
    if (isset($data['via'])) {
        $datiAggiornamento['via'] = trim($data['via']);
    }
    
    if (isset($data['citta'])) {
        $datiAggiornamento['citta'] = trim($data['citta']);
    }
    
    if (isset($data['provincia'])) {
        $datiAggiornamento['provincia'] = trim($data['provincia']);
    }
    
    if (isset($data['cap'])) {
        $datiAggiornamento['cap'] = trim($data['cap']);
    }
    
    // Gestione password (solo se fornita)
    if (isset($data['password']) && !empty($data['password'])) {
        $datiAggiornamento['password'] = $data['password'];
    }
    
    // Validazione base
    if (empty($datiAggiornamento['nome']) || empty($datiAggiornamento['cognome']) || empty($datiAggiornamento['mail'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nome, cognome ed email sono obbligatori"]);
        exit();
    }
    
    // Validazione email
    if (!filter_var($datiAggiornamento['mail'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Formato email non valido"]);
        exit();
    }
    
    // Aggiorna il profilo
    if ($utente->aggiorna($datiAggiornamento)) {
        // Aggiorna la sessione con la nuova email se è cambiata
        if (isset($datiAggiornamento['mail'])) {
            $_SESSION['email'] = $datiAggiornamento['mail'];
        }
        
        echo json_encode([
            "success" => true, 
            "message" => "Profilo aggiornato con successo"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Errore durante l'aggiornamento del profilo"
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Errore del database: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Errore del server: " . $e->getMessage()
    ]);
}
