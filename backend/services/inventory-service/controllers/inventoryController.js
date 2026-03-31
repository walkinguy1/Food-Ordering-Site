const MenuItem = require('../models/MenuItem');

// @desc    Fetch all menu items (with filtering)
// @route   GET /api/v1/inventory
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { vendorId, category, cuisine } = req.query;
    let query = {};
    if (vendorId) query.vendorId = vendorId;
    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;

    const items = await MenuItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create new menu item
// @route   POST /api/v1/inventory
// @access  Private/Vendor
const createMenuItem = async (req, res) => {
  try {
    // Expecting user ID from auth middleware (to be implemented via gateway)
    // For now we assume vendorId is passed in body
    const { vendorId, name, description, price, category, cuisine, options } = req.body;
    
    if (!vendorId) return res.status(400).json({message: "vendorId required"});

    const item = new MenuItem({
      vendorId, name, description, price, category, cuisine, options
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update menu item (toggle availability, etc)
// @route   PUT /api/v1/inventory/:id
// @access  Private/Vendor
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (item) {
      item.name = req.body.name || item.name;
      item.price = req.body.price || item.price;
      item.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : item.isAvailable;
      
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem
};
