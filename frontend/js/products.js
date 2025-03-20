// frontend/js/products.js

// Current page state
let currentPage = 0;
let pageSize = 10;
let totalProducts = 0;
let currentFilters = {};

// My products page state
let myCurrentPage = 0;
let myTotalProducts = 0;

// Load products with filters
async function loadProducts() {
    try {
        const params = {
            skip: currentPage * pageSize,
            limit: pageSize,
            ...currentFilters
        };

        const products = await API.getProducts(params);

        if (Array.isArray(products)) {
            displayProducts(products);
            totalProducts = products.length >= pageSize ? (currentPage + 1) * pageSize + 1 : (currentPage * pageSize) + products.length;
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-list').innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
    }
}

// Display products in the list
function displayProducts(products) {
    const productsContainer = document.getElementById('products-list');

    if (products.length === 0) {
        productsContainer.innerHTML = '<p>No products found matching your criteria.</p>';
        return;
    }

    let html = '';

    products.forEach(product => {
        html += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p><strong>Ingredient:</strong> ${product.ingredient}</p>
                <p><strong>Therapeutic Area:</strong> ${product.therapeutic_area.name}</p>
                <p>${product.description}</p>
                <div class="product-regions">
                    <strong>Available in:</strong>
                    ${product.regions.map(region => `<span class="region-tag">${region.name}</span>`).join('')}
                </div>
                <div class="product-meta">
                    <span>Added on: ${new Date(product.creation_date).toLocaleString('tr-TR')}</span>
                    <span>By: <a href="#" class="creator-link" data-creator-id="${product.creator_id}">${product.creator.name}</a></span>
                </div>
            </div>
        `;
    });

    productsContainer.innerHTML = html;

    // Add event listeners to creator links
    document.querySelectorAll('.creator-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const creatorId = e.target.getAttribute('data-creator-id');
            filterByCreator(creatorId);
        });
    });
}

// Update pagination controls
function updatePagination() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = totalProducts <= (currentPage + 1) * pageSize;

    pageInfo.textContent = `Page ${currentPage + 1}`;
}

// Change page
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 0) currentPage = 0;
    loadProducts();
}

// Apply filters
function applyFilters() {
    currentPage = 0;

    const searchInput = document.getElementById('search-input').value;
    const therapeuticArea = document.getElementById('therapeutic-area-filter').value;
    const regionId = document.getElementById('region-filter').value;
    const sortBy = document.getElementById('sort-by').value;
    const sortOrder = document.getElementById('sort-order').value;

    currentFilters = {
        therapeutic_area_id: therapeuticArea,
        region_id: regionId,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchInput.trim()
    };

    loadProducts();
}

// Filter by creator
function filterByCreator(creatorId) {
    currentPage = 0;
    currentFilters.creator_id = creatorId;
    loadProducts();

    // Update filters in the UI
    document.getElementById('search-input').value = '';
    document.getElementById('therapeutic-area-filter').value = '';
    document.getElementById('region-filter').value = '';
}

// Load therapeutic areas for filter
async function loadTherapeuticAreas() {
    try {
        const areas = await API.getTherapeuticAreas();
        const select = document.getElementById('therapeutic-area-filter');

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading therapeutic areas:', error);
    }
}

// Load regions for filter
async function loadRegions() {
    try {
        const regions = await API.getRegions();
        const select = document.getElementById('region-filter');

        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.id;
            option.textContent = region.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading regions:', error);
    }
}

// Load regions for product form
async function loadRegionsForForm() {
    if (!document.getElementById('regions-checkboxes')) return;

    try {
        const regions = await API.getRegions();
        const container = document.getElementById('regions-checkboxes');

        let html = '';
        regions.forEach(region => {
            html += `
                <label>
                    <input type="checkbox" name="regions" value="${region.id}"> ${region.name}
                </label>
            `;
        });

        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading regions for form:', error);
    }
}

async function loadTherapeuticAreasForForm() {
    try {
        const areas = await API.getTherapeuticAreas();
        const select = document.getElementById('product-therapeutic-area');

        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = area.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading therapeutic areas:', error);
    }
}


// Load user's products
async function loadUserProducts() {
    if (!document.getElementById('my-products-list')) return;

    try {
        const user = await API.getCurrentUser();
        const params = {
            skip: myCurrentPage * pageSize,
            limit: pageSize,
            creator_id: user.id
        };

        const products = await API.getProducts(params);

        if (Array.isArray(products)) {
            displayUserProducts(products);
            myTotalProducts = products.length >= pageSize ? (myCurrentPage + 1) * pageSize + 1 : (myCurrentPage * pageSize) + products.length;
            updateUserPagination();
        }
    } catch (error) {
        console.error('Error loading user products:', error);
        document.getElementById('my-products-list').innerHTML = '<p class="error-message">Failed to load your products. Please try again later.</p>';
    }
}

// Display user's products
function displayUserProducts(products) {
    const container = document.getElementById('my-products-list');

    if (products.length === 0) {
        container.innerHTML = '<p>You haven\'t added any products yet.</p>';
        return;
    }

    let html = '';

    products.forEach(product => {
        html += `
            <div class="product-card">
                <div class="product-actions">
                    <button class="btn btn-secondary edit-product" data-id="${product.id}">Edit</button>
                    <button class="btn btn-danger delete-product" data-id="${product.id}">Delete</button>
                </div>
                <h3>${product.name}</h3>
                <p><strong>Ingredient:</strong> ${product.ingredient}</p>
                <p><strong>Therapeutic Area:</strong> ${product.therapeutic_area.name}</p>
                <p>${product.description}</p>
                <div class="product-regions">
                    <strong>Available in:</strong>
                    ${product.regions.map(region => `<span class="region-tag">${region.name}</span>`).join('')}
                </div>
                <div class="product-meta">
                    <span>Added on: ${new Date(product.creation_date).toLocaleString('tr-TR')}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            editProduct(productId);
        });
    });

    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            deleteProduct(productId);
        });
    });
}

