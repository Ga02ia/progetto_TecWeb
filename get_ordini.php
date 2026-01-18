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

    // Query per recuperare tutti gli ordini dell'utente con i dettagli dei prodotti
    $stmt = $conn->prepare("
        SELECT 
            o.id AS ordine_id,
            o.totale,
            o.data,
            p.id AS poster_id,
            p.titolo,
            p.autore,
            p.image_path,
            po.prezzo
        FROM ordini o
        INNER JOIN prodottiOrdine po ON o.id = po.id_ordine
        INNER JOIN posters p ON po.id_poster = p.id
        WHERE o.id_utente = :id_utente
        ORDER BY o.data DESC
    ");
    
    $stmt->bindParam(':id_utente', $id_utente, PDO::PARAM_INT);
    $stmt->execute();
    
    $risultati = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Raggruppa i prodotti per ordine
    $ordini = [];
    foreach ($risultati as $row) {
        $ordine_id = $row['ordine_id'];
        
        if (!isset($ordini[$ordine_id])) {
            $ordini[$ordine_id] = [
                'id' => $ordine_id,
                'totale' => $row['totale'],
                'data' => $row['data'],
                'prodotti' => []
            ];
        }
        
        $ordini[$ordine_id]['prodotti'][] = [
            'id' => $row['poster_id'],
            'titolo' => $row['titolo'],
            'autore' => $row['autore'],
            'image_path' => $row['image_path'],
            'prezzo' => $row['prezzo']
        ];
    }
    
    // Converti l'array associativo in array indicizzato
    $ordini = array_values($ordini);
    
    echo json_encode([
        "success" => true,
        "ordini" => $ordini
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore nel recupero degli ordini: " . $e->getMessage()
    ]);
}
?>
