/**
 * audioRecorder.js – Browser 16kHz Mono WAV Audio Recorder.
 * Records microphone audio directly into 16kHz 16-bit mono PCM WAV,
 * perfectly matching NVIDIA Riva / Whisper requirements without external transcoding.
 */

class WavAudioRecorder {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.processor = null;
    this.source = null;
    this.recordedBuffers = [];
    this.isRecording = false;
    this._isStopping = false;
    this.sampleRate = 16000;
  }

  isSupported() {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      (window.AudioContext || window.webkitAudioContext)
    );
  }

  async start() {
    if (!this.isSupported()) {
      throw new Error("Microphone access is not supported by your browser.");
    }

    // Await the full teardown of any previous session before starting a new one
    await this.cancel();

    // Request microphone without overconstrained sampleRate
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    const sourceSampleRate = this.audioContext.sampleRate;

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.recordedBuffers = [];

    // ScriptProcessor for universal browser compatibility
    const bufferSize = 4096;
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      // Downsample to 16000 Hz if source is higher
      const downsampled = downsampleBuffer(input, sourceSampleRate, this.sampleRate);
      this.recordedBuffers.push(new Float32Array(downsampled));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  async stop() {
    // If already stopping or nothing was ever started, return null
    if (this._isStopping) return null;
    if (!this.isRecording && !this.mediaStream && this.recordedBuffers.length === 0) {
      return null;
    }
    this._isStopping = true;

    this.isRecording = false;

    // Disconnect audio nodes
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    // Merge buffers
    const totalLength = this.recordedBuffers.reduce((acc, b) => acc + b.length, 0);
    if (totalLength === 0) {
      return null;
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const b of this.recordedBuffers) {
      merged.set(b, offset);
      offset += b.length;
    }
    this.recordedBuffers = [];
    this._isStopping = false;

    // Encode to 16-bit PCM WAV at 16000Hz
    const wavBlob = encodeWAV(merged, this.sampleRate);
    return wavBlob;
  }

  async cancel() {
    this.isRecording = false;
    this._isStopping = false;
    this.recordedBuffers = [];
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
  }
}

/**
 * Downsample Float32Array buffer to target sample rate.
 */
function downsampleBuffer(buffer, sourceRate, targetRate) {
  if (sourceRate === targetRate) {
    return buffer;
  }
  const ratio = sourceRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

/**
 * Encode Float32Array PCM samples into a 16-bit mono WAV Blob.
 */
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, "WAVE");
  // format chunk identifier
  writeString(view, 12, "fmt ");
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 2 bytes * 1 channel)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 channel * 2 bytes)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, "data");
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples as 16-bit signed integers
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const audioRecorder = new WavAudioRecorder();
export default audioRecorder;
