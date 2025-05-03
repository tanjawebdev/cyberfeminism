const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'cyberfeminism.appspot.com',
});

const db     = admin.firestore();
const bucket = admin.storage().bucket();

async function dumpData() {
    // 1) Firestore export
    const collections = ['realitems','categories'];
    const out = {};

    for (let col of collections) {
        const snap = await db.collection(col).get();
        out[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    fs.writeFileSync('data/firestore.json', JSON.stringify(out, null, 2));
    console.log('✅ Firestore exported.');

    // 2) Storage export
    const [files] = await bucket.getFiles();
    await Promise.all(files.map(async file => {
        const dest = path.join('public','images',file.name);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        await file.download({ destination: dest });
        console.log('↓', file.name);
    }));
    console.log('✅ Images downloaded.');
}

dumpData().catch(console.error);