<?php
require_once 'admin_check.php';
require_once 'dbConnection.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            // Ottieni tutti i prodotti con dettagli categoria
            $stmt = $conn->prepare("
                SELECT p.*, c.nome as categoria_nome 
                FROM posters p 
                LEFT JOIN categorie c ON p.id_categoria = c.id 
                ORDER BY p.id DESC
            ");
            $stmt->execute();
            $prodotti = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "prodotti" => $prodotti]);
            break;
            
        case 'PATCH':
            // Aggiorna parzialmente un prodotto
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID prodotto richiesto"]);
                exit();
            }
            
            // Costruisci dinamicamente la query in base ai campi presenti
            $campiAggiornabili = ['titolo', 'descrizione', 'autore', 'prezzo', 'image_path', 'id_categoria'];
            $setClauses = [];
            $params = [':id' => $id];
            
            foreach ($campiAggiornabili as $campo) {
                if (isset($data[$campo])) {
                    $setClauses[] = "$campo = :$campo";
                    $params[":$campo"] = $data[$campo];
                }
            }
            
            if (empty($setClauses)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Nessun campo da aggiornare"]);
                exit();
            }
            
            $sql = "UPDATE posters SET " . implode(', ', $setClauses) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Prodotto aggiornato con successo"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Errore durante l'aggiornamento"]);
            }
            break;
            
        case 'DELETE':
            // Elimina un prodotto
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "ID prodotto richiesto"]);
                exit();
            }
            
            $stmt = $conn->prepare("DELETE FROM posters WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Prodotto eliminato con successo"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Errore durante l'eliminazione"]);
            }
            break;
            
        case 'POST':
            // Crea un nuovo prodotto
            $data = json_decode(file_get_contents('php://input'), true);
            
            $titolo = $data['titolo'] ?? null;
            $descrizione = $data['descrizione'] ?? null;
            $autore = $data['autore'] ?? 'sconosciuto';
            $prezzo = $data['prezzo'] ?? null;
            $image_path = $data['image_path'] ?? null;
            $id_categoria = $data['id_categoria'] ?? null;
            
            if (!$titolo || !$descrizione || !$prezzo || !$image_path) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Campi obbligatori mancanti"]);
                exit();
            }
            
            $stmt = $conn->prepare("
                INSERT INTO posters (titolo, descrizione, autore, prezzo, image_path, id_categoria) 
                VALUES (:titolo, :descrizione, :autore, :prezzo, :image_path, :id_categoria)
            ");
            
            $stmt->bindParam(':titolo', $titolo);
            $stmt->bindParam(':descrizione', $descrizione);
            $stmt->bindParam(':autore', $autore);
            $stmt->bindParam(':prezzo', $prezzo);
            $stmt->bindParam(':image_path', $image_path);
            $stmt->bindParam(':id_categoria', $id_categoria);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Prodotto creato con successo",
                    "id" => $conn->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Errore durante la creazione"]);
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
