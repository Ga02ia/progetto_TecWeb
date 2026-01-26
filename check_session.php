<?php
// questo file verifica lo stato della sessione utente e restituisce informazioni sull'autenticazione e sui dettagli dell'utente.
require_once __DIR__ . '/dbConnection.php';
require_once __DIR__ . '/src/support/response.php';
require_once __DIR__ . '/src/support/auth.php';

Auth::start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    Response::json(["authenticated" => false]);
}

try {
    $stmt = $conn->prepare("
        SELECT nome, cognome, mail, telefono, via, citta, provincia, cap, ruolo, blocked
        FROM utenti
        WHERE id = :id
    ");
    $stmt->bindValue(':id', (int)$_SESSION['id_utente'], PDO::PARAM_INT);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        Response::json(["authenticated" => false]);
    }

    if ((int)($user['blocked'] ?? 0) === 1) {
        session_destroy();
        Response::json([
            "authenticated" => false,
            "blocked" => true,
            "message" => "Il tuo account è stato bloccato dall'amministratore."
        ]);
    }

    Response::json([
        "authenticated" => true,
        "id_utente" => (int)$_SESSION['id_utente'],
        "email" => $user['mail'],
        "nome" => $user['nome'],
        "cognome" => $user['cognome'],
        "telefono" => $user['telefono'],
        "via" => $user['via'],
        "citta" => $user['citta'],
        "provincia" => $user['provincia'],
        "cap" => $user['cap'],
        "ruolo" => (int)$user['ruolo'],
        "is_admin" => ((int)$user['ruolo'] === 1)
    ]);
} catch (PDOException $e) {
    Response::json(["authenticated" => false]);
}
