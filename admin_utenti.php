<?php
require_once __DIR__ . '/dbConnection.php';
require_once __DIR__ . '/classes/Utente.php';

require_once __DIR__ . '/src/support/response.php';
require_once __DIR__ . '/src/support/auth.php';

Auth::requireAdmin();

// Delega la gestione API alla classe Utente
Utente::handleApiRequest($conn);
