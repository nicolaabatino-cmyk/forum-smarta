const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Configurazione globale
let notificationsEnabled = true;

app.get('/api/settings/notifications', (req, res) => {
    res.json({ enabled: notificationsEnabled });
});

app.post('/api/settings/notifications', (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled === 'boolean') {
        notificationsEnabled = enabled;
        res.json({ success: true, enabled: notificationsEnabled });
    } else {
        res.status(400).json({ error: 'Payload non valido' });
    }
});

// Carica la lista degli utenti
let allowedUsers = [];
try {
    const usersFile = fs.readFileSync(path.join(__dirname, 'public', 'allowedUsers.js'), 'utf8');
    // regex pattern matching the values inside the array
    const match = usersFile.match(/const ALLOWED_USERS = \[([\s\S]*?)\];/);
    if (match && match[1]) {
        allowedUsers = match[1]
            .split(',')
            .map(s => s.trim().replace(/"/g, ''))
            .filter(s => s.length > 0);
    }
} catch (e) {
    console.error("Errore nel caricamento di allowedUsers.js", e);
}

// Configurazione Google Apps Script
const gasUrls = [
  process.env.GAS_URL,    // legacy variable (if still set)
  process.env.GAS_URL_1,
  process.env.GAS_URL_2,
  process.env.GAS_URL_3,
  process.env.GAS_URL_4
].filter(Boolean); // rimuove eventuali variabili non impostate
let urlIndex = 0; // indice per round‑robin

if (gasUrls.length === 0) {
  console.warn("ATTENZIONE: Nessuna GAS_URL impostata. Le notifiche saranno simulate.");
}

app.post('/api/notify', async (req, res) => {
    const { author, title, discussionTitle, content, category, recentReplies } = req.body;

    if (!author || !content) {
        return res.status(400).json({ error: 'Mancano dati necessari' });
    }

    console.log(`Richiesto invio email notifica per post di ${author} in categoria: ${category}`);

    try {
        const catStr = category ? category : 'Varie';
        const discStr = discussionTitle || title || 'Discussione generica';
        
        let repliesHtml = '';
        let repliesText = '';
        if (recentReplies && recentReplies.length > 0) {
            repliesHtml = `<hr><p style="color: #666; font-size: 0.9em;"><strong>In risposta a:</strong></p>`;
            repliesText = `\n\n--- In risposta a ---\n`;
            
            recentReplies.forEach(r => {
                repliesHtml += `<div style="margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #ddd; color: #555;">
                                    <strong>${r.author}</strong> ha scritto:<br/>
                                    <em>${r.content.replace(/\n/g, '<br>')}</em>
                                </div>`;
                repliesText += `> ${r.author} ha scritto:\n> ${r.content}\n\n`;
            });
        }

        // Determina i destinatari
        let toList = 'nicolaabatino@alberghieropesaro.it';
        let bccArray = [];

        if (notificationsEnabled) {
            allowedUsers.forEach(email => {
                if (email !== 'nicolaabatino@alberghieropesaro.it' && email.includes('@')) {
                    bccArray.push(email);
                }
            });
            console.log(`-> Notifiche ON: invio a Nicola + ${bccArray.length} utenti in bcc (a blocchi di 40)`);
        } else {
            console.log(`-> Notifiche OFF: invio solo a Nicola`);
        }

        const htmlContent = `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
               <p>È stato pubblicato un nuovo post o una risposta da <strong>${author}</strong> nella categoria <strong style="color: #dc2626;">"${catStr}"</strong>, discussione <strong style="color: #2563eb;">"${discStr}"</strong>.</p>
               <p><strong>Post:</strong><br/>${content.replace(/\n/g, '<br>')}</p>
               <br/>
               ${repliesHtml}
               <p style="margin-top: 20px;"><a href="https://forum-smarta.onrender.com/" style="padding: 10px 15px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Vai al forum</a></p>
               </div>`;
        const subject = `Nuovo post in "${catStr}" da ${author}`;

        // Se non ci sono URL valide, simuliamo l'invio
        if (gasUrls.length === 0) {
            console.log('-> Invio simulato (manca GAS_URL):', subject);
            return res.status(200).json({ success: true, message: 'Simulazione invio completata' });
        }

        // Funzione interna per inviare un singolo blocco di email
        const sendBatch = async (bccString) => {
            const emailData = {
                to: toList,
                bcc: bccString,
                subject: subject,
                htmlContent: htmlContent
            };
            const url = gasUrls[urlIndex];
            urlIndex = (urlIndex + 1) % gasUrls.length; // round‑robin
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(emailData)
            });
            const resultText = await response.text();
            let resultJson;
            try {
                resultJson = JSON.parse(resultText);
            } catch(e) {
                console.error("Risposta non JSON da GAS:", resultText);
                throw new Error(`Errore inaspettato da Google Apps Script`);
            }
            if (resultJson.error) {
                throw new Error(`Errore da Google Apps Script: ${resultJson.error}`);
            }
        };

        if (bccArray.length === 0) {
            // Invio solo a Nicola
            await sendBatch('');
        } else {
            // Dividiamo i destinatari in gruppi da 40 per superare il limite di Google
            const BATCH_SIZE = 40;
            for (let i = 0; i < bccArray.length; i += BATCH_SIZE) {
                const batch = bccArray.slice(i, i + BATCH_SIZE);
                await sendBatch(batch.join(','));
                // Piccola pausa di 500ms tra un blocco e l'altro per non intasare l'API
                await new Promise(r => setTimeout(r, 500)); 
            }
        }

        console.log('Tutte le email sono state inviate con successo tramite Google Apps Script');
        res.status(200).json({ success: true, message: 'Email inviate con successo' });
    } catch (error) {
        console.error('Errore invio email:', error);
        res.status(500).json({ error: 'Errore durante l\'invio delle email' });
    }
});

// Fallback to index.html for SPA routing (if needed later, good practice)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
