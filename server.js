const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static folders
app.use(express.static("public"));
app.use(express.static("frontend"));

// Auth routes
app.use("/auth", authRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/artswap", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Art Schema
const ArtSchema = new mongoose.Schema({
  title: String,
  artist: String,
  description: String,
  imageURL: String,
  likes: { type: Number, default: 0 },
  likedBy: [String],
});

const Art = mongoose.model("Art", ArtSchema);

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add Art
app.post("/add-art", async (req, res) => {
  try {
    const art = new Art(req.body);
    await art.save();
    res.send("Art added successfully!");
  } catch (error) {
    console.error("Error adding art:", error);
    res.status(500).send("Failed to add art");
  }
});

// Get All Arts
app.get("/arts", async (req, res) => {
  try {
    const arts = await Art.find();
    res.json(arts);
  } catch (error) {
    console.error("Error fetching arts:", error);
    res.status(500).send("Failed to fetch arts");
  }
});

// Like Art (only once per user)
app.post("/like/:id", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const art = await Art.findById(req.params.id);
    if (!art) return res.status(404).json({ message: "Art not found" });

    if (art.likedBy.includes(username)) {
      return res.status(400).json({ message: "You already liked this art!" });
    }

    art.likes += 1;
    art.likedBy.push(username);
    await art.save();

    res.json({ message: "Liked successfully!", likes: art.likes });
  } catch (err) {
    console.error("Error liking art:", err);
    res.status(500).send("Failed to like");
  }
});

// Delete Art
app.delete("/art/:id", async (req, res) => {
  try {
    await Art.findByIdAndDelete(req.params.id);
    res.send("Deleted successfully!");
  } catch (err) {
    console.error("Error deleting art:", err);
    res.status(500).send("Failed to delete");
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
