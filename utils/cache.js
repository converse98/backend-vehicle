const { getCache, setCache } = require('../config/redis');

module.exports = function (ttl = 300) {
  return async (req, res, next) => {
    const key = req.originalUrl;

    try {
      const cached = await getCache(key);
      if (cached) {
        return res.status(200).json(cached);
      }

      // Interceptar res.json para cachear respuesta
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await setCache(key, data, ttl);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // continuar incluso si falla el cache
    }
  };
};
