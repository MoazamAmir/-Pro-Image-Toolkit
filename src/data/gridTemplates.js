export const gridTemplates = [
    // --- 2 GRIDS ---
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
        id: 'grid-2-v-30-70',
        title: '2 Vertical 30/70',
        slots: [
            { x: 0, y: 0, w: 30, h: 100 },
            { x: 30, y: 0, w: 70, h: 100 }
        ]
    },
    {
        id: 'grid-2-v-70-30',
        title: '2 Vertical 70/30',
        slots: [
            { x: 0, y: 0, w: 70, h: 100 },
            { x: 70, y: 0, w: 30, h: 100 }
        ]
    },
    {
        id: 'grid-2-h-30-70',
        title: '2 Horizontal 30/70',
        slots: [
            { x: 0, y: 0, w: 100, h: 30 },
            { x: 0, y: 30, w: 100, h: 70 }
        ]
    },
    {
        id: 'grid-2-h-70-30',
        title: '2 Horizontal 70/30',
        slots: [
            { x: 0, y: 0, w: 100, h: 70 },
            { x: 0, y: 70, w: 100, h: 30 }
        ]
    },

    // --- 3 GRIDS ---
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
        id: 'grid-3-mix-1',
        title: '1 Left 2 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-3-mix-2',
        title: '1 Top 2 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-3-mix-3',
        title: '2 Left 1 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },
    {
        id: 'grid-3-mix-4',
        title: '2 Top 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },
    {
        id: 'grid-3-v-wide',
        title: 'Center Wide',
        slots: [
            { x: 0, y: 0, w: 25, h: 100 },
            { x: 25, y: 0, w: 50, h: 100 },
            { x: 75, y: 0, w: 25, h: 100 }
        ]
    },

    // --- 4 GRIDS ---
    {
        id: 'grid-4-sq',
        title: '2x2 Grid',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 }
        ]
    },
    {
        id: 'grid-4-v',
        title: '4 Vertical',
        slots: [
            { x: 0, y: 0, w: 25, h: 100 },
            { x: 25, y: 0, w: 25, h: 100 },
            { x: 50, y: 0, w: 25, h: 100 },
            { x: 75, y: 0, w: 25, h: 100 }
        ]
    },
    {
        id: 'grid-4-h',
        title: '4 Horizontal',
        slots: [
            { x: 0, y: 0, w: 100, h: 25 },
            { x: 0, y: 25, w: 100, h: 25 },
            { x: 0, y: 50, w: 100, h: 25 },
            { x: 0, y: 75, w: 100, h: 25 }
        ]
    },
    {
        id: 'grid-4-mix-1',
        title: '1 Top 3 Bottom',
        slots: [
            { x: 0, y: 0, w: 100, h: 50 },
            { x: 0, y: 50, w: 33.33, h: 50 },
            { x: 33.33, y: 50, w: 33.33, h: 50 },
            { x: 66.66, y: 50, w: 33.33, h: 50 }
        ]
    },
    {
        id: 'grid-4-mix-2',
        title: '3 Top 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 33.33, h: 50 },
            { x: 33.33, y: 0, w: 33.33, h: 50 },
            { x: 66.66, y: 0, w: 33.33, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },
    {
        id: 'grid-4-mix-3',
        title: '1 Left 3 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 33.33 },
            { x: 50, y: 33.33, w: 50, h: 33.33 },
            { x: 50, y: 66.66, w: 50, h: 33.33 }
        ]
    },
    {
        id: 'grid-4-mix-4',
        title: '3 Left 1 Right',
        slots: [
            { x: 0, y: 0, w: 50, h: 33.33 },
            { x: 0, y: 33.33, w: 50, h: 33.33 },
            { x: 0, y: 66.66, w: 50, h: 33.33 },
            { x: 50, y: 0, w: 50, h: 100 }
        ]
    },

    // --- 5 GRIDS ---
    {
        id: 'grid-5-mix',
        title: '1 Center 4 Corners',
        slots: [
            { x: 0, y: 0, w: 50, h: 50 },
            { x: 50, y: 0, w: 50, h: 50 },
            { x: 0, y: 50, w: 50, h: 50 },
            { x: 50, y: 50, w: 50, h: 50 },
            { x: 25, y: 25, w: 50, h: 50 } // Overlay center
        ]
    },
    {
        id: 'grid-5-v',
        title: '5 Vertical',
        slots: [
            { x: 0, y: 0, w: 20, h: 100 },
            { x: 20, y: 0, w: 20, h: 100 },
            { x: 40, y: 0, w: 20, h: 100 },
            { x: 60, y: 0, w: 20, h: 100 },
            { x: 80, y: 0, w: 20, h: 100 }
        ]
    },
    {
        id: 'grid-5-mix-2',
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
        id: 'grid-5-mix-3',
        title: '4 Top 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 25, h: 50 },
            { x: 25, y: 0, w: 25, h: 50 },
            { x: 50, y: 0, w: 25, h: 50 },
            { x: 75, y: 0, w: 25, h: 50 },
            { x: 0, y: 50, w: 100, h: 50 }
        ]
    },

    // --- 6 GRIDS ---
    {
        id: 'grid-6-sq',
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
        id: 'grid-6-rect',
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
        id: 'grid-6-mix',
        title: '1 Left (50%), 5 Right Stack',
        slots: [
            { x: 0, y: 0, w: 50, h: 100 },
            { x: 50, y: 0, w: 50, h: 20 },
            { x: 50, y: 20, w: 50, h: 20 },
            { x: 50, y: 40, w: 50, h: 20 },
            { x: 50, y: 60, w: 50, h: 20 },
            { x: 50, y: 80, w: 50, h: 20 }
        ]
    },

    // --- 7 GRIDS ---
    {
        id: 'grid-7-mix',
        title: '1 Top, 2 Rows of 3',
        slots: [
            { x: 0, y: 0, w: 100, h: 40 },
            // Row 2 (3 items)
            { x: 0, y: 40, w: 33.33, h: 30 },
            { x: 33.33, y: 40, w: 33.33, h: 30 },
            { x: 66.66, y: 40, w: 33.33, h: 30 },
            // Row 3 (3 items)
            { x: 0, y: 70, w: 33.33, h: 30 },
            { x: 33.33, y: 70, w: 33.33, h: 30 },
            { x: 66.66, y: 70, w: 33.33, h: 30 }
        ]
    },
    {
        id: 'grid-7-mix-2',
        title: '3 Rows of 2, 1 Bottom',
        slots: [
            { x: 0, y: 0, w: 50, h: 30 }, { x: 50, y: 0, w: 50, h: 30 },
            { x: 0, y: 30, w: 50, h: 30 }, { x: 50, y: 30, w: 50, h: 30 },
            { x: 0, y: 60, w: 50, h: 30 }, { x: 50, y: 60, w: 50, h: 30 },
            { x: 0, y: 90, w: 100, h: 10 }
        ]
    },

    // --- 8 GRIDS ---
    {
        id: 'grid-8-sq',
        title: '4x2 Grid',
        slots: [
            { x: 0, y: 0, w: 25, h: 50 }, { x: 25, y: 0, w: 25, h: 50 }, { x: 50, y: 0, w: 25, h: 50 }, { x: 75, y: 0, w: 25, h: 50 },
            { x: 0, y: 50, w: 25, h: 50 }, { x: 25, y: 50, w: 25, h: 50 }, { x: 50, y: 50, w: 25, h: 50 }, { x: 75, y: 50, w: 25, h: 50 }
        ]
    },
    {
        id: 'grid-8-sq-v',
        title: '2x4 Grid',
        slots: [
            { x: 0, y: 0, w: 50, h: 25 }, { x: 50, y: 0, w: 50, h: 25 },
            { x: 0, y: 25, w: 50, h: 25 }, { x: 50, y: 25, w: 50, h: 25 },
            { x: 0, y: 50, w: 50, h: 25 }, { x: 50, y: 50, w: 50, h: 25 },
            { x: 0, y: 75, w: 50, h: 25 }, { x: 50, y: 75, w: 50, h: 25 }
        ]
    },

    // --- 9 GRIDS ---
    {
        id: 'grid-9-sq',
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
    {
        id: 'grid-9-mix',
        title: 'Center Big, 8 Around',
        slots: [
            // Top Row
            { x: 0, y: 0, w: 33.33, h: 33.33 }, { x: 33.33, y: 0, w: 33.33, h: 33.33 }, { x: 66.66, y: 0, w: 33.33, h: 33.33 },
            // Middle Row (Left/Right)
            { x: 0, y: 33.33, w: 33.33, h: 33.33 }, { x: 66.66, y: 33.33, w: 33.33, h: 33.33 },
            // Bottom Row
            { x: 0, y: 66.66, w: 33.33, h: 33.33 }, { x: 33.33, y: 66.66, w: 33.33, h: 33.33 }, { x: 66.66, y: 66.66, w: 33.33, h: 33.33 },
            // Center (Overlay)
            { x: 33.33, y: 33.33, w: 33.33, h: 33.33 }
        ]
    }
];