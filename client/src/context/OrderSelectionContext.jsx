import { createContext, useContext, useMemo, useReducer } from 'react';

const OrderSelectionContext = createContext(null);

function selectionReducer(state, action) {
  const currentQuantity = Number(state.quantities[action.foodId] || 0);

  if (action.type === 'increment') {
    return {
      quantities: {
        ...state.quantities,
        [action.foodId]: currentQuantity + 1
      }
    };
  }

  if (action.type === 'decrement') {
    if (currentQuantity <= 1) {
      const { [action.foodId]: _removed, ...remainingQuantities } = state.quantities;
      return { quantities: remainingQuantities };
    }
    return {
      quantities: {
        ...state.quantities,
        [action.foodId]: currentQuantity - 1
      }
    };
  }

  if (action.type === 'clear') return { quantities: {} };
  return state;
}

export function OrderSelectionProvider({ children }) {
  const [state, dispatch] = useReducer(selectionReducer, { quantities: {} });
  const value = useMemo(
    () => ({
      quantities: state.quantities,
      increaseItem: (foodId) => dispatch({ type: 'increment', foodId }),
      decreaseItem: (foodId) => dispatch({ type: 'decrement', foodId }),
      clearSelection: () => dispatch({ type: 'clear' })
    }),
    [state.quantities]
  );

  return <OrderSelectionContext.Provider value={value}>{children}</OrderSelectionContext.Provider>;
}

export function useOrderSelection() {
  const context = useContext(OrderSelectionContext);
  if (!context) throw new Error('useOrderSelection must be used within OrderSelectionProvider');
  return context;
}
