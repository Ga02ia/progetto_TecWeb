<?php
session_start();
header('Content-Type: application/json');
require_once 'dbConnection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Metodo non valido"]);
    exit();
}

$nome = trim($_POST['nome'] ?? '');
$cognome = trim($_POST['cognome'] ?? '');
$mail = trim($_POST['mail'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$via = trim($_POST['via'] ?? '');
$citta = trim($_POST['citta'] ?? '');
$provincia = strtoupper(trim($_POST['provincia'] ?? ''));
$cap = trim($_POST['cap'] ?? '');
$password = $_POST['password'] ?? '';
$password_confirm = $_POST['password_confirm'] ?? '';

// Validazione
if (empty($nome) || empty($cognome) || empty($mail) || empty($telefono) || empty($via) || empty($citta) || empty($provincia) || empty($cap) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Compila tutti i campi"]);
    exit();
}

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Email non valida"]);
    exit();
}

if ($password !== $password_confirm) {
    echo json_encode(["success" => false, "message" => "Le password non coincidono"]);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "Password troppo corta (min 6 caratteri)"]);
    exit();
}

if (strlen($provincia) !== 2) {
    echo json_encode(["success" => false, "message" => "Provincia deve essere di 2 caratteri"]);
    exit();
}

if (strlen($cap) !== 5 || !is_numeric($cap)) {
    echo json_encode(["success" => false, "message" => "CAP non valido (5 cifre)"]);
    exit();
}

try {
    // ✅ Controlla se l'utente esiste già
    $checkStmt = $conn->prepare("SELECT id FROM utenti WHERE mail = :mail");
    $checkStmt->bindParam(':mail', $mail);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Email già registrata"]);
        exit();
    }
    
    // ✅ HASH della password (SICURO!)
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // ✅ Inserisci nuovo utente con tutti i campi
    $stmt = $conn->prepare("
        INSERT INTO utenti (nome, cognome, mail, telefono, via, citta, provincia, cap, password_hash, ruolo) 
        VALUES (:nome, :cognome, :mail, :telefono, :via, :citta, :provincia, :cap, :password_hash, 0)
    ");
    
    $stmt->execute([
        ':nome' => $nome,
        ':cognome' => $cognome,
        ':mail' => $mail,
        ':telefono' => $telefono,
        ':via' => $via,
        ':citta' => $citta,
        ':provincia' => $provincia,
        ':cap' => $cap,
        ':password_hash' => $password_hash,
        // ruolo 0 = utente normale
    ]);
    
    // Crea la sessione per l'utente appena registrato
    $userId = $conn->lastInsertId();
    $_SESSION['authenticated'] = true;
    $_SESSION['id_utente'] = $userId;
    $_SESSION['email'] = $mail;
    
    echo json_encode([
        "success" => true, 
        "message" => "Registrazione completata! Sarai reindirizzato alla home.",
        "redirect" => "home.html"
    ]);
    
} catch (PDOException $e) {
   echo json_encode([
        "success" => false,
        "message" => "Errore server: " . $e->getMessage()
    ]);
}
?>
