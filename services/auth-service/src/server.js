const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Serviço de Autenticação Bairro Digital está no ar!');
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Serviço de Autenticação rodando na porta ${PORT}`);
});