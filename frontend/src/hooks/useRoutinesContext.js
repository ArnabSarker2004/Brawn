import { useContext } from 'react';
import { RoutinesContext } from '../context/RoutinesContext';

export const useRoutinesContext = () => {
  const context = useContext(RoutinesContext);

  if (!context) {
    throw Error('useRoutinesContext must be used within a RoutinesContextProvider');
  }

  return context;
};
