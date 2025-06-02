const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let client;
let db;

async function connectDB() {
    if (db) return db;
    try {
        if (!uri) { 
            throw new Error('MONGODB_URI não está definida. Verifique seu arquivo .env e a configuração do dotenv.');
        }
        client = new MongoClient(uri);
        await client.connect();
        db = client.db();
        console.log("Conectado ao MongoDB Atlas - Auth Service!");
        return db;
    } catch (error) {
        console.error("Não foi possível conectar ao MongoDB - Auth Service:", error);
        process.exit(1);
    }
}

module.exports = connectDB;