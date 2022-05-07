require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tl4lz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        await client.connect();
        const productCollection = client.db("warehouse").collection("products");

        app.get('/products', async (req, res)=>{
            const query = { }; 
            const cursor = productCollection.find(query);
            const products =   await cursor.toArray();
            res.send(products);
        })

        app.get('/product/:id', async(req, res)=>{
            const id = req.params.id;
             const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.put('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const udpatedProduct = req.body;
          
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            
            const updateDoc = {
              $set: {
                 stock: udpatedProduct.stock,
              },
            };
            console.log(updateDoc);
            const result = await productCollection.updateOne(filter, updateDoc, options );
            res.send(result);

        })


    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send("Warehouse Server Runnig!!")
})
app.listen(port, ()=>{
    console.log(` Server is running is at port - ${port}`)
})

// warehouseUser
// KTSxYds9KkECNvoT