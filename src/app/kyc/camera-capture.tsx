"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, RefreshCw, Check } from "lucide-react";

/**
 * Full-screen camera capture for selfies. Uses getUserMedia with the
 * front-facing camera, shows a mirrored live preview, and returns a JPEG
 * `File` to the caller. Gracefully degrades with a clear message when the
 * browser blocks camera access (the uploader still offers file upload).
 */
export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const pendingFile = useRef<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (err: any) {
        const name = err?.name || "";
        setError(
          name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings, or upload a photo instead."
            : name === "NotFoundError"
            ? "No camera was found on this device. Please upload a photo instead."
            : "Couldn't start the camera. Please upload a photo instead."
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        pendingFile.current = file;
        setPreview(URL.createObjectURL(blob));
        stopStream();
      },
      "image/jpeg",
      0.92
    );
  }

  async function retake() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    pendingFile.current = null;
    setReady(false);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch {
      setError("Couldn't restart the camera. Please upload a photo instead.");
    }
  }

  function confirm() {
    if (pendingFile.current) {
      onCapture(pendingFile.current);
      close();
    }
  }

  function close() {
    if (preview) URL.revokeObjectURL(preview);
    stopStream();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1400] flex flex-col bg-black/95">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-medium">Take a selfie</span>
        <button
          type="button"
          onClick={close}
          className="rounded-full p-2 hover:bg-white/10"
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
        {error ? (
          <div className="max-w-sm text-center text-white/90">
            <Camera className="mx-auto h-10 w-10 text-white/60" />
            <p className="mt-4 text-sm">{error}</p>
            <Button variant="secondary" className="mt-6" onClick={close}>
              Close
            </Button>
          </div>
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selfie preview"
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="max-h-full max-w-full rounded-2xl object-contain"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!error && (
        <div className="p-6 pb-10 flex items-center justify-center gap-4">
          {preview ? (
            <>
              <Button variant="secondary" size="lg" onClick={retake}>
                <RefreshCw className="h-4 w-4" /> Retake
              </Button>
              <Button variant="gradient" size="lg" onClick={confirm}>
                <Check className="h-4 w-4" /> Use this photo
              </Button>
            </>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              onClick={capture}
              disabled={!ready}
              loading={!ready}
            >
              <Camera className="h-4 w-4" /> Capture
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
