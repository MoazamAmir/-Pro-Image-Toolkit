export const generateSVGMarkup = ({ layers, canvasSize }) => {
    const width = canvasSize.width;
    const height = canvasSize.height;

    let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    layers.forEach(layer => {
        if (layer.isHidden) return;
        const x = (layer.x * width) / 100;
        const y = (layer.y * height) / 100;
        const w = (layer.width * width) / 100;
        const h = (layer.height * height) / 100;
        const rotation = layer.rotation || 0;
        const transform = `translate(${x}, ${y}) rotate(${rotation}) scale(${layer.flipX ? -1 : 1}, ${layer.flipY ? -1 : 1})`;

        if (layer.type === 'text') {
            svgContent += `<text transform="${transform}" font-family="${layer.fontFamily}" font-size="${layer.fontSize}" fill="${layer.color}" text-anchor="middle" dominant-baseline="middle">${layer.content}</text>`;
        } else if (layer.type === 'shape' && layer.shapeType === 'rectangle') {
            svgContent += `<rect transform="${transform}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${layer.color}" />`;
        } else if (layer.type === 'shape' && layer.shapeType === 'circle') {
            svgContent += `<circle transform="${transform}" cx="0" cy="0" r="${Math.min(w, h) / 2}" fill="${layer.color}" />`;
        } else if (layer.type === 'shape' && layer.shapeType === 'image') {
            svgContent += `<rect transform="${transform}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#f3f4f6" stroke="#e5e7eb" />`;
        }
    });

    svgContent += '</svg>';
    return svgContent;
};
