import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * SlideRenderer - A shared component to render design pages/slides faithfully.
 * Used by PresenterWindow and AudienceViewer.
 */
const SlideRenderer = ({
    page,
    canvasSize,
    adjustments,
    className = '',
    style = {},
    overlays = null
}) => {
    if (!page) {
        return (
            <div className={`sr-empty ${className}`} style={{
                width: '500px', height: '350px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyCenter: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'rgba(255,255,255,0.2)'
            }}>
                <LucideIcons.Hash size={48} strokeWidth={1} />
                <span>No page data</span>
            </div>
        );
    }

    const { layers = [] } = page;

    return (
        <div
            className={`slide-renderer-root ${className}`}
            style={{
                width: canvasSize?.width ? `${canvasSize.width}px` : '100%',
                height: canvasSize?.height ? `${canvasSize.height}px` : '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                position: 'relative',
                containerType: 'size',
                background: '#fff',
                overflow: 'hidden',
                boxShadow: '0 20px 80px rgba(0,0,0,0.3)',
                ...style
            }}
        >
            {/* Overlay Slot (Drawings, Laser, etc.) */}
            {overlays}

            {/* Full Layer Rendering */}
            <div className="sr-layers-container" style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none'
            }}>
                {layers.map((layer, index) => (
                    <div
                        key={layer.id}
                        className="absolute will-change-transform"
                        style={{
                            left: 0,
                            top: 0,
                            width: `${layer.width}px`,
                            height: `${layer.height}px`,
                            transform: `translate3d(calc(${layer.x}cqw - 50%), calc(${layer.y}cqh - 50%), 0) rotate(${layer.rotation || 0}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
                            zIndex: layer.id === 'background-layer' ? 0 : (index + 1),
                            opacity: layer.opacity !== undefined ? layer.opacity / 100 : 1,
                            display: layer.isHidden ? 'none' : 'block',
                            visibility: layer.isHidden ? 'hidden' : 'visible',
                            position: 'absolute'
                        }}
                    >
                        {/* ========== FRAME LAYER ========== */}
                        {layer.type === 'frame' ? (
                            <div
                                className="w-full h-full overflow-hidden relative"
                                style={{
                                    width: `${layer.width}px`,
                                    height: `${layer.height}px`,
                                    clipPath: layer.frameProps?.clipPath,
                                    ...(layer.frameProps?.style && { ...layer.frameProps.style, border: undefined }),
                                    backgroundColor: layer.backgroundColor || '#f3f4f6',
                                    border: layer.borderWidth ? `${layer.borderWidth}px solid ${layer.borderColor || '#ffffff'}` : undefined
                                }}
                            >
                                {(layer.content || layer.placeholder) && (
                                    <img
                                        src={layer.content || layer.placeholder}
                                        alt=""
                                        className="w-full h-full pointer-events-none"
                                        style={{
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: '100%',
                                            transform: `scale(${layer.contentScale || 1}) translate(${(layer.contentX || 0) / (layer.width || 1) * 100}%, ${(layer.contentY || 0) / (layer.height || 1) * 100}%)`
                                        }}
                                        draggable={false}
                                    />
                                )}
                                {/* Overlays shared with Editor */}
                                {layer.frameProps?.frameStyle === 'paper' && layer.frameProps?.thumb && (
                                    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ backgroundImage: `url(${layer.frameProps.thumb})`, backgroundSize: '100% 100%', mixBlendMode: 'multiply', zIndex: 20 }} />
                                )}
                                {layer.frameProps?.frameStyle === 'film' && (
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 flex justify-around items-center px-1" style={{ height: '20px' }}>
                                            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />)}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-1" style={{ height: '20px' }}>
                                            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />)}
                                        </div>
                                    </div>
                                )}
                                {layer.frameProps?.frameStyle === 'browser' && (
                                    <div className="absolute pointer-events-none" style={{ top: '-30px', left: '12px', display: 'flex', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                                    </div>
                                )}
                                {/* Decorations */}
                                {(layer.frameProps?.frameStyle === 'phone' || layer.frameProps?.frameStyle === 'tablet') && (
                                    <>
                                        {layer.frameProps?.hasNotch && <div className="absolute pointer-events-none" style={{ top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '25px', background: '#1a1a1a', borderRadius: '0 0 12px 12px', zIndex: 10 }} />}
                                        {layer.frameProps?.hasButtons && (
                                            <>
                                                <div className="absolute pointer-events-none" style={{ top: '20%', right: '-14px', width: '5px', height: '40px', background: '#1a1a1a', borderRadius: '0 2px 2px 0' }} />
                                                <div className="absolute pointer-events-none" style={{ top: '18%', left: '-14px', width: '5px', height: '30px', background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
                                            </>
                                        )}
                                    </>
                                )}
                                {(layer.frameProps?.frameStyle === 'monitor' || layer.frameProps?.frameStyle === 'laptop') && (
                                    <div className="absolute pointer-events-none" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', width: '33%', height: '40px', background: '#9ca3af', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', marginTop: '-16px', zIndex: -1 }} />
                                )}
                            </div>

                            /* ========== TEXT LAYER ========== */
                        ) : layer.type === 'text' ? (
                            <div
                                style={{
                                    fontSize: `${layer.fontSize}px`,
                                    fontFamily: layer.fontFamily,
                                    fontWeight: layer.fontWeight,
                                    fontStyle: layer.fontStyle || 'normal',
                                    letterSpacing: `${layer.letterSpacing || 0}px`,
                                    backgroundColor: layer.backgroundColor || 'transparent',
                                    padding: layer.backgroundColor ? '4px 8px' : '0',
                                    borderRadius: layer.backgroundColor ? '4px' : '0',
                                    WebkitTextStroke: layer.stroke ? '1px black' : 'unset',
                                    color: layer.color === 'none' ? 'transparent' : layer.color,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {layer.content}
                            </div>

                            /* ========== FORM LAYER ========== */
                        ) : layer.type === 'form' ? (
                            <div
                                style={{
                                    width: `${layer.width}px`,
                                    height: `${layer.height}px`,
                                    background: layer.formData?.bg || '#fff',
                                    border: `1px solid ${layer.formData?.borderColor || '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                                    <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px', color: layer.formData?.textColor || '#1f2937' }}>{layer.formData?.name}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {layer.formData?.fields?.map((field, fIdx) => (
                                            <div key={fIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {field.type === 'label' && <p style={{ fontSize: '12px', fontWeight: 600, color: layer.formData?.textColor || '#374151' }}>{field.text}</p>}
                                                {(field.type === 'input' || field.type === 'textarea') && (
                                                    <div style={{ width: '100%', height: field.type === 'input' ? '40px' : '80px', borderRadius: '6px', border: `1px solid ${layer.formData?.borderColor || '#e5e7eb'}`, background: 'rgba(255,255,255,0.5)', padding: '8px 12px', fontSize: '14px', color: '#9ca3af' }}>{field.label || ''}</div>
                                                )}
                                                {(field.type === 'radio' || field.type === 'checkbox') && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {field.options?.map((opt, oIdx) => (
                                                            <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                                                                <div style={{ width: '16px', height: '16px', borderRadius: field.type === 'radio' ? '50%' : '2px', border: '1px solid #d1d5db' }} />
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {layer.formData?.buttonText && <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', background: layer.formData?.buttonStyle?.bg || '#1f2937', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{layer.formData.buttonText}</div>}
                                </div>
                            </div>

                            /* ========== LOTTIE / GIF / SHAPE / IMAGE ========== */
                        ) : (
                            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                {layer.type === 'lottie' || layer.type === 'gif' ? (
                                    <img src={layer.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
                                ) : layer.shapeType === 'icon' ? (
                                    (() => {
                                        const IconCmp = LucideIcons[layer.content] || LucideIcons.HelpCircle;
                                        return <IconCmp style={{ width: '100%', height: '100%', color: layer.color }} />;
                                    })()
                                ) : layer.shapeType === 'image' ? (
                                    <img
                                        src={layer.content}
                                        alt=""
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            transform: layer.id !== 'background-layer' ? `scale(${layer.contentScale || 1}) translate(${(layer.contentX || 0) / (layer.width || 1) * 100}%, ${(layer.contentY || 0) / (layer.height || 1) * 100}%)` : undefined,
                                            ...(layer.id === 'background-layer' && adjustments ? {
                                                filter: `brightness(${adjustments.brightness || 100}%) contrast(${adjustments.contrast || 100}%) saturate(${adjustments.saturation || 100}%) blur(${adjustments.blur || 0}px) grayscale(${adjustments.grayscale || 0}%) sepia(${adjustments.sepia || 0}%) hue-rotate(${adjustments.hue || 0}deg) invert(${adjustments.invert || 0}%)`
                                            } : {})
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%', background: layer.color,
                                        borderRadius: layer.shapeType === 'circle' ? '50%' : layer.shapeType === 'square-rounded' ? '20%' : '0'
                                    }} />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .slide-renderer-root {
                    user-select: none;
                    background-size: cover;
                    background-position: center;
                }
                .absolute { position: absolute; }
                .w-full { width: 100%; }
                .h-full { height: 100%; }
                .overflow-hidden { overflow: hidden; }
                .pointer-events-none { pointer-events: none; }
                .inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .relative { position: relative; }
            `}</style>
        </div>
    );
};

export default SlideRenderer;
