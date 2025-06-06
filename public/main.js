import '@material/web/all.js';

const dataUrl = './data.json'; // Path to your JSON data

const countryListingsContainer = document.getElementById('countryListings');
const filterTitleInput = document.getElementById('filterTitle');
const filterPriceInput = document.getElementById('filterPrice');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const sortSelect = document.getElementById('sortSelect');

let allData = [];

function extractCountry(title) {
  const parts = title.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown';
}

function createCard(item) {
  const card = document.createElement('md-elevated-card');

  card.innerHTML = `
    <div class="listing-title">${item.Title}</div>
    <div class="listing-detail">${item.Detail}</div>
    <div class="listing-meta"><strong>Date:</strong> ${item.Date}</div>
    <div class="listing-meta"><strong>Beds:</strong> ${item["Number of bed"]}</div>
    <div class="listing-meta"><strong>Price:</strong> $${item["Price(in dollar)"]}</div>
    <div class="rating">★ ${item["Review and rating"]}</div>
  `;

  return card;
}

function createCountrySection(country, listings) {
  const section = document.createElement('section');
  section.classList.add('country-section');

  // Title and arrows
  const titleBar = document.createElement('div');
  titleBar.className = 'country-title';
  titleBar.textContent = country;

  const arrows = document.createElement('div');
  arrows.className = 'arrows';

  const leftBtn = document.createElement('md-icon-button');
  leftBtn.setAttribute('aria-label', 'Scroll Left');
  leftBtn.innerHTML = '<md-icon class="arrow-button">arrow_back</md-icon>';

  const rightBtn = document.createElement('md-icon-button');
  rightBtn.setAttribute('aria-label', 'Scroll Right');
  rightBtn.innerHTML = '<md-icon class="arrow-button">arrow_forward</md-icon>';

  arrows.appendChild(leftBtn);
  arrows.appendChild(rightBtn);
  titleBar.appendChild(arrows);
  section.appendChild(titleBar);

  // Scroll container
  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'scroll-container';

  listings.forEach(item => {
    const card = createCard(item);
    scrollContainer.appendChild(card);
  });

  section.appendChild(scrollContainer);

  const scrollAmount = 300;
  leftBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Hover auto-scroll right
  let scrollInterval;
  scrollContainer.addEventListener('mouseenter', () => {
    scrollInterval = setInterval(() => {
      scrollContainer.scrollBy({ left: 1, behavior: 'smooth' });
    }, 20);
  });
  scrollContainer.addEventListener('mouseleave', () => {
    clearInterval(scrollInterval);
  });

  return section;
}

function filterAndGroupData() {
  // Get filters
  const titleFilter = filterTitleInput.value.trim().toLowerCase();
  const maxPrice = parseFloat(filterPriceInput.value);
  const sortBy = sortSelect.value;

  // Filter data by title and price
  const filteredData = allData.filter(item => {
    const titleMatch = item.Title.toLowerCase().includes(titleFilter);
    const price = parseFloat(item["Price(in dollar)"]);
    const priceMatch = isNaN(maxPrice) ? true : price <= maxPrice;
    return titleMatch && priceMatch;
  });

  // Sort filteredData
  filteredData.sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a["Price(in dollar)"]) - parseFloat(b["Price(in dollar)"]);
    } else if (sortBy === 'price-desc') {
      return parseFloat(b["Price(in dollar)"]) - parseFloat(a["Price(in dollar)"]);
    } else if (sortBy === 'title-asc') {
      return a.Title.localeCompare(b.Title);
    }
    return 0;
  });

  // Group by country
  const countryMap = {};
  filteredData.forEach(item => {
    const country = extractCountry(item.Title);
    if (!countryMap[country]) countryMap[country] = [];
    countryMap[country].push(item);
  });

  return countryMap;
}


function render() {
  const countryMap = filterAndGroupData();

  countryListingsContainer.innerHTML = '';
  Object.entries(countryMap).forEach(([country, listings]) => {
    const section = createCountrySection(country, listings);
    countryListingsContainer.appendChild(section);
  });
}

async function loadData() {
  const res = await fetch(dataUrl);
  allData = await res.json();
  render();
}

const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeLabel = document.getElementById('darkModeLabel');

darkModeToggle.addEventListener('change', () => {
  const isDark = darkModeToggle.checked;
  document.body.classList.toggle('dark', isDark);

  // Change label text dynamically
  darkModeLabel.textContent = isDark ? 'Bright Mode' : 'Dark Mode';
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

// Filter events
filterTitleInput.addEventListener('input', () => {
  render();
});
filterPriceInput.addEventListener('input', () => {
  render();
});
sortSelect.addEventListener('change', () => {
  render();
});

// Initial load
loadData();
