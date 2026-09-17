import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Generate a unique cart key based on product id + variant selections
      const cartKey = action.payload.cartKey || action.payload.id;
      const existing = state.items.find((i) => i.cartKey === cartKey);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, cartKey, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.cartKey !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.payload.cartKey
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };
    case 'UPDATE_ITEM_DETAIL':
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartKey === action.payload.cartKey ? { ...i, ...action.payload.updates } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_RENTAL_DATE':
      return { ...state, rentalDate: action.payload };
    case 'SET_RETURN_DATE':
      return { ...state, returnDate: action.payload };
    case 'SET_DELIVERY_OPTION':
      return { ...state, deliveryOption: action.payload };
    case 'SET_PROMO':
      return { ...state, promoCode: action.payload.code, promoDiscount: action.payload.discount };
    case 'CLEAR_PROMO':
      return { ...state, promoCode: '', promoDiscount: 0 };
    default:
      return state;
  }
};

const DELIVERY_FEE = 15000;
const DEPOSIT = 100000;
const VALID_PROMOS = {
  DANIYOU10: 0.10,
  WISUDA25:  0.25,
  SEMHAS15:  0.15,
};

const initialState = {
  items: [],
  rentalDate: '',
  returnDate: '',
  deliveryOption: 'pickup', // 'pickup' | 'delivery'
  promoCode: '',
  promoDiscount: 0,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('daniyou_cart');
      return saved ? JSON.parse(saved) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem('daniyou_cart', JSON.stringify(state));
  }, [state]);

  const subtotal = state.items.reduce((sum, i) => sum + (i.selectedPrice || i.price) * i.quantity, 0);
  const deliveryFee = state.deliveryOption === 'delivery' ? DELIVERY_FEE : 0;
  const discountAmount = subtotal * state.promoDiscount;
  const total = subtotal + deliveryFee + DEPOSIT - discountAmount;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const applyPromo = (code) => {
    const upper = code.toUpperCase();
    if (VALID_PROMOS[upper] !== undefined) {
      dispatch({ type: 'SET_PROMO', payload: { code: upper, discount: VALID_PROMOS[upper] } });
      return true;
    }
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        dispatch,
        subtotal,
        deliveryFee,
        discountAmount,
        deposit: DEPOSIT,
        total,
        itemCount,
        applyPromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
