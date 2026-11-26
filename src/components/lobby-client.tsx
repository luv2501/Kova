"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  ChevronDown,
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { KovaLogo } from "@/components/kova-logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface LobbyMeeting {
  id: string;
  title: string;
  roomCode: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  status: "SCHEDULED" | "LIVE" | "ENDED";
}

interface LobbyClientProps {
  meeting: LobbyMeeting;
  isHost: boolean;
  defaultName: string;
}

type WaitingState = "IDLE" | "KNOCKING" | "WAITING" | "ADMITTED" | "REJECTED";

function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return "G";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function LobbyClient({
  meeting,
  isHost,
  defaultName,
}: LobbyClientProps) {
  const router = useRouter();

  // Join & waiting state
  const [displayName, setDisplayName] = useState(defaultName);
  const [waitingState, setWaitingState] = useState<WaitingState>("IDLE");
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Media state
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);

  // Refs for direct hardware & Web Audio lifecycle management
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const volumeFillRef = useRef<HTMLDivElement | null>(null);
  const isMicOnRef = useRef(isMicOn);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
    if (!isMicOn && volumeFillRef.current) {
      volumeFillRef.current.style.width = "0%";
    }
  }, [isMicOn]);

  const stopAudioAnalyser = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (volumeFillRef.current) {
      volumeFillRef.current.style.width = "0%";
    }
  }, []);

  const stopAllStreams = useCallback(() => {
    stopAudioAnalyser();
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
  }, [stopAudioAnalyser]);

  const startAudioAnalyser = useCallback(
    (stream: MediaStream) => {
      stopAudioAnalyser();
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      try {
        const AudioCtx =
          window.AudioContext ||
          (
            window as unknown as {
              webkitAudioContext: typeof AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateMeter = () => {
          if (!analyserRef.current) return;

          if (!isMicOnRef.current) {
            if (volumeFillRef.current) {
              volumeFillRef.current.style.width = "0%";
            }
            rafIdRef.current = requestAnimationFrame(updateMeter);
            return;
          }

          analyserRef.current.getByteTimeDomainData(dataArray);
          let sumSquares = 0;
          for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / bufferLength);
          const percent = Math.min(100, Math.round(rms * 380));

          if (volumeFillRef.current) {
            volumeFillRef.current.style.width = `${percent}%`;
          }

          rafIdRef.current = requestAnimationFrame(updateMeter);
        };

        rafIdRef.current = requestAnimationFrame(updateMeter);
      } catch {
        // Gracefully ignore if AudioContext cannot start before user gesture
      }
    },
    [stopAudioAnalyser]
  );

  const enumerateMediaDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const audioDevices = devices.filter((d) => d.kind === "audioinput");
      setCameras(videoDevices);
      setMicrophones(audioDevices);

      if (videoDevices.length > 0) {
        setSelectedCameraId((prev) => prev || videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0) {
        setSelectedMicId((prev) => prev || audioDevices[0].deviceId);
      }
    } catch {
      // Ignore device enumeration errors
    }
  }, []);

  const initializeDevices = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setPermissionDenied(true);
      setIsCamOn(false);
      setIsMicOn(false);
      setMediaNotice("Camera and microphone APIs are unavailable in this browser.");
      return;
    }

    stopAllStreams();
    setPermissionDenied(false);
    setMediaNotice(null);

    try {
      const combined = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const vStream = new MediaStream(combined.getVideoTracks());
      const aStream = new MediaStream(combined.getAudioTracks());

      videoStreamRef.current = vStream;
      audioStreamRef.current = aStream;

      if (videoRef.current) {
        videoRef.current.srcObject = vStream;
      }

      const vTrack = vStream.getVideoTracks()[0];
      const aTrack = aStream.getAudioTracks()[0];
      if (vTrack?.getSettings().deviceId) {
        setSelectedCameraId(vTrack.getSettings().deviceId!);
      }
      if (aTrack?.getSettings().deviceId) {
        setSelectedMicId(aTrack.getSettings().deviceId!);
      }

      setIsCamOn(true);
      setIsMicOn(true);
      startAudioAnalyser(aStream);
      await enumerateMediaDevices();
    } catch (err) {
      // Attempt separate fallback if only one device exists or permission partially blocked
      const errorName = err instanceof Error ? err.name : "";
      if (
        errorName === "NotAllowedError" ||
        errorName === "PermissionDeniedError"
      ) {
        setPermissionDenied(true);
        setIsCamOn(false);
        setIsMicOn(false);
        setMediaNotice(
          "Camera and microphone access denied. Allow permissions in browser settings to preview."
        );
        await enumerateMediaDevices();
        return;
      }

      let gotVideo = false;
      let gotAudio = false;

      try {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStreamRef.current = vStream;
        if (videoRef.current) {
          videoRef.current.srcObject = vStream;
        }
        gotVideo = true;
      } catch {
        gotVideo = false;
      }

      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = aStream;
        startAudioAnalyser(aStream);
        gotAudio = true;
      } catch {
        gotAudio = false;
      }

      setIsCamOn(gotVideo);
      setIsMicOn(gotAudio);

      if (!gotVideo && !gotAudio) {
        setPermissionDenied(true);
        setMediaNotice("No camera or microphone detected.");
      } else if (!gotVideo) {
        setMediaNotice("Camera unavailable — audio preview active.");
      } else if (!gotAudio) {
        setMediaNotice("Microphone unavailable — video preview active.");
      }

      await enumerateMediaDevices();
    }
  }, [enumerateMediaDevices, startAudioAnalyser, stopAllStreams]);

  useEffect(() => {
    initializeDevices();
    const handleDeviceChange = () => {
      enumerateMediaDevices();
    };
    navigator.mediaDevices?.addEventListener?.(
      "devicechange",
      handleDeviceChange
    );
    return () => {
      navigator.mediaDevices?.removeEventListener?.(
        "devicechange",
        handleDeviceChange
      );
      stopAllStreams();
    };
  }, [initializeDevices, enumerateMediaDevices, stopAllStreams]);

  // Keep <video> bound whenever camera toggles back on
  useEffect(() => {
    if (isCamOn && videoRef.current && videoStreamRef.current) {
      videoRef.current.srcObject = videoStreamRef.current;
    }
  }, [isCamOn]);

  const handleToggleCamera = async () => {
    if (isCamOn) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCamOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCamOn(true);
      setPermissionDenied(false);
      setMediaNotice(null);
    } catch {
      setPermissionDenied(true);
      setIsCamOn(false);
      setMediaNotice("Unable to access camera. Check browser permissions.");
    }
  };

  const handleToggleMic = async () => {
    if (audioStreamRef.current) {
      const next = !isMicOn;
      audioStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
      if (next && audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
      setIsMicOn(next);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
      });
      audioStreamRef.current = stream;
      setIsMicOn(true);
      setPermissionDenied(false);
      startAudioAnalyser(stream);
    } catch {
      setPermissionDenied(true);
      setIsMicOn(false);
      setMediaNotice("Unable to access microphone. Check browser permissions.");
    }
  };

  const handleCameraChange = async (deviceId: string) => {
    setSelectedCameraId(deviceId);
    if (!isCamOn) return;

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCamOn(false);
      setMediaNotice("Failed to switch camera device.");
    }
  };

  const handleMicChange = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      stream.getAudioTracks().forEach((t) => {
        t.enabled = isMicOn;
      });
      audioStreamRef.current = stream;
      startAudioAnalyser(stream);
    } catch {
      setIsMicOn(false);
      setMediaNotice("Failed to switch microphone device.");
    }
  };

  const saveLobbyPreferences = useCallback(
    (token?: string | null) => {
      try {
        sessionStorage.setItem(
          `kova:lobby:${meeting.roomCode}`,
          JSON.stringify({
            displayName: displayName.trim() || "Guest",
            audioEnabled: isMicOn,
            videoEnabled: isCamOn,
            audioDeviceId: selectedMicId,
            videoDeviceId: selectedCameraId,
            guestToken: token || null,
          })
        );
      } catch {
        // Ignore storage quota issues
      }
    },
    [
      displayName,
      isCamOn,
      isMicOn,
      meeting.roomCode,
      selectedCameraId,
      selectedMicId,
    ]
  );

  // Poll waiting room status every 2.5 seconds while WAITING
  useEffect(() => {
    if (waitingState !== "WAITING" || !guestToken) return;

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const res = await fetch(
          `/api/meetings/${meeting.roomCode}/knock?token=${encodeURIComponent(
            guestToken
          )}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { status?: WaitingState };

        if (cancelled) return;

        if (data.status === "ADMITTED") {
          setWaitingState("ADMITTED");
          saveLobbyPreferences(guestToken);
          stopAllStreams();
          router.push(
            `/m/${meeting.roomCode}?guestToken=${encodeURIComponent(
              guestToken
            )}`
          );
        } else if (data.status === "REJECTED") {
          setWaitingState("REJECTED");
        }
      } catch {
        // Ignore transient network failures and keep polling
      }
    };

    const intervalId = setInterval(pollStatus, 2500);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    guestToken,
    meeting.roomCode,
    router,
    saveLobbyPreferences,
    stopAllStreams,
    waitingState,
  ]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = displayName.trim();
    if (!cleanName) {
      setErrorMessage("Please enter your display name.");
      return;
    }

    if (meeting.status === "ENDED") {
      setErrorMessage("This meeting has ended.");
      return;
    }

    if (meeting.isLocked && !isHost) {
      setErrorMessage("This meeting is locked by the host.");
      return;
    }

    // Direct entry for host or open rooms without waiting room
    if (isHost || !meeting.waitingRoomEnabled) {
      saveLobbyPreferences(null);
      stopAllStreams();
      router.push(`/m/${meeting.roomCode}`);
      return;
    }

    // Knock on Waiting Room gate for non-host guests
    setWaitingState("KNOCKING");
    try {
      const res = await fetch(`/api/meetings/${meeting.roomCode}/knock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: cleanName }),
      });

      const data = (await res.json()) as {
        guestToken?: string;
        error?: string;
      };

      if (!res.ok || !data.guestToken) {
        setErrorMessage(data.error || "Unable to request entry.");
        setWaitingState("IDLE");
        return;
      }

      setGuestToken(data.guestToken);
      setWaitingState("WAITING");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setWaitingState("IDLE");
    }
  };

  const canEnter =
    meeting.status !== "ENDED" && !(meeting.isLocked && !isHost);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#09090B] text-[#111113] dark:text-[#F5F5F7] flex flex-col selection:bg-[#D99B52]/25 dark:selection:bg-[#F2C594]/25 relative">
      {/* Subtle Ambient Top Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] pointer-events-none opacity-70 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(242, 197, 148, 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-black/[0.08] dark:border-white/[0.08] px-6 sm:px-10 relative z-10">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              href={isHost ? "/dashboard" : "/"}
              className="transition-opacity hover:opacity-90 shrink-0"
            >
              <KovaLogo size="md" />
            </Link>
            <span
              className="hidden sm:inline text-black/20 dark:text-white/20 font-mono text-xs select-none"
              aria-hidden="true"
            >
              /
            </span>
            <span className="hidden sm:inline text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] truncate">
              {meeting.title}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono tabular-nums text-xs text-[#B47B38] dark:text-[#F2C594] bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] px-3 py-1 rounded-md tracking-wider">
              {meeting.roomCode}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Two-Column Green Room Stage */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Preview Stage & Device Selectors */}
          <section className="lg:col-span-7 space-y-4">
            {/* 16:9 Mirrored Camera Preview Stage */}
            <div className="relative aspect-video w-full bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl overflow-hidden shadow-lg dark:shadow-2xl dark:shadow-black/60 flex items-center justify-center">
              {/* Mirrored Camera Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${
                  isCamOn ? "block" : "hidden"
                }`}
              />

              {/* Circular Initials Fallback Avatar when Camera is Off */}
              {!isCamOn && (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center font-heading text-2xl font-semibold text-[#B47B38] dark:text-[#F2C594] shadow-inner">
                    {getInitials(displayName)}
                  </div>
                  <span className="text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93]">
                    {permissionDenied ? "Camera unavailable" : "Camera is off"}
                  </span>
                </div>
              )}

              {/* Permission / Hardware Warning Pill */}
              {mediaNotice && (
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-[#131316]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#6B6B70] dark:text-[#8E8E93]">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle
                      size={14}
                      strokeWidth={1.75}
                      className="text-[#B47B38] dark:text-[#F2C594] shrink-0"
                    />
                    <span className="truncate">{mediaNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={initializeDevices}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#111113] dark:text-[#F2C594] hover:underline shrink-0 cursor-pointer"
                  >
                    <RefreshCw size={12} strokeWidth={1.75} />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Floating Bottom Controls + Live Mic Visualizer */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] bg-white/85 dark:bg-[#131316]/85 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] shadow-lg">
                {/* Mic Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleMic}
                  aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
                  title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                  className={`p-2.5 rounded-md transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                    isMicOn
                      ? "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
                      : "bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent"
                  }`}
                >
                  {isMicOn ? (
                    <Mic size={17} strokeWidth={1.75} />
                  ) : (
                    <MicOff size={17} strokeWidth={1.75} />
                  )}
                </button>

                {/* Camera Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
                  title={isCamOn ? "Turn off camera" : "Turn on camera"}
                  className={`p-2.5 rounded-md transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                    isCamOn
                      ? "bg-[#F2F0EB] dark:bg-[#1A1A1E] text-[#111113] dark:text-[#F5F5F7] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]"
                      : "bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent"
                  }`}
                >
                  {isCamOn ? (
                    <Video size={17} strokeWidth={1.75} />
                  ) : (
                    <VideoOff size={17} strokeWidth={1.75} />
                  )}
                </button>

                {/* Divider */}
                <div
                  className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.1]"
                  aria-hidden="true"
                />

                {/* Live Web Audio API Microphone Volume Visualizer Bar (#F2C594) */}
                <div
                  className="flex items-center gap-2 pr-1"
                  title="Live microphone input level"
                >
                  <div className="w-20 h-1.5 rounded-full bg-black/[0.08] dark:bg-white/[0.1] overflow-hidden">
                    <div
                      ref={volumeFillRef}
                      className="h-full bg-[#B47B38] dark:bg-[#F2C594] rounded-full transition-[width] duration-75 ease-out"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Device Selector Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Camera Selector */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B70] dark:text-[#8E8E93] pointer-events-none">
                  <Camera size={15} strokeWidth={1.75} />
                </div>
                <select
                  aria-label="Select camera"
                  value={selectedCameraId}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  disabled={cameras.length === 0}
                  className="w-full appearance-none bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-xl pl-10 pr-9 py-2.5 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] focus:outline-none focus:border-[#B47B38] dark:focus:border-[#F2C594]/60 transition-colors disabled:opacity-50 cursor-pointer truncate"
                >
                  {cameras.length === 0 ? (
                    <option value="">No camera detected</option>
                  ) : (
                    cameras.map((cam, idx) => (
                      <option key={cam.deviceId || idx} value={cam.deviceId}>
                        {cam.label || `Camera ${idx + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B70] dark:text-[#8E8E93] pointer-events-none">
                  <ChevronDown size={14} strokeWidth={1.75} />
                </div>
              </div>

              {/* Microphone Selector */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B70] dark:text-[#8E8E93] pointer-events-none">
                  <Mic size={15} strokeWidth={1.75} />
                </div>
                <select
                  aria-label="Select microphone"
                  value={selectedMicId}
                  onChange={(e) => handleMicChange(e.target.value)}
                  disabled={microphones.length === 0}
                  className="w-full appearance-none bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-xl pl-10 pr-9 py-2.5 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] focus:outline-none focus:border-[#B47B38] dark:focus:border-[#F2C594]/60 transition-colors disabled:opacity-50 cursor-pointer truncate"
                >
                  {microphones.length === 0 ? (
                    <option value="">No microphone detected</option>
                  ) : (
                    microphones.map((mic, idx) => (
                      <option key={mic.deviceId || idx} value={mic.deviceId}>
                        {mic.label || `Microphone ${idx + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B70] dark:text-[#8E8E93] pointer-events-none">
                  <ChevronDown size={14} strokeWidth={1.75} />
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Join / Waiting Room Panel */}
          <aside className="lg:col-span-5">
            <div className="bg-white dark:bg-[#131316] border border-black/[0.08] dark:border-white/[0.08] dark:border-t-white/15 rounded-2xl p-8 shadow-lg dark:shadow-2xl dark:shadow-black/60">
              {waitingState === "WAITING" ? (
                /* Waiting Room Active State */
                <div className="py-4 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-[#B47B38]/30 dark:border-[#F2C594]/30 flex items-center justify-center text-[#B47B38] dark:text-[#F2C594] mb-5">
                    <Loader2
                      size={24}
                      strokeWidth={1.75}
                      className="animate-spin"
                    />
                  </div>

                  <h1 className="font-heading text-xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                    Waiting for the host to let you in...
                  </h1>

                  <p className="mt-2.5 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed max-w-xs">
                    You&apos;ll enter{" "}
                    <span className="text-[#111113] dark:text-[#F5F5F7] font-medium">
                      {meeting.title}
                    </span>{" "}
                    automatically once admitted.
                  </p>

                  <div className="mt-6 w-full p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#09090B] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-xs">
                    <span className="text-[#6B6B70] dark:text-[#8E8E93]">
                      Joining as
                    </span>
                    <span className="font-medium text-[#111113] dark:text-[#F5F5F7] truncate max-w-[180px]">
                      {displayName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setWaitingState("IDLE");
                      setGuestToken(null);
                    }}
                    className="mt-6 text-xs font-medium text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  >
                    Cancel request
                  </button>
                </div>
              ) : waitingState === "REJECTED" ? (
                /* Host Declined State */
                <div className="py-4 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-5">
                    <Shield size={22} strokeWidth={1.75} />
                  </div>

                  <h1 className="font-heading text-xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                    Entry declined
                  </h1>

                  <p className="mt-2.5 text-xs text-[#6B6B70] dark:text-[#8E8E93] leading-relaxed max-w-xs">
                    The host was unable to admit you to this meeting room.
                  </p>

                  <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium text-[#111113] dark:text-[#F5F5F7] bg-[#F2F0EB] dark:bg-[#1A1A1E] hover:bg-[#EAE7E0] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl transition-all duration-150"
                  >
                    <ArrowLeft size={14} strokeWidth={1.75} />
                    <span>Return Home</span>
                  </Link>
                </div>
              ) : (
                /* Standard Ready-to-Join Form */
                <div>
                  {/* Room Metadata Kicker */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA]">
                      {isHost ? "Host Entry" : "Green Room"}
                    </span>
                    {meeting.status === "LIVE" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#10B981]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>

                  <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#111113] dark:text-[#F5F5F7] tracking-[-0.025em]">
                    Ready to join?
                  </h1>
                  <p className="mt-1.5 text-xs text-[#6B6B70] dark:text-[#8E8E93]">
                    {meeting.title}
                  </p>

                  {/* Status / Gate Notices */}
                  {meeting.status === "ENDED" && (
                    <div className="mt-5 p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-start gap-2.5 text-xs text-[#EF4444]">
                      <AlertCircle
                        size={15}
                        strokeWidth={1.75}
                        className="shrink-0 mt-0.5"
                      />
                      <span>This meeting has already ended.</span>
                    </div>
                  )}

                  {meeting.status !== "ENDED" &&
                    meeting.isLocked &&
                    !isHost && (
                      <div className="mt-5 p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-start gap-2.5 text-xs text-[#EF4444]">
                        <Lock
                          size={15}
                          strokeWidth={1.75}
                          className="shrink-0 mt-0.5"
                        />
                        <span>
                          Meeting is locked. Only the host can unlock entry.
                        </span>
                      </div>
                    )}

                  {meeting.status !== "ENDED" &&
                    !meeting.isLocked &&
                    meeting.waitingRoomEnabled &&
                    !isHost && (
                      <div className="mt-5 p-3.5 rounded-xl bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-[#B47B38]/30 dark:border-[#F2C594]/25 flex items-start gap-2.5 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                        <Shield
                          size={15}
                          strokeWidth={1.75}
                          className="text-[#B47B38] dark:text-[#F2C594] shrink-0 mt-0.5"
                        />
                        <span>
                          Waiting Room enabled. The host will admit you shortly.
                        </span>
                      </div>
                    )}

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="mt-5 px-3.5 py-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-xs text-[#EF4444]">
                      {errorMessage}
                    </div>
                  )}

                  {/* Display Name & Join Button */}
                  <form onSubmit={handleJoinSubmit} className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="display-name"
                        className="block font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#52525B] dark:text-[#A1A1AA] mb-2"
                      >
                        Display Name
                      </label>
                      <input
                        id="display-name"
                        type="text"
                        required
                        maxLength={80}
                        disabled={!canEnter || waitingState === "KNOCKING"}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[#F2F0EB] dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#111113] dark:text-[#F5F5F7] placeholder-[#6B6B70] dark:placeholder-[#8E8E93] focus:outline-none focus:border-[#B47B38] dark:focus:border-[#F2C594]/60 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !canEnter ||
                        waitingState === "KNOCKING" ||
                        !displayName.trim()
                      }
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#18181B] hover:bg-[#27272A] text-[#FAF9F6] dark:bg-[#F2C594] dark:hover:bg-[#F7D7B2] dark:text-[#09090B] text-sm font-semibold rounded-xl transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-[#D99B52]/50 dark:focus:ring-[#F2C594]/50 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md dark:shadow-[0_0_24px_-4px_rgba(242,197,148,0.35)]"
                    >
                      <span>
                        {waitingState === "KNOCKING"
                          ? "Requesting entry..."
                          : isHost || !meeting.waitingRoomEnabled
                            ? "Join Room"
                            : "Ask to Join"}
                      </span>
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <Link
                      href={isHost ? "/dashboard" : "/"}
                      className="inline-flex items-center gap-1.5 text-[#6B6B70] dark:text-[#8E8E93] hover:text-[#111113] dark:hover:text-[#F5F5F7] transition-colors"
                    >
                      <ArrowLeft size={13} strokeWidth={1.75} />
                      <span>{isHost ? "Back to Dashboard" : "Leave Lobby"}</span>
                    </Link>
                    <span className="font-mono text-[11px] text-[#6B6B70] dark:text-[#8E8E93]">
                      {isMicOn ? "Mic Ready" : "Mic Muted"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
