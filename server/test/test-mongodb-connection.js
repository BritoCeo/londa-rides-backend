const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = "mongodb+srv://LondaRides:LondaRides344$@cluster0.oxeu63b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log('📍 Cluster: londacluster.wuu7n2k.mongodb.net');
    
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // List databases
    const adminDb = client.db("admin");
    const result = await adminDb.listDatabases();
    console.log("📊 Available databases:", result.databases.map(db => db.name));
    
    // Test creating a collection in the londa_rides database
    const londaDb = client.db("londa_rides");
    const collections = await londaDb.listCollections().toArray();
    console.log("📁 Collections in londa_rides:", collections.map(col => col.name));
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Troubleshooting tips:");
    console.log("1. Check if your IP address is whitelisted in MongoDB Atlas");
    console.log("2. Verify the connection string and credentials");
    console.log("3. Check your network connection");
    console.log("4. Ensure MongoDB Atlas cluster is running");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("🔌 Connection closed");
  }
}

run().catch(console.dir);
