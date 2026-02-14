export const CUISINE_IMAGES: Record<string, string> = {
    'Italien': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000',
    'Japonais': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    'Français': 'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000',
    'Méditerranéen': 'https://images.unsplash.com/photo-1523986395389-c8a8ddc52971?q=80&w=1000',
    'Asiatique': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000',
    'Indien': 'https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=1000',
    'Mexicain': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1000',
    'Végétarien': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000',
    'Default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000',
    'Vietnamien': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
};

export const getImageForCuisine = (foodTypes: string[] | null | undefined): string => {
    if (!foodTypes || foodTypes.length === 0) return CUISINE_IMAGES['Default'];
    for (const type of foodTypes) {
        const key = Object.keys(CUISINE_IMAGES).find(k => type.toLowerCase().includes(k.toLowerCase()));
        if (key) return CUISINE_IMAGES[key];
    }
    return CUISINE_IMAGES['Default'];
};
