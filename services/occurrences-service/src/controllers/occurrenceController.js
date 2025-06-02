const connectDB = require('../config/db');
const { ObjectId, GridFSBucket } = require('mongodb');
const multer = require('multer');

const OCCURRENCES_COLLECTION = 'occurrences';

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
        let fotoFileId = null;

        if (req.file) {
            const bucket = new GridFSBucket(db, {
                bucketName: 'occurrence_photos'
            });

            const readablePhotoStream = require('stream').Readable.from(req.file.buffer);
            
            const uploadStream = bucket.openUploadStream(req.file.originalname, {
                contentType: req.file.mimetype
            });

            await new Promise((resolve, reject) => {
                readablePhotoStream.pipe(uploadStream)
                    .on('error', (error) => {
                        console.error("Erro ao fazer upload para GridFS:", error);
                        reject(new Error('Falha ao salvar a imagem.'));
                    })
                    .on('finish', () => {
                        fotoFileId = uploadStream.id;
                        resolve();
                    });
            });
        }

        const novaOcorrencia = {
            userId: new ObjectId(userId),
            userName, userEmail, titulo, tipo, descricao, cep, rua, bairro, cidade, estado,
            referencia: referencia || '',
            fotoFileId: fotoFileId,
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
        } else if (error.message === 'Falha ao salvar a imagem.') {
             return res.status(500).json({ message: error.message });
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
        const occurrenceObjectId = new ObjectId(occurrenceId);

        const ocorrenciaExistente = await occurrencesCollection.findOne({ _id: occurrenceObjectId });

        if (!ocorrenciaExistente) {
            return res.status(404).json({ message: 'Ocorrência não encontrada.' });
        }

        if (ocorrenciaExistente.userId.toString() !== userIdFromToken) {
            return res.status(403).json({ message: 'Usuário não autorizado a editar esta ocorrência.' });
        }

        const camposParaAtualizar = {};
        const { titulo, tipo, descricao, status, cep, rua, bairro, cidade, estado, referencia } = req.body;

        if (titulo !== undefined) camposParaAtualizar.titulo = titulo;
        if (tipo !== undefined) camposParaAtualizar.tipo = tipo;
        if (descricao !== undefined) camposParaAtualizar.descricao = descricao;
        if (status !== undefined) camposParaAtualizar.status = status;
        if (cep !== undefined) camposParaAtualizar.cep = cep;
        if (rua !== undefined) camposParaAtualizar.rua = rua;
        if (bairro !== undefined) camposParaAtualizar.bairro = bairro;
        if (cidade !== undefined) camposParaAtualizar.cidade = cidade;
        if (estado !== undefined) camposParaAtualizar.estado = estado;
        if (referencia !== undefined) camposParaAtualizar.referencia = referencia;

        let novoFotoFileId = ocorrenciaExistente.fotoFileId;

        if (req.file) {
            const bucket = new GridFSBucket(db, { bucketName: 'occurrence_photos' });

            if (ocorrenciaExistente.fotoFileId) {
                try {
                    await bucket.delete(new ObjectId(ocorrenciaExistente.fotoFileId));
                    console.log(`Foto antiga ${ocorrenciaExistente.fotoFileId} deletada do GridFS.`);
                } catch (gridfsError) {
                    console.error(`Erro ao deletar foto antiga ${ocorrenciaExistente.fotoFileId} do GridFS:`, gridfsError);
                }
            }

            const readablePhotoStream = require('stream').Readable.from(req.file.buffer);
            const uploadStream = bucket.openUploadStream(req.file.originalname, {
                contentType: req.file.mimetype
            });

            await new Promise((resolve, reject) => {
                readablePhotoStream.pipe(uploadStream)
                    .on('error', (error) => reject(new Error('Falha ao salvar a nova imagem no GridFS.')))
                    .on('finish', () => {
                        novoFotoFileId = uploadStream.id;
                        resolve();
                    });
            });
            camposParaAtualizar.fotoFileId = novoFotoFileId;
        }
        if (Object.keys(camposParaAtualizar).length === 0 && novoFotoFileId === ocorrenciaExistente.fotoFileId) {
            if (Object.keys(camposParaAtualizar).length === 1 && camposParaAtualizar.fotoFileId === ocorrenciaExistente.fotoFileId && !req.file){
                 return res.status(200).json({ message: 'Nenhuma alteração detectada.', ocorrencia: ocorrenciaExistente });
            }
        }


        camposParaAtualizar.updatedAt = new Date();

        const result = await occurrencesCollection.updateOne(
            { _id: occurrenceObjectId },
            { $set: camposParaAtualizar }
        );
        
        if (result.modifiedCount === 0 && (!req.file || novoFotoFileId?.toString() === ocorrenciaExistente.fotoFileId?.toString())) {
            const ocorrenciaSemModificacaoTextual = await occurrencesCollection.findOne({ _id: occurrenceObjectId });
            return res.status(200).json({ message: 'Nenhuma alteração textual nos dados da ocorrência.', ocorrencia: ocorrenciaSemModificacaoTextual });
        }

        const ocorrenciaAtualizada = await occurrencesCollection.findOne({ _id: occurrenceObjectId });
        res.status(200).json({
            message: 'Ocorrência atualizada com sucesso!',
            ocorrencia: ocorrenciaAtualizada
        });

    } catch (error) {
        if (error instanceof multer.MulterError || (error.message && error.message.startsWith('Formato de arquivo não suportado'))) {
            return res.status(400).json({ message: `Erro no upload do arquivo: ${error.message}` });
        } else if (error.message === 'Falha ao salvar a nova imagem no GridFS.') {
            return res.status(500).json({ message: error.message });
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
        const occurrenceObjectId = new ObjectId(occurrenceId);

        const ocorrenciaExistente = await occurrencesCollection.findOne({ _id: occurrenceObjectId });

        if (!ocorrenciaExistente) {
            return res.status(404).json({ message: 'Ocorrência não encontrada.' });
        }

        if (ocorrenciaExistente.userId.toString() !== userIdFromToken) {
            return res.status(403).json({ message: 'Usuário não autorizado a excluir esta ocorrência.' });
        }

        if (ocorrenciaExistente.fotoFileId) {
            try {
                const bucket = new GridFSBucket(db, { bucketName: 'occurrence_photos' });
                await bucket.delete(new ObjectId(ocorrenciaExistente.fotoFileId));
                console.log(`Foto ${ocorrenciaExistente.fotoFileId} deletada do GridFS.`);
            } catch (gridfsError) {
                console.error(`Erro ao deletar foto ${ocorrenciaExistente.fotoFileId} do GridFS:`, gridfsError);
            }
        }

        const result = await occurrencesCollection.deleteOne({ _id: occurrenceObjectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Ocorrência não encontrada para exclusão (conflito).' });
        }

        res.status(200).json({ message: 'Ocorrência excluída com sucesso!' });

    } catch (error) {
        console.error("Erro ao excluir ocorrência:", error);
        res.status(500).json({ message: 'Erro no servidor ao tentar excluir ocorrência.' });
    }
};

exports.getOccurrenceImage = async (req, res) => {
    try {
        const db = await connectDB();
        const fileIdString = req.params.fileId;

        if (!ObjectId.isValid(fileIdString)) {
            return res.status(400).json({ message: 'ID de arquivo inválido.' });
        }
        const fileId = new ObjectId(fileIdString);

        const bucket = new GridFSBucket(db, {
            bucketName: 'occurrence_photos'
        });

        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'Imagem não encontrada.' });
        }
        const fileInfo = files[0];

        res.set('Content-Type', fileInfo.contentType || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${fileInfo.filename}"`);

        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', (error) => {
            console.error("Erro ao fazer stream da imagem do GridFS:", error);
            res.status(500).json({ message: 'Erro ao carregar a imagem.' });
        });

        downloadStream.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error("Erro geral ao servir imagem do GridFS:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao tentar servir a imagem.' });
    }
};