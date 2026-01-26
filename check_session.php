<?php
/**
 * @deprecated Usa /api/me.php invece
 * Questo file è mantenuto per retrocompatibilità
 * Rimanda le richieste al nuovo endpoint /api/me.php
 */

// Includi il nuovo controller API
require_once __DIR__ . '/api/me.php';
