<?php
session_start();
header('Content-Type: application/json');

// Verifica che l'utente sia autenticato
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Non autenticato"]);
    exit();
}

// Verifica che l'utente sia admin
if (!isset($_SESSION['ruolo']) || $_SESSION['ruolo'] != 1) {
    http_response_code(403);
    echo json_encode(["error" => "Accesso negato. Solo gli amministratori possono accedere a questa risorsa."]);
    exit();
}

// Se arriviamo qui, l'utente è un admin autenticato
return true;
?>
