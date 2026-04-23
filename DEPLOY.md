# Guida al Deploy: Firebase e Netlify

Questa guida ti aiuterà a configurare il database online (Firebase) e a pubblicare il sito su internet (Netlify).

## Parte 1: Configurazione Firebase (Database)

Firebase è il servizio di Google che useremo per salvare i dati (discussioni, categorie) in modo che non spariscano quando chiudi la pagina.

1.  Vai su [Firebase Console](https://console.firebase.google.com/) e accedi con il tuo account Google.
2.  Clicca su **"Aggiungi progetto"** (o "Create a project").
    - Dai un nome al progetto (es. `forum-smarta`).
    - Puoi disabilitare Google Analytics per semplicità.
    - Clicca su "Crea progetto".

### Configurazione Database (Realtime Database)
1.  Nel menu a sinistra della console Firebase, clicca su **"Build"** -> **"Realtime Database"**.
2.  Clicca su **"Crea database"**.
3.  Scegli una location (es. `Belgium (europe-west1)` o `United States`).
4.  **IMPORTANTE**: Scegli **"Avvia in modalità di test"** (Start in test mode).
    - *Nota: Questo permette a chiunque di leggere/scrivere per 30 giorni. Per un'app reale servirebbero regole più strette, ma per iniziare va bene.*
5.  Clicca "Abilita".

### Collegamento App
1.  Clicca sull'icona dell'**Ingranaggio** ⚙️ (in alto a sinistra, accanto a "Panoramica del progetto") e seleziona **Impostazioni progetto**.
2.  Scorri la pagina verso il basso fino alla sezione **"Le tue app"**.
3.  Clicca sull'icona **`</>`** (quella che sembra un codice) per registrare una nuova app web.
    - Nome app: `Forum Web`.
    - Clicca "Registra app".
4.  Ti verrà mostrato un codice con `const firebaseConfig = { ... }`.
    - **COPIA** solo il contenuto tra le parentesi graffe `{ ... }` (API Key, AuthDomain, ecc.).
    - Incolla questi dati nel file `public/app.js` al posto dei valori "TUO_..." all'inizio del file.
    - **NOTA**: Assicurati che nel codice copiato ci sia una riga che inizia con `databaseURL: "..."`. Se non c'è, dovrai aggiungerla manualmente copiando l'URL che vedi nella pagina del Realtime Database.

## Parte 2: Verifica Locale

1.  Dopo aver incollato le chiavi in `app.js`, salva il file.
2.  Apri il terminale nella cartella del progetto e scrivi:
    ```bash
    npm start
    ```
3.  Vai su `http://localhost:3000`.
4.  Prova a creare una categoria e una discussione.
5.  Se vedi i dati apparire anche nella console di Firebase (sotto la tab "Dati" di Realtime Database), funziona!

## Parte 3: Pubblicazione su Netlify

Netlify è il servizio che ospiterà il tuo sito gratuitamente.

1.  Vai su [Netlify Drop](https://app.netlify.com/drop).
2.  Se non sei loggato, registrati (puoi usare GitHub o Email).
3.  Apri la cartella del tuo progetto sul tuo computer.
4.  Prendi la cartella **`public`** (quella che contiene `index.html`, `app.js`, `style.css`) e **trascinala** nell'area tratteggiata su Netlify Drop.
5.  Attendi qualche secondo... Fatto! Il tuo sito è online.
6.  Netlify ti darà un link (es. `random-name.netlify.app`). Puoi cliccarci per vedere il sito live.

### Aggiornamenti Futuri
Se modifichi il codice:
1.  Fai le modifiche sul tuo computer.
2.  Vai sulla dashboard di Netlify -> "Deploys".
3.  Trascina di nuovo la cartella `public` per aggiornare il sito.
