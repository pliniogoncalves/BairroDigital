const connectDB = require('../config/db');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const OCCURRENCES_COLLECTION = 'occurrences';
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/');

exports.createOccurrence = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const {
            titulo, tipo, descricao, cep, rua, bairro, cidade, estado, referencia
        } = req.body;

        if (!titulo || !tipo || !descricao || !cep || !rua || !bairro || !cidade || !estado) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }
        const { id: userId, name: userName, email: userEmail } = req.user;

        let fotoPath = '';
        if (req.file) {
            fotoPath = `uploads/${req.file.filename}`;
        }

        const novaOcorrencia = {
            userId: new ObjectId(userId), 
            userName, userEmail, titulo, tipo, descricao, cep, rua, bairro, cidade, estado,
            referencia: referencia || '',
            fotoUrl: fotoPath,
            status: 'Aberto',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await occurrencesCollection.insertOne(novaOcorrencia);
        const ocorrenciaCriada = await occurrencesCollection.findOne({ _id: result.insertedId });
        res.status(201).json({
            message: 'Ocorrência criada com sucesso!',
            ocorrencia: ocorrenciaCriada
        });
    } catch (error) {
        if (error instanceof multer.MulterError) { 
            return res.status(400).json({ message: `Erro no upload do arquivo: ${error.message}` });
        } else if (error.message && error.message.startsWith('Formato de arquivo não suportado')) { 
             return res.status(400).json({ message: error.message });
        }
        console.error("Erro ao criar ocorrência:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar criar ocorrência.' });
    }
};

exports.getAllOccurrences = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const queryFilters = {};
        if (req.query.status) queryFilters.status = req.query.status;
        if (req.query.tipo) queryFilters.tipo = req.query.tipo;
        const ocorrencias = await occurrencesCollection.find(queryFilters).sort({ createdAt: -1 }).toArray();
        res.status(200).json(ocorrencias);
    } catch (error) {
        console.error("Erro ao listar todas as ocorrências:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar listar ocorrências.' });
    }
};

exports.getMyOccurrences = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const userIdParaBuscar = new ObjectId(req.user.id);
        const minhasOcorrencias = await occurrencesCollection
            .find({ userId: userIdParaBuscar })
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json(minhasOcorrencias);
    } catch (error) {
        console.error("Erro ao listar 'minhas ocorrências':", error);
        if (error.message && error.message.toLowerCase().includes("objectid")) {
            return res.status(400).json({ message: 'ID de usuário inválido no token.'})
        }
        res.status(500).json({ message: 'Erro no servidor ao tentar listar suas ocorrências.' });
    }
};

exports.getOccurrenceById = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const occurrenceId = req.params.id;

        if (!ObjectId.isValid(occurrenceId)) {
            return res.status(400).json({ message: 'ID da ocorrência inválido.' });
        }

        const ocorrencia = await occurrencesCollection.findOne({ _id: new ObjectId(occurrenceId) });

        if (!ocorrencia) {
            return res.status(404).json({ message: 'Ocorrência não encontrada.' });
        }

        res.status(200).json(ocorrencia);

    } catch (error) {
        console.error("Erro ao obter detalhes da ocorrência:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar obter detalhes da ocorrência.' });
    }
};


