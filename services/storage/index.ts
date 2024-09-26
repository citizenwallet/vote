const mockLocalStorage = {
  getItem: () => {
    return null;
  },
  setItem: () => {
    return;
  },
};

// NextJS will complain about UI hydration errors if we simply return null
export const storage =
  typeof window !== "undefined" ? window.localStorage : mockLocalStorage;
