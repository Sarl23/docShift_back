const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db;

async function initializeFirebase() {
    try {
        const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!serviceAccountPath) {
            throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
        }

        let serviceAccount;
        if (serviceAccountPath.startsWith('http')) {
            console.log('Downloading credentials from URL...');
            const response = await axios.get(serviceAccountPath);
            serviceAccount = response.data;
        } else {
            console.log('Reading credentials from local file...');
            const filePath = path.resolve(serviceAccountPath);
            serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        initializeApp({
            credential: cert(serviceAccount),
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