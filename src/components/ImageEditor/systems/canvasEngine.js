export const getLayerDimensions = (layer) => {
    if (layer.type === 'text') {
        const textLength = (layer.content || '').length;
        return {
            width: layer.width || (textLength * (layer.fontSize || 16) * 0.6),
            height: layer.height || ((layer.fontSize || 16) * 1.2)
        };
    }

    if (layer.type === 'form') {
        return {
            width: layer.width || 280,
            height: layer.height || 350
        };
    }

    return {
        width: layer.width || 100,
        height: layer.height || 100
    };
};

export const clampDraggedLayerPosition = ({ layer, pointerEvent, rect, offset }) => {
    const { width, height } = getLayerDimensions(layer);
    const halfWidthPercent = (width / 2 / rect.width) * 100;
    const halfHeightPercent = (height / 2 / rect.height) * 100;

    let x = ((pointerEvent.clientX - rect.left - offset.x) / rect.width) * 100;
    let y = ((pointerEvent.clientY - rect.top - offset.y) / rect.height) * 100;

    x = Math.max(halfWidthPercent, Math.min(100 - halfWidthPercent, x));
    y = Math.max(halfHeightPercent, Math.min(100 - halfHeightPercent, y));

    return { x, y };
};
