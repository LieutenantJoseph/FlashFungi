// placeholder-assets.js - Temporary asset definitions
(function() {
    'use strict';
    
    // Achievement icons mapping (will be replaced with actual images)
    window.achievementIcons = {
        'first_correct': '🌱',
        'ten_streak': '🔥',
        'genus_master': '👑',
        'module_complete': '📚',
        'dna_specialist': '🧬',
        'night_owl': '🦉',
        'early_bird': '🐦',
        'persistent': '💪',
        'perfect_score': '💯',
        'speed_demon': '⚡',
        'collector': '📦',
        'explorer': '🗺️'
    };
    
    // PWA Icon placeholder generator
    window.generatePlaceholderIcon = function(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#059669');
        gradient.addColorStop(1, '#047857');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Center mushroom emoji
        ctx.font = `${size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText('🍄', size / 2, size / 2);
        
        return canvas.toDataURL('image/png');
    };
    
    // Interactive diagram placeholder structure
    window.interactiveDiagramPlaceholder = {
        type: 'svg',
        width: 400,
        height: 400,
        elements: [
            {
                id: 'cap',
                type: 'ellipse',
                cx: 200,
                cy: 150,
                rx: 120,
                ry: 60,
                fill: '#8b4513',
                interactive: true,
                label: 'Cap (Pileus)',
                description: 'The top part of the mushroom'
            },
            {
                id: 'stem',
                type: 'rect',
                x: 180,
                y: 150,
                width: 40,
                height: 150,
                fill: '#d2691e',
                interactive: true,
                label: 'Stem (Stipe)',
                description: 'The stalk that supports the cap'
            },
            {
                id: 'gills',
                type: 'path',
                d: 'M 100,150 L 300,150',
                stroke: '#654321',
                interactive: true,
                label: 'Gills',
                description: 'Structures under the cap that produce spores'
            }
        ]
    };
})();