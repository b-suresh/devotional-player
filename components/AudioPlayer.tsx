"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Song } from "@/types";

interface AudioPlayerProps {
    currentSong: Song | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function AudioPlayer({
    currentSong,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [needsInteraction, setNeedsInteraction] = useState(false);

    // Reset interaction state when song changes
    useEffect(() => {
        setNeedsInteraction(false);
    }, [currentSong]);

    // Handle playback based on isPlaying prop
    useEffect(() => {
        if (currentSong && audioRef.current) {
            if (isPlaying) {
                // Attempt to play. If blocked (e.g. Safari), catch error and show manual play button.
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("Autoplay prevented:", error);
                        if (error.name === "NotAllowedError") {
                            setNeedsInteraction(true);
                        }
                    });
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentSong, isPlaying]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    // Manual play handler for when autoplay is blocked
    const handleManualPlay = useCallback(() => {
        if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setNeedsInteraction(false);
                    })
                    .catch(e => console.error("Manual play failed:", e));
            }
        }
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg border-t border-gray-800">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                {/* Song Info */}
                <div className="text-center">
                    <h3 className="text-lg font-bold text-orange-400">
                        {currentSong ? currentSong.title : "Select a song or say a command"}
                    </h3>
                    {needsInteraction && (
                        <button
                            onClick={handleManualPlay}
                            className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-full animate-pulse hover:bg-red-700"
                        >
                            Tap to Play (Autoplay Blocked)
                        </button>
                    )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button onClick={onPrev} className="p-2 hover:text-orange-400 transition">
                        ⏮
                    </button>
                    <button
                        onClick={needsInteraction ? handleManualPlay : onPlayPause}
                        className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-xl transition shadow-md"
                    >
                        {isPlaying && !needsInteraction ? "⏸" : "▶"}
                    </button>
                    <button onClick={onNext} className="p-2 hover:text-orange-400 transition">
                        ⏭
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Hidden Audio Element */}
                {currentSong && (
                    <audio
                        ref={audioRef}
                        src={currentSong.url} // This will be the Firebase URL
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={onNext}
                    />
                )}
            </div>
        </div>
    );
}
