/**
 * Two-device rooms over MQTT + BroadcastChannel (no /api/rtc, no WebRTC).
 * Host and guest both join the same topic; the first hello from the other seat starts play.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RoomBus } from "./bus";
import type { PeerInfo } from "./p2p";
import type { P2PRoomHandle } from "./use-p2p-room";

export function peerIdFor(room: string) {
  return `gon${room.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`;
}

export function useLinkRoom({
  room,
  name,
  host,
}: {
  room: string;
  name: string;
  host: boolean;
}): P2PRoomHandle & { status: string } {
  const [selfId] = useState(() => `p${Math.random().toString(36).slice(2, 10)}`);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState(host ? "Opening the room." : "Finding the host.");
  const busRef = useRef<RoomBus | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );

  useEffect(() => {
    const bus = new RoomBus(room, selfId, name, {
      onStatus: (s) => {
        setStatus(s);
        if (s === "Connected." || s.startsWith("Share this code")) setJoined(true);
      },
      onPeer: (peer) => setPeers(peer ? [peer] : []),
      onBody: (from, body) => {
        for (const fn of listeners.current) fn(from, body, "reliable");
      },
    });
    busRef.current = bus;
    try {
      bus.start();
      setJoined(true);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not open the room.");
    }
    return () => {
      busRef.current = null;
      bus.destroy();
    };
  }, [room, name, selfId]);

  const send = useCallback((data: unknown) => {
    busRef.current?.send(data);
  }, []);

  const onMessage = useCallback(
    (fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => {
      listeners.current.add(fn);
      return () => {
        listeners.current.delete(fn);
      };
    },
    [],
  );

  return useMemo(
    () => ({
      selfId,
      room,
      peers,
      joined,
      status,
      broadcast: send,
      send,
      onMessage,
    }),
    [selfId, room, peers, joined, status, send, onMessage],
  );
}
