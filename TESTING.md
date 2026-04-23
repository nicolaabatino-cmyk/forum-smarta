# Guida al Test dell'Applicazione Forum

Questa guida spiega come avviare e testare manualmente le funzionalità dell'applicazione Forum.

## Prerequisiti

Assicurati di avere [Node.js](https://nodejs.org/) installato sul tuo computer.

## Installazione e Avvio

1.  **Apri il terminale** nella cartella del progetto.
2.  **Installa le dipendenze** (se non lo hai già fatto):
    ```bash
    npm install
    ```
3.  **Avvia il server**:
    ```bash
    npm start
    ```
4.  Il terminale mostrerà: `Server running at http://localhost:3000`
5.  Apri il browser e vai su: [http://localhost:3000](http://localhost:3000)

## Funzionalità da Testare

L'applicazione utilizza una memoria temporanea (i dati vengono persi se riavvii il server, ma rimangono se ricarichi la pagina finché il server è attivo, o meglio, essendo in-memory lato client nel file `app.js` attuale, i dati si resettano al refresh della pagina a meno che non siano salvati nel localStorage o database - *Nota: Attualmente il codice usa una variabile `store` in memoria, quindi i dati si resettano ad ogni refresh della pagina.*).

### 1. Login
- Clicca su **Accedi**.
- **Utente Normale**: Inserisci un nome utente qualsiasi (es. "Mario") e conferma.
- **Amministratore**:
    - Spunta la casella "Accesso Admin".
    - Password: `admin123`
    - Conferma.

### 2. Gestione Categorie (Solo Admin)
- Effettua il login come Amministratore.
- Clicca sul pulsante **"+"** accanto alla lista categorie.
- Inserisci un nome per la nuova categoria e conferma.
- Verifica che la categoria appaia nella lista.
- Prova a cancellare una categoria cliccando sull'icona del cestino (solo Admin).

### 3. Discussioni
- **Creazione**:
    - Effettua il login.
    - Clicca su **"Nuova Discussione"**.
    - Scegli una categoria, inserisci titolo e contenuto.
    - Clicca su "Crea Discussione".
- **Visualizzazione**:
    - Clicca su una discussione per aprirla.
    - Verifica che i dettagli siano corretti.
- **Cancellazione** (Solo Admin):
    - Dalla home, clicca sull'icona del cestino su una discussione per eliminarla.

### 4. Risposte
- Apri una discussione.
- Scrivi una risposta nel box in fondo e clicca "Invia Risposta".
- Verifica che la risposta appaia immediatamente.
- **Eliminazione Risposta** (Solo Admin):
    - Clicca "Elimina" accanto a un messaggio.

## Note Tecniche
- L'app è attualmente una Single Page Application (SPA) servita da Express.
- Non ci sono ancora test automatici configurati (`npm test` restituirà un errore).
