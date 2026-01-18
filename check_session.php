<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode(["authenticated" => false]);
    exit();
}

echo json_encode([
    "authenticated" => true,
    "id_utente" => $_SESSION['id_utente'],
    "email" => $_SESSION['email']
]);
?>
