import { createContext, useReducer } from "react";

const routinesReducer = (state, action) => {
    switch (action.type) {
        case "SET_ROUTINES":
            return {
                routines: action.payload,
            };
        case "CREATE_ROUTINE":
            return {
                routines: [action.payload, ...state.routines],
            };
        case "DELETE_ROUTINE":
            return {
                routines: state.routines.filter(
                    (routine) => routine._id !== action.payload._id
                ),
            };
        case "UPDATE_ROUTINE":
            return {
                routines: state.routines.map((routine) =>
                    routine._id === action.payload._id
                        ? action.payload
                        : routine
                ),
            };
        default:
            return state;
    }
};

export const RoutinesContext = createContext();

export const RoutinesContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(routinesReducer, { routines: [] });

    return (
        <RoutinesContext.Provider value={{ ...state, dispatch }}>
            {children}
        </RoutinesContext.Provider>
    );
};
