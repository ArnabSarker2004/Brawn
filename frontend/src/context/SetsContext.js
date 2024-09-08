import { createContext, useReducer } from 'react';

export const SetsContext = createContext();

export const setsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SETS':
      return {
        sets: action.payload // Set the sets for a specific workout
      };
    case 'CREATE_SET':
      return {
        sets: [action.payload, ...state.sets] // Add a new set
      };
    case 'UPDATE_SET':
      return {
        sets: state.sets.map(set => 
          set._id === action.payload._id ? action.payload : set // Update a specific set by ID
        )
      };
    case 'DELETE_SET':
      return {
        sets: state.sets.filter(set => set._id !== action.payload._id) // Delete a specific set by ID
      };
    default:
      return state;
  }
};

export const SetsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(setsReducer, { sets: [] }); // Initialize sets as an empty array

  return (
    <SetsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SetsContext.Provider>
  );
};
