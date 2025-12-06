"use client";

import React, { useState, useEffect } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import VoiceControl from "@/components/VoiceControl";
import InstallPrompt from "@/components/InstallPrompt";
import { Song } from "@/types";
import { getAllSongs } from "@/lib/firebase";

import Fuse from "fuse.js";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastHeard, setLastHeard] = useState<string>("");

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const fetchedSongs = await getAllSongs(); // Use the new function
        setSongs(fetchedSongs);
      } catch (err) {
        console.error("Failed to load songs", err);
        setError("Failed to load songs from Firebase.");
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Helper to play a song
  const playSong = async (song: Song) => {
    try {
      setError(null);
      console.log(`Playing ${song.title}`);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing song:", err);
      setError("Could not play song.");
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    setLastHeard(transcript);
    const lowerTranscript = transcript.toLowerCase().replace("play", "").trim(); // Remove "play" command

    if (!songs.length) return;

    // Configure Fuse for fuzzy search
    const fuse = new Fuse(songs, {
      keys: ["title", "tags", "fileName"],
      threshold: 0.4, // 0.0 is exact match, 1.0 is match anything. 0.4 is good for typos/phonetic.
      includeScore: true
    });

    const results = fuse.search(lowerTranscript);

    if (results.length > 0) {
      const bestMatch = results[0].item;
      console.log(`Matched "${transcript}" to "${bestMatch.title}" (Score: ${results[0].score})`);
      playSong(bestMatch);
    } else {
      console.log(`No match found for "${transcript}"`);
      // Optional: Speak back "Song not found"
    }
  };

  // Filter songs based on search query
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const visibleSongs = filteredSongs.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      <header className="p-6 border-b border-gray-800 sticky top-0 bg-black/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-orange-500 tracking-wide text-center">
          Devotional Voice Player
        </h1>
      </header>

      <main className="container mx-auto px-4">
        <InstallPrompt />
        <VoiceControl onCommand={handleVoiceCommand} />

        {lastHeard && (
          <div className="text-center text-gray-500 mt-2 text-sm">
            Heard: <span className="text-orange-400 italic">"{lastHeard}"</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-center my-4">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="my-6">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(20); // Reset pagination on search
            }}
            className="w-full bg-gray-900 border border-gray-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 mt-8">Loading songs from Firebase...</div>
        ) : (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              {searchQuery ? `Found ${filteredSongs.length} Songs` : `Available Songs (${songs.length})`}
            </h2>

            <div className="grid gap-3">
              {visibleSongs.map(song => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className={`p-4 rounded-lg cursor-pointer transition flex items-center justify-between ${currentSong?.id === song.id
                    ? "bg-orange-900/30 border border-orange-500/50"
                    : "bg-gray-900 hover:bg-gray-800"
                    }`}
                >
                  <span className="font-medium">{song.title}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[100px]">{song.fileName}</span>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredSongs.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full transition text-sm font-medium"
                >
                  Load More
                </button>
              </div>
            )}

            {filteredSongs.length === 0 && !loading && (
              <div className="text-center text-gray-500 mt-8">
                No songs found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </main>

      <AudioPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => { }} // TODO: Implement next
        onPrev={() => { }} // TODO: Implement prev
      />
    </div>
  );
}
