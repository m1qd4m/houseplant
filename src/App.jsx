// Houseplant Haven Demo Store
// GitHub: https://github.com/ryanwiemer/houseplant-haven (example public repo, replace with actual if needed)

// --- Redux Setup (all code in this file, no imports) ---

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// --- Redux Implementation (no imports) ---
const PLANTS = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    price: 25,
    category: "Tropical",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Snake Plant",
    price: 18,
    category: "Succulent",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    price: 30,
    category: "Tree",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    name: "Aloe Vera",
    price: 15,
    category: "Succulent",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    name: "Pothos",
    price: 12,
    category: "Vine",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    name: "Peace Lily",
    price: 22,
    category: "Flowering",
    image: "https://unsplash.com/photos/a-white-flower-with-green-leaves-in-a-vase-xQLLJXHuItc",
  },
];

// Redux actions
const ADD_TO_CART = "ADD_TO_CART";
const REMOVE_FROM_CART = "REMOVE_FROM_CART";
const INCREMENT_QTY = "INCREMENT_QTY";
const DECREMENT_QTY = "DECREMENT_QTY";
const CLEAR_CART = "CLEAR_CART";

const addToCart = (plant) => ({ type: ADD_TO_CART, plant });
const removeFromCart = (id) => ({ type: REMOVE_FROM_CART, id });
const incrementQty = (id) => ({ type: INCREMENT_QTY, id });
const decrementQty = (id) => ({ type: DECREMENT_QTY, id });
const clearCart = () => ({ type: CLEAR_CART });

const initialCartState = {
  items: {}, // { [plantId]: { ...plant, qty } }
};

function cartReducer(state = initialCartState, action) {
  switch (action.type) {
    case ADD_TO_CART: {
      const { plant } = action;
      if (state.items[plant.id]) return state; // already in cart
      return {
        ...state,
        items: {
          ...state.items,
          [plant.id]: { ...plant, qty: 1 },
        },
      };
    }
    case REMOVE_FROM_CART: {
      const newItems = { ...state.items };
      delete newItems[action.id];
      return { ...state, items: newItems };
    }
    case INCREMENT_QTY: {
      const item = state.items[action.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: { ...item, qty: item.qty + 1 },
        },
      };
    }
    case DECREMENT_QTY: {
      const item = state.items[action.id];
      if (!item) return state;
      if (item.qty <= 1) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.id]: { ...item, qty: item.qty - 1 },
        },
      };
    }
    case CLEAR_CART:
      return initialCartState;
    default:
      return state;
  }
}

// --- Minimal Redux Store Implementation (no imports) ---
function createStore(reducer) {
  let state = reducer(undefined, { type: "@@redux/INIT" });
  let listeners = [];
  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };
}

function combineReducers(reducers) {
  return function combination(state = {}, action) {
    const nextState = {};
    for (let key in reducers) {
      nextState[key] = reducers[key](state[key], action);
    }
    return nextState;
  };
}

const rootReducer = combineReducers({
  cart: cartReducer,
});

const store = createStore(rootReducer);

// --- React Redux Context (no imports) ---
const ReduxContext = React.createContext();

function Provider({ store, children }) {
  const [_, setState] = React.useState(0);
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => setState((s) => s + 1));
    return unsubscribe;
  }, [store]);
  return (
    <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
  );
}

function useDispatch() {
  const store = React.useContext(ReduxContext);
  return store.dispatch;
}

function useSelector(selector) {
  const store = React.useContext(ReduxContext);
  const [selected, setSelected] = React.useState(() => selector(store.getState()));
  React.useEffect(() => {
    const checkForUpdates = () => {
      const newSelected = selector(store.getState());
      setSelected(newSelected);
    };
    const unsubscribe = store.subscribe(checkForUpdates);
    return unsubscribe;
  }, [store, selector]);
  return selected;
}

// --- Header ---
function Header() {
  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-green-800/80 text-white sticky top-0 z-50 shadow-lg backdrop-blur-md">
      <div className="font-bold text-2xl drop-shadow">
        <Link to="/" className="text-white no-underline">Houseplant Haven</Link>
      </div>
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-white hover:underline">Home</Link>
        <Link to="/products" className="text-white hover:underline">Shop</Link>
        <Link to="/cart" className="relative text-white hover:underline">
          <span role="img" aria-label="cart" className="text-2xl">🛒</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-white text-green-800 rounded-full px-2 py-0.5 text-xs font-bold shadow">
              {totalItems}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}

