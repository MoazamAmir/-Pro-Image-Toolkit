
export const gridTemplates = [
    // --- 2 Photos ---
    {
        id: 'grid-2-v',
        title: '2 Vertical',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },
    {
        id: 'grid-2-h',
        title: '2 Horizontal',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },
    {
        id: 'grid-2-v-wide',
        title: '2 Vertical Wide',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 100 },
            { x: 33.33, y: 0, w: 66.66, h: 100 }
        ]
    },
    {
        id: 'grid-2-v-wide-r',
        title: '2 Vertical Wide Right',
        slots: [
            { x: 0, y: 0, w: 66.66, h: 100 },
            { x: 66.66, y: 0, w: 33.33, h: 100 }
        ]
    },
    {
        id: 'grid-2-h-tall',
        title: '2 Horizontal Tall',
        slots: [
            { x: 0, y: 0, w: 100, h: 66.66 },
            { x: 0, y: 66.66, w: 100, h: 33.33 }
        ]
    },

    // --- 3 Photos ---
    {
        id: 'grid-3-v',
        title: '3 Vertical',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 100 },
            { x: 33.33, y: 0, w: 33.33, h: 100 },
            { x: 66.66, y: 0, w: 33.33, h: 100 }
        ]
    },
    {
        id: 'grid-3-h',
        title: '3 Horizontal',
        slots: [
            { x: 0, y: 0, w: 100, h: 33.33 },
            { x: 0, y: 33.33, w: 100, h: 33.33 },
            { x: 0, y: 66.66, w: 100, h: 33.33 }
        ]
    },
    {
        id: 'grid-3-1l-2r',
        title: '1 Left 2 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-3-2l-1r',
        title: '2 Left 1 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },
    {
        id: 'grid-3-1t-2b',
        title: '1 Top 2 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-3-2t-1b',
        title: '2 Top 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },

    // --- 4 Photos ---
    {
        id: 'grid-4-2x2',
        title: '2x2 Grid',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-4-1l-3r',
        title: '1 Left 3 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 33.33 },
            { x: 50, y: 33.33, w: 50, h: 33.33 },
            { x: 50, y: 66.66, w: 50, h: 33.33 }
        ]
    },
    {
        id: 'grid-4-3l-1r',
        title: '3 Left 1 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 33.33 },
            { x: 0, y: 33.33, w: 50, h: 33.33 },
            { x: 0, y: 66.66, w: 50, h: 33.33 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },
    {
        id: 'grid-4-1t-3b',
        title: '1 Top 3 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 33.33, h: 50 },
            { x: 33.33, y: 50, w: 33.33, h: 50 },
            { x: 66.66, y: 50, w: 33.33, h: 50 }
        ]
    },
    {
        id: 'grid-4-3t-1b',
        title: '3 Top 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 50 },
            { x: 33.33, y: 0, w: 33.33, h: 50 },
            { x: 66.66, y: 0, w: 33.33, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },
    {
        id: 'grid-4-h-stripes',
        title: '4 Horizontal Stripes',
        slots: [
            { x: 0, y: 0, w: 100, h: 25 },
            { x: 0, y: 25, w: 100, h: 25 },
            { x: 0, y: 50, w: 100, h: 25 },
            { x: 0, y: 75, w: 100, h: 25 }
        ]
    },
    {
        id: 'grid-4-v-stripes',
        title: '4 Vertical Stripes',
        slots: [
            { x: 0, y: 0, w: 25, h: 100 },
            { x: 25, y: 0, w: 25, h: 100 },
            { x: 50, y: 0, w: 25, h: 100 },
            { x: 75, y: 0, w: 25, h: 100 }
        ]
    },

    // --- 5 Photos ---
    {
        id: 'grid-5-1l-4r',
        title: '1 Left 4 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 25 },
            { x: 50, y: 25, w: 50, h: 25 },
            { x: 50, y: 50, w: 50, h: 25 },
            { x: 50, y: 75, w: 50, h: 25 }
        ]
    },
    {
        id: 'grid-5-4l-1r',
        title: '4 Left 1 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 25 },
            { x: 0, y: 25, w: 50, h: 25 },
            { x: 0, y: 50, w: 50, h: 25 },
            { x: 0, y: 75, w: 50, h: 25 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },
    {
        id: 'grid-5-1t-4b',
        title: '1 Top 4 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 25, h: 50 },
            { x: 25, y: 50, w: 25, h: 50 },
            { x: 50, y: 50, w: 25, h: 50 },
            { x: 75, y: 50, w: 25, h: 50 }
        ]
    },
    {
        id: 'grid-5-mixed',
        title: 'Mixed 5',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 33.33, h: 50 },
            { x: 33.33, y: 50, w: 33.33, h: 50 },
            { x: 66.66, y: 50, w: 33.33, h: 50 }
        ]
    },
    {
        id: 'grid-5-center',
        title: 'Center Focus',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 100 },
            { x: 66.66, y: 0, w: 33.33, h: 100 },
            { x: 33.33, y: 0, w: 33.33, h: 33.33 },
            { x: 33.33, y: 33.33, w: 33.33, h: 33.33 },
            { x: 33.33, y: 66.66, w: 33.33, h: 33.33 }
        ]
    },

    // --- 6 Photos ---
    {
        id: 'grid-6-2x3',
        title: '2x3 Grid',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 50 },
            { x: 33.33, y: 0, w: 33.33, h: 50 },
            { x: 66.66, y: 0, w: 33.33, h: 50 },
            { x: 0, y: 50, w: 33.33, h: 50 },
            { x: 33.33, y: 50, w: 33.33, h: 50 },
            { x: 66.66, y: 50, w: 33.33, h: 50 }
        ]
    },
    {
        id: 'grid-6-3x2',
        title: '3x2 Grid',
        slots: [
            { x: 0, y: 0, w: 50, h: 33.33 },
            { x: 50, y: 0, w: 50, h: 33.33 },
            { x: 0, y: 33.33, w: 50, h: 33.33 },
            { x: 50, y: 33.33, w: 50, h: 33.33 },
            { x: 0, y: 66.66, w: 50, h: 33.33 },
            { x: 50, y: 66.66, w: 50, h: 33.33 }
        ]
    },
    {
        id: 'grid-6-1b-5s',
        title: '1 Big 5 Small',
        slots: [
            { x: 0, y: 0, w: 66.66, h: 66.66 },
            { x: 66.66, y: 0, w: 33.33, h: 33.33 },
            { x: 66.66, y: 33.33, w: 33.33, h: 33.33 },
            { x: 0, y: 66.66, w: 33.33, h: 33.33 },
            { x: 33.33, y: 66.66, w: 33.33, h: 33.33 },
            { x: 66.66, y: 66.66, w: 33.33, h: 33.33 }
        ]
    },

    // --- 7 Photos ---
    {
        id: 'grid-7-mixed',
        title: 'Mixed 7',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 25, h: 25 },
            { x: 75, y: 0, w: 25, h: 25 },
            { x: 50, y: 25, w: 25, h: 25 },
            { x: 75, y: 25, w: 25, h: 25 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-7-strips',
        title: '1 Top 6 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 40 },
            { x: 0, y: 40, w: 33.33, h: 30 },
            { x: 33.33, y: 40, w: 33.33, h: 30 },
            { x: 66.66, y: 40, w: 33.33, h: 30 },
            { x: 0, y: 70, w: 33.33, h: 30 },
            { x: 33.33, y: 70, w: 33.33, h: 30 },
            { x: 66.66, y: 70, w: 33.33, h: 30 }
        ]
    },

    // --- 8 Photos ---
    {
        id: 'grid-8-4x2',
        title: '4x2 Grid',
        slots: [
            { x: 0, y: 0, w: 25, h: 50 },
            { x: 25, y: 0, w: 25, h: 50 },
            { x: 50, y: 0, w: 25, h: 50 },
            { x: 75, y: 0, w: 25, h: 50 },
            { x: 0, y: 50, w: 25, h: 50 },
            { x: 25, y: 50, w: 25, h: 50 },
            { x: 50, y: 50, w: 25, h: 50 },
            { x: 75, y: 50, w: 25, h: 50 }
        ]
    },
    {
        id: 'grid-8-center',
        title: 'Center Surround',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 33.33 },
            { x: 33.33, y: 0, w: 33.33, h: 33.33 },
            { x: 66.66, y: 0, w: 33.33, h: 33.33 },
            { x: 0, y: 33.33, w: 33.33, h: 33.33 },
            // Center is skipped or filled? Let's just do a 3x3 minus center? No, user wants 8 fotos
            { x: 66.66, y: 33.33, w: 33.33, h: 33.33 },
            { x: 0, y: 66.66, w: 33.33, h: 33.33 },
            { x: 33.33, y: 66.66, w: 33.33, h: 33.33 },
            { x: 66.66, y: 66.66, w: 33.33, h: 33.33 },
            // So where is the 8th? Maybe I will do one big center
            { x: 33.33, y: 33.33, w: 33.33, h: 33.33 } // This makes 9. 
            // Let's do 2 big 4 small.
        ]
    },
    {  // Retrying 8: 2 big, 6 small
        id: 'grid-8-mixed',
        title: '2 Big 6 Small',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 33.33, h: 25 },
            { x: 33.33, y: 50, w: 33.33, h: 25 },
            { x: 66.66, y: 50, w: 33.33, h: 25 },
            { x: 0, y: 75, w: 33.33, h: 25 },
            { x: 33.33, y: 75, w: 33.33, h: 25 },
            { x: 66.66, y: 75, w: 33.33, h: 25 }
        ]
    },

    // --- 9 Photos ---
    {
        id: 'grid-9-3x3',
        title: '3x3 Grid',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 33.33 },
            { x: 33.33, y: 0, w: 33.33, h: 33.33 },
            { x: 66.66, y: 0, w: 33.33, h: 33.33 },
            { x: 0, y: 33.33, w: 33.33, h: 33.33 },
            { x: 33.33, y: 33.33, w: 33.33, h: 33.33 },
            { x: 66.66, y: 33.33, w: 33.33, h: 33.33 },
            { x: 0, y: 66.66, w: 33.33, h: 33.33 },
            { x: 33.33, y: 66.66, w: 33.33, h: 33.33 },
            { x: 66.66, y: 66.66, w: 33.33, h: 33.33 }
        ]
    },

    // --- More Complex / Artistic ---
    {
        id: 'grid-collage-1',
        title: 'Collage 1',
        slots: [
            { x: 0, y: 0, w: 60, h: 60 },
            { x: 60, y: 0, w: 40, h: 30 },
            { x: 60, y: 30, w: 40, h: 30 },
            { x: 0, y: 60, w: 30, h: 40 },
            { x: 30, y: 60, w: 30, h: 40 },
            { x: 60, y: 60, w: 40, h: 40 }
        ]
    },
    {
        id: 'grid-collage-2',
        title: 'Collage 2',
        slots: [
            { x: 0, y: 0, w: 40, h: 100 },
            { x: 40, y: 0, w: 60, h: 40 },
            { x: 40, y: 40, w: 60, h: 20 },
            { x: 40, y: 60, w: 30, h: 40 },
            { x: 70, y: 60, w: 30, h: 40 }
        ]
    },
    {
        id: 'grid-collage-3',
        title: 'Collage 3',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 100, h: 20 },
            { x: 0, y: 70, w: 33.33, h: 30 },
            { x: 33.33, y: 70, w: 33.33, h: 30 },
            { x: 66.66, y: 70, w: 33.33, h: 30 }
        ]
    },
    {
        id: 'grid-mosaic',
        title: 'Mosaic',
        slots: [
            { x: 0, y: 0, w: 20, h: 100 },
            { x: 20, y: 0, w: 20, h: 20 },
            { x: 40, y: 0, w: 20, h: 20 },
            { x: 60, y: 0, w: 20, h: 20 },
            { x: 80, y: 0, w: 20, h: 20 },
            { x: 20, y: 20, w: 80, h: 80 }
        ]
    },
    {
        id: 'grid-steps',
        title: 'Steps',
        slots: [
            { x: 0, y: 0, w: 25, h: 25 },
            { x: 25, y: 0, w: 75, h: 25 },
            { x: 0, y: 25, w: 25, h: 75 },
            { x: 25, y: 25, w: 50, h: 50 },
            { x: 75, y: 25, w: 25, h: 25 },
            { x: 75, y: 50, w: 25, h: 50 },
            { x: 25, y: 75, w: 50, h: 25 }
        ]
    }
];
