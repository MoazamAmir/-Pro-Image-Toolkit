// Editor Storage Utility - Uses localStorage for persisting editor state

const STORAGE_KEY = 'editor_design_data';

/**
 * Saves the editor state (layers and adjustments) to localStorage
 * @param {Object} state - The state to save
 * @param {Array} state.layers - Array of layer objects
 * @param {Object} state.adjustments - Adjustments object
 */
export const saveEditorState = (state) => {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
        console.warn('Failed to save editor state:', error);
    }
};

/**
 * Loads the editor state from localStorage
 * @returns {Object|null} The saved state or null if none exists
 */
export const loadEditorState = () => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.warn('Failed to load editor state:', error);
        return null;
    }
};

/**
 * Clears the saved editor state from localStorage
 */
export const clearEditorState = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear editor state:', error);
    }
};
