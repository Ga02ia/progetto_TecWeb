<?php
/**
 * @deprecated Usa /api/admin/prodotti.php invece
 * Questo file è mantenuto per retrocompatibilità
 * Rimanda le richieste al nuovo endpoint /api/admin/prodotti.php
 */

// Includi il nuovo controller API
require_once __DIR__ . '/api/admin/prodotti.php';
