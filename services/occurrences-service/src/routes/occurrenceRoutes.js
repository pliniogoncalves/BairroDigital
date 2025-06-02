const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const occurrenceController = require('../controllers/occurrenceController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Formato de arquivo não suportado! Apenas JPEG, PNG ou GIF.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/', protect, upload.single('foto'), occurrenceController.createOccurrence);

router.get('/', occurrenceController.getAllOccurrences);

router.get('/my', protect, occurrenceController.getMyOccurrences);

router.get('/:id', occurrenceController.getOccurrenceById);

router.put('/:id', protect, upload.single('foto'), occurrenceController.updateOccurrence);

router.delete('/:id', protect, occurrenceController.deleteOccurrence);


module.exports = router;