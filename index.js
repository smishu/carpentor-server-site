const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
var jwt = require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.etdwp.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    // console.log('JWT token');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: 'Unthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ massage: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });

}

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('carpenter').collection('products');
        const bookingCollection = client.db('carpenter').collection('pacelBooks');
        const userCollection = client.db('carpenter').collection('users');

        app.get('/product', async (req, res) => {

            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            // console.log('products');
            res.send(products);
        });

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const option = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, option);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
            res.send({ result, token });


        })


        app.get('/available', async (req, res) => {
            const pacel = req.query.pacel || "CRAFTSMAN  Fiberglass";
            const prooducts = await productCollection.find().toArray();
            res.send(prooducts);
        });

        app.get('/pacelBook', verifyJWT, async (req, res) => {
            const buyer = req.query.buyer;
            const decodedEmail = req.decoded.email;
            if (buyer === decodedEmail) {
                const query = { buyer: buyer };
                const pacelBooks = await bookingCollection.find(query).toArray();
                return res.send(pacelBooks);
            }
            else {
                return res.status(403).send({ massage: 'Forbidden access' });
            }

        });


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