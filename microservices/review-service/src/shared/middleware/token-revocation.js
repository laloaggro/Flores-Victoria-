// Token revocation middleware stub
let redisClient = null;
const initRedisClient = (client) => { redisClient = client; };
const revokeToken = async () => true;
const isTokenRevoked = async (req, res, next) => next();
const isTokenRevokedMiddleware = () => (req, res, next) => next();
module.exports = { initRedisClient, revokeToken, isTokenRevoked, isTokenRevokedMiddleware };
