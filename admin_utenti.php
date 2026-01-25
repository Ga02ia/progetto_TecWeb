<?php
require_once 'dbConnection.php';
require_once 'classes/Utente.php';

// Delega tutta la gestione API alla classe Utente (con controllo admin integrato)
Utente::handleApiRequest($conn);
