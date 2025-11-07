const addBtn = document.getElementById("addBtn");
const gallery = document.getElementById("gallery");

addBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const artist = document.getElementById("artist").value;
  const imageURL = document.getElementById("imageURL").value;
  const description = document.getElementById("description").value;

  const res = await fetch("http://localhost:5000/add-art", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, artist, imageURL, description }),
  });

  if (res.ok) {
    alert("Art added successfully!");
    loadArts();
  } else {
    alert("Error adding art.");
  }
});

async function loadArts() {
  const res = await fetch("http://localhost:5000/arts");
  const arts = await res.json();

  gallery.innerHTML = "";
  arts.forEach((art) => {
    const card = document.createElement("div");
    card.className = "art-card";
    card.innerHTML = `
      <img src="${art.imageURL}" alt="${art.title}">
      <h3>${art.title}</h3>
      <p><strong>${art.artist}</strong></p>
      <p>${art.description}</p>
      <div class="buttons">
        <button class="like-btn" onclick="likeArt('${art._id}')">❤️ ${art.likes} Likes</button>
        <button class="delete-btn" onclick="deleteArt('${art._id}')">🗑️ Delete</button>
      </div>
    `;
    gallery.appendChild(card);
  });
}

async function likeArt(id) {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("Login to like artworks!");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`http://localhost:5000/like/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Liked successfully!");
    loadArts();
  } else {
    alert(data.message || "Failed to like");
  }
}

async function deleteArt(id) {
  const res = await fetch(`http://localhost:5000/art/${id}`, { method: "DELETE" });
  if (res.ok) loadArts();
}

loadArts();
