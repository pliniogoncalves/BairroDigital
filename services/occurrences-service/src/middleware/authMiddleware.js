const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                name: decoded.name
            };

            next();
        } catch (error) {
            console.error('Erro na autenticação do token:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token inválido.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado.' });
            }
            return res.status(401).json({ message: 'Não autorizado, falha no token.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};

module.exports = { protect };