"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  useParticipants,
  useTrackToggle,
  useIsSpeaking,
  useIsMuted,
  useRoomContext,
  useConnectionState,
  useDataChannel,
  isTrackReference,
} from "@livekit/components-react";
import type {
  TrackReferenceOrPlaceholder,
  ReceivedDataMessage,
} from "@livekit/components-core";
import { ConnectionState, DisconnectReason, Track } from "livekit-client";
import type { Participant } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Users,
  MessageSquare,
  Hand,
  Send,
  Shield,
  Lock,
  Unlock,
  PhoneOff,
  Copy,
  Check,
  X,
  UserX,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Clock,
} from "lucide-react";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface RoomMeetingInfo {
  id: string;
  title: string;
  roomCode: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED";
}

interface VideoRoomClientProps {
  meeting: RoomMeetingInfo;
  isHost: boolean;
  defaultName: string;
  guestToken?: string | null;
}

interface LobbyPrefs {
  displayName?: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  guestToken?: string | null;
}

interface WaitingGuestItem {
  id: string;
  guestName: string;
  guestToken: string;
  status: "WAITING" | "ADMITTED" | "REJECTED";
  createdAt: string;
}

interface ChatMessageItem {
  id: string;
  senderIdentity: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
}

interface SignalPayload {
  type: "RAISE_HAND" | "SYNC_REQUEST";
  identity?: string;
  raised?: boolean;
}

type PostCallReason = "LEFT" | "ENDED_BY_HOST" | "REMOVED";

interface PostCallState {
  reason: PostCallReason;
  durationSeconds: number;
}

