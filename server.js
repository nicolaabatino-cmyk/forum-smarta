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

// Configura nodemailer
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    console.warn("ATTENZIONE: Credenziali EMAIL mancanti nel file .env");
}

app.post('/api/notify', async (req, res) => {
    const { author, title, discussionTitle, content, category, recentReplies } = req.body;

    if (!author || !content) {
        return res.status(400).json({ error: 'Mancano dati necessari' });
    }

    if (!transporter) {
        return res.status(500).json({ error: 'Servizio email non configurato' });
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

        // Determina i destinatari in base allo stato delle notifiche
        let recipients;
        if (notificationsEnabled) {
            recipients = allowedUsers.join(', ');
            console.log(`-> Notifiche ON: invio a tutti (${allowedUsers.length} utenti)`);
        } else {
            recipients = 'nicolaabatino@alberghieropesaro.it';
            console.log(`-> Notifiche OFF: invio solo a Nicola (${recipients})`);
        }

        if (!recipients) {
            return res.status(200).json({ success: true, message: 'Nessun destinatario trovato' });
        }

        const mailOptions = {
            from: `"Forum Santa Marta" <${process.env.EMAIL_USER}>`,
            to: recipients,
            subject: `Nuovo post in "${catStr}" da ${author}`,
            text: `È stato pubblicato un nuovo post o una risposta da ${author} nella categoria "${catStr}", discussione "${discStr}".\n\nContenuto: ${content}${repliesText}\n\nAccedi al forum per partecipare alla discussione: https://forum-smarta.onrender.com/`,
            html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
                   <p>È stato pubblicato un nuovo post o una risposta da <strong>${author}</strong> nella categoria <strong style="color: #dc2626;">"${catStr}"</strong>, discussione <strong style="color: #2563eb;">"${discStr}"</strong>.</p>
                   <p><strong>Post:</strong><br/>${content.replace(/\n/g, '<br>')}</p>
                   <br/>
                   ${repliesHtml}
                   <p style="margin-top: 20px;"><a href="https://forum-smarta.onrender.com/" style="padding: 10px 15px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Vai al forum</a></p>
                   </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email inviata con successo: ' + info.response);
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
