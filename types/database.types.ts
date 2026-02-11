export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    full_name: string | null;
                    bio: string | null;
                    city: string | null;
                    avatar_url: string | null;
                    is_contributor: boolean;
                    subscription_end_date: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    full_name?: string | null;
                    bio?: string | null;
                    city?: string | null;
                    avatar_url?: string | null;
                    is_contributor?: boolean;
                    subscription_end_date?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string | null;
                    full_name?: string | null;
                    bio?: string | null;
                    city?: string | null;
                    avatar_url?: string | null;
                    is_contributor?: boolean;
                    subscription_end_date?: string | null;
                    created_at?: string;
                };
            };
            restaurants: {
                Row: {
                    id: string;
                    name: string;
                    address: string | null;
                    postal_code: string | null;
                    city: string | null;
                    region: string | null;
                    department: string | null;
                    country: string | null;
                    lat: number | null;
                    lng: number | null;
                    budget_level: number | null;
                    food_types: string[] | null;
                    dietary_prefs: string[] | null;
                    services: string[] | null;
                    atmospheres: string[] | null;
                    created_at: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    restaurant_id: string | null;
                    contributor_id: string | null;
                    title: string | null;
                    description: string | null;
                    rating: number | null;
                    created_at: string;
                };
            };
            souvenirs: {
                Row: {
                    id: string;
                    traveler_id: string | null;
                    title: string | null;
                    description: string | null;
                    rating: number | null;
                    photos_urls: string[] | null;
                    date: string;
                };
            };
            conversations: {
                Row: {
                    id: string;
                    participant_1: string | null;
                    participant_2: string | null;
                    last_message_text: string | null;
                    last_message_at: string;
                };
            };
            messages: {
                Row: {
                    id: string;
                    conversation_id: string | null;
                    sender_id: string | null;
                    text: string;
                    is_read: boolean;
                    created_at: string;
                };
            };
            favorite_restaurants: {
                Row: {
                    user_id: string;
                    restaurant_id: string;
                };
                Insert: {
                    user_id: string;
                    restaurant_id: string;
                };
                Update: {
                    user_id?: string;
                    restaurant_id?: string;
                };
            };
            favorite_contributors: {
                Row: {
                    follower_id: string;
                    contributor_id: string;
                };
                Insert: {
                    follower_id: string;
                    contributor_id: string;
                };
                Update: {
                    follower_id?: string;
                    contributor_id?: string;
                };
            };
        };
    };
}
