<?php
/**
 * @deprecated Usa /api/admin/utenti.php invece
 * Questo file è mantenuto per retrocompatibilità
 * Rimanda le richieste al nuovo endpoint /api/admin/utenti.php
 */

// Includi il nuovo controller API
require_once __DIR__ . '/api/admin/utenti.php';
