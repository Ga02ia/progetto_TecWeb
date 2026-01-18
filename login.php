<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Metodo non valido"]);
    exit();
}

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

try {
    $stmt = $conn->prepare("SELECT id, mail, password_hash FROM utenti WHERE mail = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verifica password con hash
        if (password_verify($password, $user['password_hash'])) {
            $_SESSION['authenticated'] = true;
            $_SESSION['id_utente'] = $user['id'];
            $_SESSION['email'] = $user['mail'];
            
            echo json_encode([
                "success" => true,
                "message" => "Login effettuato!",
                "redirect" => "home.html"
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Password errata."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Email non trovata."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server."]);
}
?>
