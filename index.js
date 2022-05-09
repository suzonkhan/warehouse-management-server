require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tl4lz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        await client.connect();
        const productCollection = client.db("warehouse").collection("products");

        app.post('/login', async(req, res) => {
            const user = req.body;
            console.log(user);
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({accessToken})
        })
        // Add product 
        app.post('/product', async(req, res)=>{ 
            const newProduct = req.body; 
            const result = await productCollection.insertOne(newProduct);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result); 
        })

        // View products 
        app.get('/products', async (req, res)=>{
            const query = { }; 
            const cursor = productCollection.find(query);
            const products =   await cursor.toArray();
            res.send(products);
        })

        // View products collection (My Products) 
        app.get('/product',verifyJWT, async (req, res)=>{ 
            const decodedEmail = req.decoded.email; 
            const email = req.query.email;  
            if (email === decodedEmail) {
                const query = {userEmail: email}; 
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
           
        })

        //Load Single Product
        app.get('/product/:id', async(req, res)=>{
            const id = req.params.id;
             const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        //Update Single Product
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
        //Delete Single Product
        app.delete('/product/:id', async (req, res)=>{
            const id = req.params.id; 
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
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