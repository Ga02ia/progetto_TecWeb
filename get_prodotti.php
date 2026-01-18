<?php
header('Content-Type: application/json');
require_once 'dbConnection.php';

try {
    // Query per ottenere tutti i poster con le informazioni sulla categoria
    $sql = "SELECT 
                p.id, 
                p.titolo, 
                p.descrizione, 
                p.autore, 
                p.prezzo, 
                p.image_path,
                p.id_categoria,
                c.nome as categoria_nome
            FROM posters p
            LEFT JOIN categorie c ON p.id_categoria = c.id
            ORDER BY p.id ASC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $posters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "count" => count($posters),
        "data" => $posters
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel recupero dei prodotti: " . $e->getMessage()
    ]);
}
?>
