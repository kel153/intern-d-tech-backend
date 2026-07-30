exports.hashPassword = async (password) => password;
exports.comparePassword = async (password, hash) => password === hash;
