import React, { useRef, useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import lottie from 'lottie-web';

const { ChevronLeft, ChevronRight, Plus } = LucideIcons;

export const TemplateCategory = ({ category, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -200 : 200;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="animate-fadeIn relative group/category">
            <div className="flex items-center justify-between mb-2">
                <h5 className={`text-[9px] font-bold uppercase ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{category}</h5>
                <button className="text-[9px] hover:underline opacity-60">See all</button>
            </div>
            <div className="relative">
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -ml-3`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((tpl, i) => (
                        <button
                            key={i}
                            onClick={() => onAdd(tpl)}
                            className={`flex-none w-[120px] aspect-[3/2] rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center group relative overflow-hidden snap-start ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:border-purple-500/50' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}
                            style={{ backgroundColor: tpl.style.bg || 'transparent' }}
                        >
                            <span
                                style={{
                                    fontFamily: tpl.style.font,
                                    fontWeight: tpl.style.weight,
                                    fontSize: `${Math.min(20, tpl.style.size * 0.6)}px`,
                                    color: tpl.style.stroke ? 'transparent' : (tpl.style.bg ? (tpl.style.color || '#fff') : (darkMode ? '#fff' : (tpl.style.color || '#000'))),
                                    fontStyle: tpl.style.italic ? 'italic' : 'normal',
                                    letterSpacing: tpl.style.spacing ? `${tpl.style.spacing}px` : 'normal',
                                    WebkitTextStroke: tpl.style.stroke ? `1px ${darkMode ? '#fff' : '#0f172a'}` : 'none',
                                    lineHeight: 1.1
                                }}
                                className="pointer-events-none z-10"
                            >
                                {tpl.name}
                            </span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-opacity ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} -mr-3`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const ThreeDCategory = ({ sub, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -200 : 200;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-8 animate-fadeIn relative group/category">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} text-purple-500 shadow-sm`}>
                        {sub.icon}
                    </div>
                    <h4 className={`text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sub.title}
                    </h4>
                </div>
                <button className="text-[10px] text-purple-600 font-bold hover:underline opacity-60">See all</button>
            </div>

            <div className="relative">
                <button
                    onClick={() => scroll('left')}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'} -ml-2 border border-gray-100 dark:border-gray-700`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items && items.map((rawItem, i) => {
                        const isString = typeof rawItem === 'string';
                        const item = isString ? { thumb: rawItem, title: 'Element' } : rawItem;
                        const url = item.thumb;
                        const aspectRatio = item.aspectRatio || 1;

                        return (
                            <div key={i} className="flex-none w-[100px] flex flex-col items-center gap-2 group/item snap-start">
                                <button
                                    onClick={() => onAdd(item)}
                                    className="w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-center p-2.5 relative overflow-hidden shadow-sm hover:shadow-md active:scale-95"
                                    draggable={true}
                                    onDragStart={(e) => {
                                        if (isString) {
                                            e.dataTransfer.setData('text/plain', rawItem);
                                        } else {
                                            e.dataTransfer.setData('application/json', JSON.stringify(rawItem));
                                            e.dataTransfer.setData('text/plain', item.thumb);
                                        }
                                        const dragImg = new Image();
                                        dragImg.src = url || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                        e.dataTransfer.setDragImage(dragImg, 0, 0);
                                    }}
                                >
                                    {url && !['paper', 'Paper'].includes(item.frameStyle) ? (
                                        <img
                                            src={url}
                                            alt={item.title}
                                            className="w-full h-full pointer-events-none transition-transform group-hover/item:scale-110"
                                            style={{ clipPath: item.clipPath || 'none', objectFit: 'contain', ...(item.style || {}) }}
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                            <div
                                                className="bg-gray-400 dark:bg-gray-600 group-hover/item:bg-purple-500 transition-colors relative"
                                                style={{
                                                    clipPath: item.clipPath,
                                                    ...(item.style || {}),
                                                    width: aspectRatio > 1 ? '85%' : `${85 * aspectRatio}%`,
                                                    height: aspectRatio > 1 ? `${85 / aspectRatio}%` : '85%',
                                                    borderWidth: item.style?.border ? '1.5px' : '0',
                                                    borderRadius: item.style?.borderRadius ? (parseInt(item.style.borderRadius, 10) / 6) + 'px' : '4px',
                                                    borderTopWidth: item.style?.borderTop ? '5px' : undefined,
                                                    borderBottomWidth: item.style?.borderBottomWidth ? '3px' : undefined,
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                {item.frameStyle === 'browser' && (
                                                    <div className="absolute top-[-4px] left-0.5 flex gap-0.5 scale-[0.3] origin-top-left">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
                                                    </div>
                                                )}
                                                {item.frameStyle === 'paper' && item.thumb && (
                                                    <div
                                                        className="absolute inset-0 w-full h-full pointer-events-none z-20"
                                                        style={{
                                                            backgroundImage: `url(${item.thumb})`,
                                                            backgroundSize: '100% 100%',
                                                            backgroundPosition: 'center',
                                                            mixBlendMode: 'multiply'
                                                        }}
                                                    />
                                                )}

                                                {(item.frameStyle === 'phone' || item.frameStyle === 'tablet') && (
                                                    <>
                                                        {item.hasNotch && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[8%] bg-[#1a1a1a] rounded-b-[1px]" />}
                                                        {item.hasHolePunch && <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[6%] h-[6%] bg-[#1a1a1a] rounded-full shadow-inner" />}
                                                        {item.hasButtons && (
                                                            <>
                                                                <div className="absolute top-[20%] right-[-2px] w-[2px] h-[15%] bg-[#1a1a1a] rounded-r-[1px]" />
                                                                <div className="absolute top-[18%] left-[-2px] w-[2px] h-[10%] bg-[#1a1a1a] rounded-l-[1px]" />
                                                                <div className="absolute top-[30%] left-[-2px] w-[2px] h-[10%] bg-[#1a1a1a] rounded-l-[1px]" />
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {item.frameStyle === 'watch' && item.hasCrown && (
                                                    <div className="absolute top-[30%] right-[-2.5px] w-[2.5px] h-[15%] bg-[#222] rounded-r-[1px]" />
                                                )}
                                                {(item.frameStyle === 'monitor' || item.frameStyle === 'laptop') && (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1/3 h-[10%] bg-gray-400 dark:bg-gray-600 pointer-events-none" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', marginTop: item.frameStyle === 'laptop' ? '-5%' : '-8%', zIndex: -1 }} />
                                                )}
                                                {item.frameStyle === 'laptop' && (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[120%] h-[5%] bg-[#222] pointer-events-none -mt-[2%] rounded-[1px]" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)' }}>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-full bg-[#111] rounded-b-[1px] opacity-50" />
                                                    </div>
                                                )}
                                                {item.frameStyle === 'browser' && (
                                                    <div className="absolute top-[5%] left-[5%] flex gap-[2px]">
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#ff5f56]" />
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#ffbd2e]" />
                                                        <div className="w-[3px] h-[3px] rounded-full bg-[#27c93f]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/item:bg-purple-600/5 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                                        <Plus className="w-5 h-5 text-purple-600 drop-shadow-sm" />
                                    </div>
                                </button>
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-bold truncate w-full text-center px-1">
                                    {item.title || 'Element'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full shadow-lg opacity-0 group-hover/category:opacity-100 transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'} -mr-2 border border-gray-100 dark:border-gray-700`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const LottiePreview = ({ item, url }) => {
    const container = useRef(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const targetUrl = item?.url || url;
        const isActuallyGif = (item?.type === 'gif') || (targetUrl && (targetUrl.endsWith('.gif') || targetUrl.includes('flaticon.com')));

        if (!container.current || !targetUrl || isActuallyGif) return;

        let anim = null;
        let isCancelled = false;

        const loadLottie = () => {
            setStatus('loading');
            try {
                if (isCancelled) return;

                anim = lottie.loadAnimation({
                    container: container.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: targetUrl,
                    rendererSettings: {
                        preserveAspectRatio: 'xMidYMid meet'
                    }
                });

                anim.addEventListener('DOMLoaded', () => {
                    if (!isCancelled) setStatus('success');
                });

                anim.addEventListener('data_failed', () => {
                    if (!isCancelled) setStatus('failed');
                });

                anim.addEventListener('error', () => {
                    if (!isCancelled) setStatus('failed');
                });
            } catch (error) {
                if (!isCancelled) setStatus('failed');
            }
        };

        loadLottie();

        return () => {
            isCancelled = true;
            if (anim) anim.destroy();
        };
    }, [item?.url, url, item?.type]);

    const targetUrl = item?.url || url;
    const isActuallyGif = (item?.type === 'gif') || (targetUrl && (targetUrl.endsWith('.gif') || targetUrl.includes('flaticon.com')));

    const renderFallback = () => {
        const targetTitle = item?.title || 'Animation';

        if (isActuallyGif) {
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={targetUrl}
                        alt={targetTitle}
                        className="relative z-10 w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        loading="eager"
                        onError={() => setStatus('failed')}
                    />
                </div>
            );
        }

        if (item?.type === 'noto') {
            return (
                <img
                    src={item.fallback}
                    alt={item.title}
                    className="w-full h-full object-contain p-2"
                />
            );
        }

        if ((item?.type === 'lordicon' || item?.type === 'local-arrow') && item.fallbackIcon) {
            const IconComponent = LucideIcons[item.fallbackIcon] || LucideIcons.HelpCircle;
            return <IconComponent className="w-8 h-8 text-gray-300 dark:text-gray-600" />;
        }

        return <LucideIcons.Sparkles className="w-8 h-8 text-gray-200" />;
    };

    if (isActuallyGif) {
        return (
            <div className="w-full h-full relative flex items-center justify-center p-1 overflow-hidden">
                <img
                    src={targetUrl}
                    alt={item?.title || 'GIF Animation'}
                    className="relative z-10 w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={() => setStatus('failed')}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            {status !== 'success' && (
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${status === 'success' ? 'opacity-0' : 'opacity-100'}`}>
                    {renderFallback()}
                </div>
            )}

            <div
                ref={container}
                className={`w-full h-full transition-opacity duration-300 z-10 ${status === 'failed' ? 'opacity-0' : 'opacity-100'}`}
            />

            {status === 'loading' && (
                <div className="absolute top-1 right-1">
                    <LucideIcons.Loader2 className="w-3 h-3 text-purple-500 animate-spin opacity-20" />
                </div>
            )}
        </div>
    );
};

export const LottieCategory = ({ sub, items, onAdd, darkMode }) => {
    const scrollRef = useRef(null);
    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 240;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="mb-6 group/cat">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                        {sub.icon}
                    </div>
                    <h4 className={`text-xs font-bold tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {sub.title}
                    </h4>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                    <button onClick={() => scroll('left')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => onAdd(item)}
                        title={item.title}
                        className={`flex-shrink-0 w-24 aspect-square relative flex items-center justify-center rounded-2xl ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-white'} border-2 border-transparent hover:border-purple-500/30 transition-all group overflow-hidden shadow-sm hover:shadow-md`}
                    >
                        <div className="w-full h-full p-2 pointer-events-none">
                            <LottiePreview item={item} />
                        </div>
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-1 right-1 p-1 bg-purple-500 text-white rounded-lg scale-0 group-hover:scale-100 transition-transform shadow-lg z-20">
                            <Plus className="w-3 h-3" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
