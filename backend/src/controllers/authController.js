const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const refresh = (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = authService.refresh(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

const logout = (req, res) => {
  try {
    const { refreshToken } = req.body;
    authService.logout(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { register, login, refresh, logout };
