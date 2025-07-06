// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('.filters button');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA APOD API key and endpoint
const API_KEY = 'SeO1vWc03dUN6kQxTq6ZRmQhrjxKJaio4HLLf5hx';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Listen for button click to fetch images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show a loading message
  gallery.innerHTML = `<div class="placeholder" style="background: transparent;">
    <p>Loading Images...</p>
  </div>`;

  // Build the API URL with parameters
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // If only one image is returned, put it in an array
      const images = Array.isArray(data) ? data : [data];
      // Show the images in the gallery
      showImages(images);
    })
    .catch(error => {
      gallery.innerHTML = `<p>Sorry, something went wrong. Please try again later.</p>`;
      console.error('Error fetching data:', error);
    });
});

// Function to create and show a modal with image details
function showModal(image) {
  // Create modal HTML
  const modalHtml = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-content">
        <button class="modal-close" id="modalClose">&times;</button>
        <img src="${image.hdurl || image.url}" alt="${image.title}" class="modal-img" />
        <h2 class="modal-title">${image.title}</h2>
        <p class="modal-date">${image.date}</p>
        <p class="modal-explanation">${image.explanation}</p>
      </div>
    </div>
  `;
  // Add modal to the body
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Close modal on button click or overlay click
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  closeBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  // Close modal on Escape key
  document.addEventListener('keydown', function escListener(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escListener);
    }
  });
}

// Function to display images in the gallery
function showImages(images) {
  // If no images, show a message
  if (!images.length) {
    gallery.innerHTML = `<p>No images found for this date range.</p>`;
    return;
  }

  // Create HTML for each image
  const html = images.map((image, idx) => {
    // Only show images (not videos)
    if (image.media_type !== 'image') return '';
    return `
      <div class="apod-card" data-idx="${idx}">
        <img src="${image.url}" alt="${image.title}" class="apod-img" />
        <div class="apod-hover">
          <h2>${image.title}</h2>
          <p class="apod-date">${image.date}</p>
        </div>
      </div>
    `;
  }).join('');

  // Insert the images into the gallery
  gallery.innerHTML = html || `<p>No images found for this date range.</p>`;

  // Add click event to each card to open modal
  const cards = gallery.querySelectorAll('.apod-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent modal from opening if user is selecting text
      if (window.getSelection().toString()) return;
      const idx = card.getAttribute('data-idx');
      showModal(images[idx]);
    });
  });
}
