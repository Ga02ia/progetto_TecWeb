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

    // Query per recuperare tutti i preferiti dell'utente con i dettagli dei prodotti
    $stmt = $conn->prepare("
        SELECT 
            p.id,
            p.titolo,
            p.descrizione,
            p.autore,
            p.prezzo,
            p.image_path,
            p.id_categoria,
            c.nome as categoria_nome,
            pref.data_aggiunta
        FROM preferiti pref
        INNER JOIN posters p ON pref.id_poster = p.id
        LEFT JOIN categorie c ON p.id_categoria = c.id
        WHERE pref.id_utente = :id_utente
        ORDER BY pref.data_aggiunta DESC
    ");
    
    $stmt->bindParam(':id_utente', $id_utente, PDO::PARAM_INT);
    $stmt->execute();
    
    $preferiti = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "count" => count($preferiti),
        "preferiti" => $preferiti
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel recupero dei preferiti: " . $e->getMessage()
    ]);
}
?>
