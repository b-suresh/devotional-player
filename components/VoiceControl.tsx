"use client";

import React, { useState, useEffect } from "react";

interface VoiceControlProps {
    onCommand: (transcript: string) => void;
}

export default function VoiceControl({ onCommand }: VoiceControlProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                const rec = new SpeechRecognition();
                rec.continuous = false;
                rec.interimResults = false;
                rec.lang = "en-IN"; // Indian English for better recognition of Tamil names

                rec.onstart = () => setIsListening(true);
                rec.onend = () => setIsListening(false);
                rec.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log("Voice Command:", transcript);
                    onCommand(transcript);
                };
                rec.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                    if (event.error === 'not-allowed') {
                        alert("Microphone access denied. Please allow microphone access in your browser settings.");
                    }
                };

                setRecognition(rec);
            }
        }
    }, [onCommand]);

    const toggleListening = () => {
        if (!recognition) {
            alert("Voice recognition is not supported in this browser. Try Chrome.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center my-8">
            <button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-500 shadow-xl ${isListening
                    ? "bg-red-500 animate-pulse ring-4 ring-red-300"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                🎙
            </button>
            <p className="mt-4 text-gray-400 font-medium">
                {isListening ? "Listening... Say a song name" : "Tap to Speak"}
            </p>
        </div>
    );
}
