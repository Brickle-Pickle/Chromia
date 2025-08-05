import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

// Initial state for the application
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    palettes: [],
    currentPalette: null,
    // Add community colors state
    communityColors: [],
    communityColorsLoading: false,
    communityColorsPagination: {
        page: 1,
        limit: 12,
        total: 0,
        hasMore: false,
        totalPages: 0
    },
    // Add user colors state
    userColors: [],
    userColorsLoading: false,
    // Add total colors count state
    totalColorsCount: 0,
    totalColorsCountLoading: false,
    // Add forgot password related state
    forgotPasswordState: {
        emailSent: false,
        isProcessing: false,
        error: null,
    },
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
    // Add community colors action types
    SET_COMMUNITY_COLORS_LOADING: 'SET_COMMUNITY_COLORS_LOADING',
    SET_COMMUNITY_COLORS: 'SET_COMMUNITY_COLORS',
    ADD_COMMUNITY_COLORS: 'ADD_COMMUNITY_COLORS',
    SET_COMMUNITY_COLORS_PAGINATION: 'SET_COMMUNITY_COLORS_PAGINATION',
    // Add user colors action types
    SET_USER_COLORS_LOADING: 'SET_USER_COLORS_LOADING',
    SET_USER_COLORS: 'SET_USER_COLORS',
    ADD_USER_COLOR: 'ADD_USER_COLOR',
    // Add total colors count action types
    SET_TOTAL_COLORS_COUNT_LOADING: 'SET_TOTAL_COLORS_COUNT_LOADING',
    SET_TOTAL_COLORS_COUNT: 'SET_TOTAL_COLORS_COUNT',
    // Add forgot password action types
    SET_FORGOT_PASSWORD_LOADING: 'SET_FORGOT_PASSWORD_LOADING',
    SET_FORGOT_PASSWORD_ERROR: 'SET_FORGOT_PASSWORD_ERROR',
    CLEAR_FORGOT_PASSWORD_ERROR: 'CLEAR_FORGOT_PASSWORD_ERROR',
    SET_FORGOT_PASSWORD_EMAIL_SENT: 'SET_FORGOT_PASSWORD_EMAIL_SENT',
    RESET_FORGOT_PASSWORD_STATE: 'RESET_FORGOT_PASSWORD_STATE',
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
                userColors: [],
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
        // Add community colors reducer cases
        case actionTypes.SET_COMMUNITY_COLORS_LOADING:
            return {
                ...state,
                communityColorsLoading: action.payload,
            };
        case actionTypes.SET_COMMUNITY_COLORS:
            return {
                ...state,
                communityColors: action.payload,
                communityColorsLoading: false,
            };
        case actionTypes.ADD_COMMUNITY_COLORS:
            return {
                ...state,
                communityColors: [...state.communityColors, ...action.payload],
                communityColorsLoading: false,
            };
        case actionTypes.SET_COMMUNITY_COLORS_PAGINATION:
            return {
                ...state,
                communityColorsPagination: action.payload,
            };
        // Add user colors reducer cases
        case actionTypes.SET_USER_COLORS_LOADING:
            return {
                ...state,
                userColorsLoading: action.payload,
            };
        case actionTypes.SET_USER_COLORS:
            return {
                ...state,
                userColors: action.payload,
                userColorsLoading: false,
            };
        case actionTypes.ADD_USER_COLOR:
            return {
                ...state,
                userColors: [...state.userColors, action.payload],
            };
        // Add total colors count reducer cases
        case actionTypes.SET_TOTAL_COLORS_COUNT_LOADING:
            return {
                ...state,
                totalColorsCountLoading: action.payload,
            };
        case actionTypes.SET_TOTAL_COLORS_COUNT:
            return {
                ...state,
                totalColorsCount: action.payload,
                totalColorsCountLoading: false,
            };
        // Add forgot password reducer cases
        case actionTypes.SET_FORGOT_PASSWORD_LOADING:
            return {
                ...state,
                forgotPasswordState: {
                    ...state.forgotPasswordState,
                    isProcessing: action.payload,
                },
            };
        case actionTypes.SET_FORGOT_PASSWORD_ERROR:
            return {
                ...state,
                forgotPasswordState: {
                    ...state.forgotPasswordState,
                    error: action.payload,
                    isProcessing: false,
                },
            };
        case actionTypes.CLEAR_FORGOT_PASSWORD_ERROR:
            return {
                ...state,
                forgotPasswordState: {
                    ...state.forgotPasswordState,
                    error: null,
                },
            };
        case actionTypes.SET_FORGOT_PASSWORD_EMAIL_SENT:
            return {
                ...state,
                forgotPasswordState: {
                    ...state.forgotPasswordState,
                    emailSent: action.payload,
                    isProcessing: false,
                },
            };
        case actionTypes.RESET_FORGOT_PASSWORD_STATE:
            return {
                ...state,
                forgotPasswordState: {
                    emailSent: false,
                    isProcessing: false,
                    error: null,
                },
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

// Helper function to make API calls with credentials - moved outside component to prevent recreation
const createApiCall = () => {
    return async (endpoint, options = {}) => {
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

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, defaultOptions);
            
            // Handle unauthorized responses more carefully
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
                
                // Only clear session if it's actually an authentication error
                // and not a temporary server issue
                if (errorData.error === 'Token expired' || errorData.error === 'Invalid token') {
                    localStorage.removeItem('chromia_token');
                    localStorage.removeItem('chromia_user');
                    window.location.href = '/login';
                }
                
                throw new Error(errorData.message || 'Unauthorized');
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            // Don't redirect to login for network errors or other non-auth issues
            if (error.message !== 'Unauthorized') {
                console.error('API call error:', error);
            }
            throw error;
        }
    };
};

