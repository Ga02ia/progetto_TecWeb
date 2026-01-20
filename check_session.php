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
    $stmt = $conn->prepare("SELECT nome, cognome, mail, telefono, via, citta, provincia, cap, ruolo, blocked FROM utenti WHERE id = :id");
    $stmt->bindParam(':id', $_SESSION['id_utente'], PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verifica se l'utente è stato bloccato
        if (isset($user['blocked']) && $user['blocked'] == 1) {
            session_destroy();
            echo json_encode([
                "authenticated" => false,
                "blocked" => true,
                "message" => "Il tuo account è stato bloccato dall'amministratore."
            ]);
            exit();
        }
        
        echo json_encode([
            "authenticated" => true,
            "id_utente" => $_SESSION['id_utente'],
            "email" => $user['mail'],
            "nome" => $user['nome'],
            "cognome" => $user['cognome'],
            "telefono" => $user['telefono'],
            "via" => $user['via'],
            "citta" => $user['citta'],
            "provincia" => $user['provincia'],
            "cap" => $user['cap'],
            "ruolo" => $user['ruolo'],
            "is_admin" => ($user['ruolo'] == 1)
        ]);
    } else {
        echo json_encode(["authenticated" => false]);
    }
} catch (PDOException $e) {
    echo json_encode(["authenticated" => false]);
}
?>
