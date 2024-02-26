const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    description: { type: String },
    weight: { type: Number, required: true },
    kind: { type: String, required: true },
});

module.exports = mongoose.model('Book', bookSchema);