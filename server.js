const express = require('express');
const { SerialPort } = require('serialport');
const { formatBon, poezie } = require('./templates');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const port = 56478;
const printerPath = '/dev/tty.MPT-II';
let printer = undefined;

app.post('/print', async (req, res) => {
    try {
        const bonText = formatBon(req.body);

        if (!printer) {
            printer = new SerialPort({
                path: printerPath,
                baudRate: 9600
            });
        }

        printer.write(bonText, (err) => {
            if (err) {
                console.error('Eroare la trimiterea datelor:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('Mesaj trimis la imprimantă:\n' + bonText);
            res.json({ status: 'Trimis!', message: bonText });
        });
    } catch (e) {
        console.error('Eroare la formatBon:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/poezie', async (req, res) => {
    const text = poezie();

    if (!printer) {
        printer = new SerialPort({
            path: printerPath,
            baudRate: 9600
        });
    }

    printer.write(text, (err) => {
        if (err) {
            console.error('Eroare la trimiterea poeziei:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Poezie trimisă la imprimantă:\n' + text);
        res.json({ status: 'Trimisă!', poezie: text });
    });
});

app.listen(port, () => {
    console.log(`Serverul ascultă pe http://localhost:${port}`);
});
