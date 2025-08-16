import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';

// Razorpay loader
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Product data inspired by Charlie's drinks
const products = [
  {
    id: 1,
    name: 'Orange & Mandarin',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-orange-200 to-orange-300',
    textColor: 'text-orange-800'
  },
  {
    id: 2,
    name: 'Raspberry & Lime',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-green-200 to-green-300',
    textColor: 'text-green-800'
  },
  {
    id: 3,
    name: 'Grapefruit',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-pink-200 to-pink-300',
    textColor: 'text-pink-800'
  },
  {
    id: 4,
    name: 'Lemon',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-blue-200 to-blue-300',
    textColor: 'text-blue-800'
  },
  {
    id: 5,
    name: 'Cassis',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-purple-200 to-purple-300',
    textColor: 'text-purple-800'
  },
  {
    id: 6,
    name: 'Passionfruit',
    description: 'Sparkling Water',
    price: 249,
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=400&fit=crop',
    bgColor: 'bg-gradient-to-br from-yellow-200 to-yellow-300',
    textColor: 'text-yellow-800'
  },
];

const Home = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.length;
  });

  // Add product to cart
  function handleBuy(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.find(item => item.id === product.id)) {
      cart.push({
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      setCartCount(cart.length);
      alert(`${product.name} added to cart!`);
    } else {
      alert(`${product.name} is already in your cart.`);
    }
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  function clearCart() {
    localStorage.removeItem('cart');
    setCartCount(0);
    setShowCart(false);
  }

  function handleCheckout() {
    if (!user) {
      alert('Please sign in to checkout');
      return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    loadRazorpayScript().then((loaded) => {
      if (!loaded) return alert('Razorpay SDK failed to load');
      
      const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'E-Commerce Store',
        description: `Purchase of ${cart.length} item(s)`,
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          clearCart();
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#3B82F6' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative">
      {/* Floating Cart Icon */}
      <button
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
        onClick={() => setShowCart(v => !v)}
        aria-label="View Cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a5 5 0 0110 0v7" />
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">{cartCount}</span>
        )}
      </button>

      {/* Enhanced Cart Dropdown */}
      {showCart && (
        <div className="fixed bottom-28 right-8 z-50 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-80 max-h-96 overflow-y-auto border border-white/30">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="font-bold text-lg text-gray-800">Shopping Cart</span>
            <button className="text-sm text-red-500 font-semibold hover:text-red-600 transition" onClick={clearCart}>Clear All</button>
          </div>
          <div className="p-4 space-y-3">
            {getCart().length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a5 5 0 0110 0v7" />
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                {getCart().map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-gray-500 text-sm">{item.description}</div>
                    </div>
                    <div className="font-bold text-blue-600">₹{item.price}</div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-800">Total:</span>
                    <span className="font-bold text-xl text-blue-600">₹{getCart().reduce((sum, item) => sum + item.price, 0)}</span>
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Premium Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">Featured Products</h2>
          <p className="text-gray-600 text-lg">Discover our premium collection of sparkling waters</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className={`${product.bgColor} rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group border border-white/20 backdrop-blur-sm`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              
              {/* Product Image */}
              <div className="relative z-10 mb-6 group-hover:scale-110 transition-transform duration-500">
                <img
                  src={imgError[idx] ? 'https://via.placeholder.com/200x200?text=No+Image' : product.image}
                  alt={product.name}
                  className="w-40 h-40 object-cover rounded-2xl shadow-lg bg-white/20 backdrop-blur-sm border-2 border-white/30"
                  onError={() => setImgError(e => ({ ...e, [idx]: true }))}
                />
              </div>
              
              {/* Product Info */}
              <div className="relative z-10 flex flex-col items-center">
                <h3 className={`text-2xl font-bold ${product.textColor} mb-2 drop-shadow-sm`}>{product.name}</h3>
                <p className={`text-base ${product.textColor} opacity-90 mb-6 drop-shadow-sm`}>{product.description}</p>
                
                <div className="w-full mt-auto">
                  <div className={`text-3xl font-bold ${product.textColor} mb-6 drop-shadow-sm`}>₹{product.price}</div>
                  <button
                    className="w-full bg-white/25 backdrop-blur-md text-white py-4 px-6 rounded-2xl font-bold hover:bg-white/35 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 group-hover:scale-105"
                    onClick={() => handleBuy(product)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a5 5 0 0110 0v7" />
                      </svg>
                      Add to Cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
