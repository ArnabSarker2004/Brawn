import { createContext, useReducer } from 'react';

export const WorkoutsContext = createContext();

export const workoutsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WORKOUTS':
      return { workouts: action.payload };  // Set workouts for a specific routine
    case 'CREATE_WORKOUT':
      return { workouts: [action.payload, ...state.workouts] };  // Add a new workout to the routine
    case 'UPDATE_WORKOUT':
      return {
        workouts: state.workouts.map(workout =>
          workout._id === action.payload._id ? action.payload : workout
        )
      };
    case 'DELETE_WORKOUT':
      return { workouts: state.workouts.filter(workout => workout._id !== action.payload._id) };
    default:
      return state;
  }
};

export const WorkoutsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workoutsReducer, { workouts: [] }); // Default workouts to an empty array, not null

  return (
    <WorkoutsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WorkoutsContext.Provider>
  );
};
