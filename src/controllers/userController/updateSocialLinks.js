const express = require('express');
const router = express.Router();
const {authenticateToken} = require("../../utils/authenticateToken");
const connect = require("../dbSafe/db");
const isValidLink = require("../../utils/socialLinksValidation");

router.patch('/updateSocialLinks', authenticateToken, async (req, res) => {
    try {
        const db = await connect();
        const collection = db.collection('users');
        const userId = req.user._id; // Получаем ID из JWT
        const { activeIcon, inputValue } = req.body; // Получаем тип и новое значение поля из запроса
        const updateQuery = {};
        if (inputValue.trim() === '') {
            updateQuery.$unset = { [`profile.socialLinks.${activeIcon}`]: '' };
        } else {
            // Проверяем, является ли ссылка валидной для указанной социальной сети
            if (isValidLink(activeIcon, inputValue)) {
                updateQuery.$set = { [`profile.socialLinks.${activeIcon}`]: inputValue };
            } else {
                return res.status(400).json({ error: `Invalid ${activeIcon} link` });
            }
        }

        const result = await collection.updateOne(
            { _id: userId },
            updateQuery
        );
        const message = {};
        message[activeIcon] = inputValue.trim();
        if (result.modifiedCount > 0) {
            // Добавляем в ответ данные о типе и его значении
            res.json( message )
        } else {
            res.status(404).json({ error: `Failed to update ${activeIcon}` });
        }
    } catch (error) {
        console.error('Error updating social link', error);
        res.status(500).json({ error: 'Error updating social link' });
    }
});
module.exports = router;