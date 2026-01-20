<?php
session_start();
header('Content-Type: application/json');
echo json_encode([
    'session_exists' => isset($_SESSION['authenticated']),
    'authenticated' => $_SESSION['authenticated'] ?? false,
    'id_utente' => $_SESSION['id_utente'] ?? null,
    'session_data' => $_SESSION
]);
?>
