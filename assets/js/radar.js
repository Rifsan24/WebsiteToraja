document.addEventListener("DOMContentLoaded", function () {
  fetch("data/radar.json")
    .then((response) => response.json())
    .then((data) => {
      const radarDiv = document.getElementById("radarmap");
      if (!radarDiv) return;

      // Tambah gambar radar
      const img = document.createElement("img");
      img.src = data.image;
      img.alt = "Radar Cuaca";
      img.style.width = "100%";
      img.classList.add("img-fluid", "rounded");

      // Tambah update time
      const updateText = document.createElement("small");
      const time = new Date(data.updated);
      const formattedTime = time.toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      });
      updateText.textContent = `Diperbarui: ${formattedTime}`;
      updateText.classList.add("d-block", "mt-2", "text-muted");

      radarDiv.appendChild(img);
      radarDiv.appendChild(updateText);
    })
    .catch((error) => {
      console.error("Gagal muat radar:", error);
    });
});
