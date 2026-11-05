/**
 * Free, in-browser voice: speechSynthesis speaks, SpeechRecognition listens.
 * Supported in Chrome, Edge and Safari; Firefox has no SpeechRecognition.
 */

export function getSpeechRecognition(): BrowserSpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * SOURCE OF TRUTH KEYWORDS: isBrowserVoiceSupported, speech support, browser voice check, firefox unsupported
 * WHAT:  True when this browser can both speak (speechSynthesis) and listen (SpeechRecognition).
 * WHERE: hooks/useBrowserInterview.ts before starting a call.
 */
export function isBrowserVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && getSpeechRecognition() !== null;
}

/** Voices load asynchronously in Chrome; wait briefly for them, then prefer a natural English voice. */
async function pickVoice(): Promise<SpeechSynthesisVoice | null> {
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (voices.length === 0) {
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      synth.addEventListener("voiceschanged", done, { once: true });
      setTimeout(done, 1000);
    });
    voices = synth.getVoices();
  }
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const preferred = ["Google US English", "Samantha", "Microsoft Aria", "Microsoft Jenny", "Karen", "Daniel"];
  for (const name of preferred) {
    const match = english.find((voice) => voice.name.includes(name));
    if (match) return match;
  }
  return english.find((voice) => voice.lang === "en-US") ?? english[0] ?? null;
}

/**
 * SOURCE OF TRUTH KEYWORDS: speak, text to speech, speechSynthesis, interviewer voice, browser tts
 * WHAT:  Speaks `text` and resolves when it finishes, is cancelled, or the abort signal fires.
 * WHY:   Free replacement for Vapi's paid voice. Has a safety timeout because some browsers
 *        occasionally never fire `end`, which would otherwise freeze the interview.
 * WHERE: hooks/useBrowserInterview.ts.
 */
export async function speak(text: string, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return;
  const synth = window.speechSynthesis;
  const voice = await pickVoice();
  if (signal?.aborted) return;

  await new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    const onAbort = () => {
      synth.cancel();
      finish();
    };
    // Roughly 80ms per character plus slack; only fires if the browser never reports `end`.
    const safety = setTimeout(finish, 4000 + text.length * 80);

    utterance.onend = finish;
    utterance.onerror = finish;
    signal?.addEventListener("abort", onAbort, { once: true });
    synth.cancel();
    synth.speak(utterance);
  });
}

/**
 * SOURCE OF TRUTH KEYWORDS: listen, speech to text, SpeechRecognition, capture answer, silence detection, browser stt
 * WHAT:  Listens to the candidate and resolves with their answer once they stop talking,
 *        when `signal` aborts ("I'm done" or end call), or after a long silence with no speech.
 * WHY:   Free replacement for Vapi/Deepgram transcription. Restarts recognition when the browser
 *        stops it early, and rejects with "not-allowed" when the microphone is blocked.
 * WHERE: hooks/useBrowserInterview.ts.
 */
export function listen({
  signal,
  onPartial,
  silenceMs = 2600,
  noSpeechMs = 15000,
  maxMs = 180000,
}: {
  signal?: AbortSignal;
  onPartial?: (text: string) => void;
  silenceMs?: number;
  noSpeechMs?: number;
  maxMs?: number;
}): Promise<string> {
  const Recognition = getSpeechRecognition();
  if (!Recognition) return Promise.reject(new Error("speech-unsupported"));

  return new Promise<string>((resolve, reject) => {
    const finals: string[] = [];
    let interim = "";
    let heardSpeech = false;
    let settled = false;
    let recognition: BrowserSpeechRecognition | null = null;
    let silenceTimer: ReturnType<typeof setTimeout> | undefined;
    // Sessions that end almost immediately mean the speech service is unreachable; don't spin forever.
    let lastStartedAt = 0;
    let rapidEnds = 0;

    const currentText = () => [...finals, interim].join(" ").replace(/\s+/g, " ").trim();

    const cleanup = () => {
      clearTimeout(silenceTimer);
      clearTimeout(noSpeechTimer);
      clearTimeout(maxTimer);
      signal?.removeEventListener("abort", onAbort);
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {}
      }
    };
    const done = () => {
      if (settled) return;
      settled = true;
      const text = currentText();
      cleanup();
      resolve(text);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => done();

    const armSilenceTimer = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(done, silenceMs);
    };

    const startRecognition = () => {
      const instance = new Recognition();
      instance.lang = "en-US";
      instance.continuous = true;
      instance.interimResults = true;
      instance.maxAlternatives = 1;

      instance.onresult = (event) => {
        interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result?.[0]?.transcript ?? "";
          if (result?.isFinal) finals.push(transcript.trim());
          else interim += transcript;
        }
        if (currentText()) {
          heardSpeech = true;
          clearTimeout(noSpeechTimer);
          armSilenceTimer();
        }
        onPartial?.(currentText());
      };
      instance.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
          fail(new Error(event.error));
        } else if (event.error === "network" || event.error === "language-not-supported") {
          fail(new Error("speech-unavailable"));
        }
        // "no-speech" and "aborted" end the session; onend restarts it.
      };
      instance.onend = () => {
        if (settled) return;
        rapidEnds = Date.now() - lastStartedAt < 800 ? rapidEnds + 1 : 0;
        if (rapidEnds >= 5) {
          fail(new Error("speech-unavailable"));
          return;
        }
        // Browsers stop recognition after a pause or ~60s; keep listening until we decide the answer is over.
        startRecognition();
      };
      recognition = instance;
      lastStartedAt = Date.now();
      try {
        instance.start();
      } catch (error) {
        fail(error instanceof Error ? error : new Error("speech-start-failed"));
      }
    };

    const noSpeechTimer = setTimeout(() => {
      if (!heardSpeech) done();
    }, noSpeechMs);
    const maxTimer = setTimeout(done, maxMs);

    if (signal?.aborted) {
      done();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
    startRecognition();
  });
}
