<?php
require_once 'dbConnection.php';
require_once 'classes/Prodotto.php';

// Delega tutta la gestione API alla classe Prodotto (con controllo admin)
Prodotto::handleApiRequest($conn, true);
