const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_URL = VITE_API_URL
  ? (VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL)
  : (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://sabay-tenh.onrender.com/api');


// ========== PUBLIC ROUTES ==========

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch single product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// ========== ORDER ROUTES ==========

// Create new order (checkout) — pass token to link order to logged-in user
export const createOrder = async (orderData, token = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Fetch order by ID
export const fetchOrderById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

// ========== ADMIN ROUTES ==========

// Fetch all orders (admin only)
export const fetchAllOrders = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (id, statusData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
};

// ========== ADMIN PRODUCT ROUTES ==========

// Create new product
export const createProduct = async (productData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};
// Fetch product by slug
export const fetchProductBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/products/slug/${slug}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
};
// Delete product
export const deleteProduct = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// ========== FEATURED PRODUCTS ==========

export const fetchFeaturedProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products/featured/home`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// ========== REVIEW ROUTES ==========

export const fetchProductReviews = async (productId) => {
  try {
    const response = await fetch(`${API_URL}/reviews/product/${productId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const submitReview = async (reviewData, token) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const deleteReview = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// ========== COUPON ROUTES ==========

export const validateCoupon = async (code, orderTotal) => {
  try {
    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal })
    });
    return await response.json();
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

export const fetchCoupons = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/coupons`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const createCoupon = async (couponData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(couponData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

export const updateCoupon = async (id, couponData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(couponData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/coupons/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

// ========== USER ORDER HISTORY ==========

export const fetchUserOrders = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export default API_URL;