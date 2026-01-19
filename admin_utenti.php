<?php
require_once 'admin_check.php';
require_once 'dbConnection.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Ottieni tutti gli utenti
            if (isset($_GET['id'])) {
                // Dettagli di un singolo utente
                $id = $_GET['id'];
                $stmt = $conn->prepare("
                    SELECT id, nome, cognome, mail, citta, provincia, cap, via, ruolo,
                    (SELECT COUNT(*) FROM ordini WHERE id_utente = utenti.id) as num_ordini
                    FROM utenti 
                    WHERE id = :id
                ");
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $utente = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($utente) {
                    // Ottieni anche gli ordini dell'utente
                    $stmt2 = $conn->prepare("
                        SELECT o.id, o.totale, o.data,
                        (SELECT COUNT(*) FROM prodottiOrdine WHERE id_ordine = o.id) as num_prodotti
                        FROM ordini o
                        WHERE o.id_utente = :id
                        ORDER BY o.data DESC
                    ");
                    $stmt2->bindParam(':id', $id, PDO::PARAM_INT);
                    $stmt2->execute();
                    $ordini = $stmt2->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo json_encode([
                        "success" => true, 
                        "utente" => $utente,
                        "ordini" => $ordini
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Utente non trovato"]);
                }
            } else {
                // Lista di tutti gli utenti
                $stmt = $conn->prepare("
                    SELECT u.id, u.nome, u.cognome, u.mail, u.ruolo,
                    (SELECT COUNT(*) FROM ordini WHERE id_utente = u.id) as num_ordini
                    FROM utenti u
                    ORDER BY u.id DESC
                ");
                $stmt->execute();
                $utenti = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(["success" => true, "utenti" => $utenti]);
            }
            break;
            
        case 'PATCH':
            // Aggiorna ruolo o stato blocco di un utente
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID utente richiesto"]);
                exit();
            }
            
            // Non permettere di modificare se stesso
            if ($id == $_SESSION['id_utente']) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Non puoi modificare il tuo stesso account"]);
                exit();
            }
            
            $setClauses = [];
            $params = [':id' => $id];
            
            // Solo ruolo e blocked sono modificabili dall'admin
            if (isset($data['ruolo'])) {
                $setClauses[] = "ruolo = :ruolo";
                $params[':ruolo'] = $data['ruolo'];
            }
            
            if (isset($data['blocked'])) {
                $setClauses[] = "blocked = :blocked";
                $params[':blocked'] = $data['blocked'];
            }
            
            if (empty($setClauses)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Nessun campo da aggiornare"]);
                exit();
            }
            
            $sql = "UPDATE utenti SET " . implode(', ', $setClauses) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Utente aggiornato con successo"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Errore durante l'aggiornamento"]);
            }
            break;
            
        case 'DELETE':
            // Elimina un utente (opzionale, potrebbe essere pericoloso)
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID utente richiesto"]);
                exit();
            }
            
            // Non permettere di eliminare se stesso
            if ($id == $_SESSION['id_utente']) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Non puoi eliminare il tuo stesso account"]);
                exit();
            }
            
            $stmt = $conn->prepare("DELETE FROM utenti WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Utente eliminato con successo"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Errore durante l'eliminazione"]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Metodo non supportato"]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Errore del database: " . $e->getMessage()]);
}
?>
