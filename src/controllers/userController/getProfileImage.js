const express = require("express");
const router = express.Router();
const path = require('path')

// Указываем абсолютный путь к папке с изображениями
// const imageFolderPath = path.join(__dirname, '../../uploads'); // Это предполагает, что папка 'uploads' находится в директории роутера
const imageFolderPath = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../../uploads');
console.log(imageFolderPath)
router.get('/uploads/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const imagePath = path.join(imageFolderPath, fileName); // Путь к изображению
    res.sendFile(imagePath);
});

module.exports = router