<?php
require_once __DIR__ . '/dbConnection.php';
require_once __DIR__ . '/classes/Prodotto.php';

require_once __DIR__ . '/src/support/response.php';

// Pubblico: niente Auth qui
Prodotto::handleApiRequest($conn);

