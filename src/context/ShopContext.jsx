import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
// import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  // User authentication state
  const [user, setUser] = useState(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      // Ensure all fields exist
      return {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        name: parsed.name || '',
        email: parsed.email || '',
        mobile: parsed.mobile || '',
        address: parsed.address || '',
        street: parsed.street || '',
        city: parsed.city || '',
        state: parsed.state || '',
        country: parsed.country || '',
        zipcode: parsed.zipcode || '',
        pincode: parsed.pincode || '',
        gender: parsed.gender || '',
      };
    }
    return null;
  });

  // Login and logout helpers
  // Accepts an object with all profile fields
  const login = (userInfo) => {
    const userData = {
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      name: userInfo.name || '',
      email: userInfo.email || '',
      mobile: userInfo.mobile || '',
      address: userInfo.address || '',
      street: userInfo.street || '',
      city: userInfo.city || '',
      state: userInfo.state || '',
      country: userInfo.country || '',
      zipcode: userInfo.zipcode || '',
      pincode: userInfo.pincode || '',
      gender: userInfo.gender || '',
    };
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userInfo");
  };
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/product/list");
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  fetchProducts();
  }, []);
  const navigate = useNavigate();

  const currency = "₹";
  const delivery_fee = 50;

  useEffect(() => {
    // INFO: Load cart items from localStorage when the component mounts
    try {
      const storedCartItems = localStorage.getItem("cartItems");
      if (storedCartItems) {
        const parsedCartItems = JSON.parse(storedCartItems);
        // Clean up any empty or invalid entries
        const cleanedCart = {};
        for (const itemId in parsedCartItems) {
          if (parsedCartItems[itemId] && typeof parsedCartItems[itemId] === 'object') {
            const sizes = {};
            for (const size in parsedCartItems[itemId]) {
              const quantity = parsedCartItems[itemId][size];
              if (quantity > 0) {
                sizes[size] = quantity;
              }
            }
            if (Object.keys(sizes).length > 0) {
              cleanedCart[itemId] = sizes;
            }
          }
        }
        setCartItems(cleanedCart);
      }
    } catch (err) {
      console.error("Error loading cart from localStorage:", err);
      localStorage.removeItem("cartItems");
    }
  }, []);

  useEffect(() => {
    // INFO: Save cart items to localStorage whenever cartItems changes
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    } else {
      toast.success("Item Added To The Cart");
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (err) {
          // INFO: Error Handling
          console.error("Error in getCartCount:", err);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      // Remove the specific size item completely
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        
        // If no sizes left for this item, remove the item completely
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
      toast.success("Item Removed From The Cart");
    } else {
      // Update the quantity
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);
  };

  const removeFromCart = async (itemId, size) => {
    let cartData = structuredClone(cartItems);
    
    if (cartData[itemId] && cartData[itemId][size]) {
      delete cartData[itemId][size];
      
      // If no sizes left for this item, remove the item completely
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
      
      setCartItems(cartData);
      toast.success("Item Removed From The Cart");
    }
  };

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
    toast.success("Cart Cleared");
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (err) {
          console.error("Error calculating cart amount:", err);
        }
      }
    }
    return totalAmount;
  };

  // Update user profile fields (all fields)
  const updateProfile = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem("userInfo", JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartAmount,
    navigate,
    user,
    login,
    logout,
    updateProfile,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ShopContextProvider;
