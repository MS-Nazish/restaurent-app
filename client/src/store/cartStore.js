import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  // State
  items: [],
  tableId: null,
  sessionId: null,

  // Set table and session
  setTable: (tableId, sessionId) => set({ tableId, sessionId }),

  // Add item to cart
  addItem: (newItem) => {
    const { items } = get()

    // Check if same item with same variant and addons exists
    const existingIndex = items.findIndex(
      (item) =>
        item.item_id === newItem.item_id &&
        item.variant === newItem.variant &&
        JSON.stringify(item.addons) === JSON.stringify(newItem.addons)
    )

    if (existingIndex !== -1) {
      // Update quantity of existing item
      const updatedItems = [...items]
      updatedItems[existingIndex].quantity += newItem.quantity
      set({ items: updatedItems })
    } else {
      // Add new item
      set({ items: [...items, { ...newItem, id: Date.now() }] })
    }
  },

  // Remove item from cart
  removeItem: (id) => {
    set({ items: get().items.filter((item) => item.id !== id) })
  },

  // Update quantity
  updateQuantity: (id, quantity) => {
    if (quantity < 1) return
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })
  },

  // Clear cart
  clearCart: () => set({ items: [], tableId: null, sessionId: null }),

  // Get total price
  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  },

  // Get total item count
  getCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))

export default useCartStore