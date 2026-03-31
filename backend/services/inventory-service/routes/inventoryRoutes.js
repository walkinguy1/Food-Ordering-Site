const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem, updateMenuItem } = require('../controllers/inventoryController');

router.route('/')
  .get(getMenuItems)
  .post(createMenuItem); // Should be protected for Vendors

router.route('/:id')
  .put(updateMenuItem); // Should be protected for Vendors

module.exports = router;
