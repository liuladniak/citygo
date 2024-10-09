import { CartState } from "../features/cart/cartSlice";

export const loadFromLocalStorage = (key: string): CartState | undefined => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return undefined;
    return JSON.parse(serializedValue) as CartState;
  } catch (error) {
    console.error("Error loading from localStorage", error);
    return undefined;
  }
};

export const saveToLocalStorage = (key: string, state: CartState): void => {
  try {
    const serializedValue = JSON.stringify(state);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};
