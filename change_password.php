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
    
    if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dati mancanti"]);
        exit();
    }
    
    $currentPassword = $data['currentPassword'];
    $newPassword = $data['newPassword'];
    
    // Validazione password
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La nuova password deve essere di almeno 6 caratteri"]);
        exit();
    }
    
    // Carica l'utente corrente
    $utente = new Utente($conn, $_SESSION['id_utente']);
    
    if ($utente->getId() === null) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Utente non trovato"]);
        exit();
    }
    
    // Verifica la password attuale
    if (!$utente->verificaPassword($currentPassword)) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Password attuale non corretta"]);
        exit();
    }
    
    // Aggiorna con la nuova password
    if ($utente->aggiorna(['password' => $newPassword])) {
        echo json_encode([
            "success" => true, 
            "message" => "Password modificata con successo"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Errore durante il cambio password"
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
