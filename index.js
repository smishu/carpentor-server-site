const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.etdwp.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productCollection = client.db('carpenter').collection('products');
        const bookingCollection = client.db('carpenter').collection('pacelBooks');

        app.get('/product', async (req, res) => {

            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            // console.log('products');
            res.send(products);
        })
        app.post('/pacelBook', async (req, res) => {
            const pacelBook = req.body;
            const result = await bookingCollection.insertOne(pacelBook);

            res.send(result);
        })


    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Ronick sarker')
})
app.listen(port, () => {
    console.log(`listenig on port ${port}`)
})