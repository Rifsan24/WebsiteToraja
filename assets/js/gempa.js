fetch('../data/gempa.json')
  .then(response => response.json())
  .then(data => {
    const gempaContainer = document.getElementById('infogempa');
    gempaContainer.innerHTML = `
      <h6 class="fw-bold mb-2">Info Gempa Terbaru</h6>
      <ul class="list-unstyled mb-0">
        <li><strong>Wilayah:</strong> ${data.wilayah}</li>
        <li><strong>Tanggal:</strong> ${data.tanggal} ${data.jam}</li>
        <li><strong>Magnitudo:</strong> ${data.magnitude}</li>
        <li><strong>Kedalaman:</strong> ${data.kedalaman}</li>
        <li><strong>Lokasi:</strong> ${data.lokasi}</li>
      </ul>
    `;
  })
  .catch(error => {
    document.getElementById('infogempa').textContent = 'Gagal memuat data gempa.';
    console.error(error);
  });
