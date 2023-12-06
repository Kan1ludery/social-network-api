const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");
const multer = require("multer");
const fs = require("fs"); // Подключите вашу базу данных

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname}`;
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });
router.post('/uploadImage', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            const db = await connect(); // Установка соединения с базой данных
            const usersCollection = db.collection('users');
            const userId = req.user._id;

            if (!userId) {
                return null;
            }

            const existingUser = await usersCollection.findOne({_id: userId});

            if (existingUser.profile.profileImage?.trim()) {
                const oldImageFileName = existingUser.profile.profileImage;
                // Полный путь к старой картинке
                const oldImagePath = `uploads/${oldImageFileName}`;
                // Асинхронное удаление файла
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении старой картинки:', err);
                    }
                });
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
