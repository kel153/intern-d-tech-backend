module.exports = (user) => `token-${user?.id || 'guest'}`;
