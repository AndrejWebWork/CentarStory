export type ArmedCamera =
  | { stream: MediaStream }
  | { error: "camera" | "permission" | "unsupported" };

let inflight: Promise<ArmedCamera> | null = null;
let stopCurrent: (() => void) | null = null;
const listeners = new Set<(value: ArmedCamera) => void>();

function publish(value: ArmedCamera) {
  if (listeners.size === 0) return;
  inflight = null;
  for (const listener of listeners) listener(value);
}

export function subscribeArmedCamera(listener: (value: ArmedCamera) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function armCamera() {
  stopCurrent?.();
  stopCurrent = null;
  const promise = (async (): Promise<ArmedCamera> => {
    if (!navigator.mediaDevices?.getUserMedia) return { error: "unsupported" };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        audio: false,
      });
      stopCurrent = () => stream.getTracks().forEach((track) => track.stop());
      return { stream };
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : "";
      return {
        error: name === "NotAllowedError" || name === "PermissionDeniedError" ? "permission" : "camera",
      };
    }
  })();
  inflight = promise;
  void promise.then((value) => {
    if (inflight !== promise) return;
    publish(value);
  });
  return promise;
}

export function takeArmedCamera() {
  const pending = inflight;
  inflight = null;
  return pending;
}
