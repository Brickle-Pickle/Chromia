import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for the application
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    palettes: [],
    currentPalette: null,
};

// Action types
const actionTypes = {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    SET_PALETTES: 'SET_PALETTES',
    ADD_PALETTE: 'ADD_PALETTE',
    UPDATE_PALETTE: 'UPDATE_PALETTE',
    DELETE_PALETTE: 'DELETE_PALETTE',
    SET_CURRENT_PALETTE: 'SET_CURRENT_PALETTE',
};

// Reducer function to manage state changes
const appReducer = (state, action) => {
    switch (action.type) {
        case actionTypes.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case actionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        case actionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case actionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case actionTypes.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                palettes: [],
                currentPalette: null,
                error: null,
            };
        case actionTypes.SET_PALETTES:
            return {
                ...state,
                palettes: action.payload,
            };
        case actionTypes.ADD_PALETTE:
            return {
                ...state,
                palettes: [...state.palettes, action.payload],
            };
        case actionTypes.UPDATE_PALETTE:
            return {
                ...state,
                palettes: state.palettes.map(palette =>
                    palette._id === action.payload._id ? action.payload : palette
                ),
                currentPalette: state.currentPalette?._id === action.payload._id 
                    ? action.payload 
                    : state.currentPalette,
            };
        case actionTypes.DELETE_PALETTE:
            return {
                ...state,
                palettes: state.palettes.filter(palette => palette._id !== action.payload),
                currentPalette: state.currentPalette?._id === action.payload 
                    ? null 
                    : state.currentPalette,
            };
        case actionTypes.SET_CURRENT_PALETTE:
            return {
                ...state,
                currentPalette: action.payload,
            };
        default:
            return state;
    }
};

// Create context
const AppContext = createContext();

// API base URL - adjust according to your backend configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Custom hook to use the app context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// Helper function to make API calls with credentials
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('chromia_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include', // Always send credentials
        ...options,
    };

    // Merge headers properly
    if (options.headers) {
        defaultOptions.headers = {
            ...defaultOptions.headers,
            ...options.headers,
        };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
    
    // Handle unauthorized responses
    if (response.status === 401) {
        localStorage.removeItem('chromia_token');
        localStorage.removeItem('chromia_user');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
};

// App Provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Initialize app - check for existing token
    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('chromia_token');
            const userData = localStorage.getItem('chromia_user');
            
            if (token && userData) {
                try {
                    dispatch({ type: actionTypes.SET_LOADING, payload: true });
                    
                    // Verify token is still valid by getting current user
                    const currentUser = await apiCall('/users/current');
                    
                    dispatch({
                        type: actionTypes.LOGIN_SUCCESS,
                        payload: {
                            token,
                            user: currentUser,
                        },
                    });
                } catch (error) {
                    // Token is invalid, clear storage
                    localStorage.removeItem('chromia_token');
                    localStorage.removeItem('chromia_user');
                    dispatch({ type: actionTypes.SET_ERROR, payload: 'Session expired' });
                } finally {
                    dispatch({ type: actionTypes.SET_LOADING, payload: false });
                }
            }
        };

        initializeApp();
    }, []);

    // Authentication functions
    const login = async (username, password) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            dispatch({ type: actionTypes.CLEAR_ERROR });

            const response = await apiCall('/users/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            // Store token and user data
            localStorage.setItem('chromia_token', response.token);
            localStorage.setItem('chromia_user', JSON.stringify(response.user));

            dispatch({
                type: actionTypes.LOGIN_SUCCESS,
                payload: {
                    token: response.token,
                    user: response.user,
                },
            });

            return { success: true };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const register = async (username, password) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            dispatch({ type: actionTypes.CLEAR_ERROR });

            await apiCall('/users/register', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });

            // After successful registration, automatically log in
            return await login(username, password);
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const logout = () => {
        localStorage.removeItem('chromia_token');
        localStorage.removeItem('chromia_user');
        dispatch({ type: actionTypes.LOGOUT });
    };

    // Palette management functions
    const fetchPalettes = async () => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const palettes = await apiCall('/palettes');
            dispatch({ type: actionTypes.SET_PALETTES, payload: palettes });
            return { success: true, data: palettes };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const createPalette = async (paletteData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const newPalette = await apiCall('/palettes', {
                method: 'POST',
                body: JSON.stringify(paletteData),
            });
            dispatch({ type: actionTypes.ADD_PALETTE, payload: newPalette });
            return { success: true, data: newPalette };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const updatePalette = async (paletteId, paletteData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const updatedPalette = await apiCall(`/palettes/${paletteId}`, {
                method: 'PUT',
                body: JSON.stringify(paletteData),
            });
            dispatch({ type: actionTypes.UPDATE_PALETTE, payload: updatedPalette });
            return { success: true, data: updatedPalette };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const deletePalette = async (paletteId) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            await apiCall(`/palettes/${paletteId}`, {
                method: 'DELETE',
            });
            dispatch({ type: actionTypes.DELETE_PALETTE, payload: paletteId });
            return { success: true };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    const getPaletteById = async (paletteId) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const palette = await apiCall(`/palettes/${paletteId}`);
            dispatch({ type: actionTypes.SET_CURRENT_PALETTE, payload: palette });
            return { success: true, data: palette };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    };

    // Color API integration function
    const getColorInfo = async (hexColor) => {
        try {
            // Remove # from hex color if present
            const cleanHex = hexColor.replace('#', '');
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch color information');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching color info:', error);
            throw error;
        }
    };

    // Utility functions
    const clearError = () => {
        dispatch({ type: actionTypes.CLEAR_ERROR });
    };

    const setCurrentPalette = (palette) => {
        dispatch({ type: actionTypes.SET_CURRENT_PALETTE, payload: palette });
    };

    // Context value
    const contextValue = {
        // State
        ...state,
        
        // Authentication functions
        login,
        register,
        logout,
        
        // Palette management functions
        fetchPalettes,
        createPalette,
        updatePalette,
        deletePalette,
        getPaletteById,
        setCurrentPalette,
        
        // Color API function
        getColorInfo,
        
        // Utility functions
        clearError,
        
        // Direct API call function for custom requests
        apiCall,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;