<?php
session_start();
header('Content-Type: application/json');

// Verifica autenticazione
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    echo json_encode(["success" => false, "message" => "Non autenticato"]);
    exit();
}

require_once 'dbConnection.php';

try {
    $id_utente = $_SESSION['id_utente'];
    $id_poster = isset($_POST['id_poster']) ? intval($_POST['id_poster']) : 0;
    $action = isset($_POST['action']) ? $_POST['action'] : '';

    if ($id_poster <= 0) {
        echo json_encode(["success" => false, "message" => "ID prodotto non valido"]);
        exit();
    }

    if ($action === 'add') {
        // Aggiungi ai preferiti
        $stmt = $conn->prepare("INSERT INTO preferiti (id_utente, id_poster) VALUES (:id_utente, :id_poster)");
        $stmt->bindParam(':id_utente', $id_utente, PDO::PARAM_INT);
        $stmt->bindParam(':id_poster', $id_poster, PDO::PARAM_INT);
        
        try {
            $stmt->execute();
            echo json_encode(["success" => true, "message" => "Aggiunto ai preferiti", "isFavorite" => true]);
        } catch (PDOException $e) {
            // Se è un duplicate key, significa che è già nei preferiti
            if ($e->getCode() == 23000) {
                echo json_encode(["success" => false, "message" => "Già nei preferiti"]);
            } else {
                throw $e;
            }
        }
    } elseif ($action === 'remove') {
        // Rimuovi dai preferiti
        $stmt = $conn->prepare("DELETE FROM preferiti WHERE id_utente = :id_utente AND id_poster = :id_poster");
        $stmt->bindParam(':id_utente', $id_utente, PDO::PARAM_INT);
        $stmt->bindParam(':id_poster', $id_poster, PDO::PARAM_INT);
        $stmt->execute();
        
        echo json_encode(["success" => true, "message" => "Rimosso dai preferiti", "isFavorite" => false]);
    } elseif ($action === 'check') {
        // Controlla se è nei preferiti
        $stmt = $conn->prepare("SELECT id FROM preferiti WHERE id_utente = :id_utente AND id_poster = :id_poster");
        $stmt->bindParam(':id_utente', $id_utente, PDO::PARAM_INT);
        $stmt->bindParam(':id_poster', $id_poster, PDO::PARAM_INT);
        $stmt->execute();
        
        $isFavorite = $stmt->rowCount() > 0;
        echo json_encode(["success" => true, "isFavorite" => $isFavorite]);
    } else {
        echo json_encode(["success" => false, "message" => "Azione non valida"]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore: " . $e->getMessage()
    ]);
}
?>
