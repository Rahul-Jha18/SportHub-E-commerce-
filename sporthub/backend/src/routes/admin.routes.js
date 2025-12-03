const express = require('express');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', auth, isAdmin, async (req, res) => {
  // later you can add dashboard stats here
  res.json({ message: 'Admin stats placeholder for SportHub' });
});

module.exports = router;
