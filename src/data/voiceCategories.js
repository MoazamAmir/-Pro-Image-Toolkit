/**
 * Voice/Audio Categories Data
 * Pre-defined audio tracks organized by categories
 * Using reliable audio sources (Pixabay CDN)
 */

export const voiceCategories = [
    {
        id: 'speeches',
        title: 'Speeches',
        icon: 'Mic',
        color: 'from-blue-400 to-blue-600',
        audios: [
            {
                id: 'speech_1',
                title: 'Motivational Speech',
                duration: 30,
                url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808367634.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=150&h=150&fit=crop',
                tags: ['motivational', 'speech', 'inspiring']
            },
            {
                id: 'speech_2',
                title: 'Business Presentation',
                duration: 45,
                url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&h=150&fit=crop',
                tags: ['business', 'presentation', 'professional']
            },
            {
                id: 'speech_3',
                title: 'Wedding Toast',
                duration: 25,
                url: 'https://cdn.pixabay.com/audio/2022/02/07/audio_1565d05e1a.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&h=150&fit=crop',
                tags: ['wedding', 'celebration', 'toast']
            },
            {
                id: 'speech_4',
                title: 'Graduation Address',
                duration: 60,
                url: 'https://cdn.pixabay.com/audio/2022/03/28/audio_9135476a99.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&h=150&fit=crop',
                tags: ['graduation', 'education', 'achievement']
            }
        ]
    },
    {
        id: 'voiceovers',
        title: 'Voice Overs',
        icon: 'Headphones',
        color: 'from-purple-400 to-purple-600',
        audios: [
            {
                id: 'vo_1',
                title: 'Documentary Narration',
                duration: 90,
                url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=150&h=150&fit=crop',
                tags: ['documentary', 'narration', 'storytelling']
            },
            {
                id: 'vo_2',
                title: 'Commercial Voiceover',
                duration: 30,
                url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_55d687042f.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef362b?w=150&h=150&fit=crop',
                tags: ['commercial', 'advertisement', 'promo']
            },
            {
                id: 'vo_3',
                title: 'Audiobook Sample',
                duration: 120,
                url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d9a15f69d2.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&h=150&fit=crop',
                tags: ['audiobook', 'reading', 'story']
            },
            {
                id: 'vo_4',
                title: 'Podcast Intro',
                duration: 15,
                url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_c1a1c5c9a9.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=150&h=150&fit=crop',
                tags: ['podcast', 'intro', 'broadcast']
            }
        ]
    },
    {
        id: 'interviews',
        title: 'Interviews',
        icon: 'Users',
        color: 'from-green-400 to-green-600',
        audios: [
            {
                id: 'int_1',
                title: 'Celebrity Interview',
                duration: 180,
                url: 'https://cdn.pixabay.com/audio/2021/12/06/audio_89e05d585f.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=150&h=150&fit=crop',
                tags: ['celebrity', 'interview', 'entertainment']
            },
            {
                id: 'int_2',
                title: 'News Interview',
                duration: 120,
                url: 'https://cdn.pixabay.com/audio/2022/01/03/audio_78d05f8f5a.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1397211706853-0435c6634be6?w=150&h=150&fit=crop',
                tags: ['news', 'interview', 'journalism']
            },
            {
                id: 'int_3',
                title: 'Podcast Interview',
                duration: 240,
                url: 'https://cdn.pixabay.com/audio/2021/10/25/audio_a5b2e5f5a5.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&h=150&fit=crop',
                tags: ['podcast', 'interview', 'conversation']
            }
        ]
    },
    {
        id: 'announcements',
        title: 'Announcements',
        icon: 'Megaphone',
        color: 'from-orange-400 to-orange-600',
        audios: [
            {
                id: 'ann_1',
                title: 'Event Announcement',
                duration: 20,
                url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_025c1539c.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=150&h=150&fit=crop',
                tags: ['event', 'announcement', 'public']
            },
            {
                id: 'ann_2',
                title: 'Airport Announcement',
                duration: 15,
                url: 'https://cdn.pixabay.com/audio/2022/02/01/audio_1565d05e1a.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=150&h=150&fit=crop',
                tags: ['airport', 'travel', 'announcement']
            },
            {
                id: 'ann_3',
                title: 'Store Announcement',
                duration: 25,
                url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_55d687042f.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=150&h=150&fit=crop',
                tags: ['retail', 'store', 'announcement']
            }
        ]
    },
    {
        id: 'conversations',
        title: 'Conversations',
        icon: 'MessageCircle',
        color: 'from-pink-400 to-pink-600',
        audios: [
            {
                id: 'conv_1',
                title: 'Casual Chat',
                duration: 120,
                url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_89e05d585f.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=150&fit=crop',
                tags: ['casual', 'conversation', 'friends']
            },
            {
                id: 'conv_2',
                title: 'Business Meeting',
                duration: 180,
                url: 'https://cdn.pixabay.com/audio/2022/01/03/audio_78d05f8f5a.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&h=150&fit=crop',
                tags: ['business', 'meeting', 'professional']
            },
            {
                id: 'conv_3',
                title: 'Phone Call',
                duration: 90,
                url: 'https://cdn.pixabay.com/audio/2021/10/25/audio_a5b2e5f5a5.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&h=150&fit=crop',
                tags: ['phone', 'call', 'conversation']
            }
        ]
    },
    {
        id: 'effects',
        title: 'Voice Effects',
        icon: 'Sliders',
        color: 'from-cyan-400 to-cyan-600',
        audios: [
            {
                id: 'fx_1',
                title: 'Robot Voice',
                duration: 10,
                url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1535378437327-b7149b371465?w=150&h=150&fit=crop',
                tags: ['robot', 'effect', 'sci-fi']
            },
            {
                id: 'fx_2',
                title: 'Echo Effect',
                duration: 8,
                url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_89e05d585f.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=150&h=150&fit=crop',
                tags: ['echo', 'effect', 'ambient']
            },
            {
                id: 'fx_3',
                title: 'Whisper Effect',
                duration: 12,
                url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
                thumbnail: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=150&h=150&fit=crop',
                tags: ['whisper', 'effect', 'quiet']
            }
        ]
    }
];

export default voiceCategories;
