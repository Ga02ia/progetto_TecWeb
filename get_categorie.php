<?php
header('Content-Type: application/json');
require_once 'dbConnection.php';

try {
    $stmt = $conn->prepare("SELECT id, nome FROM categorie ORDER BY nome ASC");
    $stmt->execute();
    
    $categorie = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "data" => $categorie
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel recupero delle categorie: " . $e->getMessage()
    ]);
}
?>
