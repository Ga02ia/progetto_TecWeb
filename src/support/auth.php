<?php
// il file gestisce l'autenticazione e l'autorizzazione degli utenti.
declare(strict_types=1);

final class Auth //definisce una classe finale chiamata Auth che non può essere estesa.
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }//metodo statico che avvia una sessione PHP se non è già stata avviata.

    public static function requireLogin(): void
    {
        self::start();

        if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
            Response::error("Non autenticato", 401);
        }
    }//metodo statico che verifica se l'utente è autenticato; in caso contrario, invia una risposta di errore 401.

    public static function requireAdmin(): void
    {
        self::requireLogin();

        if (!isset($_SESSION['ruolo']) || (int)$_SESSION['ruolo'] !== 1) {
            Response::error("Accesso negato", 403);
        }
    }//metodo statico che verifica se l'utente è un amministratore; in caso contrario, invia una risposta di errore 403.

    public static function userId(): int
    {
        self::requireLogin();
        return (int)$_SESSION['id_utente'];
    }//metodo statico che ritorna l'ID dell'utente autenticato dalla sessione.

    public static function isAdmin(): bool
    {
        self::start();
        return isset($_SESSION['ruolo']) && (int)$_SESSION['ruolo'] === 1;
    }//metodo statico che verifica se l'utente corrente è un amministratore.
}
