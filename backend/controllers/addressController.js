const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(addresses);
});

// @desc    Create a new address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  const { name, streetAddress, city, state, zipCode, country, phone, isDefault } = req.body;

  if (!name || !streetAddress || !city || !state || !zipCode || !country || !phone) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  // Check if this is the first address (make it default by default)
  const addressCount = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = addressCount === 0 ? true : isDefault;

  // If this address is set as default, update all other addresses to not be default
  if (shouldBeDefault) {
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.create({
    user: req.user._id,
    name,
    streetAddress,
    city,
    state,
    zipCode,
    country,
    phone,
    isDefault: shouldBeDefault,
  });

  if (address) {
    res.status(201).json(address);
  } else {
    res.status(400);
    throw new Error("Invalid address data");
  }
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if the address belongs to the logged in user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this address");
  }

  const { isDefault } = req.body;

  // If setting as default, update all other addresses
  if (isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: req.params.id } },
      { $set: { isDefault: false } }
    );
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedAddress);
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if the address belongs to the logged in user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this address");
  }

  const wasDefault = address.isDefault;
  
  await Address.findByIdAndDelete(req.params.id);

  // If the deleted address was the default, set another address as default if any exist
  if (wasDefault) {
    const anotherAddress = await Address.findOne({ user: req.user._id });
    if (anotherAddress) {
      anotherAddress.isDefault = true;
      await anotherAddress.save();
    }
  }

  res.json({ message: "Address removed" });
});

// @desc    Set an address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Check if the address belongs to the logged in user
  if (address.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this address");
  }

  // Update all user addresses to not be default
  await Address.updateMany(
    { user: req.user._id },
    { $set: { isDefault: false } }
  );

  // Set this address as default
  address.isDefault = true;
  await address.save();

  res.json({ message: "Address set as default", address });
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
}; 