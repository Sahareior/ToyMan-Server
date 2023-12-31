const express = require('express')
require('dotenv').config();

const cors = require('cors')
const app = express()
const port = process.env.PORT|| 5000
app.use(cors())
app.use(express.json())

//  

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.j0rll9s.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();
    const productCollections = client.db('kidsShop').collection('trend_Products')
    const itemsCollections = client.db('kidsShop').collection('allItems')
    const reviewCollections = client.db('kidsShop').collection('reviews')
    // Send a ping to confirm a successful connection

    app.get('/products', async(req,res)=>{
        const cursor = productCollections.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.post('/items', async(req,res)=>{
        const data = req.body
        const result = await itemsCollections.insertOne(data)
        res.send(result)
    })
    app.get('/items/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await itemsCollections.findOne(query);
        res.send(result);
    })

    app.get('/items', async (req, res) => {
      let query = {};
    
      if (req.query && req.query.subcategory) {
        query = { subcategory: req.query.subcategory };
      } else if (req.query && req.query.toyName) {
        query = { toyName: req.query.toyName };
      } else if (req.query && req.query.email) {
        query = { email: req.query.email };
      }
    
      const sortOrder = req.query && req.query.sort === 'desc' ? -1 : 1;
      const cursor = itemsCollections.find(query).sort({ price: sortOrder });
      const result = await cursor.toArray();
      res.send(result);
    });
    
      
    app.put('/items/:id', async(req,res)=>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const options = {upsert:true}
        const updatedData = req.body;

        const data = {
            $set: {
              image: updatedData.image,
               name: updatedData.name,
               toyName: updatedData.toyName,
               email: updatedData.email,
               subcategory: updatedData.subcategory,
               price: updatedData.price,
               rating: updatedData.rating,
               availableQuantity: updatedData.availableQuantity,
               description: updatedData.description
            }
        }

        const result = await itemsCollections.updateOne(query, data, options);
        res.send(result);
    })
    app.delete('/items/:id', async(req,res)=>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const result = await itemsCollections.deleteOne(query)
        res.send(result)
    })
    app.post('/productsByIds', async(req, res) => {
      const ids = req.body;
      const objectIds = ids.map(id => new ObjectId(id));
      const query = { _id: { $in: objectIds } }
      
      const result = await itemsCollections.find(query).toArray();
      res.send(result);
    })
    // reviews..........
    app.post('/review', async(req,res)=>{
      const newReview = req.body
      const result = await reviewCollections.insertOne(newReview)
      res.send(result)
    })
    app.get('/review', async(req,res)=>{
      const cursor = reviewCollections.find()
      const result = await cursor.toArray()
      res.send(result)
    })
      
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send("hii")
})

app.listen(port,()=>{
    console.log(`this app running on ${port}`)
})