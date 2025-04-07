function formatBon(data) {
    const { bon, comanda, restaurant, produse, total, casier, dataOra, tva } = data;

    const lines = [];

    lines.push('      BON FISCAL');
    lines.push('S.C. US FOOD NETWORK S.A.');
    lines.push('SOS.BUCURESTI-PLOIESTI42D,S.1 BUCURESTI');
    lines.push('COD FISCAL: RO6645790');
    lines.push('');
    lines.push(`Numar bon: ${bon}`);
    lines.push(`NUMAR COMANDA: ${comanda}`);
    lines.push('');
    lines.push(`*** ${restaurant.nume} ***`);
    lines.push(`Numar Restaurant: ${restaurant.numar}`);
    lines.push('');

    produse.forEach(p => {
        const pret = (p.pret * p.cantitate).toFixed(2);
        lines.push(`${p.nume.padEnd(20)} ${pret.padStart(6)} B`);
        lines.push(`${p.pret.toFixed(2)} x${p.cantitate}`);
    });

    lines.push('');
    lines.push('TOTAL'.padEnd(20) + total.toFixed(2).padStart(10));
    lines.push('CARTE CREDIT'.padEnd(20) + total.toFixed(2).padStart(10));
    lines.push('REST'.padEnd(20) + '0,00'.padStart(10));
    lines.push('');
    lines.push(`NUME: ${casier}`);
    lines.push('CASA: Pos1');
    lines.push('MOD SERVIRE: Acasa');
    lines.push('');
    lines.push(`TOTAL TVA B`.padEnd(20) + tva.toFixed(2).padStart(10));
    lines.push('Cota TVA B = 09.00 %');
    lines.push(`Data: ${dataOra}`);
    lines.push('');
    lines.push('MB0345510089');

    return lines.map(line => line + '\n').join('');
}

function qrCodeTeIubesc() {
    const data = 'Te iubesc';

    const storeLen = data.length + 3;
    const pL = storeLen % 256;
    const pH = Math.floor(storeLen / 256);

    return (
        '\x1D\x28\x6B\x03\x00\x31\x43\x07' +
        '\x1D\x28\x6B\x03\x00\x31\x45\x30' +
        '\x1D\x28\x6B' + String.fromCharCode(pL, pH) +
        '\x31\x50\x30' + data +
        '\x1D\x28\x6B\x03\x00\x31\x51\x30'
    );
}

function poezie() {
    const lines = [];

    lines.push('      n');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('');
    lines.push('Oricat as cauta nu as gasi in intregul cosmos,');
    lines.push('Gândul zboară lin, ușor,');
    lines.push('Spre-o iubire ce nu moare.');
    lines.push('');
    lines.push('Printre stele, dorul meu');
    lines.push('Țese vise, pas cu pas.');
    lines.push('Și-apoi scrie printre rânduri:');
    lines.push('„Te iubesc”... și e de-ajuns.');
    lines.push('');
    lines.push('      ~ ♥ ~');
    lines.push('');
    lines.push('Scanează și tu:');

    const qr = qrCodeTeIubesc();

    return lines.map(l => l + '\n').join('') + qr;
}

module.exports = {
    formatBon,
    poezie
};
