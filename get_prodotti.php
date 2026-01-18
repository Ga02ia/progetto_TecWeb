<?php
header('Content-Type: application/json');
require_once 'dbConnection.php';

try {
    // Se c'è un ID specifico, recupera solo quel prodotto
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = intval($_GET['id']);
        
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
                WHERE p.id = :id";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $poster = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($poster) {
            echo json_encode([
                "success" => true,
                "data" => $poster
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Prodotto non trovato"
            ]);
        }
    } else {
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
    }
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel recupero dei prodotti: " . $e->getMessage()
    ]);
}
?>
