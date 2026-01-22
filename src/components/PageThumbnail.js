import React from 'react';

const PageThumbnail = ({ layers, canvasSize, darkMode }) => {
    const baseWidth = canvasSize?.width || 1080;
    const baseHeight = canvasSize?.height || 720;

    return (
        <div
            className="relative w-full h-full bg-white dark:bg-gray-900 pointer-events-none overflow-hidden shadow-sm"
        >
            {/* Background Layer First */}
            {layers.filter(l => l.isBackground).map(layer => (
                <div key={layer.id} className="absolute inset-0 w-full h-full">
                    {layer.shapeType === 'image' && (
                        <img src={layer.content} className="w-full h-full object-cover" alt="" />
                    )}
                    {(!layer.shapeType || layer.shapeType !== 'image') && (
                        <div className="w-full h-full" style={{ background: layer.color || '#fff' }} />
                    )}
                </div>
            ))}

            {/* Content Layers */}
            {layers.filter(l => !l.isBackground).map(layer => {
                const style = {
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    width: `${(layer.width / baseWidth) * 100}%`,
                    height: `${(layer.height / baseHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                };

                if (layer.type === 'text') {
                    const relativeFontSize = (layer.fontSize / baseHeight) * 100;
                    return (
                        <div key={layer.id} className="absolute flex items-center justify-center text-center leading-tight whitespace-nowrap" style={{
                            ...style,
                            color: layer.color,
                            fontFamily: layer.fontFamily,
                            fontWeight: layer.fontWeight,
                            fontSize: `max(2px, ${relativeFontSize * 2}px)`,
                        }}>
                            {layer.content}
                        </div>
                    );
                }

                if (layer.type === 'shape') {
                    return (
                        <div key={layer.id} className="absolute" style={style}>
                            {layer.shapeType === 'image' ? (
                                <img src={layer.content} className="w-full h-full object-contain" alt="" />
                            ) : layer.shapeType === 'circle' ? (
                                <div className="w-full h-full rounded-full" style={{ background: layer.color }} />
                            ) : (
                                <div className="w-full h-full" style={{ background: layer.color }} />
                            )}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
};

export default PageThumbnail;
