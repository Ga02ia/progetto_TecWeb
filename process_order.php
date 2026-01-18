<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';

// Leggi i dati JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Dati non validi"]);
    exit();
}

// Validazione dati
$required = ['nome', 'cognome', 'email', 'telefono', 'via', 'citta', 'provincia', 'cap', 'totale', 'prodotti'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Campo obbligatorio mancante: $field"]);
        exit();
    }
}

// Verifica che ci siano prodotti
if (!is_array($data['prodotti']) || count($data['prodotti']) === 0) {
    echo json_encode(["success" => false, "message" => "Nessun prodotto nell'ordine"]);
    exit();
}

try {
    // Inizia transazione
    $conn->beginTransaction();

    // Ottieni l'ID utente se loggato
    $id_utente = isset($_SESSION['id_utente']) ? $_SESSION['id_utente'] : null;

    // Inserisci l'ordine
    $stmt = $conn->prepare("
        INSERT INTO ordini (totale, data, id_utente) 
        VALUES (:totale, NOW(), :id_utente)
    ");
    
    $stmt->execute([
        ':totale' => $data['totale'],
        ':id_utente' => $id_utente
    ]);
    
    $orderId = $conn->lastInsertId();

    // Inserisci i prodotti dell'ordine
    $stmtProdotti = $conn->prepare("
        INSERT INTO prodottiOrdine (id_ordine, id_poster, prezzo) 
        VALUES (:id_ordine, :id_poster, :prezzo)
    ");

    foreach ($data['prodotti'] as $prodotto) {
        $quantita = isset($prodotto['quantita']) ? $prodotto['quantita'] : 1;
        
        // Inserisci ogni quantità come riga separata (secondo la struttura del DB)
        for ($i = 0; $i < $quantita; $i++) {
            $stmtProdotti->execute([
                ':id_ordine' => $orderId,
                ':id_poster' => $prodotto['id_poster'],
                ':prezzo' => $prodotto['prezzo']
            ]);
        }
    }

    // Commit transazione
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Ordine creato con successo",
        "orderId" => $orderId
    ]);

} catch (PDOException $e) {
    // Rollback in caso di errore
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    echo json_encode([
        "success" => false,
        "message" => "Errore durante la creazione dell'ordine: " . $e->getMessage()
    ]);
}
?>
