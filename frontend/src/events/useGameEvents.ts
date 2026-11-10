/**
 * Why this exists: connects the socket while a user is signed in and routes
 * each server event into gameStore. Components never touch the socket.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect } from 'react';
import { refreshSession } from '../api/http';
import { useGameStore } from '../store/gameStore';
import { socket } from './socket';

export function useGameEvents(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const store = useGameStore.getState();
    let retriedAuth = false;

    const onConnect = () => {
      retriedAuth = false;
      store.setConnected(true);
    };
    const onDisconnect = () => store.setConnected(false);

    // If the access token expired, renew it once and reconnect.
    const onConnectError = (error: Error) => {
      if (error.message !== 'Unauthorized' || retriedAuth) return;
      retriedAuth = true;
      refreshSession()
        .then(() => socket.connect())
        .catch(() => {
          // refreshSession has already signed the user out.
        });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('game:tick', store.setTick);
    socket.on('score:updated', store.addScore);
    socket.on('leaderboard:changed', store.setLeaderboard);
    socket.on('run:saved', store.runSaved);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('game:tick', store.setTick);
      socket.off('score:updated', store.addScore);
      socket.off('leaderboard:changed', store.setLeaderboard);
      socket.off('run:saved', store.runSaved);
      socket.disconnect();
      store.setConnected(false);
    };
  }, [enabled]);
}
