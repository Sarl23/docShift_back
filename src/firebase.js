const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

async function initializeFirebase() {
    try {
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!serviceAccountPath) {
            throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
        }

        console.log('Reading credentials...');
        const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));

        initializeApp({
            credential: cert(serviceAccount)
        });

        db = getFirestore();
        console.log('Firebase initialized successfully...');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

async function getDb() {
    if (!db) {
        await initializeFirebase();
    }
    return db;
}

module.exports = { getDb };
