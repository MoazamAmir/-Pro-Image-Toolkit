
export const mockupElements = [
    {
        id: 'mockup-hand',
        title: 'Hand Holding Frame',
        image: '/assets/mockups/mockup_hand.jpg',
        thumb: '/assets/mockups/mockup_hand.jpg',
        frames: [
            {
                id: 'frame-1',
                x: 50, // Center: 17 + 33
                y: 45, // Center: roughly adjusted visually (14 is too high probably, let's try 45)
                width: 66,
                height: 56,
                rotation: 0
            }
        ]
    },
    {
        id: 'mockup-wall',
        title: 'Wall Frames',
        image: '/assets/mockups/mockup_wall.jpg',
        thumb: '/assets/mockups/mockup_wall.jpg',
        frames: [
            {
                id: 'frame-1',
                x: 33, // Moved left
                y: 35, // Moved up
                width: 25,
                height: 35, // Portrait orientation
                rotation: 0
            },
            {
                id: 'frame-2',
                x: 67, // Moved right
                y: 35, // Moved up
                width: 25,
                height: 35, // Portrait orientation
                rotation: 0
            }
        ]
    },
    {
        id: 'mockup-stand',
        title: 'Table Stand',
        image: '/assets/mockups/mockup_stand.jpg',
        thumb: '/assets/mockups/mockup_stand.jpg',
        frames: [
            {
                id: 'frame-1',
                x: 53.5, // Center: 27 + 22.5 = 49.5 -> adjusted slightly right to 53.5 based on screenshot offset
                y: 52, // Center: 28 + 24
                width: 45,
                height: 48,
                rotation: 0
            }
        ]
    }
];
