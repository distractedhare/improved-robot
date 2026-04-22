import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { GameStatus } from '../../types';
import { audio } from './Audio';

export const AudioSync: React.FC = () => {
    const status = useStore(state => state.status);
    const musicVolume = useStore(state => state.musicVolume);
    const isMusicEnabled = useStore(state => state.isMusicEnabled);

    useEffect(() => {
        audio.setMasterVolume(musicVolume);
    }, [musicVolume]);

    useEffect(() => {
        if (isMusicEnabled && (status === GameStatus.PLAYING || status === GameStatus.MENU || status === GameStatus.SETTINGS)) {
            audio.startMusic();
        } else {
            audio.stopMusic();
        }
    }, [isMusicEnabled, status]);

    useEffect(() => {
        const sync = () => {
            // Updated to NOT mute during GameStatus.SETTINGS to allow soundtrack testing
            if (document.hidden || status === GameStatus.PAUSED || status === GameStatus.TRIVIA || status === GameStatus.SHOP) {
                audio.mute();
            } else if (status === GameStatus.PLAYING || status === GameStatus.MENU || status === GameStatus.SETTINGS) {
                audio.unmute();
            }
        };

        sync();
        document.addEventListener('visibilitychange', sync);
        return () => document.removeEventListener('visibilitychange', sync);
    }, [status]);

    return null;
};
