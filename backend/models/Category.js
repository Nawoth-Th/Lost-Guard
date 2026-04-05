const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String }, // Icon name for lucide-react-native
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