exports.updateOccurrence = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const occurrenceId = req.params.id;
        const userIdFromToken = req.user.id;

        if (!ObjectId.isValid(occurrenceId)) {
            return res.status(400).json({ message: 'ID da ocorrência inválido.' });
        }
        const OcurrenceObjectId = new ObjectId(occurrenceId);

        const ocorrenciaExistente = await occurrencesCollection.findOne({ _id: OcurrenceObjectId });

        if (!ocorrenciaExistente) {
            return res.status(404).json({ message: 'Ocorrência não encontrada.' });
        }

        if (ocorrenciaExistente.userId.toString() !== userIdFromToken) {
            return res.status(403).json({ message: 'Usuário não autorizado a editar esta ocorrência.' });
        }

        const camposParaAtualizar = {};
        const { titulo, tipo, descricao, status, cep, rua, bairro, cidade, estado, referencia } = req.body;

        if (titulo) camposParaAtualizar.titulo = titulo;
        if (tipo) camposParaAtualizar.tipo = tipo;
        if (descricao) camposParaAtualizar.descricao = descricao;
        if (status) camposParaAtualizar.status = status;
        if (cep) camposParaAtualizar.cep = cep;
        if (rua) camposParaAtualizar.rua = rua;
        if (bairro) camposParaAtualizar.bairro = bairro;
        if (cidade) camposParaAtualizar.cidade = cidade;
        if (estado) camposParaAtualizar.estado = estado;
        if (referencia !== undefined) camposParaAtualizar.referencia = referencia;

        if (req.file) {
            if (ocorrenciaExistente.fotoUrl && ocorrenciaExistente.fotoUrl.startsWith('uploads/')) {
                const caminhoFotoAntiga = path.join(UPLOADS_DIR, path.basename(ocorrenciaExistente.fotoUrl));
                fs.unlink(caminhoFotoAntiga, (err) => {
                    if (err) console.error("Erro ao deletar foto antiga:", err);
                    else console.log("Foto antiga deletada:", caminhoFotoAntiga);
                });
            }
            camposParaAtualizar.fotoUrl = `uploads/${req.file.filename}`;
        }

        camposParaAtualizar.updatedAt = new Date();

        const result = await occurrencesCollection.updateOne(
            { _id: OcurrenceObjectId },
            { $set: camposParaAtualizar }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Ocorrência não encontrada para atualização (conflito).' });
        }
        if (result.modifiedCount === 0 && !req.file) {
            return res.status(200).json({ message: 'Nenhuma alteração detectada.', ocorrencia: ocorrenciaExistente });
        }

        const ocorrenciaAtualizada = await occurrencesCollection.findOne({ _id: OcurrenceObjectId });
        res.status(200).json({
            message: 'Ocorrência atualizada com sucesso!',
            ocorrencia: ocorrenciaAtualizada
        });

    } catch (error) {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: `Erro no upload do arquivo: ${error.message}` });
        } else if (error.message && error.message.startsWith('Formato de arquivo não suportado')) {
             return res.status(400).json({ message: error.message });
        }
        console.error("Erro ao atualizar ocorrência:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar atualizar ocorrência.' });
    }
};

exports.deleteOccurrence = async (req, res) => {
    try {
        const db = await connectDB();
        const occurrencesCollection = db.collection(OCCURRENCES_COLLECTION);
        const occurrenceId = req.params.id;
        const userIdFromToken = req.user.id;

        if (!ObjectId.isValid(occurrenceId)) {
            return res.status(400).json({ message: 'ID da ocorrência inválido.' });
        }
        const OcurrenceObjectId = new ObjectId(occurrenceId);

        const ocorrenciaExistente = await occurrencesCollection.findOne({ _id: OcurrenceObjectId });

        if (!ocorrenciaExistente) {
            return res.status(404).json({ message: 'Ocorrência não encontrada.' });
        }

        if (ocorrenciaExistente.userId.toString() !== userIdFromToken) {
            return res.status(403).json({ message: 'Usuário não autorizado a excluir esta ocorrência.' });
        }

        if (ocorrenciaExistente.fotoUrl && ocorrenciaExistente.fotoUrl.startsWith('uploads/')) {
            const caminhoFoto = path.join(UPLOADS_DIR, path.basename(ocorrenciaExistente.fotoUrl));
            fs.unlink(caminhoFoto, (err) => {
                if (err) {
                    console.error("Erro ao deletar arquivo de imagem associado:", err);
                } else {
                    console.log("Arquivo de imagem associado deletado:", caminhoFoto);
                }
            });
        }

        const result = await occurrencesCollection.deleteOne({ _id: OcurrenceObjectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Ocorrência não encontrada para exclusão (conflito).' });
        }

        res.status(200).json({ message: 'Ocorrência excluída com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir ocorrência:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar excluir ocorrência.' });
    }
};