import { useContext } from 'react';
import { SetsContext } from '../context/SetsContext';

export const useSetsContext = () => {
  const context = useContext(SetsContext);

  if (!context) {
    throw new Error('useSetsContext must be used inside a SetsContextProvider');
  }

  return context;
};
