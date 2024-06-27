const { storage } = require("./cloudinary.js");
const Material = require('./models/material.js');
const express = require("express");
const multer = require('multer');
const methodOverride = require('method-override');
const { isValidObjectId } = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
 function createServer() {

const upload = multer({ storage })
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get all materials, without their image
 *     responses:
 *       200:
 *         description: If the Materials are fetched Successfully, it would return a 200.
 *       500:
 *         description: Server error
 */
app.get("/materials",async(req,res) => {
    try {
          const material = await Material.find().select('name technology colors pricePerGram applicationTypes');
          return res.status(200).json({msg:"Succesfully fetched  materials",material:material});
    }
     catch(e) {
   
             return res.status(500).json({msg:"Internal Server Error"});
    }


})



/**
 * @swagger
 * /material/{id}:
 *   get:
 *     summary: Get material according to material id. Example id = 6679a8135704705869cdda6c
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Material Id
 *     responses:
 *       '200':
 *         description: If the Material was fetched successfully, it returns a 200.
 *       '400':
 *         description: It returns 400 (Bad Request) if no id was provided.
 *       '404':
 *         description: 404 would be returned if the material with the given id was not found.
 *       '500':
 *         description: Server error.
 */

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

/**
 * @swagger
 * /material:
 *   post:
 *     summary: Post a new material
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *                 required: true  
 *               name:
 *                 type: string
 *                 description: Name of the material.
 *                 required: true  
 *               colors:
 *                 type: array
 *                 description: Colors available for the material.
 *                 items:
 *                   type: string
 *                 required: true  
 *               pricePerGram:
 *                 type: number
 *                 description: Price per gram for the material.
 *                 required: true  
 *               applicationTypes:
 *                 type: array
 *                 description: Application types for the material.
 *                 required: true  
 *                 items:
 *                   type: string
 *                 example: ["Mechanical Parts", "Prototyping"]
 *               technology:
 *                 type: string
 *                 description: Technology for the material.
 *                 required: true  
 *     responses:
 *       '201':
 *         description: If the material was added successfully, it would return a 201.
 *       '400':
 *         description: If any of the fields are missing, it would return 400.
*/

app.post("/material", upload.single('file'),async(req,res) => {
    try {
      
       const {name,technology,colors,pricePerGram,applicationTypes} = req.body;  
        if(!name||  !technology || !colors ||!pricePerGram || !req.file || !applicationTypes) {
           return res.status(400).json({msg:"All fields are mandatory"});
        }
        const material =  new Material({name,technology,pricePerGram,imageUrl:req.file.path});
        const colorsArray = colors.split(',');
        material.colors.push(...colorsArray);
        const applicationTypesArray = applicationTypes.split(',');
        material.applicationTypes.push(...applicationTypesArray);
        await material.save();
        return res.status(201).json({msg:"Succesfully Crested a new material",material});
    }catch(e) {
   
           return res.status(500).json({msg:"Internal server error"});
    }
     

})

/**
 * @swagger
 * /material/{id}:
 *   put:
 *     summary: Update material according to material id. Example id = 6679a8135704705869cdda6c
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Material Id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *                 required: true  
 *               name:
 *                 type: string
 *                 description: Name of the material.
 *                 required: true  
 *               colors:
 *                 type: array
 *                 description: Colors available for the material.
 *                 items:
 *                   type: string
 *                 required: true  
 *               pricePerGram:
 *                 type: number
 *                 description: Price per gram for the material.
 *                 required: true  
 *               applicationTypes:
 *                 type: array
 *                 description: Application types for the material.
 *                 required: true  
 *                 items:
 *                   type: string
 *                 example: ["Mechanical Parts", "Prototyping"]
 *               technology:
 *                 type: string
 *                 description: Technology for the material.
 *                 required: true  
 *                  
 *     responses:
 *       200:
 *         description: If the material was updated successfully, it would return a 200.
 *       400:
 *         description: It would return 400 (Bad Request) if no id was provided or empty strings "" was provided.
 *       404:
 *         description: 404 would be returned if the material with the given id was not found.
 *       500:
 *         description: Server error.
 */


app.put("/material/:id", upload.single('file'),async(req,res) => {
    try{
      const {id} = req.params;
      const { name, technology, colors, pricePerGram, applicationTypes, imageUrl } = req.body;
         if(!id) {
          return res.status(400).json({msg:"No id was provided to fetch the materail"});
         }
       
     const updateFields = {};
  if (name) updateFields.name = name;
  if (technology) updateFields.technology = technology;
  if (colors){ Array.isArray(colors)? updateFields.colors =colors : updateFields.colors =  colors.split(',') }
  if (pricePerGram) updateFields.pricePerGram = pricePerGram;
  if (applicationTypes) {Array.isArray(applicationTypes) ?  updateFields.applicationTypes = applicationTypes  :updateFields.applicationTypes = applicationTypes.split(',');}
  if (req.file) updateFields.imageUrl = req.file.path
       
      const newMaterial = await Material.findByIdAndUpdate(id,updateFields,{new:true});
       if(!newMaterial) {
           return res.status(404).json({msg:"material with the given id does not exist"});
         }
      res.status(200).json({msg:"Returned new material",newMaterial});
    }catch(e) {
       return res.status(500).json({msg:"Internal server error"});
    }
})


/**
 * @swagger
 * /material/{id}:
 *   delete:
 *     summary: Delete material according to material id. Example id = 6679a8135704705869cdda6c
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Material ID
 *     responses:
 *       '200':
 *         description: If the Material was deleted successfully, it returns a 200.
 *       '400':
 *         description: It returns 400 (Bad Request) if no id was provided.
 *       '404':
 *         description: 404 would be returned if the material with the given id was not found.
 *       '500':
 *         description: Server error.
 */

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