// App Provider component
export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Create stable API call function
    const apiCall = useMemo(() => createApiCall(), []);

    // Initialize app - check for existing token
    useEffect(() => {
        let isMounted = true; // Prevent state updates if component unmounts

        const initializeApp = async () => {
            const token = localStorage.getItem('chromia_token');
            const userData = localStorage.getItem('chromia_user');
            
            if (token && userData) {
                try {
                    if (isMounted) {
                        dispatch({ type: actionTypes.SET_LOADING, payload: true });
                    }
                    
                    // Verify token is still valid by getting current user
                    const currentUser = await apiCall('/users/current');
                    
                    if (isMounted) {
                        dispatch({
                            type: actionTypes.LOGIN_SUCCESS,
                            payload: {
                                token,
                                user: currentUser,
                            },
                        });
                    }
                } catch (error) {
                    // Token is invalid, clear storage
                    localStorage.removeItem('chromia_token');
                    localStorage.removeItem('chromia_user');
                    if (isMounted) {
                        dispatch({ type: actionTypes.SET_ERROR, payload: 'Session expired' });
                    }
                } finally {
                    if (isMounted) {
                        dispatch({ type: actionTypes.SET_LOADING, payload: false });
                    }
                }
            }
        };

        initializeApp();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [apiCall]);

    // Authentication functions - memoized to prevent recreation
    const login = useCallback(async (username, password) => {
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
    }, [apiCall]);

    const register = useCallback(async (username, password) => {
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
    }, [apiCall, login]);

    const logout = useCallback(() => {
        localStorage.removeItem('chromia_token');
        localStorage.removeItem('chromia_user');
        dispatch({ type: actionTypes.LOGOUT });
    }, []);

    // Forgot password functions - memoized
    const requestPasswordReset = useCallback(async (email) => {
        try {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_LOADING, payload: true });
            dispatch({ type: actionTypes.CLEAR_FORGOT_PASSWORD_ERROR });

            // Since the backend doesn't have this functionality yet, simulate the request
            // In the future, this would call: await apiCall('/users/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For now, always return success since it's not implemented
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_EMAIL_SENT, payload: true });
            
            return { 
                success: true, 
                message: 'Password reset instructions have been sent to your email.' 
            };
        } catch (error) {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_LOADING, payload: false });
        }
    }, []);

    const resetPassword = useCallback(async (token, newPassword) => {
        try {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_LOADING, payload: true });
            dispatch({ type: actionTypes.CLEAR_FORGOT_PASSWORD_ERROR });

            // Since the backend doesn't have this functionality yet, simulate the request
            // In the future, this would call: await apiCall('/users/reset-password', { method: 'POST', body: JSON.stringify({ token, password: newPassword }) });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For now, always return success since it's not implemented
            return { 
                success: true, 
                message: 'Password has been reset successfully.' 
            };
        } catch (error) {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_FORGOT_PASSWORD_LOADING, payload: false });
        }
    }, []);

    const clearForgotPasswordError = useCallback(() => {
        dispatch({ type: actionTypes.CLEAR_FORGOT_PASSWORD_ERROR });
    }, []);

    const resetForgotPasswordState = useCallback(() => {
        dispatch({ type: actionTypes.RESET_FORGOT_PASSWORD_STATE });
    }, []);

    // Utility function to copy text to clipboard - memoized
    const copyToClipboard = useCallback(async (text) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return { success: true };
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    return { success: true };
                } else {
                    throw new Error('Failed to copy text');
                }
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // Palette management functions - memoized
    const fetchPalettes = useCallback(async () => {
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
    }, [apiCall]);

    const createPalette = useCallback(async (paletteData) => {
        try {
            dispatch({ type: actionTypes.SET_LOADING, payload: true });
            const newPalette = await apiCall('/palettes/create', {
                method: 'POST',
                body: JSON.stringify(paletteData),
            });
            dispatch({ type: actionTypes.ADD_PALETTE, payload: newPalette });
            return { success: true, data: newPalette };
        } catch (error) {
            console.error('Error creating palette:', error);
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
    }, [apiCall]);

    const updatePalette = useCallback(async (paletteId, paletteData) => {
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
    }, [apiCall]);

    const deletePalette = useCallback(async (paletteId) => {
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
    }, [apiCall]);

    const getPaletteById = useCallback(async (paletteId) => {
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
    }, [apiCall]);

    // Color management functions - memoized
    const fetchUserColors = useCallback(async () => {
        try {
            dispatch({ type: actionTypes.SET_USER_COLORS_LOADING, payload: true });
            const colors = await apiCall('/colors');
            dispatch({ type: actionTypes.SET_USER_COLORS, payload: colors });
            return { success: true, data: colors };
        } catch (error) {
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_USER_COLORS_LOADING, payload: false });
        }
    }, [apiCall]);

    const createColor = useCallback(async (colorData) => {
        try {
            const newColor = await apiCall('/colors/create', {
                method: 'POST',
                body: JSON.stringify(colorData),
            });
            dispatch({ type: actionTypes.ADD_USER_COLOR, payload: newColor });
            return { success: true, data: newColor };
        } catch (error) {
            console.error('Error creating color:', error);
            return { success: false, error: error.message };
        }
    }, [apiCall]);

    const searchCommunityColors = useCallback(async (searchTerm) => {
        try {
            // Use fetch directly for public endpoint (no authentication needed)
            const response = await fetch(`${API_BASE_URL}/colors/community?search=${encodeURIComponent(searchTerm)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to search colors');
            }
            
            const data = await response.json();
            return { success: true, data: data.colors };
        } catch (error) {
            console.error('Error searching community colors:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // Community colors management functions - memoized
    const fetchCommunityColors = useCallback(async (page = 1, limit = 12, reset = false) => {
        try {
            dispatch({ type: actionTypes.SET_COMMUNITY_COLORS_LOADING, payload: true });
            
            // Use fetch directly for public endpoint (no authentication needed)
            const response = await fetch(`${API_BASE_URL}/colors/community?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials but don't require auth
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch community colors');
            }
            
            const data = await response.json();
            
            if (reset || page === 1) {
                dispatch({ type: actionTypes.SET_COMMUNITY_COLORS, payload: data.colors });
            } else {
                dispatch({ type: actionTypes.ADD_COMMUNITY_COLORS, payload: data.colors });
            }
            
            dispatch({ type: actionTypes.SET_COMMUNITY_COLORS_PAGINATION, payload: data.pagination });
            
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching community colors:', error);
            dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_COMMUNITY_COLORS_LOADING, payload: false });
        }
    }, []);

    // Get total colors count function - memoized
    const fetchTotalColorsCount = useCallback(async () => {
        try {
            dispatch({ type: actionTypes.SET_TOTAL_COLORS_COUNT_LOADING, payload: true });
            
            // Use fetch directly for public endpoint (no authentication needed)
            const response = await fetch(`${API_BASE_URL}/colors/count`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch colors count');
            }
            
            const data = await response.json();
            dispatch({ type: actionTypes.SET_TOTAL_COLORS_COUNT, payload: data.count });
            
            return { success: true, data: data.count };
        } catch (error) {
            console.error('Error fetching total colors count:', error);
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: actionTypes.SET_TOTAL_COLORS_COUNT_LOADING, payload: false });
        }
    }, []);

    // Color API integration function - memoized
    const getColorInfo = useCallback(async (hexColor) => {
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
    }, []);

    // Utility functions - memoized
    const clearError = useCallback(() => {
        dispatch({ type: actionTypes.CLEAR_ERROR });
    }, []);

    const setCurrentPalette = useCallback((palette) => {
        dispatch({ type: actionTypes.SET_CURRENT_PALETTE, payload: palette });
    }, []);

    // Context value - memoized to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // State
        ...state,
        
        // Authentication functions
        login,
        register,
        logout,
        
        // Forgot password functions
        requestPasswordReset,
        resetPassword,
        clearForgotPasswordError,
        resetForgotPasswordState,
        
        // Palette management functions
        fetchPalettes,
        createPalette,
        updatePalette,
        deletePalette,
        getPaletteById,
        setCurrentPalette,
        
        // Color management functions
        fetchUserColors,
        createColor,
        searchCommunityColors,
        
        // Community colors functions
        fetchCommunityColors,
        fetchTotalColorsCount,
        
        // Color API function
        getColorInfo,
        
        // Utility functions
        clearError,
        copyToClipboard,
        
        // Direct API call function for custom requests
        apiCall,
    }), [
        state,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        clearForgotPasswordError,
        resetForgotPasswordState,
        fetchPalettes,
        createPalette,
        updatePalette,
        deletePalette,
        getPaletteById,
        setCurrentPalette,
        fetchUserColors,
        createColor,
        searchCommunityColors,
        fetchCommunityColors,
        fetchTotalColorsCount,
        getColorInfo,
        clearError,
        copyToClipboard,
        apiCall
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;