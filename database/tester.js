
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const username = "aliang26";
const password = "2Jbs5wBl9kvZ83GT";
let database;
let collectionUsers;
let collectionReceipts;


const uri = `mongodb+srv://${username}:${password}@centsible.y4wsdci.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    // try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        database = client.db("Centsible");
        collectionUsers = database.collection("Users");
        collectionReceipts = database.collection("Receipts");

    // await insertUser(collectionUsers, "Ali", "Li", "stupid@gmail.com", []);
    // await insertUser(collectionUsers, "Alice", "Jones", "tester123456@yahoo.com", []);
    await addFriends(collectionUsers, '65504cb6e6ad05e0b55c01de', '655059941ac2a01a03ce9d70');
    // await insertReceipt(collectionReceipts, "Walmart", "2021-03-01", 100, ["apple", "banana", "orange"], ["65504cb6e6ad05e0b55c01de"], [1.0]);
    // await addReceiptToUser(collectionUsers, ['65504cb6e6ad05e0b55c01de'], '655051b3c2ca86f5b732c0f2');  
    // await removeReceiptFromUser(collectionUsers, '65504cb6e6ad05e0b55c01de', '655051b3c2ca86f5b732c0f2');
    // await getAllUsers(collectionUsers);
        // await insertUser(collection);
        // await updateDocuments(collection);
        
    // } finally {
        // Ensures that the client will close when you finish/error
        // console.log("Closed connection to server!");
        // await client.close();
    // }
    await client.close();
    console.log("done");
}

// Methods to add/update users

async function getAllUsers(collection) {
    // Get all documents
    const result = await collection.find({}).toArray();
    console.log('Found documents:', result);
}
async function insertUser(collection, firstName, lastName, email) {
    // Insert documents
    const temp = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        friends: [],
        receipts: []
    }
    const result = await collection.insertOne(temp);
    console.log('Success! New user', temp.firstName, "was added to the system. \n");
}


async function addFriends(collection, userId, newFriendId) {
    // Update documents
    const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { friends: new ObjectId(newFriendId)} }
    );
    await collection.updateOne(
        { _id: new ObjectId(newFriendId) },
        { $push: { friends: new ObjectId(userId)} }
    );
    console.log('Updated documents:', result.modifiedCount);
}

async function addReceiptToUser(collection, userList, receiptId) {
    // Update documents
    userList = userList.map(user => new ObjectId(user));
    // console.log(userList);
    for (let i = 0; i < userList.length; i++) {
        const result = await collection.updateOne(
            { _id: userList[i] },
            { $push: { receipts: new ObjectId(receiptId) } }
        );
    }
    // console.log('Updated documents:', result.modifiedCount);
}

async function removeReceiptFromUser(collection, userId, receiptId) {
    // Update documents
    const result = await collection.updateMany(
        { _id: new ObjectId(userId) },
        { $pull: { receipts: new ObjectId(receiptId) } }
    );
    console.log('Updated documents:', result.modifiedCount);
}

// find a user based on their email
async function findUser(collection, email) {
    // find userId based off of their email
    return await collection.findOne({ email: email });
}


// method to add/update receipts

async function insertReceipt(collection, store, date, total, items, users, percents) {
    // Insert documents
    const temp = {
        store: store,
        date: date,
        total: total,
        items: items,
        users: users.map(user => new ObjectId(user)),
        percents: percents,
        paid: [true, ...new Array(users.length - 1).fill(false)],
        owner: new ObjectId(users[0])
    }
    const result = await collection.insertOne(temp);
    console.log('Success! New receipt', temp.store, "was added to the system. \n", result.insertedCount);
}

async function updateReceiptPercent(collection, receiptId, usersId, percents) {
    // Update documents
    const result = await collection.updateOne(
        { _id: new ObjectId(receiptId) },
        { $set: { users: usersId.map(user => new ObjectId(user)), percents: percents } }
    );
}

async function deleteReceipt(collection, receiptId) {
    const users = await collection.findOne({ _id: new ObjectId(receiptId) }).users;
    const temp = await collection.deleteOne({ _id: new ObjectId(receiptId) });
    console.log('Deleted documents:', temp.deletedCount);
    users.forEach(user => {
        removeReceiptFromUser(collectionUsers, user, receiptId);
    });

}

run().catch(console.dir);

