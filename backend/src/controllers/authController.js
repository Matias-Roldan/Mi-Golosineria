const authService = require('../services/authService');

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => {
  res.json({ admin: req.admin });
};
