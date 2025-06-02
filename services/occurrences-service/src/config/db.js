const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
    if (db) return db;
    try {
        if (!uri) {
            throw new Error('MONGODB_URI não está definida para occurrences-service. Verifique o arquivo .env correspondente.');
        }
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(); 
        console.log("Conectado ao MongoDB - Occurrences Service!");
        return db;
    } catch (error) {
        console.error("Não foi possível conectar ao MongoDB - Occurrences Service:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;