/**
 * Utility to identify the best audio input device (preferring Bluetooth).
 */
export const getBestAudioDevice = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(d => d.kind === 'audioinput');

        if (mics.length === 0) return null;

        // Prioritize Bluetooth devices by label
        const bluetoothMic = mics.find(d =>
            d.label.toLowerCase().includes('bluetooth') ||
            d.label.toLowerCase().includes('hands-free') ||
            d.label.toLowerCase().includes('headset')
        );

        if (bluetoothMic) {
            console.log('[AudioUtils] Found Bluetooth microphone:', bluetoothMic.label);
            return bluetoothMic.deviceId;
        }

        // Fallback to default or first available
        const defaultMic = mics.find(d => d.deviceId === 'default') || mics[0];
        console.log('[AudioUtils] Using standard microphone:', defaultMic.label || 'Default');
        return defaultMic.deviceId;
    } catch (err) {
        console.error('[AudioUtils] Error identifying best audio device:', err);
        return null;
    }
};

/**
 * Checks if a specific device ID belongs to a Bluetooth device.
 */
export const isBluetoothDevice = async (deviceId) => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const device = devices.find(d => d.deviceId === deviceId);
        if (!device) return false;

        const label = device.label.toLowerCase();
        return label.includes('bluetooth') || label.includes('hands-free') || label.includes('headset');
    } catch (e) {
        return false;
    }
};
