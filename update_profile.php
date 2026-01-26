<?php
/**
 * @deprecated Usa PATCH /api/me.php invece
 * Questo file è mantenuto per retrocompatibilità
 * Rimanda le richieste al nuovo endpoint /api/me.php
 */

// Forza il metodo a PATCH per il nuovo controller
$_SERVER['REQUEST_METHOD'] = 'PATCH';

// Includi il nuovo controller API
require_once __DIR__ . '/api/me.php';
