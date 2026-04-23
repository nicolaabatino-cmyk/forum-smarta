/**
 * SCRIPT DI POPOLAMENTO DATABASE (SEEDER)
 * Questo script caricherà categorie e discussioni d'esempio nel tuo database Firebase.
 * Eseguilo una volta sola con il comando: node seed.js
 * Una volta terminato, puoi eliminare questo file.
 */

const firebase = require('firebase-admin');

// --- CONFIGURAZIONE ---
// NOTA: Per sicurezza e semplicità, usiamo i dati di configurazione dal tuo progetto.
// In un ambiente reale, useresti un file serviceAccountKey.json.
// Qui usiamo l'URL del tuo database Realtime DB.
const databaseURL = "https://forum-smarta-2026-default-rtdb.europe-west1.firebasedatabase.app";

// Inizializza l'admin SDK (Nota: questo richiede i permessi di scrittura sul DB)
// Se non hai un file di credenziali, questo script funzionerà solo se le regole del DB sono aperte 
// o se lo esegui in un ambiente autorizzato.
firebase.initializeApp({
    databaseURL: databaseURL
});

const db = firebase.database();

const data = {
    categories: [
        { id: "cat_comunicazioni", name: "Comunicazioni di Istituto" },
        { id: "cat_didattica", name: "Didattica e Programmazione" },
        { id: "cat_cucina", name: "Laboratori di Cucina" },
        { id: "cat_sala", name: "Sala e Vendita – Bar" },
        { id: "cat_accoglienza", name: "Accoglienza Turistica" },
        { id: "cat_inclusione", name: "Inclusione, BES e Gestione della Classe" },
        { id: "cat_pcto", name: "PCTO, Stage e Rapporti con le Aziende" },
        { id: "cat_progetti", name: "Progetti, Eventi e Concorsi" },
        { id: "cat_innovazione", name: "Innovazione, Digitale e Formazione Docenti" },
        { id: "cat_confronto", name: "Spazio di Confronto e Buone Pratiche" }
    ],
    threads: [
        // 1. Comunicazioni di Istituto
        {
            categoryId: "cat_comunicazioni",
            title: "Avvisi e comunicazioni per i docenti",
            content: "Questo spazio è dedicato alle comunicazioni di carattere generale rivolte ai docenti dell’istituto.\nQui possono essere inseriti avvisi organizzativi, promemoria, segnalazioni operative e informazioni utili alla vita scolastica.\nSi invita a mantenere interventi chiari, sintetici e pertinenti.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_comunicazioni",
            title: "Scadenze importanti (scrutini, consigli di classe, PDP/PEI)",
            content: "Discussione dedicata al monitoraggio e promemoria delle scadenze istituzionali.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_comunicazioni",
            title: "Utilizzo spazi e laboratori (cucine, sale, bar didattici)",
            content: "Coordinamento per l'uso degli spazi comuni e dei laboratori tecnici.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 2. Didattica e Programmazione
        {
            categoryId: "cat_didattica",
            title: "Programmazione per competenze e UDA",
            content: "In questa discussione è possibile confrontarsi sulla progettazione didattica per competenze, con particolare riferimento alle Unità di Apprendimento.\nSono benvenuti esempi, materiali, riflessioni, difficoltà incontrate e soluzioni adottate nelle diverse discipline e indirizzi.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_didattica",
            title: "Programmazione per competenze nell’istruzione professionale",
            content: "Focus specifico sulle peculiarità della programmazione nell'istruzione professionale.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_didattica",
            title: "Unità di Apprendimento (UDA): esempi e buone pratiche",
            content: "Archivio e confronto su modelli di UDA efficaci.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_didattica",
            title: "Valutazione per competenze: criteri e rubriche",
            content: "Discussione su criteri di valutazione e costruzione di rubriche valutative.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_didattica",
            title: "Prove comuni e compiti autentici",
            content: "Idee e materiali per prove di verifica comuni e compiti di realtà.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_didattica",
            title: "Educazione civica: proposte e integrazione nelle discipline",
            content: "Come integrare l'educazione civica nel curriculum scolastico.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 3. Laboratori di Cucina
        {
            categoryId: "cat_cucina",
            title: "Attività di laboratorio: esperienze e buone pratiche",
            content: "Questo spazio è dedicato alla condivisione di esperienze didattiche svolte nei laboratori di cucina.\nÈ possibile segnalare attività riuscite, criticità emerse, proposte operative, aspetti legati alla sicurezza e all’organizzazione delle classi in laboratorio.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_cucina",
            title: "Attività di laboratorio riuscite (ricette, percorsi, UDA)",
            content: "Raccolta di percorsi didattici e ricette che hanno avuto particolare successo.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_cucina",
            title: "Gestione della sicurezza e HACCP in laboratorio",
            content: "Procedure operative e monitoraggio della sicurezza alimentare e sul lavoro.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_cucina",
            title: "Organizzazione delle brigate di cucina con le classi",
            content: "Modelli organizzativi per l'efficace gestione dei gruppi classe in laboratorio.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_cucina",
            title: "Difficoltà ricorrenti degli studenti e strategie didattiche",
            content: "Analisi delle criticità nell'apprendimento e soluzioni proposte.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_cucina",
            title: "Attrezzature, manutenzione e materiali mancanti",
            content: "Segnalazioni e gestione degli strumenti di lavoro.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 4. Sala e Vendita – Bar
        {
            categoryId: "cat_sala",
            title: "Didattica di sala e simulazioni di servizio",
            content: "Qui i docenti di sala e vendita possono confrontarsi su simulazioni di servizio, attività di laboratorio, eventi didattici e strategie di valutazione delle competenze professionali.\nLo spazio è aperto anche a suggerimenti su gestione del bar didattico e organizzazione di eventi interni.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_sala",
            title: "Simulazioni di servizio: idee e criticità",
            content: "Confronto su come organizzare simulazioni realistiche ed efficaci.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_sala",
            title: "Educazione al cliente e comunicazione professionale",
            content: "Strategie per l'insegnamento delle soft skills e del galateo professionale.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_sala",
            title: "Mise en place, servizio e valutazione delle competenze",
            content: "Dagli aspetti tecnici alla valutazione finale dello studente.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_sala",
            title: "Gestione del bar didattico",
            content: "Aspetti operativi e didattici della gestione del bar interno.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_sala",
            title: "Eventi interni: banchetti, open day, cene didattiche",
            content: "Coordinamento per l'organizzazione di grandi eventi scolastici.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 5. Accoglienza Turistica
        {
            categoryId: "cat_accoglienza",
            title: "Simulazioni di accoglienza e strumenti didattici",
            content: "Questa discussione è dedicata alle attività didattiche dell’indirizzo Accoglienza Turistica.\nÈ possibile condividere esperienze su simulazioni di front e back office, utilizzo di software, progetti interdisciplinari e attività legate al territorio.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_accoglienza",
            title: "Simulazioni di front office e back office",
            content: "Esercitazioni pratiche sulla gestione del cliente e delle prenotazioni.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_accoglienza",
            title: "Utilizzo di software gestionali e strumenti digitali",
            content: "Istruzioni e consigli sui programmi usati nel settore turistico.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_accoglienza",
            title: "Progetti di accoglienza per eventi scolastici",
            content: "Organizzazione dell'accoglienza durante convegni e open day.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_accoglienza",
            title: "Collegamenti con il territorio e strutture ricettive",
            content: "Uscite didattiche e collaborazioni con hotel e agenzie locali.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 6. Inclusione, BES e Gestione della Classe
        {
            categoryId: "cat_inclusione",
            title: "Strategie inclusive e gestione delle classi",
            content: "Spazio di confronto su inclusione, BES, DSA e gestione delle dinamiche di classe, in particolare nei contesti laboratoriali.\nÈ possibile condividere strategie, strumenti, buone pratiche e chiedere supporto ai colleghi nel rispetto della riservatezza degli studenti.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_inclusione",
            title: "Strategie didattiche per studenti BES e DSA",
            content: "Metodologie personalizzate per garantire il successo formativo.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_inclusione",
            title: "Gestione delle classi difficili nei laboratori/classi",
            content: "Consigli e supporto reciproco sulla gestione del comportamento.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_inclusione",
            title: "Condivisione di strumenti compensativi",
            content: "Raccolta di schemi, mappe e software facilitatori.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_inclusione",
            title: "Esperienze su PDP e PEI",
            content: "Aspetti burocratici e operativi della documentazione inclusiva.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_inclusione",
            title: "Motivazione e coinvolgimento degli studenti",
            content: "Come contrastare la dispersione e aumentare l'interesse.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 7. PCTO, Stage e Rapporti con le Aziende
        {
            categoryId: "cat_pcto",
            title: "Esperienze di PCTO e collaborazione con le aziende",
            content: "Questa discussione è dedicata allo scambio di esperienze relative ai PCTO e agli stage.\nÈ possibile segnalare aziende, condividere criticità, buone pratiche, modalità di preparazione degli studenti e criteri di valutazione delle competenze.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_pcto",
            title: "Esperienze di PCTO: cosa ha funzionato e cosa no",
            content: "Debriefing sulle attività svolte esternamente.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_pcto",
            title: "Aziende disponibili e contatti utili",
            content: "Database condiviso delle realtà ospitanti sul territorio.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_pcto",
            title: "Preparazione degli studenti allo stage",
            content: "Attività preliminari all'inserimento in azienda.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_pcto",
            title: "Valutazione delle competenze in PCTO",
            content: "Come monitorare e certificare il lavoro fatto in azienda.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 8. Progetti, Eventi e Concorsi
        {
            categoryId: "cat_progetti",
            title: "Proposte progettuali ed eventi",
            content: "In questo spazio possono essere proposte e condivise idee progettuali, partecipazioni a concorsi, eventi didattici e collaborazioni con enti esterni.\nLa discussione favorisce il coordinamento e la valorizzazione delle iniziative dell’istituto.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_progetti",
            title: "Proposte di nuovi progetti didattici",
            content: "Spazio per l'ideazione di nuove attività extra-curricolari.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_progetti",
            title: "Concorsi gastronomici e professionali",
            content: "Segnalazione di bandi e preparazione degli studenti alle competizioni.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_progetti",
            title: "Partecipazione a eventi del territorio",
            content: "Presenza dell'istituto a fiere, sagre e manifestazioni locali.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_progetti",
            title: "Collaborazioni con enti e associazioni",
            content: "Lavoro di rete con il tessuto sociale e culturale.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_progetti",
            title: "Documentazione e rendicontazione dei progetti",
            content: "Come archiviare e dare visibilità al lavoro svolto.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 9. Innovazione, Digitale e Formazione Docenti
        {
            categoryId: "cat_innovazione",
            title: "Strumenti digitali e formazione",
            content: "Spazio dedicato all’innovazione didattica, agli strumenti digitali e alla formazione dei docenti.\nÈ possibile condividere risorse, applicazioni, esperienze formative e riflessioni sull’uso consapevole delle tecnologie nella didattica.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_innovazione",
            title: "Strumenti digitali utili per la didattica",
            content: "Recensioni e consigli su hardware e software per la scuola.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_innovazione",
            title: "Uso di piattaforme, app e webapp",
            content: "Google Workspace, Canva, Kahoot e molto altro.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_innovazione",
            title: "Intelligenza artificiale a supporto della didattica",
            content: "Sperimentazioni e riflessioni sull'uso dell'IA generativa.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_innovazione",
            title: "Corsi di formazione consigliati",
            content: "Segnalazione di webinar, MOOC e corsi in presenza.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_innovazione",
            title: "Condivisione di materiali e risorse online",
            content: "Link a repository, siti web e canali YouTube didattici.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        // 10. Spazio di Confronto e Buone Pratiche
        {
            categoryId: "cat_confronto",
            title: "Confronto tra docenti",
            content: "Questo è uno spazio di confronto libero e costruttivo tra docenti.\nÈ possibile porre domande, condividere esperienze significative, proporre miglioramenti e favorire una comunità professionale collaborativa.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_confronto",
            title: "Buone Pratiche Didattiche da condividere",
            content: "Cosa ha funzionato in aula? Condividiamo il successo.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_confronto",
            title: "Esperienze significative in classe o in laboratorio",
            content: "Racconti di vita scolastica che stimolano la riflessione.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_confronto",
            title: "Domande, dubbi e richieste di confronto",
            content: "Nessuna domanda è banale se serve a migliorare.",
            author: "Amministratore",
            date: new Date().toISOString()
        },
        {
            categoryId: "cat_confronto",
            title: "Suggerimenti per migliorare il funzionamento dell’istituto",
            content: "Proposte costruttive per l'organizzazione scolastica.",
            author: "Amministratore",
            date: new Date().toISOString()
        }
    ]
};

async function seed() {
    console.log("Inizio svuotamento e popolamento database...");

    try {
        // Pulisci database esistente
        await db.ref('categories').remove();
        await db.ref('threads').remove();
        console.log("Database svuotato.");

        // Carica Categorie
        const catRef = db.ref('categories');
        for (const cat of data.categories) {
            await catRef.child(cat.id).set({ name: cat.name });
            console.log(`Categoria aggiunta: ${cat.name}`);
        }

        // Carica Discussioni
        const threadRef = db.ref('threads');
        for (const thread of data.threads) {
            await threadRef.push(thread);
            console.log(`Discussione aggiunta: ${thread.title}`);
        }

        console.log("Popolamento completato con successo!");
        process.exit(0);
    } catch (error) {
        console.error("Errore durante il popolamento:", error);
        process.exit(1);
    }
}

seed();
