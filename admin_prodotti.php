<?php
require_once __DIR__ . '/dbConnection.php';
require_once __DIR__ . '/classes/Prodotto.php';

require_once __DIR__ . '/src/support/response.php';
require_once __DIR__ . '/src/support/auth.php';

Auth::requireAdmin();

// Delega la gestione API alla classe Prodotto (ma ora l'admin check è già fatto qui)
Prodotto::handleApiRequest($conn, true);
