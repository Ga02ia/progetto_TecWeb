<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode(["authenticated" => false]);
    exit();
}

// Recupera i dati utente dal database
require_once 'dbConnection.php';

try {
    $stmt = $conn->prepare("SELECT nome, cognome, mail FROM utenti WHERE id = :id");
    $stmt->bindParam(':id', $_SESSION['id_utente'], PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            "authenticated" => true,
            "id_utente" => $_SESSION['id_utente'],
            "email" => $user['mail'],
            "nome" => $user['nome'],
            "cognome" => $user['cognome']
        ]);
    } else {
        echo json_encode(["authenticated" => false]);
    }
} catch (PDOException $e) {
    echo json_encode(["authenticated" => false]);
}
?>
