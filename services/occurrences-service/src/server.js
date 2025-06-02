const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors'); 
const connectDB = require('./config/db');
const occurrenceRoutes = require('./routes/occurrenceRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

connectDB();

const whitelist = ['https://bairro-digital.vercel.app'];
 if (process.env.NODE_ENV !== 'production') {
     whitelist.push('http://localhost:5500');
     whitelist.push('http://127.0.0.1:5500');
}
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('Serviço de Ocorrências Bairro Digital está no ar!');
});

app.use('/occurrences', occurrenceRoutes);

app.listen(PORT, () => {
    console.log(`Serviço de Ocorrências rodando na porta ${PORT}`);
});