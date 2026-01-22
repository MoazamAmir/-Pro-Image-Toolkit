// Editor Storage Utility - Uses localStorage for persisting editor state

const STORAGE_KEY = 'editor_design_data';
const RECENT_ANIMATIONS_KEY = 'editor_recent_animations';


/**
 * Cleans and sanitizes the layer data before saving to ensure proper serialization
 * @param {Array} layers - Array of layer objects to clean
 * @returns {Array} - Cleaned array of layer objects
 */
const sanitizeLayersForStorage = (layers) => {
    return layers.map(layer => {
        // Create a clean copy of the layer without functions or complex references
        let cleanedLayer = { ...layer };
        
        // Ensure content is properly serializable
        if (typeof layer.content === 'object' && layer.content !== null) {
            if (layer.type === 'lottie' || layer.type === 'gif') {
                // For lottie layers, we only store the necessary properties
                cleanedLayer.content = layer.content;
                if (layer.lottieItem) {
                    // Ensure lottieItem is a plain object without functions
                    cleanedLayer.lottieItem = { ...layer.lottieItem };
                }
            } else {
                // For other object content, try to extract meaningful string representation
                cleanedLayer.content = layer.content.toString ? layer.content.toString() : JSON.stringify(layer.content);
            }
        }
        
        // Ensure lottieItem is a plain object without functions
        if (layer.lottieItem && typeof layer.lottieItem === 'object') {
            cleanedLayer.lottieItem = { ...layer.lottieItem };
        }
        
        // Ensure all properties are serializable
        ['width', 'height', 'x', 'y', 'rotation', 'fontSize', 'speed'].forEach(prop => {
            if (typeof layer[prop] !== 'number' && layer[prop] !== undefined) {
                try {
                    cleanedLayer[prop] = Number(layer[prop]);
                } catch (e) {
                    cleanedLayer[prop] = 0;
                }
            }
        });
        
        return cleanedLayer;
    });
};

/**
 * Saves the editor state (layers and adjustments) to localStorage
 * @param {Object} state - The state to save
 * @param {Array} state.layers - Array of layer objects
 * @param {Object} state.adjustments - Adjustments object
 */
export const saveEditorState = (state) => {
    try {
        const cleanedState = {
            ...state,
            layers: sanitizeLayersForStorage(state.layers)
        };
        const serialized = JSON.stringify(cleanedState);
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

/**
 * Saves the list of recently used animations to localStorage
 * @param {Array} animations - Array of animation item objects
 */
export const saveRecentlyUsedAnimations = (animations) => {
    try {
        const serialized = JSON.stringify(animations);
        localStorage.setItem(RECENT_ANIMATIONS_KEY, serialized);
    } catch (error) {
        console.warn('Failed to save recently used animations:', error);
    }
};

/**
 * Loads the list of recently used animations from localStorage
 * @returns {Array} The saved animations or an empty array
 */
export const loadRecentlyUsedAnimations = () => {
    try {
        const serialized = localStorage.getItem(RECENT_ANIMATIONS_KEY);
        if (serialized === null) {
            return [];
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.warn('Failed to load recently used animations:', error);
        return [];
    }
};
