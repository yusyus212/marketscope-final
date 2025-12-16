const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
   symbol: String,
   companyName: String,
   price: Number,
   addedAt: { type: Date, default: Date.now }
});


const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;