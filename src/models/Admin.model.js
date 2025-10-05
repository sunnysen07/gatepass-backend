const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, 
    trim: true
  },
  email:{
    type:String,
    unique:true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "admin"
  }
}, { timestamps: true });

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;
