const supertest = require("supertest");
const createServer = require("../createServer.js");
const mongoose = require('mongoose');
const Material = require('../models/material.js');
const { ObjectId } = mongoose.Types;
const path = require('path');

const app = createServer()
jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload: jest.fn(() => ({ secure_url: 'https://mock.cloudinary.com/image.jpg' }))
        }
    }
}));
describe('material',() => {
    afterEach(() => {
        // Ensure mocks are reset after each test.
        jest.restoreAllMocks();
    });
    // for get By ID route
    describe('get material by id route',() => {
        
         describe('GET /materials/:id', () => {
        it('should return 404 if material does not exist', async () => {
            const id = new mongoose.Types.ObjectId().toString();
                const mockFindById = jest.spyOn(Material, 'findById').mockImplementation((id) => {
                    return Promise.resolve(null); 
                });
                await supertest(app).get(`/material/${id}`).expect(404);
                mockFindById.mockRestore(); 
            
        });

        it('should return 400 if no ID is provided', async () => {
            await supertest(app).get('/material/').expect(404);
        });

        it('should return 400 if ID format is invalid', async () => {
            await supertest(app).get('/material/invalid_id_format').expect(400);
        });

        it('should return 200 if material exists', async () => {
                const material = {
         
        "_id": "6679a721c927af4b58bd2af5",
        "name": "name",
        "technology": "AWS",
        "colors": [
            "[RED,BLUE]"
        ],
        "pricePerGram": 0.03,
        "applicationTypes": [],
        "__v": 0
    
                }
                const mockFindById = jest.spyOn(Material, 'findById').mockImplementation((id) => {
                    return id === id ? Promise.resolve(material) : Promise.resolve(null);
                });
                const response = await supertest(app).get('/material/6679a721c927af4b58bd2af5').expect(200);
               expect(response.body).toHaveProperty('material');
                expect(response.body.material).toEqual(material);
                


                mockFindById.mockRestore(); 
        });
    });


    })
})


// fot put by id route //
describe('PUT material/:id',() => {
    describe('update material by id route',() => {

            it("should return a 404", async() => {
             const id = new ObjectId().toString(); 
               await supertest(app).put(`/materials/${id}`).expect(404)
            })
      it('should update a resource successfully', async () => {
        const updateMaterial = { name: 'Updated Name',imageUrl:"https://res.cloudinary.com/dft1xk7ug/image/upload/v1719507547/node.js-assignment/roykkzwnjtw1krvaunmw.png", technology:"ADM",pricePerGram:0,applicationTypes:["AGA","HFF"],colors:["RED"]};

        const mockUpdateById = jest.spyOn(Material, 'findByIdAndUpdate').mockImplementation((id, updateData, options) => {
            return Promise.resolve(updateMaterial); 
        });

        const res = await supertest(app)
            .put('/material/6679a721c927af4b58bd2af5')
            .send(updateMaterial);

    
        expect(res.statusCode).toEqual(200);
        expect(res._body.newMaterial.name).toBe('Updated Name');

       
        mockUpdateById.mockRestore();
    });
    
    })
})

// For POST ALL materail routes

describe('POST material',() => {
  describe('add a new material',() => {
    

    it('should return 400 if required fields are missing', async () => {
        const response = await supertest(app)
            .post('/material')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('All fields are mandatory');
    });
    });
    
    })

    describe('DELETE /material/:id', () => {
    it('should delete a material and return 200', async () => {
      
        const id = '6679a721c927af4b58bd2af5';

    
        const mockDelete = jest.spyOn(Material, 'findByIdAndDelete').mockResolvedValue({
            _id: id,
          
        });

    
        const response = await supertest(app)
            .delete(`/material/${id}`)
            .expect(200); 


        expect(response.body).toHaveProperty('msg', 'Material with id 6679a721c927af4b58bd2af5 deleted successfully');


        expect(mockDelete).toHaveBeenCalledWith(id);


        mockDelete.mockRestore();
    });

    it('should return 404 if material not found', async () => {
          const id = new ObjectId().toString(); 

    
        const mockDelete = jest.spyOn(Material, 'findByIdAndDelete').mockResolvedValue(null);

     
        const response = await supertest(app)
            .delete(`/material/${id}`)
            .expect(404);

   
        expect(response.body).toHaveProperty('msg', 'Material with id not found');
        expect(mockDelete).toHaveBeenCalledWith(id);
        mockDelete.mockRestore();
    });

   
});
  describe('GET /materials', () => {
      beforeEach(() => {
        jest.clearAllMocks(); 
    });
    it('should return 200 and all materials', async () => {
        const mockMaterials = [
            { name: 'Material 1', technology: 'Tech 1', colors: ['Red'], applicationTypes: ['Type 1'], imageUrl: 'http://example.com/image1.png' },
            { name: 'Material 2', technology: 'Tech 2', colors: ['Blue'], applicationTypes: ['Type 2'], imageUrl: 'http://example.com/image2.png' }
        ];

       
          jest.spyOn(Material, 'find').mockReturnValue({
            select: jest.fn().mockResolvedValue(mockMaterials),
        });

      
        const response = await supertest(app)
            .get('/materials')
            .expect(200); // Expecting a 200 OK status

        // Check the response for the materials
        expect(response.body).toHaveProperty('material');
        expect(response.body.material).toHaveLength(mockMaterials.length);
        expect(response.body.material).toEqual(expect.arrayContaining(mockMaterials));
    });
  })