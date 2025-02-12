// Base URLs as per the official API documentation.
const apiUrl = 'https://api.everrest.educata.dev/shop/products';
const categoryUrl = `${apiUrl}/categories`;
const brandUrl = `${apiUrl}/brands`;

// Helper function to check if a URL is from Imgur
function isImgurLink(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes("imgur.com");
  } catch (error) {
    // If the URL is invalid, treat it as not acceptable.
    return false;
  }
}

// Get product details by Id
async function getProductById(id) {
  const response = await fetch(`${apiUrl}/id/${id}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  const data = await response.json();
  displayProduct(data);
}

// Get all categories and display them in the category filter dropdown.
async function getAllCategories() {
  try {
    const response = await fetch(categoryUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    const categories = await response.json();
    console.log('Categories:', categories);
    displayCategories(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    alert('There was an error fetching categories. Please try again later.');
  }
}

function displayCategories(categories) {
  const categoryFilter = document.getElementById('categoryFilter');
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    // Using category.id for filtering and displaying category.name
    option.value = category.id;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}

// Get all brands and display them in the brand filter dropdown.
async function getAllBrands() {
  try {
    const response = await fetch(brandUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch brands');
    const brands = await response.json();
    console.log('Brands:', brands);
    displayBrands(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    alert('There was an error fetching brands. Please try again later.');
  }
}

function displayBrands(brands) {
  const brandFilter = document.getElementById('brandFilter');
  brandFilter.innerHTML = '<option value="">All Brands</option>';
  brands.forEach((brand) => {
    const option = document.createElement('option');
    // The API returns an array of strings for brands.
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}

async function searchProducts() {
  const keyword = document.getElementById('searchKeyword').value;
  const category = document.getElementById('categoryFilter').value;
  const brand = document.getElementById('brandFilter').value;

  // Get the slider element, its current value, and its max value.
  const priceRangeInput = document.getElementById('priceRange');
  const priceRangeValue = parseInt(priceRangeInput.value, 10);
  const priceRangeMax = parseInt(priceRangeInput.max, 10);

  let queryParams = new URLSearchParams();
  queryParams.append('page_index', '1');
  queryParams.append('page_size', '5');

  if (keyword) {
    queryParams.append('keywords', keyword);
  }
  if (category) {
    queryParams.append('category_id', category);
  }
  if (brand) {
    queryParams.append('brand', brand);
  }
  
  if (priceRangeValue < priceRangeMax) {
    queryParams.append('price_min', '1');
    queryParams.append('price_max', priceRangeValue.toString());
  }
  
  console.log("Searching with query:", queryParams.toString());

  try {
    const response = await fetch(`${apiUrl}/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`);
    }
    
    const data = await response.json();
    displayProducts(data.products);
  } catch (error) {
    console.error("Error during search:", error);
    alert('There was an error fetching the products. Please try again later.');
  }
}




// Display a single product's details.
function displayProduct(product) {
  const productInfo = document.getElementById('productInfo');
  // Use default image if thumbnail is missing or from Imgur.
  const thumbnail = (product.thumbnail && !isImgurLink(product.thumbnail))
    ? product.thumbnail
    : 'default-image.avif';

  productInfo.innerHTML = `
    <div class="product">
      <img src="${thumbnail}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p>Price: ${product.price.current} ${product.price.currency}</p>
      <p>Brand: ${product.brand}</p>
      <p>Stock: ${product.stock}</p>
      <p>Rating: ${product.rating}</p>
      <button onclick="rateProduct('${product._id}', 5)">Rate 5 Stars</button>
    </div>
  `;
}

function displayProducts(products) {
  const productInfo = document.getElementById('productInfo');
  productInfo.innerHTML = '';
  products.forEach((product) => {
    const thumbnail = (product.thumbnail && !isImgurLink(product.thumbnail))
      ? product.thumbnail
      : 'default-image.avif';

    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.innerHTML = `
      <img src="${thumbnail}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p>Price: ${product.price.current} ${product.price.currency}</p>
      <p>Brand: ${product.brand}</p>
      <p>Stock: ${product.stock}</p>
      <p>Rating: ${product.rating}</p>
      <button onclick="getProductById('${product._id}')">View More</button>
      <button onclick="addToCart('${product._id}', '${product.title}', ${product.price.current}, '${product.price.currency}')">Add to Cart</button>
    `;
    productInfo.appendChild(productElement);
  });
}

function addToCart(productId, productTitle, productPrice, productCurrency) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProductIndex = cart.findIndex(item => item.id === productId);
  if (existingProductIndex > -1) {
    cart[existingProductIndex].quantity += 1;
  } else {
    cart.push({
      id: productId,
      title: productTitle,
      price: productPrice,
      currency: productCurrency,
      quantity: 1
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Product added to cart!');
}

async function rateProduct(productId, rating) {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${apiUrl}/rate`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: productId,
      rate: rating,
    }),
  });
  const data = await response.json();
  alert('Rated successfully!');
  displayProduct(data);
}

document.getElementById('priceRange').addEventListener('input', (event) => {
  document.getElementById('priceOutput').textContent = `0 - ${event.target.value} USD`;
});

function applyFilters() {
  searchProducts();
}

window.onload = function () {
  getAllCategories();
  getAllBrands();
  getProductById('64edc5b96ad1cbae75d3025a');
};
