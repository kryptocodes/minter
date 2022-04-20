const jwt = require('jsonwebtoken');

const AuthCheck = (req, res, next) => {
    const token = req.headers['x-api-key'];
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access denied. No token provided.'
        });
     
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.userID;
        next();
    } catch (err) {
        return res.status(500).json({
            status: 'error',
            message: 'Invalid token.'
        });
    }
}


module.exports = AuthCheck;