function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return "G";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function parseParticipantIsHost(participant: Participant): boolean {
  if (!participant.metadata) return false;
  try {
    const parsed = JSON.parse(participant.metadata) as { isHost?: boolean };
    return Boolean(parsed.isHost);
  } catch {
    return false;
  }
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

function formatChatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

function renderMessageWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, idx) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-[#B47B38] dark:text-[#F2C594] hover:opacity-80 break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/* -------------------------------------------------------------------------- */
/* Individual Participant Video Tile                                           */
/* -------------------------------------------------------------------------- */
function ParticipantTileCard({
  trackRef,
  compact = false,
  isHandRaised = false,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  compact?: boolean;
  isHandRaised?: boolean;
}) {
  const participant = trackRef.participant;
  const isSpeaking = useIsSpeaking(participant);
  const isCameraMuted = useIsMuted(trackRef);
  const isMicMuted = useIsMuted({
    participant,
    source: Track.Source.Microphone,
  });

  const hasVideo = isTrackReference(trackRef) && !isCameraMuted;
  const displayName = participant.name || participant.identity || "Participant";
  const isParticipantHost = parseParticipantIsHost(participant);

  return (
    <div
      className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-white dark:bg-[#131316] transition-all duration-150 flex items-center justify-center shadow-sm dark:shadow-xl dark:shadow-black/50 ${
        isSpeaking
          ? "border-2 border-[#10B981]"
          : "border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15"
      }`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={`w-full h-full object-cover ${
            participant.isLocal ? "-scale-x-100" : ""
          }`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <div
            className={`rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center font-heading font-semibold text-[#B47B38] dark:text-[#F2C594] shadow-inner ${
              compact
                ? "w-12 h-12 text-sm"
                : "w-16 h-16 sm:w-20 sm:h-20 text-xl"
            }`}
          >
            {getInitials(displayName)}
          </div>
        </div>
      )}

      {/* Top-right Raised Hand Badge (#F2C594) */}
      {isHandRaised && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B47B38] dark:bg-[#F2C594] text-white dark:text-[#09090B] text-[11px] font-semibold shadow-md">
          <Hand size={12} strokeWidth={2} />
          {!compact && <span>Hand Raised</span>}
        </div>
      )}

      {/* Bottom-left Name Tag + Muted Mic Badge */}
      <div className="absolute bottom-3 left-3 max-w-[calc(100%-24px)] inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/85 dark:bg-[#09090B]/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1]">
        {isMicMuted ? (
          <MicOff
            size={12}
            strokeWidth={1.75}
            className="text-[#EF4444] shrink-0"
          />
        ) : (
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isSpeaking ? "bg-[#10B981]" : "bg-[#6B6B70] dark:bg-[#8E8E93]"
            }`}
          />
        )}
        <span className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7] truncate">
          {displayName}
          {participant.isLocal ? " (You)" : ""}
        </span>
        {isParticipantHost && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#B47B38] dark:text-[#F2C594] shrink-0">
            Host
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Participant Roster Row (Inside Drawer with Host Moderation Controls)        */
/* -------------------------------------------------------------------------- */
function ParticipantRosterRow({
  participant,
  isViewerHost,
  isHandRaised,
  isActionPending,
  onHostAction,
}: {
  participant: Participant;
  isViewerHost: boolean;
  isHandRaised: boolean;
  isActionPending: boolean;
  onHostAction: (identity: string, action: "MUTE" | "REMOVE") => void;
}) {
  const isSpeaking = useIsSpeaking(participant);
  const isMicMuted = useIsMuted({
    participant,
    source: Track.Source.Microphone,
  });
  const isCamMuted = useIsMuted({
    participant,
    source: Track.Source.Camera,
  });
  const name = participant.name || participant.identity || "Participant";
  const isParticipantHost = parseParticipantIsHost(participant);

  return (
    <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.06] dark:border-white/[0.06]">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border flex items-center justify-center font-heading text-[11px] font-semibold text-[#B47B38] dark:text-[#F2C594] shrink-0 ${
            isSpeaking
              ? "border-[#10B981]"
              : "border-black/[0.08] dark:border-white/[0.1]"
          }`}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7] truncate flex items-center gap-1.5">
            <span className="truncate">
              {name}
              {participant.isLocal ? " (You)" : ""}
            </span>
            {isParticipantHost && (
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#B47B38] dark:text-[#F2C594] border border-[#B47B38]/25 dark:border-[#F2C594]/25 shrink-0">
                Host
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isHandRaised && (
          <span
            title="Hand raised"
            className="p-1 rounded-md bg-[#B47B38]/15 dark:bg-[#F2C594]/15 text-[#B47B38] dark:text-[#F2C594]"
          >
            <Hand size={12} strokeWidth={2} />
          </span>
        )}

        {isMicMuted ? (
          <MicOff size={13} strokeWidth={1.75} className="text-[#EF4444]" />
        ) : (
          <Mic
            size={13}
            strokeWidth={1.75}
            className={
              isSpeaking
                ? "text-[#10B981]"
                : "text-[#6B6B70] dark:text-[#8E8E93]"
            }
          />
        )}

        {isCamMuted ? (
          <VideoOff size={13} strokeWidth={1.75} className="text-[#EF4444]" />
        ) : (
          <Video
            size={13}
            strokeWidth={1.75}
            className="text-[#6B6B70] dark:text-[#8E8E93]"
          />
        )}

        {/* Host Moderation Controls for Remote Participants */}
        {isViewerHost && !participant.isLocal && (
          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-black/[0.08] dark:border-white/[0.08]">
            {!isMicMuted && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onHostAction(participant.identity, "MUTE")}
                title="Mute participant microphone"
                aria-label={`Mute ${name}`}
                className="p-1 rounded-md text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#B47B38] dark:hover:text-[#F2C594] hover:bg-[#F2F0EB] dark:hover:bg-white/[0.08] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <MicOff size={12} strokeWidth={1.75} />
              </button>
            )}
            <button
              type="button"
              disabled={isActionPending}
              onClick={() => onHostAction(participant.identity, "REMOVE")}
              title="Remove participant from room"
              aria-label={`Remove ${name}`}
              className="p-1 rounded-md text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <UserX size={12} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Inside <LiveKitRoom>: Studio Stage, Header, Grid, Dock, Chat & Host Drawer  */
/* -------------------------------------------------------------------------- */
function KovaStudioStage({
  meeting,
  isHost,
  onCallExit,
  onDurationSync,
}: {
  meeting: RoomMeetingInfo;
  isHost: boolean;
  onCallExit: (reason: PostCallReason, durationSeconds: number) => void;
  onDurationSync: (durationSeconds: number) => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const participants = useParticipants();

  // Track hooks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const camToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenToggle = useTrackToggle({ source: Track.Source.ScreenShare });

  // UI & Drawer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<
    "participants" | "chat" | null
  >(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isLeaveMenuOpen, setIsLeaveMenuOpen] = useState(false);

  // Chat state (DataChannel topic: "kova-chat")
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [hasUnreadChat, setHasUnreadChat] = useState(false);

  // Raise Hand state (DataChannel topic: "kova-signal")
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({});

  // Host room settings & moderation state
  const [isLocked, setIsLocked] = useState(meeting.isLocked);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(
    meeting.waitingRoomEnabled
  );
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [waitingGuests, setWaitingGuests] = useState<WaitingGuestItem[]>([]);
  const [moderatingGuestId, setModeratingGuestId] = useState<string | null>(
    null
  );
  const [actionPendingIdentity, setActionPendingIdentity] = useState<
    string | null
  >(null);

  // Refs for stable callbacks & auto-scroll
  const securityRef = useRef<HTMLDivElement | null>(null);
  const leaveRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const activeDrawerRef = useRef(activeDrawer);
  const isHandRaisedRef = useRef(isHandRaised);
  const elapsedRef = useRef(elapsedSeconds);
  const hasSentSyncRef = useRef(false);

  useEffect(() => {
    activeDrawerRef.current = activeDrawer;
    if (activeDrawer === "chat") {
      setHasUnreadChat(false);
    }
  }, [activeDrawer]);

  useEffect(() => {
    isHandRaisedRef.current = isHandRaised;
  }, [isHandRaised]);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
    onDurationSync(elapsedSeconds);
  }, [elapsedSeconds, onDurationSync]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeDrawer === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeDrawer, chatMessages.length]);

  // Live Call Duration Timer
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [connectionState]);

  // LiveKit DataChannel: Chat ("kova-chat")
  const handleChatReceive = useCallback(
    (msg: ReceivedDataMessage<"kova-chat">) => {
      try {
        const decoded = new TextDecoder().decode(msg.payload);
        const parsed = JSON.parse(decoded) as Omit<ChatMessageItem, "isSelf">;
        if (!parsed.id || !parsed.text) return;

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === parsed.id)) return prev;
          return [
            ...prev,
            {
              ...parsed,
              isSelf: parsed.senderIdentity === room.localParticipant.identity,
            },
          ];
        });

        if (activeDrawerRef.current !== "chat") {
          setHasUnreadChat(true);
        }
      } catch {
        // Ignore malformed chat packets
      }
    },
    [room.localParticipant.identity]
  );

  const { send: sendChatData } = useDataChannel("kova-chat", handleChatReceive);

  // LiveKit DataChannel: Signals ("kova-signal" for Raise Hand)
  const sendSignalRef = useRef<
    ((payload: Uint8Array, options: { reliable: boolean }) => Promise<void>) | null
  >(null);

  const handleSignalReceive = useCallback(
    (msg: ReceivedDataMessage<"kova-signal">) => {
      try {
        const decoded = new TextDecoder().decode(msg.payload);
        const parsed = JSON.parse(decoded) as SignalPayload;

        if (parsed.type === "RAISE_HAND" && parsed.identity) {
          const targetId = parsed.identity;
          const raised = Boolean(parsed.raised);
          setRaisedHands((prev) => ({
            ...prev,
            [targetId]: raised,
          }));
        } else if (
          parsed.type === "SYNC_REQUEST" &&
          isHandRaisedRef.current &&
          sendSignalRef.current
        ) {
          const reply = new TextEncoder().encode(
            JSON.stringify({
              type: "RAISE_HAND",
              identity: room.localParticipant.identity,
              raised: true,
            } satisfies SignalPayload)
          );
          sendSignalRef.current(reply, { reliable: true }).catch(() => {});
        }
      } catch {
        // Ignore malformed signal packets
      }
    },
    [room.localParticipant.identity]
  );

  const { send: sendSignalData } = useDataChannel(
    "kova-signal",
    handleSignalReceive
  );

  useEffect(() => {
    sendSignalRef.current = sendSignalData;
  }, [sendSignalData]);

  // Request current raised-hand state once connected
  useEffect(() => {
    if (
      connectionState === ConnectionState.Connected &&
      !hasSentSyncRef.current
    ) {
      hasSentSyncRef.current = true;
      const bytes = new TextEncoder().encode(
        JSON.stringify({ type: "SYNC_REQUEST" } satisfies SignalPayload)
      );
      sendSignalData(bytes, { reliable: true }).catch(() => {});
    }
  }, [connectionState, sendSignalData]);

  const handleToggleRaiseHand = useCallback(async () => {
    const next = !isHandRaisedRef.current;
    const myIdentity = room.localParticipant.identity;

    setIsHandRaised(next);
    setRaisedHands((prev) => ({
      ...prev,
      [myIdentity]: next,
    }));

    try {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          type: "RAISE_HAND",
          identity: myIdentity,
          raised: next,
        } satisfies SignalPayload)
      );
      await sendSignalData(payload, { reliable: true });
    } catch {
      // Keep local state even if transient publish fails
    }
  }, [room.localParticipant.identity, sendSignalData]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = chatInput.trim();
    if (!cleanText) return;

    const myIdentity = room.localParticipant.identity;
    const myName = room.localParticipant.name || "You";
    const msgObj: ChatMessageItem = {
      id: crypto.randomUUID(),
      senderIdentity: myIdentity,
      senderName: myName,
      text: cleanText,
      timestamp: Date.now(),
      isSelf: true,
    };

    setChatInput("");
    setChatMessages((prev) => [...prev, msgObj]);

    try {
      const encoded = new TextEncoder().encode(
        JSON.stringify({
          id: msgObj.id,
          senderIdentity: msgObj.senderIdentity,
          senderName: msgObj.senderName,
          text: msgObj.text,
          timestamp: msgObj.timestamp,
        })
      );
      await sendChatData(encoded, { reliable: true });
    } catch {
      // Message remains locally visible
    }
  };

  // Tactile Keyboard Shortcuts (M, V, C, H — disabled inside inputs/textareas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          micToggle.toggle();
          break;
        case "v":
          e.preventDefault();
          camToggle.toggle();
          break;
        case "c":
          e.preventDefault();
          setActiveDrawer((prev) => (prev === "chat" ? null : "chat"));
          break;
        case "h":
          e.preventDefault();
          handleToggleRaiseHand();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camToggle, handleToggleRaiseHand, micToggle]);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        securityRef.current &&
        !securityRef.current.contains(e.target as Node)
      ) {
        setIsSecurityOpen(false);
      }
      if (leaveRef.current && !leaveRef.current.contains(e.target as Node)) {
        setIsLeaveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Host polling for waiting guests every 3 seconds
  const fetchWaitingGuests = useCallback(async () => {
    if (!isHost) return;
    try {
      const res = await fetch(
        `/api/meetings/${meeting.roomCode}/participants/waiting`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        waitingGuests?: WaitingGuestItem[];
      };
      if (Array.isArray(data.waitingGuests)) {
        setWaitingGuests(data.waitingGuests);
      }
    } catch {
      // Ignore transient poll errors
    }
  }, [isHost, meeting.roomCode]);

  useEffect(() => {
    if (!isHost) return;
    fetchWaitingGuests();
    const interval = setInterval(fetchWaitingGuests, 3000);
    return () => clearInterval(interval);
  }, [fetchWaitingGuests, isHost]);

  const handleCopyInvite = async () => {
    const url = `${window.location.origin}/m/${meeting.roomCode}/lobby`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleModerateGuest = async (
    guestId: string,
    action: "ADMIT" | "REJECT"
  ) => {
    setModeratingGuestId(guestId);
    try {
      const res = await fetch(`/api/meetings/${meeting.roomCode}/admit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, action }),
      });
      if (res.ok) {
        setWaitingGuests((prev) => prev.filter((g) => g.id !== guestId));
      }
    } catch {
      // Ignore network errors
    } finally {
      setModeratingGuestId(null);
    }
  };

  const handleHostParticipantAction = async (
    targetIdentity: string,
    action: "MUTE" | "REMOVE"
  ) => {
    setActionPendingIdentity(targetIdentity);
    try {
      await fetch(`/api/meetings/${meeting.roomCode}/participants/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetIdentity, action }),
      });
    } catch {
      // Ignore transient network errors
    } finally {
      setActionPendingIdentity(null);
    }
  };

  const handleToggleSetting = async (
    field: "isLocked" | "waitingRoomEnabled",
    value: boolean
  ) => {
    setIsUpdatingSettings(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.roomCode}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = (await res.json()) as {
          isLocked: boolean;
          waitingRoomEnabled: boolean;
        };
        setIsLocked(updated.isLocked);
        setWaitingRoomEnabled(updated.waitingRoomEnabled);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleLeaveCall = async () => {
    const finalSeconds = elapsedRef.current;
    onCallExit("LEFT", finalSeconds);
    await room.disconnect();
  };

  const handleEndMeetingForAll = async () => {
    const finalSeconds = elapsedRef.current;
    try {
      await fetch(`/api/meetings/${meeting.roomCode}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });
    } catch {
      // Proceed with disconnect even if patch fails
    }
    onCallExit("ENDED_BY_HOST", finalSeconds);
    await room.disconnect();
  };

  // Separate Screen Share vs Camera tracks
  const screenShareTracks = tracks.filter(
    (t) => t.source === Track.Source.ScreenShare && isTrackReference(t)
  );
  const cameraTracks = tracks.filter((t) => t.source === Track.Source.Camera);

  const activeScreenShare = screenShareTracks[0];
  const isSpotlight = Boolean(activeScreenShare);

  // Responsive Grid sizing
  const gridClassName = useMemo(() => {
    const count = cameraTracks.length;
    if (count <= 1) return "grid-cols-1 max-w-4xl";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 max-w-5xl";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl";
  }, [cameraTracks.length]);

  return (
    <div className="h-screen w-full bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col overflow-hidden select-none">
      {/* Minimal Top Header */}
      <header className="h-14 shrink-0 border-b border-black/[0.08] dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 bg-[#FAF9F6]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-20">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <KovaLogo size="sm" />
          <span
            className="hidden sm:inline text-black/20 dark:text-white/20 font-mono text-xs"
            aria-hidden="true"
          >
            /
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-[#111113] dark:text-[#F5F5F7] truncate max-w-[200px] md:max-w-xs">
            {meeting.title}
          </span>
          {isLocked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/25 text-[10px] font-mono uppercase tracking-wider text-[#EF4444] shrink-0">
              <Lock size={10} strokeWidth={2} />
              <span className="hidden sm:inline">Locked</span>
            </span>
          )}
        </div>

        {/* Right: Copy Code, Timer, ThemeToggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyInvite}
            title="Copy invite link"
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#B47B38] dark:hover:border-[#F2C594]/50 text-xs transition-all duration-150 cursor-pointer"
          >
            <span className="font-mono tabular-nums text-[#B47B38] dark:text-[#F2C594] tracking-wider">
              {meeting.roomCode}
            </span>
            {copiedInvite ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#10B981]">
                <Check size={12} strokeWidth={2} />
                <span className="hidden sm:inline">Copied</span>
              </span>
            ) : (
              <Copy
                size={12}
                strokeWidth={1.75}
                className="text-[#6B6B70] dark:text-[#8E8E93]"
              />
            )}
          </button>

          {/* Live Call Duration Timer */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] font-mono tabular-nums text-xs text-[#111113] dark:text-[#F5F5F7]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionState === ConnectionState.Connected
                  ? "bg-[#10B981] animate-pulse"
                  : "bg-[#B47B38] dark:bg-[#F2C594]"
              }`}
            />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Stage + Slide-Over Drawers */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        {/* Video Canvas Area */}
        <main className="flex-1 min-w-0 min-h-0 p-4 sm:p-6 pb-24 flex items-center justify-center overflow-y-auto">
          {connectionState === ConnectionState.Connecting ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                size={24}
                strokeWidth={1.75}
                className="animate-spin text-[#B47B38] dark:text-[#F2C594]"
              />
              <span className="text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93]">
                Connecting to studio room...
              </span>
            </div>
          ) : isSpotlight && isTrackReference(activeScreenShare) ? (
            /* Spotlight Screen Share Layout */
            <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 min-h-0">
              {/* Primary Screen Share Stage */}
              <div className="flex-1 min-h-[280px] rounded-2xl bg-[#111113] dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 relative overflow-hidden flex items-center justify-center shadow-lg">
                <VideoTrack
                  trackRef={activeScreenShare}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/[0.1] text-xs text-[#F5F5F7]">
                  <MonitorUp
                    size={13}
                    strokeWidth={1.75}
                    className="text-[#F2C594]"
                  />
                  <span>
                    {activeScreenShare.participant.name ||
                      activeScreenShare.participant.identity}{" "}
                    is presenting
                  </span>
                </div>
              </div>

              {/* Participant Strip Sidebar */}
              <div className="w-full lg:w-72 shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 overflow-y-auto lg:max-h-full content-start">
                {cameraTracks.map((trackRef) => (
                  <ParticipantTileCard
                    key={`${trackRef.participant.identity}_${trackRef.source}`}
                    trackRef={trackRef}
                    compact
                    isHandRaised={Boolean(
                      raisedHands[trackRef.participant.identity]
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Dynamic Responsive Equal-Aspect Video Grid */
            <div
              className={`w-full mx-auto grid gap-4 items-center justify-center ${gridClassName}`}
            >
              {cameraTracks.map((trackRef) => (
                <ParticipantTileCard
                  key={`${trackRef.participant.identity}_${trackRef.source}`}
                  trackRef={trackRef}
                  isHandRaised={Boolean(
                    raisedHands[trackRef.participant.identity]
                  )}
                />
              ))}
            </div>
          )}
        </main>

        {/* Slide-Over Participants & Waiting Room Drawer */}
        {activeDrawer === "participants" && (
          <aside className="w-full sm:w-[340px] shrink-0 h-full bg-white dark:bg-[#131316] border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col z-30 shadow-2xl">
            <div className="h-14 px-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-sm font-semibold tracking-[-0.02em]">
                  Participants
                </h2>
                <span className="font-mono tabular-nums text-[11px] px-2 py-0.5 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#B47B38] dark:text-[#F2C594]">
                  {participants.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] rounded-md transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Host Waiting Room Queue */}
              {isHost && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                      Waiting Room
                    </span>
                    {waitingGuests.length > 0 && (
                      <span className="font-mono tabular-nums text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B47B38] dark:bg-[#F2C594] text-white dark:text-[#09090B]">
                        {waitingGuests.length} waiting
                      </span>
                    )}
                  </div>

                  {waitingGuests.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.06] dark:border-white/[0.06] text-xs text-[#6B6B70] dark:text-[#8E8E93]">
                      {waitingRoomEnabled
                        ? "No guests currently waiting."
                        : "Waiting room is currently off."}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {waitingGuests.map((guest) => (
                        <div
                          key={guest.id}
                          className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#09090B] border border-[#B47B38]/30 dark:border-[#F2C594]/30 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center font-heading text-[11px] font-semibold text-[#B47B38] dark:text-[#F2C594] shrink-0">
                                {getInitials(guest.guestName)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-[#111113] dark:text-[#F5F5F7] truncate">
                                  {guest.guestName}
                                </div>
                                <div className="text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                                  Waiting to join
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={moderatingGuestId === guest.id}
                              onClick={() =>
                                handleModerateGuest(guest.id, "ADMIT")
                              }
                              className="flex-1 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] text-xs font-semibold transition-all duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              Admit
                            </button>
                            <button
                              type="button"
                              disabled={moderatingGuestId === guest.id}
                              onClick={() =>
                                handleModerateGuest(guest.id, "REJECT")
                              }
                              className="px-3 py-1.5 rounded-lg bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EF4444]/15 hover:text-[#EF4444] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] transition-all duration-150 disabled:opacity-50 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Active In-Call Participants */}
              <div className="space-y-3">
                <span className="block font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                  In Call ({participants.length})
                </span>
                <div className="space-y-2">
                  {participants.map((p) => (
                    <ParticipantRosterRow
                      key={p.identity}
                      participant={p}
                      isViewerHost={isHost}
                      isHandRaised={Boolean(raisedHands[p.identity])}
                      isActionPending={actionPendingIdentity === p.identity}
                      onHostAction={handleHostParticipantAction}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Slide-Over Real-Time Room Chat Drawer */}
        {activeDrawer === "chat" && (
          <aside className="w-full sm:w-[340px] shrink-0 h-full bg-white dark:bg-[#131316] border-l border-black/[0.08] dark:border-white/[0.08] flex flex-col z-30 shadow-2xl select-text">
            <div className="h-14 px-5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-sm font-semibold tracking-[-0.02em]">
                  Room Chat
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B6B70] dark:text-[#8E8E93]">
                  Live
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] rounded-md transition-colors cursor-pointer"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            {/* Chat Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                  <div className="w-10 h-10 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center text-[#B47B38] dark:text-[#F2C594] mb-3">
                    <MessageSquare size={17} strokeWidth={1.75} />
                  </div>
                  <p className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7]">
                    No messages yet
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                    Messages are ephemeral and visible to participants currently
                    in the room.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isSelf ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-medium text-[#6B6B70] dark:text-[#8E8E93]">
                        {msg.isSelf ? "You" : msg.senderName}
                      </span>
                      <span className="font-mono tabular-nums text-[10px] text-[#6B6B70]/80 dark:text-[#8E8E93]/80">
                        {formatChatTime(msg.timestamp)}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words border ${
                        msg.isSelf
                          ? "bg-[#F2F0EB] border-[#B47B38]/30 dark:bg-[#F2C594]/15 dark:border-[#F2C594]/30 text-[#111113] dark:text-[#F5F5F7]"
                          : "bg-[#FAF9F6] border-black/[0.08] dark:bg-[#1A1A1E] dark:border-white/[0.08] text-[#111113] dark:text-[#F5F5F7]"
                      }`}
                    >
                      {renderMessageWithLinks(msg.text)}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={handleSendChatMessage}
              className="p-3.5 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..."
                maxLength={1000}
                className="flex-1 bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#111113] dark:text-[#F5F5F7] placeholder-[#6B6B70] dark:placeholder-[#8E8E93] focus:outline-none focus:border-[#B47B38] dark:focus:border-[#F2C594]/60 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
              >
                <Send size={14} strokeWidth={2} />
              </button>
            </form>
          </aside>
        )}

        {/* Centered Floating In-Call Control Dock (backdrop-blur-md) */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-[#131316]/85 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] shadow-xl dark:shadow-2xl dark:shadow-black/80">
            {/* Mic Toggle (Shortcut: M) */}
            <button
              type="button"
              {...micToggle.buttonProps}
              aria-label={
                micToggle.enabled ? "Mute microphone" : "Unmute microphone"
              }
              title={
                micToggle.enabled
                  ? "Mute microphone (M)"
                  : "Unmute microphone (M)"
              }
              className={`p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                micToggle.enabled
                  ? "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
                  : "bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent"
              }`}
            >
              {micToggle.enabled ? (
                <Mic size={18} strokeWidth={1.75} />
              ) : (
                <MicOff size={18} strokeWidth={1.75} />
              )}
            </button>

            {/* Camera Toggle (Shortcut: V) */}
            <button
              type="button"
              {...camToggle.buttonProps}
              aria-label={
                camToggle.enabled ? "Turn off camera" : "Turn on camera"
              }
              title={
                camToggle.enabled
                  ? "Turn off camera (V)"
                  : "Turn on camera (V)"
              }
              className={`p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                camToggle.enabled
                  ? "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
                  : "bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent"
              }`}
            >
              {camToggle.enabled ? (
                <Video size={18} strokeWidth={1.75} />
              ) : (
                <VideoOff size={18} strokeWidth={1.75} />
              )}
            </button>

            {/* Screen Share Toggle */}
            <button
              type="button"
              {...screenToggle.buttonProps}
              aria-label={
                screenToggle.enabled ? "Stop screen share" : "Share screen"
              }
              title={
                screenToggle.enabled ? "Stop screen share" : "Share screen"
              }
              className={`p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                screenToggle.enabled
                  ? "bg-[#18181B] text-[#FAF9F6] dark:bg-[#F2C594] dark:text-[#09090B] shadow-md dark:shadow-[0_0_20px_-4px_rgba(242,197,148,0.4)]"
                  : "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
              }`}
            >
              <MonitorUp size={18} strokeWidth={1.75} />
            </button>

            {/* Raise Hand Toggle (Shortcut: H) */}
            <button
              type="button"
              onClick={handleToggleRaiseHand}
              aria-label={isHandRaised ? "Lower hand" : "Raise hand"}
              title={isHandRaised ? "Lower hand (H)" : "Raise hand (H)"}
              className={`p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                isHandRaised
                  ? "bg-[#18181B] text-[#FAF9F6] dark:bg-[#F2C594] dark:text-[#09090B] shadow-md dark:shadow-[0_0_20px_-4px_rgba(242,197,148,0.4)]"
                  : "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
              }`}
            >
              <Hand size={18} strokeWidth={1.75} />
            </button>

            <div
              className="w-px h-6 bg-black/[0.08] dark:bg-white/[0.1] mx-0.5"
              aria-hidden="true"
            />

            {/* Chat Drawer Toggle (Shortcut: C) */}
            <button
              type="button"
              onClick={() =>
                setActiveDrawer((prev) => (prev === "chat" ? null : "chat"))
              }
              aria-label="Toggle room chat"
              title="Room chat (C)"
              className={`relative p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                activeDrawer === "chat"
                  ? "bg-[#18181B] text-[#FAF9F6] dark:bg-[#F2C594] dark:text-[#09090B]"
                  : "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
              }`}
            >
              <MessageSquare size={18} strokeWidth={1.75} />
              {hasUnreadChat && activeDrawer !== "chat" && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B47B38] dark:bg-[#F2C594] ring-2 ring-white dark:ring-[#131316]" />
              )}
            </button>

            {/* Participants & Waiting Room Drawer Toggle */}
            <button
              type="button"
              onClick={() =>
                setActiveDrawer((prev) =>
                  prev === "participants" ? null : "participants"
                )
              }
              aria-label="Toggle participants and waiting room drawer"
              title="Participants & Waiting Room"
              className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                activeDrawer === "participants"
                  ? "bg-[#18181B] text-[#FAF9F6] dark:bg-[#F2C594] dark:text-[#09090B]"
                  : "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
              }`}
            >
              <Users size={18} strokeWidth={1.75} />
              <span className="font-mono tabular-nums text-xs font-medium">
                {participants.length}
              </span>
              {isHost && waitingGuests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[#B47B38] dark:bg-[#F2C594] text-white dark:text-[#09090B] font-mono tabular-nums text-[10px] font-bold flex items-center justify-center shadow-md">
                  {waitingGuests.length}
                </span>
              )}
            </button>

            {/* Host Room Security Popover */}
            {isHost && (
              <div className="relative" ref={securityRef}>
                <button
                  type="button"
                  onClick={() => setIsSecurityOpen((prev) => !prev)}
                  aria-label="Room security controls"
                  title="Room Security"
                  className={`p-3 rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                    isSecurityOpen || isLocked
                      ? "bg-[#18181B] text-[#FAF9F6] dark:bg-[#F2C594]/15 dark:text-[#F2C594] border border-[#B47B38]/40 dark:border-[#F2C594]/40"
                      : "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                >
                  <Shield size={18} strokeWidth={1.75} />
                </button>

                {isSecurityOpen && (
                  <div className="absolute bottom-full mb-3 right-0 w-72 bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.12] dark:border-t-white/15 rounded-2xl p-4 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                      <span className="font-heading text-xs font-semibold tracking-tight">
                        Room Security
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#B47B38] dark:text-[#F2C594]">
                        Host
                      </span>
                    </div>

                    {/* Lock Room Switch */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {isLocked ? (
                          <Lock
                            size={14}
                            strokeWidth={1.75}
                            className="text-[#EF4444] mt-0.5 shrink-0"
                          />
                        ) : (
                          <Unlock
                            size={14}
                            strokeWidth={1.75}
                            className="text-[#6B6B70] dark:text-[#8E8E93] mt-0.5 shrink-0"
                          />
                        )}
                        <div>
                          <div className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7]">
                            Lock Room
                          </div>
                          <div className="text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                            Block uninvited new entries
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isLocked}
                        disabled={isUpdatingSettings}
                        onClick={() =>
                          handleToggleSetting("isLocked", !isLocked)
                        }
                        className={`w-9 h-5 rounded-full relative transition-colors duration-150 cursor-pointer border shrink-0 ${
                          isLocked
                            ? "bg-[#EF4444] border-[#EF4444]"
                            : "bg-[#F2F0EB] border-black/[0.12] dark:bg-[#1A1A1E] dark:border-white/[0.12]"
                        }`}
                      >
                        <span
                          className={`block w-3.5 h-3.5 rounded-full transition-transform duration-150 ${
                            isLocked
                              ? "bg-white translate-x-4"
                              : "bg-[#6B6B70] dark:bg-white translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Waiting Room Switch */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Shield
                          size={14}
                          strokeWidth={1.75}
                          className="text-[#B47B38] dark:text-[#F2C594] mt-0.5 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-medium text-[#111113] dark:text-[#F5F5F7]">
                            Waiting Room
                          </div>
                          <div className="text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                            Require host admission
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={waitingRoomEnabled}
                        disabled={isUpdatingSettings}
                        onClick={() =>
                          handleToggleSetting(
                            "waitingRoomEnabled",
                            !waitingRoomEnabled
                          )
                        }
                        className={`w-9 h-5 rounded-full relative transition-colors duration-150 cursor-pointer border shrink-0 ${
                          waitingRoomEnabled
                            ? "bg-[#D99B52] border-[#D99B52] dark:bg-[#F2C594] dark:border-[#F2C594]"
                            : "bg-[#F2F0EB] border-black/[0.12] dark:bg-[#1A1A1E] dark:border-white/[0.12]"
                        }`}
                      >
                        <span
                          className={`block w-3.5 h-3.5 rounded-full transition-transform duration-150 ${
                            waitingRoomEnabled
                              ? "bg-white dark:bg-[#09090B] translate-x-4"
                              : "bg-[#6B6B70] dark:bg-white translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leave / End Meeting Button (#EF4444) */}
            <div className="relative" ref={leaveRef}>
              <button
                type="button"
                onClick={() => {
                  if (isHost) {
                    setIsLeaveMenuOpen((prev) => !prev);
                  } else {
                    handleLeaveCall();
                  }
                }}
                aria-label="Leave or end meeting"
                title={isHost ? "Leave or End Meeting" : "Leave Meeting"}
                className="p-3 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer shadow-md shadow-[#EF4444]/20"
              >
                <PhoneOff size={18} strokeWidth={1.75} />
              </button>

              {isHost && isLeaveMenuOpen && (
                <div className="absolute bottom-full mb-3 right-0 w-52 bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.12] dark:border-t-white/15 rounded-2xl p-2 shadow-2xl space-y-1">
                  <button
                    type="button"
                    onClick={handleLeaveCall}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#111113] dark:text-[#F5F5F7] hover:bg-[#F2F0EB] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    Leave room
                  </button>
                  <button
                    type="button"
                    onClick={handleEndMeetingForAll}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                  >
                    End meeting for all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Root VideoRoomClient Wrapper (Token Fetch, LiveKitRoom, Post-Call Summary)  */
/* -------------------------------------------------------------------------- */
export function VideoRoomClient({
  meeting,
  isHost,
  defaultName,
  guestToken: initialGuestToken,
}: VideoRoomClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [postCallState, setPostCallState] = useState<PostCallState | null>(
    null
  );
  const [retryCount, setRetryCount] = useState(0);

  const postCallStateRef = useRef<PostCallState | null>(null);
  const latestDurationRef = useRef(0);

  useEffect(() => {
    postCallStateRef.current = postCallState;
  }, [postCallState]);

  const handleDurationSync = useCallback((durationSeconds: number) => {
    latestDurationRef.current = durationSeconds;
  }, []);

  // Initial media choices from Lobby sessionStorage
  const [mediaPrefs, setMediaPrefs] = useState<{
    audio: boolean | { deviceId: string };
    video: boolean | { deviceId: string };
    ready: boolean;
  }>({
    audio: true,
    video: true,
    ready: false,
  });

  useEffect(() => {
    let active = true;

    async function bootstrapRoom() {
      setError(null);
      setConnectionError(null);
      setToken(null);

      let prefs: LobbyPrefs = {};
      try {
        const stored = sessionStorage.getItem(`kova:lobby:${meeting.roomCode}`);
        if (stored) {
          prefs = JSON.parse(stored) as LobbyPrefs;
        }
      } catch {
        prefs = {};
      }

      const audioEnabled = prefs.audioEnabled ?? true;
      const videoEnabled = prefs.videoEnabled ?? true;

      const audioOption = !audioEnabled
        ? false
        : prefs.audioDeviceId
          ? { deviceId: prefs.audioDeviceId }
          : true;

      const videoOption = !videoEnabled
        ? false
        : prefs.videoDeviceId
          ? { deviceId: prefs.videoDeviceId }
          : true;

      if (!active) return;
      setMediaPrefs({
        audio: audioOption,
        video: videoOption,
        ready: true,
      });

      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode: meeting.roomCode,
            participantName: prefs.displayName || defaultName || "Guest",
            guestToken: initialGuestToken || prefs.guestToken || null,
          }),
        });

        const data = (await res.json()) as {
          token?: string;
          serverUrl?: string;
          error?: string;
        };

        if (!active) return;

        const cleanToken =
          typeof data.token === "string" ? data.token.trim() : "";
        const cleanUrl =
          typeof data.serverUrl === "string" ? data.serverUrl.trim() : "";

        if (
          !res.ok ||
          !cleanToken ||
          !cleanToken.startsWith("eyJ") ||
          !cleanUrl
        ) {
          setError(data.error || "Unable to connect to this meeting room.");
          return;
        }

        setToken(cleanToken);
        setServerUrl(cleanUrl);
      } catch {
        if (!active) return;
        setError("Network error while joining room.");
      }
    }

    bootstrapRoom();
    return () => {
      active = false;
    };
  }, [defaultName, initialGuestToken, meeting.roomCode, retryCount]);

  const handleRetryConnection = useCallback(() => {
    setPostCallState(null);
    postCallStateRef.current = null;
    latestDurationRef.current = 0;
    setRetryCount((prev) => prev + 1);
  }, []);

  const handleCallExit = useCallback(
    (reason: PostCallReason, durationSeconds: number) => {
      const nextState = { reason, durationSeconds };
      postCallStateRef.current = nextState;
      setPostCallState(nextState);
    },
    []
  );

  const handleRoomDisconnected = useCallback((reason?: DisconnectReason) => {
    if (postCallStateRef.current) return;

    let mappedReason: PostCallReason = "LEFT";
    if (reason === DisconnectReason.ROOM_DELETED) {
      mappedReason = "ENDED_BY_HOST";
    } else if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
      mappedReason = "REMOVED";
    }

    const nextState = {
      reason: mappedReason,
      durationSeconds: latestDurationRef.current,
    };
    postCallStateRef.current = nextState;
    setPostCallState(nextState);
  }, []);

  /* Post-Call Summary Screen */
  if (postCallState) {
    const isEndedByHost = postCallState.reason === "ENDED_BY_HOST";
    const isRemoved = postCallState.reason === "REMOVED";

    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col">
        <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between">
          <Link
            href={isHost ? "/dashboard" : "/"}
            className="transition-opacity hover:opacity-90"
          >
            <KovaLogo size="md" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-black/[0.04] dark:shadow-2xl dark:shadow-black/80">
            <div className="flex justify-center mb-6">
              <KovaLogo size="md" />
            </div>

            <h1 className="font-heading text-2xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
              {isEndedByHost
                ? "Meeting ended"
                : isRemoved
                  ? "Removed from room"
                  : "You left the room"}
            </h1>

            <p className="mt-2 text-xs text-[#6B6B70] dark:text-[#8E8E93]">
              {meeting.title}
            </p>

            {/* Duration & Room Code Summary */}
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#6B6B70] dark:text-[#8E8E93]">
                <Clock size={14} strokeWidth={1.75} />
                <span>Call Duration</span>
              </div>
              <span className="font-mono tabular-nums font-medium text-[#111113] dark:text-[#F2C594]">
                {formatDuration(postCallState.durationSeconds)}
              </span>
            </div>

            {/* Post-Call Actions */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              {!isEndedByHost && !isRemoved && (
                <button
                  type="button"
                  onClick={handleRetryConnection}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-xl transition-all duration-150 cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
                >
                  <RefreshCw size={13} strokeWidth={2} />
                  <span>Rejoin</span>
                </button>
              )}

              <Link
                href={isHost ? "/dashboard" : "/"}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-all duration-150"
              >
                <ArrowLeft size={14} strokeWidth={1.75} />
                <span>{isHost ? "Return to Dashboard" : "Home"}</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeError = error || connectionError;

  if (activeError) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col">
        <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <KovaLogo size="md" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:shadow-black/60">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444] mx-auto mb-4">
              <AlertCircle size={20} strokeWidth={1.75} />
            </div>
            <h1 className="font-heading text-xl font-semibold tracking-[-0.025em]">
              Connection failed
            </h1>
            <p className="mt-2 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed">
              {activeError}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href={`/m/${meeting.roomCode}/lobby`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-all duration-150"
              >
                <ArrowLeft size={14} strokeWidth={1.75} />
                <span>Back to Lobby</span>
              </Link>
              <button
                type="button"
                onClick={handleRetryConnection}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#FAF9F6] bg-[#18181B] hover:bg-[#27272A] dark:text-[#09090B] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] rounded-xl transition-all duration-150 cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
              >
                <RefreshCw size={13} strokeWidth={2} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const hasValidCredentials = Boolean(
    mediaPrefs.ready &&
      typeof token === "string" &&
      token.trim().length > 0 &&
      token.startsWith("eyJ") &&
      typeof serverUrl === "string" &&
      serverUrl.trim().length > 0
  );

  if (!hasValidCredentials || !token || !serverUrl) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col items-center justify-center p-6 gap-4">
        <KovaLogo size="md" />
        <div className="flex items-center gap-2.5 text-xs text-[#6B6B70] dark:text-[#8E8E93]">
          <Loader2
            size={15}
            strokeWidth={1.75}
            className="animate-spin text-[#B47B38] dark:text-[#F2C594]"
          />
          <span>Initializing encrypted studio session...</span>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={Boolean(token && serverUrl)}
      audio={mediaPrefs.audio}
      video={mediaPrefs.video}
      onDisconnected={handleRoomDisconnected}
      onError={(err) => {
        setConnectionError(
          err?.message ||
            "Could not establish signal connection. Please try again."
        );
      }}
      className="h-screen w-full overflow-hidden"
    >
      <RoomAudioRenderer />
      <KovaStudioStage
        meeting={meeting}
        isHost={isHost}
        onCallExit={handleCallExit}
        onDurationSync={handleDurationSync}
      />
    </LiveKitRoom>
  );
}
