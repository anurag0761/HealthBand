import {createContext} from 'react';

export const initialState = {
  temperature: undefined,
};

export const TemperatureContext = createContext({
  store: initialState,
  setStore: () => {},
});
