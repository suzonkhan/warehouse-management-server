require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
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