const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MongoDB URI
const MONGO_URI = "mongodb+srv://menu:catlog@menu.ypplluk.mongodb.net/Menu";

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Define user schema with type field
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

// Function to add user
async function addUser(username, password, name, email) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      email
    });
    await newUser.save();
    console.log("User added successfully:", username);
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

// Call the function with user details
addUser("admin", "admin@123", "Keshav", "keshav@example.com")
  .then(() => mongoose.disconnect())
  .catch(err => console.error(err));
