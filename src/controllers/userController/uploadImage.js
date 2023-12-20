const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");
const multer = require("multer");
const fs = require("fs");
const {getImageFolderPath} = require("./getImageFolderPath");
const path = require("path");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Максимальный размер файла в байтах (5MB)

const imageFolderPath = getImageFolderPath()
const storage = multer.diskStorage({
    destination: imageFolderPath,
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname}`;
        cb(null, filename);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Принимаем только изображения
    } else {
        cb(new Error('Файл должен быть изображением'));
    }
};

const fsPromises = fs.promises;
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
});
router.post('/uploadImage', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            const db = await connect();
            const usersCollection = db.collection('users');
            const userId = req.user._id;

            if (!userId) {
                return null;
            }

            const existingUser = await usersCollection.findOne({_id: userId});

            if (existingUser.profile.profileImage?.trim()) {
                const oldImageFileName = existingUser.profile.profileImage;
                // Полный путь к старой картинке
                const oldImagePath = `uploads/${oldImageFileName}`
                // Асинхронное удаление файла
                try {
                    await fsPromises.unlink(oldImagePath);
                } catch (err) {
                    console.error('Ошибка при удалении старого изображения:', err);
                }
            }

            const fileName = req.file.filename;
            // Обновляем информацию о файле в базе данных
            await usersCollection.updateOne({_id: userId}, {$set: {'profile.profileImage': fileName}});
            return res.status(200).json({message: 'Файл успешно загружен', fileName});
        }
        return res.status(400).json({error: 'Нет загруженного файла'});
    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        res.status(500).json({error: 'Ошибка при загрузке файла'});
    }
});

module.exports = router;
