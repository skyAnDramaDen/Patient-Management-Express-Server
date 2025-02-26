const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');  


router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'Access granted to protected route!',
    user: req.user,
  });
});

module.exports = router;