// Update user pagination
function updateUserPagination() {
    const prevButton = document.getElementById('my-prev-page');
    const nextButton = document.getElementById('my-next-page');
    const pageInfo = document.getElementById('my-page-info');

    prevButton.disabled = myCurrentPage === 0;
    nextButton.disabled = myTotalProducts <= (myCurrentPage + 1) * pageSize;

    pageInfo.textContent = `Page ${myCurrentPage + 1}`;
}

// Change user products page
function changeUserProductsPage(direction) {
    myCurrentPage += direction;
    if (myCurrentPage < 0) myCurrentPage = 0;
    loadUserProducts();
}

// Save product (create or update)
async function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const ingredient = document.getElementById('product-ingredient').value;
    const therapeuticArea = document.getElementById('product-therapeutic-area').value;
    const description = document.getElementById('product-description').value;

    // Get selected regions
    const regionIds = Array.from(document.querySelectorAll('input[name="regions"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    try {
        const productData = {
            name,
            ingredient,
            therapeutic_area_id: therapeuticArea,
            description,
            region_ids: regionIds
        };

        if (productId) {
            // Update existing product
            await API.updateProduct(productId, productData);
        } else {
            // Create new product
            await API.createProduct(productData);
        }

        // Hide form and reload products
        document.getElementById('product-form-container').classList.add('hidden');
        loadUserProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product. Please try again.');
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const product = await API.getProductById(productId);

        // Populate form
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-ingredient').value = product.ingredient;
        document.getElementById('product-therapeutic-area').value = product.therapeutic_area.name;
        document.getElementById('product-description').value = product.description;

        // Check regions
        const regionCheckboxes = document.querySelectorAll('input[name="regions"]');
        regionCheckboxes.forEach(checkbox => {
            checkbox.checked = product.regions.some(region => region.id === parseInt(checkbox.value));
        });

        // Show form and update title
        document.getElementById('form-title').textContent = 'Edit Product';
        document.getElementById('product-form-container').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Failed to load product. Please try again.');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        await API.deleteProduct(productId);
        loadUserProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
    }
}