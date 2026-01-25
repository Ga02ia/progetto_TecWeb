<?php
require_once 'dbConnection.php';
require_once 'classes/Prodotto.php';

// Delega tutta la gestione API alla classe Prodotto
Prodotto::handleApiRequest($conn);

