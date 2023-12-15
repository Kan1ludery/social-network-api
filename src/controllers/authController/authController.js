// authRoutes.js
const registration = require('./registration')
const loginController = require('./login')
const logoutController = require('./logout')
const setupEmailVerification = require('./emailVerify')
const resendVerificationEmail = require('./resendVerificationEmail')
const setupAuthRoutes = (app) => {
    app.use('/api', registration)  // /api/register (регистрация в системе
    app.use('/api', loginController);        // /api/login (вход в систему)
    app.use('/api', logoutController);       // /api/logout (выход из системы)
    app.use('/api', setupEmailVerification(app))   // /api/confirm (подтверждение почты)
    app.use('/api', resendVerificationEmail)   // /api/resendVerificationEmail (Повторная отправка подтверждения почты)
};

module.exports = {setupAuthRoutes};
