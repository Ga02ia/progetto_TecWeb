<?php
require_once __DIR__ . '/../../src/support/response.php';
require_once __DIR__ . '/../../src/support/auth.php';

Auth::start();
session_destroy();

Response::json([
    "success" => true,
    "message" => "Logout effettuato con successo"
]);
?>
