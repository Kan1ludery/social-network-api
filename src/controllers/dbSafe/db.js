const {MongoClient} = require('mongodb');
const {loadEnv} = require("../../utils/loadEnv");
loadEnv()
const uri = process.env.DATABASE_URI;
const dbName = process.env.DB_NAME;

let db = null; // Инициализируем переменную для хранения экземпляра базы данных

// Здесь мы объявляем асинхронную функцию connect(), которая будет использоваться для подключения к базе данных MongoDB.

async function connect() {
    // Внутри функции мы создаем новый экземпляр MongoClient, передавая ему URI подключения и опции { useUnifiedTopology: true }.
    if (!db) {
        try {
            // Опция useUnifiedTopology: true гарантирует использование нового механизма обмена сообщениями в MongoDB.
            const client = new MongoClient(uri, {useUnifiedTopology: true});
            // Затем мы вызываем await client.connect(), чтобы установить соединение с MongoDB с помощью созданного клиента.
            await client.connect();
            // Если подключение успешно установлено, мы получаем доступ к базе данных с именем API, используя client.db(dbName).
            db = client.db(dbName); // Сохраняем только один экземпляр базы данных, если он уже создан
            // Затем мы выводим сообщение в консоль, подтверждающее успешное подключение, и возвращаем объект базы данных db.
            console.log('Connected to MongoDB');

        }
            // Если возникает ошибка при подключении, мы выводим сообщение об ошибке в консоль и выходим из процесса, используя process.exit(1).
        catch (error) {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        }
    }
    return db;
}

// Наконец, мы экспортируем функцию connect для использования в других модулях.
module.exports = connect;
