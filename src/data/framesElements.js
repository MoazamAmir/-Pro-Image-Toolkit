// Helper for standard placeholder

export const framesElements = {
    'Basic shapes': [
        {
            id: 'circle',
            type: 'frame',
            shapeType: 'basic',
            title: 'Circle',
            clipPath: 'circle(50% at 50% 50%)',
            thumb: null
        },
        {
            id: 'square',
            type: 'frame',
            shapeType: 'basic',
            title: 'Square',
            clipPath: 'inset(0% 0% 0% 0%)',
            thumb: null
        },
        {
            id: 'vintage-rect',
            type: 'frame',
            shapeType: 'basic',
            title: 'Vintage Rect',
            clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
            thumb: null
        },
        {
            id: 'hexagon-h',
            type: 'frame',
            shapeType: 'basic',
            title: 'Hexagon H',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            thumb: null
        },
        {
            id: 'badge',
            type: 'frame',
            shapeType: 'basic',
            title: 'Badge',
            clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%)',
            thumb: null
        },
        {
            id: 'ticket',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ticket',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 60%, 10% 50%, 0% 40%)',
            thumb: null
        },
        {
            id: 'shield',
            type: 'frame',
            shapeType: 'basic',
            title: 'Shield',
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
            thumb: null
        },
        {
            id: 'plaque',
            type: 'frame',
            shapeType: 'basic',
            title: 'Plaque',
            clipPath: 'polygon(15% 0, 85% 0, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
            thumb: null
        },
        {
            id: 'tag',
            type: 'frame',
            shapeType: 'basic',
            title: 'Tag',
            clipPath: 'polygon(20% 0, 80% 0, 100% 50%, 80% 100%, 20% 100%, 0 50%)',
            thumb: null
        },
        {
            id: 'ribbon',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ribbon',
            clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%, 15% 50%)',
            thumb: null
        },
        {
            id: 'ornate-1',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ornate',
            clipPath: 'polygon(10% 0, 90% 0, 100% 20%, 90% 50%, 100% 80%, 90% 100%, 10% 100%, 0 80%, 10% 50%, 0 20%)',
            thumb: null
        },
        {
            id: 'star',
            type: 'frame',
            shapeType: 'basic',
            title: 'Star',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            thumb: null
        },
        {
            id: 'cross',
            type: 'frame',
            shapeType: 'basic',
            title: 'Cross',
            clipPath: 'polygon(20% 0, 80% 0, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0 80%, 0 20%, 20% 20%)',
            thumb: null
        }
    ],
    // For complex frames (Devices/Film), we will use simple rects for now but marked as 'frame' so they have potential for future overlay support
    'Devices': [
        {
            id: 'phone-notch-modern',
            type: 'frame',
            frameStyle: 'phone',
            hasNotch: true,
            hasButtons: true,
            title: 'Phone (Notch)',
            aspectRatio: 9 / 16,
            style: { borderRadius: '45px', border: '14px solid #1a1a1a', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'phone-hole-modern',
            type: 'frame',
            frameStyle: 'phone',
            hasHolePunch: true,
            hasButtons: true,
            title: 'Phone (Hole)',
            aspectRatio: 9 / 19.5,
            style: { borderRadius: '40px', border: '10px solid #1a1a1a', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'tablet-pro-v',
            type: 'frame',
            frameStyle: 'tablet',
            hasButtons: true,
            title: 'Tablet',
            aspectRatio: 3 / 4,
            style: { borderRadius: '24px', border: '18px solid #1a1a1a', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'smartwatch-v',
            type: 'frame',
            frameStyle: 'watch',
            hasCrown: true,
            title: 'Watch',
            aspectRatio: 4 / 5,
            style: { borderRadius: '35px', border: '12px solid #1a1a1a', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'monitor-vector-pro',
            type: 'frame',
            frameStyle: 'monitor',
            title: 'Desktop',
            aspectRatio: 16 / 9,
            style: { borderRadius: '12px', border: '12px solid #333', borderBottomWidth: '45px', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'laptop-vector-pro',
            type: 'frame',
            frameStyle: 'laptop',
            title: 'Laptop Pro',
            aspectRatio: 16 / 10,
            style: { borderRadius: '14px', border: '12px solid #1a1a1a', borderBottomWidth: '24px', backgroundColor: '#000' },
            thumb: null
        },
        {
            id: 'browser-light-v',
            type: 'frame',
            frameStyle: 'browser',
            browserColor: '#f3f4f6',
            controlsColor: 'dark',
            title: 'Browser Light',
            aspectRatio: 4 / 3,
            style: { borderRadius: '10px', borderTop: '36px solid #f3f4f6', borderLeft: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', backgroundColor: '#fff' },
            thumb: null
        },
        {
            id: 'browser-dark-v',
            type: 'frame',
            frameStyle: 'browser',
            browserColor: '#1f2937',
            title: 'Browser Dark',
            aspectRatio: 16 / 9,
            style: { borderRadius: '10px', borderTop: '36px solid #1f2937', borderLeft: '1px solid #111827', borderRight: '1px solid #111827', borderBottom: '1px solid #111827', backgroundColor: '#fff' },
            thumb: null
        }
    ],

    // Add this to your existing framesElements object
    // Add this to your existing framesElements object
    'Paper': [
        {
            id: 'paper-circle',
            type: 'frame',
            shapeType: 'basic',
            title: 'Circle Paper',
            clipPath: 'circle(50% at 50% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle, #fde047 0%, #f97316 100%)', // vibrant yellow-orange
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-landscape-1',
            type: 'frame',
            shapeType: 'basic',
            title: 'Landscape 1',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.5,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%)', // purple-blue
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-landscape-2',
            type: 'frame',
            shapeType: 'basic',
            title: 'Landscape 2',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.5,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to right, #4ade80, #0ed7b5)', // green-teal
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-portrait-1',
            type: 'frame',
            shapeType: 'basic',
            title: 'Portrait 1',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 0.67,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to bottom, #fb7185, #d946ef)', // rose-fuchsia
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-portrait-2',
            type: 'frame',
            shapeType: 'basic',
            title: 'Portrait 2',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 0.67,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(45deg, #22d3ee, #818cf8)', // cyan-indigo
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-torn-top',
            type: 'frame',
            shapeType: 'basic',
            title: 'Torn Top',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'repeating-linear-gradient(45deg, #fef3c7, #fef3c7 10px, #fde68a 10px, #fde68a 20px)', // striped yellow
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-torn-bottom',
            type: 'frame',
            shapeType: 'basic',
            title: 'Torn Bottom',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'conic-gradient(from 180deg at 50% 50%, #86efac, #3b82f6, #9333ea, #86efac)', // rainbow conic
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-torn-left',
            type: 'frame',
            shapeType: 'basic',
            title: 'Torn Left',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle at top right, #f472b6, #db2777)', // pink radial
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-torn-right',
            type: 'frame',
            shapeType: 'basic',
            title: 'Torn Right',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to left, #fb923c, #ea580c)', // orange linear
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-heart',
            type: 'frame',
            shapeType: 'basic',
            title: 'Heart',
            clipPath: 'polygon(50% 20%, 60% 40%, 80% 40%, 70% 60%, 50% 80%, 30% 60%, 20% 40%, 40% 40%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle at center, #fca5a5, #ef4444)', // soft red
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-star',
            type: 'frame',
            shapeType: 'basic',
            title: 'Star',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle, #fcd34d 0%, #d97706 80%)', // golden yellow
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-cloud',
            type: 'frame',
            shapeType: 'basic',
            title: 'Cloud',
            clipPath: 'polygon(50% 0%, 60% 20%, 80% 20%, 70% 40%, 50% 60%, 30% 40%, 20% 20%, 40% 20%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to bottom, #dbeafe, #60a5fa)', // sky blue
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-oval',
            type: 'frame',
            shapeType: 'basic',
            title: 'Oval',
            clipPath: 'ellipse(50% 50% at 50% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.2,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', // soft pastel
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-arch',
            type: 'frame',
            shapeType: 'basic',
            title: 'Arch',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', // silver/white
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-rectangle-rounded',
            type: 'frame',
            shapeType: 'basic',
            title: 'Rounded Rectangle',
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.5,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // vibrant cyan
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-triangle',
            type: 'frame',
            shapeType: 'basic',
            title: 'Triangle',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to bottom, #84fab0 0%, #8fd3f4 100%)', // mint green
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-diamond',
            type: 'frame',
            shapeType: 'basic',
            title: 'Diamond',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // pink to yellow
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-hexagon',
            type: 'frame',
            shapeType: 'basic',
            title: 'Hexagon',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to bottom, #a18cd1 0%, #fbc2eb 100%)', // lavender
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-octagon',
            type: 'frame',
            shapeType: 'basic',
            title: 'Octagon',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // metallic white
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-pentagon',
            type: 'frame',
            shapeType: 'basic',
            title: 'Pentagon',
            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)', // light blue
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-blob',
            type: 'frame',
            shapeType: 'basic',
            title: 'Blob',
            clipPath: 'polygon(20% 10%, 80% 10%, 90% 40%, 70% 60%, 50% 80%, 30% 60%, 10% 40%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle at 30% 30%, #5ee7df 0%, #b490ca 100%)', // teal-purple
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-ribbon',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ribbon',
            clipPath: 'polygon(0% 0%, 100% 0%, 85% 50%, 100% 100%, 0% 100%, 15% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.5,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', // peach
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-tag',
            type: 'frame',
            shapeType: 'basic',
            title: 'Tag',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)', // warm pastel
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-badge',
            type: 'frame',
            shapeType: 'basic',
            title: 'Badge',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', // orange-yellow
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-shield',
            type: 'frame',
            shapeType: 'basic',
            title: 'Shield',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 0.8,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)', // deep ocean
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-ticket',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ticket',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 60%, 10% 50%, 0% 40%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1.5,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'repeating-linear-gradient(90deg, #e5e5f7, #e5e5f7 10px, #ffffff 10px, #ffffff 20px)', // ticket stripes
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-plaque',
            type: 'frame',
            shapeType: 'basic',
            title: 'Plaque',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to top, #cd9cf2 0%, #f6f3ff 100%)', // soft purple
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-cross',
            type: 'frame',
            shapeType: 'basic',
            title: 'Cross',
            clipPath: 'polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)', // complex red-pink
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        },
        {
            id: 'paper-ornate',
            type: 'frame',
            shapeType: 'basic',
            title: 'Ornate',
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 20%, 90% 50%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 10% 50%, 0% 20%)',
            frameStyle: 'paper',
            thumb: 'https://i.imgur.com/7Y3zX9v.png',
            aspectRatio: 1,
            style: {
                backgroundColor: 'transparent',
                backgroundImage: 'radial-gradient(circle, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // soft pink
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply'
            }
        }
    ]
};

// Fill remaining categories with simple placeholder frames to prevent crashes
// Specific definitions for Film and Photos category
framesElements['Film and photo'] = [
    {
        id: 'polaroid-classic',
        type: 'frame',
        frameStyle: 'polaroid',
        shapeType: 'basic',
        title: 'Classic Polaroid',
        style: {
            backgroundColor: '#ffffff',
            border: '12px solid #ffffff',
            borderBottomWidth: '45px',
            boxShadow: '0 8px 15px rgba(0,0,0,0.2)'
        },
        thumb: null
    },
    {
        id: 'polaroid-taped',
        type: 'frame',
        frameStyle: 'polaroid',
        hasTape: true,
        shapeType: 'basic',
        title: 'Taped Polaroid',
        style: {
            backgroundColor: '#ffffff',
            border: '10px solid #ffffff',
            borderBottomWidth: '40px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
        },
        thumb: null
    },
    {
        id: 'polaroid-black',
        type: 'frame',
        frameStyle: 'polaroid',
        shapeType: 'basic',
        title: 'Black Polaroid',
        style: {
            backgroundColor: '#1a1a1a',
            border: '12px solid #1a1a1a',
            borderBottomWidth: '45px',
            boxShadow: '0 8px 15px rgba(0,0,0,0.3)'
        },
        thumb: null
    },
    {
        id: 'film-strip-h',
        type: 'frame',
        frameStyle: 'film',
        orientation: 'horizontal',
        shapeType: 'basic',
        title: 'Film Strip H',
        style: {
            backgroundColor: '#000',
            borderTop: '20px solid #000',
            borderBottom: '20px solid #000',
            borderLeft: '5px solid #000',
            borderRight: '5px solid #000'
        },
        thumb: null
    },
    {
        id: 'film-strip-v',
        type: 'frame',
        frameStyle: 'film',
        orientation: 'vertical',
        shapeType: 'basic',
        title: 'Film Strip V',
        style: {
            backgroundColor: '#000',
            borderLeft: '20px solid #000',
            borderRight: '20px solid #000',
            borderTop: '5px solid #000',
            borderBottom: '5px solid #000'
        },
        thumb: null
    },
    {
        id: 'vintage-gold',
        type: 'frame',
        shapeType: 'basic',
        title: 'Luxury Gold',
        style: {
            border: '15px solid #d4af37',
            outline: '2px solid #b8860b',
            outlineOffset: '-5px',
            backgroundColor: '#fff',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
        },
        thumb: null
    },
    {
        id: 'photo-corner-v2',
        type: 'frame',
        shapeType: 'basic',
        title: 'Antique Photo',
        style: {
            backgroundColor: '#fdfbf7',
            border: '15px solid #fff',
            boxShadow: '0 0 0 1px #e0d8c0, 0 5px 15px rgba(0,0,0,0.1)'
        },
        thumb: null
    }
];



// Fill remaining categories with simple placeholder frames to prevent crashes
// Flowers Category
framesElements['Flowers'] = [
    { id: 'flower-1', title: 'Daisy', clipPath: 'polygon(50% 0%, 60% 30%, 90% 20%, 70% 50%, 90% 80%, 60% 70%, 50% 100%, 40% 70%, 10% 80%, 30% 50%, 10% 20%, 40% 30%)', style: { backgroundImage: 'radial-gradient(circle, #fbc2eb 0%, #a6c1ee 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-2', title: 'Sunflower', clipPath: 'polygon(50% 10%, 60% 35%, 85% 35%, 65% 55%, 75% 85%, 50% 65%, 25% 85%, 35% 55%, 15% 35%, 40% 35%)', style: { backgroundImage: 'radial-gradient(circle, #f6d365 0%, #fda085 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-3', title: 'Lotus', clipPath: 'polygon(50% 0%, 70% 40%, 100% 40%, 80% 60%, 90% 100%, 50% 80%, 10% 100%, 20% 60%, 0% 40%, 30% 40%)', style: { backgroundImage: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-4', title: 'Tulip', clipPath: 'polygon(20% 0%, 50% 20%, 80% 0%, 80% 100%, 20% 100%)', style: { backgroundImage: 'linear-gradient(to top, #ff0844 0%, #ffb199 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-5', title: 'Rose', clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)', style: { backgroundImage: 'radial-gradient(circle, #ffdde1 0%, #ee9ca7 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-6', title: 'Lily', clipPath: 'polygon(50% 0%, 65% 35%, 100% 35%, 75% 55%, 85% 90%, 50% 70%, 15% 90%, 25% 55%, 0% 35%, 35% 35%)', style: { backgroundImage: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-7', title: 'Orchid', clipPath: 'polygon(50% 0%, 90% 30%, 70% 60%, 90% 90%, 50% 80%, 10% 90%, 30% 60%, 10% 30%)', style: { backgroundImage: 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-8', title: 'Simple 5', clipPath: 'polygon(50% 0%, 65% 30%, 100% 30%, 75% 60%, 85% 100%, 50% 75%, 15% 100%, 25% 60%, 0% 30%, 35% 30%)', style: { backgroundImage: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-9', title: 'Simple 8', clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', style: { backgroundImage: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-10', title: 'Blossom', clipPath: 'polygon(50% 10%, 70% 10%, 90% 30%, 90% 50%, 70% 70%, 90% 90%, 70% 90%, 50% 70%, 30% 90%, 10% 90%, 30% 70%, 10% 50%, 10% 30%, 30% 10%)', style: { backgroundImage: 'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-11', title: 'Petal Ring', clipPath: 'polygon(50% 0%, 60% 20%, 80% 10%, 80% 30%, 100% 40%, 80% 60%, 90% 80%, 70% 80%, 60% 100%, 40% 100%, 30% 80%, 10% 80%, 20% 60%, 0% 40%, 20% 30%, 20% 10%, 40% 20%)', style: { backgroundImage: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-12', title: 'Sunburst', clipPath: 'polygon(50% 0%, 60% 30%, 80% 0%, 70% 40%, 100% 20%, 80% 50%, 100% 80%, 70% 70%, 80% 100%, 50% 80%, 20% 100%, 30% 70%, 0% 80%, 20% 50%, 0% 20%, 30% 40%, 20% 0%, 40% 30%)', style: { backgroundImage: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-13', title: 'Clover', clipPath: 'polygon(50% 50%, 50% 0%, 75% 0%, 100% 25%, 100% 50%, 75% 75%, 50% 50%, 75% 75%, 50% 100%, 25% 75%, 50% 50%, 25% 75%, 0% 50%, 0% 25%, 25% 0%, 50% 0%)', style: { backgroundImage: 'linear-gradient(to right, #0ba360 0%, #3cba92 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-14', title: 'Sharp Petals', clipPath: 'polygon(50% 0%, 55% 40%, 90% 10%, 60% 50%, 90% 90%, 50% 60%, 10% 90%, 40% 50%, 10% 10%, 45% 40%)', style: { backgroundImage: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)', mixBlendMode: 'multiply' } },
    { id: 'flower-15', title: 'Soft Flower', clipPath: 'circle(50% at 50% 50%)', style: { backgroundImage: 'radial-gradient(circle, #ffecd2 0%, #fcb69f 100%)', mixBlendMode: 'multiply' } } // Fallback to circle for variety
].map(item => ({ ...item, type: 'frame', frameStyle: 'paper', thumb: 'https://i.imgur.com/7Y3zX9v.png', aspectRatio: 1, style: { ...item.style, backgroundColor: 'transparent', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' } }));

// Blob Category
framesElements['Blob'] = [
    { id: 'blob-1', title: 'Organic 1', clipPath: 'polygon(30% 10%, 70% 10%, 90% 30%, 90% 70%, 70% 90%, 30% 90%, 10% 70%, 10% 30%)', style: { backgroundImage: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' } },
    { id: 'blob-2', title: 'Organic 2', clipPath: 'polygon(20% 20%, 80% 10%, 90% 50%, 70% 90%, 30% 80%, 10% 50%)', style: { backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' } },
    { id: 'blob-3', title: 'Fluid', clipPath: 'polygon(10% 30%, 40% 10%, 80% 20%, 90% 60%, 60% 90%, 20% 80%)', style: { backgroundImage: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' } },
    { id: 'blob-4', title: 'Splat', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)', style: { backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' } },
    { id: 'blob-5', title: 'Droplet', clipPath: 'polygon(50% 0%, 100% 60%, 80% 100%, 20% 100%, 0% 60%)', style: { backgroundImage: 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)' } },
    { id: 'blob-6', title: 'Wobbly', clipPath: 'polygon(30% 0%, 70% 10%, 100% 30%, 90% 70%, 70% 100%, 30% 90%, 0% 70%, 10% 30%)', style: { backgroundImage: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)' } },
    { id: 'blob-7', title: 'Irregular', clipPath: 'polygon(10% 10%, 90% 20%, 80% 90%, 20% 80%)', style: { backgroundImage: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)' } },
    { id: 'blob-8', title: 'Bean', clipPath: 'polygon(30% 20%, 70% 20%, 90% 50%, 70% 80%, 30% 80%, 10% 50%)', style: { backgroundImage: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' } },
    { id: 'blob-9', title: 'Cloudy', clipPath: 'polygon(20% 30%, 40% 10%, 60% 30%, 80% 10%, 90% 40%, 100% 70%, 80% 90%, 50% 80%, 20% 90%, 10% 70%, 0% 40%)', style: { backgroundImage: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)' } },
    { id: 'blob-10', title: 'Stretch', clipPath: 'polygon(0% 20%, 100% 20%, 90% 80%, 10% 80%)', style: { backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' } },
    { id: 'blob-11', title: 'Melt', clipPath: 'polygon(10% 0%, 90% 0%, 100% 60%, 90% 90%, 70% 100%, 50% 90%, 30% 100%, 10% 90%, 0% 60%)', style: { backgroundImage: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' } },
    { id: 'blob-12', title: 'Soft Box', clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)', style: { backgroundImage: 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)' } },
    { id: 'blob-13', title: 'Puddle', clipPath: 'polygon(20% 20%, 80% 20%, 90% 60%, 70% 90%, 30% 90%, 10% 60%)', style: { backgroundImage: 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)' } },
    { id: 'blob-14', title: 'Splatter', clipPath: 'polygon(40% 0%, 60% 0%, 80% 20%, 100% 40%, 80% 80%, 60% 100%, 40% 100%, 20% 80%, 0% 40%, 20% 20%)', style: { backgroundImage: 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)' } },
    { id: 'blob-15', title: 'Amoeba', clipPath: 'polygon(30% 10%, 60% 0%, 90% 20%, 100% 50%, 90% 80%, 60% 100%, 30% 90%, 0% 60%, 10% 30%)', style: { backgroundImage: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)' } }
].map(item => ({ ...item, type: 'frame', frameStyle: 'paper', thumb: 'https://i.imgur.com/7Y3zX9v.png', aspectRatio: 1, style: { ...item.style, backgroundColor: 'transparent', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' } }));

// Retro Category
framesElements['Retro'] = [
    { id: 'retro-1', title: 'TV Screen', clipPath: 'polygon(5% 0%, 95% 0%, 100% 10%, 100% 90%, 95% 100%, 5% 100%, 0% 90%, 0% 10%)', style: { backgroundImage: 'linear-gradient(to top, #c79081 0%, #dfa579 100%)' } },
    { id: 'retro-2', title: 'Arch Window', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 50% 20%, 100% 50%)', style: { backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' } }, // Actually that path is weird, let's fix: Arch
    { id: 'retro-3', title: 'Pill', clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)', style: { backgroundImage: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)' } }, // Hex-pill
    { id: 'retro-4', title: 'Diamond Split', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', style: { backgroundImage: 'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)' } },
    { id: 'retro-5', title: 'Ticket Stub', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 75% 90%, 50% 100%, 25% 90%, 0% 100%)', style: { backgroundImage: 'linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%)' } },
    { id: 'retro-6', title: 'Stamp', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 5%, 95% 5%, 95% 95%, 5% 95%)', style: { backgroundImage: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' } }, // Frame in frame
    { id: 'retro-7', title: 'Polaroid Simple', clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 100% 100%, 0% 100%, 0% 85%)', style: { backgroundImage: 'linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)' } },
    { id: 'retro-8', title: 'Film Cell', clipPath: 'polygon(0% 10%, 10% 10%, 10% 0%, 20% 0%, 20% 10%, 30% 10%, 30% 0%, 40% 0%, 40% 10%, 50% 10%, 50% 0%, 60% 0%, 60% 10%, 70% 10%, 70% 0%, 80% 0%, 80% 10%, 90% 10%, 90% 0%, 100% 0%, 100% 100%, 0% 100%)', style: { backgroundImage: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' } },
    { id: 'retro-9', title: 'Notch Corner', clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)', style: { backgroundImage: 'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)' } },
    { id: 'retro-10', title: 'Chevron', clipPath: 'polygon(0% 0%, 50% 20%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)', style: { backgroundImage: 'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)' } },
    { id: 'retro-11', title: 'Banner', clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)', style: { backgroundImage: 'linear-gradient(to top, #9be15d 0%, #00e3ae 100%)' } },
    { id: 'retro-12', title: 'Speech', clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 60% 80%, 50% 100%, 40% 80%, 0% 80%)', style: { backgroundImage: 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)' } },
    { id: 'retro-13', title: 'Burst', clipPath: 'polygon(50% 0%, 60% 20%, 80% 0%, 70% 40%, 100% 20%, 80% 60%, 100% 80%, 70% 80%, 50% 100%, 30% 80%, 0% 80%, 20% 60%, 0% 20%, 30% 40%, 20% 0%, 40% 20%)', style: { backgroundImage: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' } },
    { id: 'retro-14', title: 'Shield Simple', clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)', style: { backgroundImage: 'linear-gradient(to top, #cc208e 0%, #6713d2 100%)' } },
    { id: 'retro-15', title: 'Window 4', clipPath: 'polygon(0% 0%, 45% 0%, 45% 45%, 0% 45%, 0% 55%, 45% 55%, 45% 100%, 55% 100%, 55% 55%, 100% 55%, 100% 45%, 55% 45%, 55% 0%, 100% 0%, 100% 100%, 0% 100%)', style: { backgroundImage: 'linear-gradient(to top, #37ecba 0%, #72afd3 100%)' } }
].map(item => ({ ...item, type: 'frame', frameStyle: 'paper', thumb: 'https://i.imgur.com/7Y3zX9v.png', aspectRatio: 1, style: { ...item.style, backgroundColor: 'transparent', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' } }));

// Trending Category
framesElements['Trending'] = [
    { id: 'trend-1', title: 'Squircle', clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)', style: { backgroundImage: 'linear-gradient(to top, #4facfe 0%, #00f2fe 100%)' } },
    { id: 'trend-2', title: 'Social Story', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', aspectRatio: 0.56, style: { backgroundImage: 'linear-gradient(45deg, #85ffbd 0%, #ffffb4 100%)' } },
    { id: 'trend-3', title: 'Post Square', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', aspectRatio: 1, style: { backgroundImage: 'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)' } },
    { id: 'trend-4', title: 'Diamond', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', style: { backgroundImage: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' } },
    { id: 'trend-5', title: 'Hex Rounded', clipPath: 'polygon(25% 5%, 75% 5%, 95% 50%, 75% 95%, 25% 95%, 5% 50%)', style: { backgroundImage: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)' } },
    { id: 'trend-6', title: 'Mobile', clipPath: 'polygon(10% 0%, 90% 0%, 100% 5%, 100% 95%, 90% 100%, 10% 100%, 0% 95%, 0% 5%)', aspectRatio: 0.5, style: { backgroundImage: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)' } },
    { id: 'trend-7', title: 'Browser', clipPath: 'polygon(0% 10%, 100% 10%, 100% 100%, 0% 100%)', style: { backgroundImage: 'linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)' } },
    { id: 'trend-8', title: 'Chat Bubble', clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 70% 80%, 60% 100%, 50% 80%, 0% 80%)', style: { backgroundImage: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' } },
    { id: 'trend-9', title: 'Notification', clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 0% 80%)', aspectRatio: 2, style: { backgroundImage: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' } },
    { id: 'trend-10', title: 'Tag', clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)', style: { backgroundImage: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)' } },
    { id: 'trend-11', title: 'Step Up', clipPath: 'polygon(0% 20%, 20% 20%, 20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 100%, 0% 100%)', style: { backgroundImage: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' } },
    { id: 'trend-12', title: 'Diag Split', clipPath: 'polygon(0% 0%, 80% 0%, 100% 100%, 20% 100%)', style: { backgroundImage: 'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)' } },
    { id: 'trend-13', title: 'Double Hex', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', style: { backgroundImage: 'linear-gradient(to right, #0ba360 0%, #3cba92 100%)' } },
    { id: 'trend-14', title: 'Plus', clipPath: 'polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)', style: { backgroundImage: 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)' } },
    { id: 'trend-15', title: 'Arrow Up', clipPath: 'polygon(50% 0%, 100% 40%, 75% 40%, 75% 100%, 25% 100%, 25% 40%, 0% 40%)', style: { backgroundImage: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' } }
].map(item => ({ ...item, type: 'frame', frameStyle: 'paper', thumb: 'https://i.imgur.com/7Y3zX9v.png', style: { ...item.style, backgroundColor: 'transparent', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' } }));

// Letters Category
const generateLetter = (char, clip, gradient) => ({
    id: `letter-${char.toLowerCase()}`,
    title: `Letter ${char}`,
    clipPath: clip,
    type: 'frame',
    frameStyle: 'paper',
    thumb: 'https://i.imgur.com/7Y3zX9v.png',
    aspectRatio: 0.8,
    style: {
        backgroundColor: 'transparent',
        backgroundImage: gradient,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        mixBlendMode: 'multiply'
    }
});

framesElements['Letters'] = [
    generateLetter('A', 'polygon(50% 0%, 100% 100%, 75% 100%, 65% 70%, 35% 70%, 25% 100%, 0% 100%)', 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'),
    generateLetter('B', 'polygon(0% 0%, 75% 0%, 100% 25%, 75% 50%, 100% 75%, 75% 100%, 0% 100%)', 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)'),
    generateLetter('C', 'polygon(100% 20%, 80% 0%, 20% 0%, 0% 20%, 0% 80%, 20% 100%, 80% 100%, 100% 80%, 70% 80%, 30% 80%, 30% 20%, 70% 20%)', 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'),
    generateLetter('D', 'polygon(0% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 0% 100%)', 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'),
    generateLetter('E', 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 80%, 30% 80%, 30% 60%, 80% 60%, 80% 40%, 30% 40%, 30% 20%, 100% 20%)', 'linear-gradient(to top, #43e97b 0%, #38f9d7 100%)'),
    generateLetter('F', 'polygon(100% 0%, 0% 0%, 0% 100%, 30% 100%, 30% 60%, 80% 60%, 80% 40%, 30% 40%, 30% 20%, 100% 20%)', 'linear-gradient(to right, #fa709a 0%, #fee140 100%)'),
    generateLetter('G', 'polygon(80% 20%, 20% 20%, 20% 80%, 60% 80%, 60% 60%, 100% 60%, 100% 100%, 0% 100%, 0% 0%, 80% 0%)', 'linear-gradient(120deg, #a18cd1 0%, #fbc2eb 100%)'),
    generateLetter('H', 'polygon(0% 0%, 30% 0%, 30% 40%, 70% 40%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 70% 60%, 30% 60%, 30% 100%, 0% 100%)', 'linear-gradient(to top, #f093fb 0%, #f5576c 100%)'),
    generateLetter('I', 'polygon(20% 0%, 80% 0%, 80% 20%, 65% 20%, 65% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 35% 80%, 35% 20%, 20% 20%)', 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)'),
    generateLetter('J', 'polygon(0% 70%, 30% 100%, 70% 100%, 100% 70%, 100% 0%, 70% 0%, 70% 70%, 30% 70%, 30% 60%, 0% 60%)', 'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)'),
    generateLetter('K', 'polygon(0% 0%, 30% 0%, 30% 40%, 70% 0%, 100% 0%, 50% 50%, 100% 100%, 60% 100%, 30% 60%, 30% 100%, 0% 100%)', 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)'),
    generateLetter('L', 'polygon(0% 0%, 30% 0%, 30% 80%, 100% 80%, 100% 100%, 0% 100%)', 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)'),
    generateLetter('M', 'polygon(0% 0%, 30% 0%, 50% 50%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 70% 40%, 50% 80%, 30% 40%, 30% 100%, 0% 100%)', 'linear-gradient(to top, #cd9cf2 0%, #f6f3ff 100%)'),
    generateLetter('N', 'polygon(0% 0%, 30% 0%, 70% 60%, 70% 0%, 100% 0%, 100% 100%, 70% 100%, 30% 40%, 30% 100%, 0% 100%)', 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)'),
    generateLetter('O', 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)'),
    generateLetter('P', 'polygon(0% 0%, 80% 0%, 100% 30%, 80% 60%, 30% 60%, 30% 100%, 0% 100%)', 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)'),
    generateLetter('Q', 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 60% 100%, 100% 100%, 90% 100%, 50% 100%, 20% 80%, 0% 50%, 0% 20%)', 'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)'),
    generateLetter('R', 'polygon(0% 0%, 80% 0%, 100% 30%, 80% 60%, 100% 100%, 70% 100%, 40% 60%, 30% 60%, 30% 100%, 0% 100%)', 'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)'),
    generateLetter('S', 'polygon(100% 0%, 0% 0%, 0% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 80%, 70% 80%, 70% 70%, 30% 70%, 30% 30%, 100% 30%)', 'linear-gradient(to right, #0ba360 0%, #3cba92 100%)'),
    generateLetter('T', 'polygon(0% 0%, 100% 0%, 100% 20%, 65% 20%, 65% 100%, 35% 100%, 35% 20%, 0% 20%)', 'linear-gradient(to top, #9be15d 0%, #00e3ae 100%)'),
    generateLetter('U', 'polygon(0% 0%, 30% 0%, 30% 80%, 70% 80%, 70% 0%, 100% 0%, 100% 100%, 0% 100%)', 'linear-gradient(to top, #cc208e 0%, #6713d2 100%)'),
    generateLetter('V', 'polygon(0% 0%, 30% 0%, 50% 80%, 70% 0%, 100% 0%, 65% 100%, 35% 100%)', 'linear-gradient(to top, #37ecba 0%, #72afd3 100%)'),
    generateLetter('W', 'polygon(0% 0%, 25% 0%, 40% 70%, 50% 40%, 60% 70%, 75% 0%, 100% 0%, 80% 100%, 50% 100%, 20% 100%)', 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)'),
    generateLetter('X', 'polygon(0% 0%, 30% 0%, 50% 40%, 70% 0%, 100% 0%, 65% 50%, 100% 100%, 70% 100%, 50% 60%, 30% 100%, 0% 100%, 35% 50%)', 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'),
    generateLetter('Y', 'polygon(0% 0%, 30% 0%, 50% 50%, 70% 0%, 100% 0%, 65% 50%, 65% 100%, 35% 100%, 35% 50%)', 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)'),
    generateLetter('Z', 'polygon(0% 0%, 100% 0%, 100% 20%, 40% 80%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 60% 20%, 0% 20%)', 'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)')
];

// Numbers Category
framesElements['Numbers'] = [
    generateLetter('0', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 30% 30%, 30% 70%, 70% 70%, 70% 30%, 30% 30%)', 'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)'),
    generateLetter('1', 'polygon(30% 0%, 50% 0%, 50% 100%, 30% 100%, 30% 20%, 10% 20%)', 'linear-gradient(to right, #0ba360 0%, #3cba92 100%)'),
    generateLetter('2', 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%, 0% 60%, 100% 100%, 0% 100%)', 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)'),
    generateLetter('3', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 80%, 70% 80%, 70% 60%, 20% 60%, 20% 40%, 70% 40%, 70% 20%, 0% 20%)', 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)'),
    generateLetter('4', 'polygon(70% 0%, 70% 60%, 0% 60%, 0% 40%, 50% 0%, 50% 40%, 100% 40%, 100% 60%, 90% 100%, 70% 100%)', 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)'),
    generateLetter('5', 'polygon(100% 0%, 0% 0%, 0% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 80%, 70% 80%, 70% 70%, 20% 70%, 20% 20%, 100% 20%)', 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)'),
    generateLetter('6', 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%, 100% 50%, 20% 50%, 20% 20%, 100% 20%)', 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)'),
    generateLetter('7', 'polygon(0% 0%, 100% 0%, 50% 100%, 20% 100%, 70% 20%, 0% 20%)', 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)'),
    generateLetter('8', 'polygon(20% 0%, 80% 0%, 100% 20%, 80% 50%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 20% 50%, 0% 20%)', 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'),
    generateLetter('9', 'polygon(100% 100%, 0% 100%, 0% 50%, 100% 50%, 100% 20%, 20% 20%, 20% 60%, 80% 60%, 80% 80%, 0% 80%)', 'linear-gradient(to top, #30cfd0 0%, #330867 100%)') // Roughly
];

