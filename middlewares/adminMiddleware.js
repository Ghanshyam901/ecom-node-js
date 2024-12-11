
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin == true) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

export default checkAdmin