const setupJson = (app, express) => {
    app.use(express.json());
}
module.exports = {setupJson}