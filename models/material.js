const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
 [{
     name:String,
     technology:String,
     colors:Array,
     pricePerGram:Number,
     applicationTypes:Array,
     imageUrl:String

  }])
const Material = mongoose.model("Material", MaterialSchema);
module.exports =  Material;