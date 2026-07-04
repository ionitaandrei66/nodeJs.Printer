const express = require('express');
const { SerialPort } = require('serialport');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const HTTP_PORT = 56478;
const PRINTER_PATH = '/dev/cu.MPT-II';
const BAUD_RATE = 9600;

function escposPrint(lines) {
    return Buffer.from(lines.join(''), 'binary');
}

function escposQrCode(text) {
    const data = Buffer.from(text, 'utf8');
    const storeLen = data.length + 3;
    const pL = storeLen % 256;
    const pH = Math.floor(storeLen / 256);

    return Buffer.concat([
        Buffer.from('\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', 'binary'),
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x43\x06', 'binary'),
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x45\x30', 'binary'),
        Buffer.from([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]),
        data,
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x51\x30', 'binary')
    ]);
}

function buildLoveQrPrint() {
    return Buffer.concat([
        Buffer.from([
            '\x1B\x40',
            '\x1B\x61\x01',
            '\x1B\x45\x01',
            'SCANEAZA-MA\n',
            '\x1B\x45\x00',
            '------------------------------\n',
            'Daca ai nevoie\n',
            'sa zambesti\n',
            '\n'
        ].join(''), 'binary'),

        escposQrCode('Te iubesc! \nEsti superba, ti-am spus azi?'),

        Buffer.from([
            '\n',
            '------------------------------\n',
            'Pentru cel mai frumos zambet\n',
            '\n\n\n\n',
            '\x1D\x56\x00'
        ].join(''), 'binary')
    ]);
}
function buildTestPrint() {
    return escposPrint([
        '\x1B\x40',
        '\x1B\x61\x01',
        '\x1B\x45\x01',
        'TEST PRINT\n',
        '\x1B\x45\x00',
        '------------------------------\n',
        '\x1B\x61\x00',
        'Salut, Andrei!\n',
        'Bluetooth Serial merge.\n',
        'Node + ThermalPrinter style\n',
        'Trimis prin SerialPort\n',
        '------------------------------\n',
        '\x1B\x61\x01',
        'Multumesc!\n',
        '\n\n\n\n',
        '\x1D\x56\x00'
    ]);
}

function buildBon(text = 'Bon test random') {
    return escposPrint([
        '\x1B\x40',
        '\x1B\x61\x01',
        '\x1B\x45\x01',
        'BON TEST\n',
        '\x1B\x45\x00',
        '------------------------------\n',
        '\x1B\x61\x00',
        text + '\n',
        '------------------------------\n',
        '\x1B\x61\x01',
        'Trimis din Node.js\n',
        '\n\n\n\n',
        '\x1D\x56\x00'
    ]);
}

function randomBonText() {
    const texte = [
        'Salut, acesta este un bon random!',
        'Imprimanta Bluetooth merge.',
        'Test rapid din Node.js.',
        'Bon mic scos cu succes.',
        'Brebump printer test OK.',
        'Text random pentru imprimanta termica.'
    ];

    return texte[Math.floor(Math.random() * texte.length)];
}

function printBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const port = new SerialPort({
            path: PRINTER_PATH,
            baudRate: BAUD_RATE,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            autoOpen: false
        });

        port.open((openErr) => {
            if (openErr) return reject(openErr);

            console.log('Port deschis:', PRINTER_PATH);

            port.write(buffer, (writeErr) => {
                if (writeErr) {
                    port.close();
                    return reject(writeErr);
                }

                port.drain((drainErr) => {
                    if (drainErr) {
                        port.close();
                        return reject(drainErr);
                    }

                    setTimeout(() => {
                        port.close((closeErr) => {
                            if (closeErr) return reject(closeErr);

                            console.log('Port inchis dupa print.');
                            resolve();
                        });
                    }, 700);
                });
            });
        });

        port.on('error', (err) => reject(err));
    });
}

app.get('/status', (req, res) => {
    res.json({
        status: 'SERVER_OK',
        printerPath: PRINTER_PATH,
        baudRate: BAUD_RATE
    });
});

app.post('/qr-love', async (req, res) => {
    try {
        const bon = buildLoveQrPrint();

        await printBuffer(bon);

        res.json({
            status: 'TRIMIS_LA_IMPRIMANTA',
            message: 'QR printat. Cand scanezi apare: Te iubesc'
        });
    } catch (error) {
        console.error('Eroare qr-love:', error.message);

        res.status(500).json({
            status: 'EROARE_PRINT',
            message: error.message
        });
    }
});

app.post('/test-print', async (req, res) => {
    try {
        const bon = buildTestPrint();

        await printBuffer(bon);

        res.json({
            status: 'TRIMIS_LA_IMPRIMANTA',
            message: 'Test print trimis cu ESC/POS prin SerialPort'
        });
    } catch (error) {
        console.error('Eroare test-print:', error.message);

        res.status(500).json({
            status: 'EROARE_PRINT',
            message: error.message
        });
    }
});

app.post('/poezie', async (req, res) => {
    try {
        const text = randomBonText();
        const bon = buildBon(text);

        await printBuffer(bon);

        res.json({
            status: 'TRIMIS_LA_IMPRIMANTA',
            text
        });
    } catch (error) {
        console.error('Eroare poezie:', error.message);

        res.status(500).json({
            status: 'EROARE_PRINT',
            message: error.message
        });
    }
});

app.post('/print', async (req, res) => {
    try {
        const text = req.body?.text || randomBonText();
        const bon = buildBon(text);

        await printBuffer(bon);

        res.json({
            status: 'TRIMIS_LA_IMPRIMANTA',
            text
        });
    } catch (error) {
        console.error('Eroare print:', error.message);

        res.status(500).json({
            status: 'EROARE_PRINT',
            message: error.message
        });
    }
});

app.listen(HTTP_PORT, () => {
    console.log(`Serverul asculta pe http://localhost:${HTTP_PORT}`);
    console.log(`Imprimanta Bluetooth: ${PRINTER_PATH}`);
});