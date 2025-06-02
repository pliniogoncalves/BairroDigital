const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const occurrenceRoutes = require('./routes/occurrenceRoutes');

const app = express();
const PORT = process.env.PORT || 3002; 

connectDB();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 

app.get('/', (req, res) => {
    res.send('Serviço de Ocorrências Bairro Digital está no ar!');
});

app.use('/occurrences', occurrenceRoutes);

app.listen(PORT, () => {
    console.log(`Serviço de Ocorrências rodando na porta ${PORT}`);
});