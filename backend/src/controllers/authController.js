const authService = require('../services/authService');
const { success } = require('../utils/response');

exports.login = async (req, res, next) => {
  try {
    success(res, await authService.login(req.body.email, req.body.password));
  } catch (err) { next(err); }
};

exports.me = (req, res) => {
  success(res, { admin: req.admin });
};
