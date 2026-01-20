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
    $stmt = $conn->prepare("SELECT id, mail, password_hash, ruolo, blocked FROM utenti WHERE mail = :email");
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verifica se l'utente è bloccato
        if (isset($user['blocked']) && $user['blocked'] == 1) {
            echo json_encode(["success" => false, "message" => "Il tuo account è stato bloccato. Contatta l'amministratore per maggiori informazioni."]);
            exit();
        }
        
        // Verifica password (supporta sia hash che password in chiaro per compatibilità)
        $passwordCorretta = false;
        
        // Prima prova con password_verify per password hashate
        if (password_verify($password, $user['password_hash'])) {
            $passwordCorretta = true;
        } 
        // Se fallisce, prova confronto diretto (per password in chiaro legacy)
        elseif ($password === $user['password_hash']) {
            $passwordCorretta = true;
        }
        
        if ($passwordCorretta) {
            $_SESSION['authenticated'] = true;
            $_SESSION['id_utente'] = $user['id'];
            $_SESSION['email'] = $user['mail'];
            $_SESSION['ruolo'] = $user['ruolo'];
            
            // Redirect diverso per admin
            $redirect = ($user['ruolo'] == 1) ? "admin.html" : "home.html";
            
            echo json_encode([
                "success" => true,
                "message" => "Login effettuato!",
                "redirect" => $redirect,
                "is_admin" => ($user['ruolo'] == 1)
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Password errata."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Email non trovata."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server: " . $e->getMessage()]);
}
?>
