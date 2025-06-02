const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; 

const USERS_COLLECTION = 'users';

exports.registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça nome, email e senha.' });
    }

    try {
        const db = await connectDB();
        const usersCollection = db.collection(USERS_COLLECTION);

        const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário com este email já existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || '',
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        const tokenPayload = {
            userId: result.insertedId,
            email: newUser.email,
            name: newUser.name
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            token,
            user: {
                id: result.insertedId,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar registrar usuário.' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
    }

    try {
        const db = await connectDB();
        const usersCollection = db.collection(USERS_COLLECTION);

        const user = await usersCollection.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas (email não encontrado).' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas (senha incorreta).' });
        }

        const tokenPayload = {
            userId: user._id,
            email: user.email,
            name: user.name
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer login.' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection(USERS_COLLECTION);

        const userIdFromToken = req.user.id;
        const { name, phone } = req.body;

        if (!name && !phone) {
            return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
        }
        if (name && typeof name !== 'string' || phone && typeof phone !== 'string') {
             return res.status(400).json({ message: 'Nome e telefone devem ser strings.' });
        }


        const camposParaAtualizar = {};
        if (name) camposParaAtualizar.name = name;
        if (phone) camposParaAtualizar.phone = phone;

        camposParaAtualizar.updatedAt = new Date();

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userIdFromToken) },
            { $set: camposParaAtualizar }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
         if (result.modifiedCount === 0) {
            const usuarioExistente = await usersCollection.findOne({ _id: new ObjectId(userIdFromToken) });
            delete usuarioExistente.password;
            return res.status(200).json({
                message: 'Nenhuma alteração nos dados do perfil.',
                user: usuarioExistente
            });
        }

        const usuarioAtualizado = await usersCollection.findOne({ _id: new ObjectId(userIdFromToken) });
        delete usuarioAtualizado.password;

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: usuarioAtualizado
        });

    } catch (error) {
        console.error("Erro ao atualizar perfil do usuário:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar atualizar o perfil.' });
    }
};