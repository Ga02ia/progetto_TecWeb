<?php
header('Content-Type: application/json');
require_once 'dbConnection.php';
require_once 'classes/Utente.php';

// Accetta solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Metodo non consentito"]);
    exit();
}

try {
    // Leggi i dati JSON
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['email']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dati mancanti"]);
        exit();
    }
    
    $email = trim($data['email']);
    $newPassword = $data['newPassword'];
    
    // Validazione email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email non valida"]);
        exit();
    }
    
    // Validazione password
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La password deve essere di almeno 6 caratteri"]);
        exit();
    }
    
    // Cerca l'utente per email
    $utente = new Utente($conn);
    if (!$utente->caricaDaEmail($email)) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Email non trovata nel sistema"]);
        exit();
    }
    
    // Aggiorna la password
    if ($utente->aggiorna(['password' => $newPassword])) {
        echo json_encode([
            "success" => true, 
            "message" => "Password reimpostata con successo"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Errore durante il reset della password"
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