// --- Landing Page ---
function LandingPage() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white"
      style={{
        background: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat`,
        textShadow: "0 2px 8px #0008",
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-10 shadow-2xl flex flex-col items-center max-w-xl">
        <h1 className="text-5xl font-bold mb-4 text-green-900 drop-shadow">Houseplant Haven</h1>
        <p className="text-lg mb-8 text-center text-green-900 font-medium">
          Welcome to Houseplant Haven! Discover a curated selection of beautiful, easy-to-care-for houseplants to brighten your home and purify your air. We believe every home deserves a touch of green and a breath of fresh air.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 text-lg bg-green-800/90 hover:bg-green-700 rounded-lg font-bold shadow-lg transition text-white glass"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

// --- Product Listing Page ---
function ProductListingPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // Group plants by category
  const categories = {};
  PLANTS.forEach((plant) => {
    if (!categories[plant.category]) categories[plant.category] = [];
    categories[plant.category].push(plant);
  });

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-green-900">Shop Houseplants</h2>
      {Object.keys(categories).map((cat) => (
        <div key={cat} className="mb-12">
          <h3 className="text-xl font-semibold text-green-800 mb-4">{cat}</h3>
          <div className="flex flex-wrap gap-8">
            {categories[cat].map((plant) => {
              const inCart = !!cartItems[plant.id];
              return (
                <div
                  key={plant.id}
                  className="border border-green-100 bg-white/60 backdrop-blur-lg rounded-2xl w-56 shadow-xl flex flex-col items-center p-4 glass"
                >
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-32 h-32 object-cover rounded-xl mb-3 shadow"
                  />
                  <div className="font-bold text-lg mb-1 text-green-900">{plant.name}</div>
                  <div className="text-green-800 font-bold mb-2">${plant.price}</div>
                  <button
                    disabled={inCart}
                    onClick={() => dispatch(addToCart(plant))}
                    className={`w-full py-2 rounded font-bold mb-2 transition ${
                      inCart
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-800/90 hover:bg-green-700 cursor-pointer text-white"
                    } glass`}
                  >
                    {inCart ? "Added" : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Cart Page ---
function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  const itemsArr = Object.values(cartItems);
  const totalQty = itemsArr.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = itemsArr.reduce((sum, item) => sum + item.qty * item.price, 0);

  const [showCheckout, setShowCheckout] = React.useState(false);

  // After checkout, go back to products page
  const handleCheckout = () => {
    setShowCheckout(false);
    dispatch(clearCart());
    setTimeout(() => {
      navigate("/products");
    }, 300); // short delay for UX
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-green-900">Your Cart</h2>
      {itemsArr.length === 0 ? (
        <div className="bg-white/70 rounded-xl p-8 text-center shadow-lg glass">
          <p className="text-lg mb-4 text-green-900">Your cart is empty.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-green-800/90 hover:bg-green-700 text-white rounded-lg font-bold shadow glass"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="bg-white/70 rounded-xl p-6 shadow-lg glass">
          <div className="mb-4 flex flex-col gap-2">
            <div className="text-green-900 font-semibold">
              Total plants: <span className="font-bold">{totalQty}</span>
            </div>
            <div className="text-green-900 font-semibold">
              Total cost: <span className="font-bold">${totalCost}</span>
            </div>
          </div>
          <div className="divide-y divide-green-100">
            {itemsArr.map((item) => (
              <div key={item.id} className="flex items-center py-4 gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg shadow"
                />
                <div className="flex-1">
                  <div className="font-bold text-green-900">{item.name}</div>
                  <div className="text-green-800 text-sm">${item.price} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(decrementQty(item.id))}
                    disabled={item.qty <= 1}
                    className={`px-2 py-1 rounded bg-green-200 text-green-900 font-bold shadow ${
                      item.qty <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-300"
                    }`}
                  >
                    -
                  </button>
                  <span className="font-bold text-green-900">{item.qty}</span>
                  <button
                    onClick={() => dispatch(incrementQty(item.id))}
                    className="px-2 py-1 rounded bg-green-200 text-green-900 font-bold shadow hover:bg-green-300"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="ml-4 px-3 py-1 rounded bg-red-200 text-red-800 font-bold shadow hover:bg-red-300"
                  aria-label={`Remove ${item.name}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => setShowCheckout(true)}
              className="flex-1 px-6 py-3 bg-green-800/90 hover:bg-green-700 text-white rounded-lg font-bold shadow glass"
            >
              Checkout
            </button>
            <button
              onClick={() => navigate("/products")}
              className="flex-1 px-6 py-3 bg-green-200 hover:bg-green-300 text-green-900 rounded-lg font-bold shadow glass"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => dispatch(clearCart())}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold shadow glass"
            >
              Clear Cart
            </button>
          </div>
          {showCheckout && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white/90 rounded-xl p-8 shadow-2xl text-center glass">
                <h3 className="text-2xl font-bold mb-4 text-green-900">Checkout</h3>
                <p className="mb-6 text-green-900">Coming Soon!</p>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-green-800/90 hover:bg-green-700 text-white rounded-lg font-bold shadow glass"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- App Wrapper ---
function App() {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;



