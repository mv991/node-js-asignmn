const { storage } = require("./cloudinary.js");
const Material = require('./models/material.js');
const express = require("express");
const multer = require('multer');
const methodOverride = require('method-override');
const { isValidObjectId } = require('mongoose');

 function createServer() {

const upload = multer({ storage })
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());


app.get("/materials",async(req,res) => {
    try {
          const material = await Material.find().select('name technology colors pricePerGram');
          return res.status(200).json({msg:"Succesfully fetched  materials",material:material});
    }
     catch(e) {
   
             return res.status(500).json({msg:"Internal Server Error"});
    }


})
app.get("/material/:id",async(req,res) => {
    try{
         const {id} = req.params;
    
         if(!id) {
          return res.status(400).json({msg:"No id was provided to fetch the materail"});
         }
           if (!isValidObjectId(id)) {
            return res.status(400).json({ msg: "Invalid ID format" });
        }
         const material =  await Material.findById(id);
   
         if(!material) {
           return res.status(404).json({msg:"material with the given id does not exist"});
         }
         else {
              return res.status(200).json({msg: `Material with id ${id} fetched successfully` ,material:material})
         }
         
      
    }catch(e) {
           return res.status(500).json({msg:"Internal server error"});
    }
})
app.post("/material", upload.single('file'),async(req,res) => {
    try {
       const {name,technology,colors,pricePerGram} = req.body;
       console.log("RANAA")
        if(!name|| !technology || !colors ||!pricePerGram || !req.file) {
           return res.status(400).json({msg:"All fields are mandatory"});
        }
        const material =  new Material({name,technology,colors,pricePerGram,imageUrl:req.file.path});
             console.log("RANAA")
        await material.save();
        return res.status(201).json({msg:"Succesfully Crested a new material"});
    }catch(e) {
      console.log(e)
           return res.status(500).json({msg:"Internal server error"});
    }
     

})
app.put("/material/:id", upload.single('image'),async(req,res) => {
    try{
      const {id} = req.params;
         if(!id) {
          return res.status(400).json({msg:"No id was provided to fetch the materail"});
         }
      const newMaterial = await Material.findByIdAndUpdate(id,req.body,{new:true});
       if(!newMaterial) {
           return res.status(404).json({msg:"material with the given id does not exist"});
         }
      res.status(200).json({msg:"Returned new material",newMaterial});
    }catch(e) {
   
       return res.status(500).json({msg:"Internal server error"});
    }
})
app.delete("/material/:id", async(req,res) => {
  try{
         const {id} = req.params;
         if(!id) {
          return res.status(400).json({msg:"No id was provided to delete the matarial"});
         }
         const material =  await Material.findByIdAndDelete(id);
        
         if(!material) {
            return res.status(404).json({msg: `Material with id not found`})
         }
         return res.status(200).json({msg: `Material with id ${id} deleted successfully` ,material:material})
      
    }catch(e) {
           return res.status(500).json({msg:"Internal server error"});
    }
})

return app;
}

module.exports = createServer;