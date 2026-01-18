<?php
// Configurazione dei parametri per la connessione al database
$host = 'localhost';  // L'indirizzo del server MySQL   
$dbname = 'artly';   // Nome del database
$username = 'root'; // Nome utente per accedere al database
$password = ''; // Password associata all'utente

try {
// Creazione di una connessione PDO al database
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password); // Specifica il DSN (Data Source Name) con i parametri
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Configura PDO per lanciare eccezioni in caso di errori
} catch (PDOException $e) { // Gestione delle eccezioni in caso di errore nella connessione
    die("Connessione fallita: " . $e->getMessage()); // Se la connessione fallisce, il messaggio di errore viene stampato e l'esecuzione dello script viene terminata
}
?>