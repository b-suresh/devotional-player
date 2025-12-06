export interface Song {
    id: string;
    title: string;
    fileName: string;
    url?: string; // Firebase download URL
    tags?: string[]; // For better voice matching (e.g. "Muthai Tharu", "Muthaitharu")
}

export interface PlayerState {
    isPlaying: boolean;
    currentSong: Song | null;
    volume: number;
    isListening: boolean;
}
