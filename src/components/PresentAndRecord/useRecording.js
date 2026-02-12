import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling full studio recording (Screen Capture + Audio Mixing).
 * Captures everything in the browser tab and mixes microphone audio reliably.
 */
const useRecording = () => {
    const [phase, setPhase] = useState('setup');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [countdownValue, setCountdownValue] = useState(3);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [processingProgress, setProcessingProgress] = useState(0);

    const [cameras, setCameras] = useState([]);
    const [microphones, setMicrophones] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('none');
    const [selectedMicrophone, setSelectedMicrophone] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const audioAnimFrameRef = useRef(null);
    const micStreamRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const displayStreamRef = useRef(null);
    const combinedStreamRef = useRef(null);

    const enumerateDevices = useCallback(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => { });
            const devices = await navigator.mediaDevices.enumerateDevices();
            setCameras(devices.filter(d => d.kind === 'videoinput'));
            const mics = devices.filter(d => d.kind === 'audioinput');
            setMicrophones(mics);
            if (mics.length > 0 && !selectedMicrophone) setSelectedMicrophone(mics[0].deviceId);
        } catch (err) {
            console.error('enumerateDevices error:', err);
        }
    }, [selectedMicrophone]);

    const startAudioMonitor = useCallback(async (deviceId) => {
        if (audioAnimFrameRef.current) cancelAnimationFrame(audioAnimFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
        if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());

        if (!deviceId) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
            micStreamRef.current = stream;
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkLevel = () => {
                if (!analyserRef.current) return;
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((prev, cur) => prev + cur, 0) / dataArray.length;
                setAudioLevel(avg / 255);
                audioAnimFrameRef.current = requestAnimationFrame(checkLevel);
            };
            checkLevel();
        } catch (err) {
            console.error('startAudioMonitor error:', err);
        }
    }, []);

    const startCameraPreview = useCallback(async (deviceId) => {
        if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach(t => t.stop());
        if (!deviceId || deviceId === 'none') return null;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId }, width: 640, height: 480 } });
            cameraStreamRef.current = stream;
            return stream;
        } catch (err) {
            console.error('startCameraPreview error:', err);
            return null;
        }
    }, []);

    const startCountdown = useCallback((onComplete) => {
        setPhase('countdown');
        setCountdownValue(3);
        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                onComplete();
            } else {
                setCountdownValue(count);
            }
        }, 1000);
    }, []);

    const startRecording = useCallback(async () => {
        try {
            chunksRef.current = [];
            setElapsedTime(0);

            // 1. Capture Full Screen (Display Media) - Prefer Current Tab
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "browser", // Suggest browser tab
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                preferCurrentTab: true, // Key for UX: suggests "This Tab"
                selfBrowserSurface: "include", // Allow capturing self
                monitorTypeSurfaces: "include"
            }).catch(() => null);

            if (!displayStream) {
                setPhase('setup');
                return;
            }
            displayStreamRef.current = displayStream;

            // 2. Capture Microphone
            let micStream = null;
            if (selectedMicrophone) {
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: { exact: selectedMicrophone },
                        echoCancellation: true,
                        noiseSuppression: true
                    }
                }).catch(() => null);
                micStreamRef.current = micStream;
            }

            // 3. Mix Audio using AudioContext (CRITICAL for reliable voice)
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            const destination = audioCtx.createMediaStreamDestination();

            // Add mic if available
            if (micStream && micStream.getAudioTracks().length > 0) {
                const micSource = audioCtx.createMediaStreamSource(micStream);
                const micGain = audioCtx.createGain();
                micGain.gain.value = 1.0; // Full volume for mic
                micSource.connect(micGain);
                micGain.connect(destination);
            }

            // Add system audio if available from screen share
            if (displayStream && displayStream.getAudioTracks().length > 0) {
                const sysSource = audioCtx.createMediaStreamSource(displayStream);
                const sysGain = audioCtx.createGain();
                sysGain.gain.value = 0.6; // Slightly lower system audio to prioritize voice
                sysSource.connect(sysGain);
                sysGain.connect(destination);
            }

            // 4. Combine Video and Mixed Audio
            const videoTrack = displayStream.getVideoTracks()[0];
            const mixedAudioStream = destination.stream;

            // CRITICAL: Construct the MediaStream with all needed tracks
            const tracks = [videoTrack];
            mixedAudioStream.getAudioTracks().forEach(track => tracks.push(track));

            const combinedStream = new MediaStream(tracks);
            combinedStreamRef.current = combinedStream;

            // Handle user clicking "Stop sharing" in browser UI
            videoTrack.onended = () => stopRecording();

            // 5. Start MediaRecorder
            const options = { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm' };
            const recorder = new MediaRecorder(combinedStream, options);

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                setPhase('processing');
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    setProcessingProgress(progress);
                    if (progress >= 100) {
                        clearInterval(interval);
                        setRecordedBlob(new Blob(chunksRef.current, { type: 'video/webm' }));
                        setPhase('done');
                    }
                }, 200);
            };

            mediaRecorderRef.current = recorder;
            recorder.start(1000);
            setPhase('recording');
            timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);

        } catch (err) {
            console.error('startRecording error:', err);
            setPhase('setup');
        }
    }, [selectedMicrophone]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
        [displayStreamRef, micStreamRef, combinedStreamRef].forEach(ref => {
            if (ref.current) ref.current.getTracks().forEach(t => t.stop());
            ref.current = null;
        });
    }, []);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('paused');
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
            setPhase('recording');
        }
    }, []);

    const downloadRecording = useCallback(() => {
        if (!recordedBlob) return;
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    }, [recordedBlob]);

    const discardRecording = useCallback(() => {
        setRecordedBlob(null);
        chunksRef.current = [];
        setElapsedTime(0);
        setPhase('setup');
    }, []);

    const cleanup = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (audioAnimFrameRef.current) cancelAnimationFrame(audioAnimFrameRef.current);
        [micStreamRef, cameraStreamRef, displayStreamRef, combinedStreamRef].forEach(ref => {
            if (ref.current) ref.current.getTracks().forEach(t => t.stop());
            ref.current = null;
        });
    }, []);

    useEffect(() => { return () => cleanup(); }, [cleanup]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return {
        phase, setPhase, elapsedTime, countdownValue, recordedBlob, processingProgress,
        cameras, microphones, selectedCamera, setSelectedCamera, selectedMicrophone, setSelectedMicrophone, audioLevel,
        enumerateDevices, startAudioMonitor, startCameraPreview, startCountdown, startRecording,
        pauseRecording, resumeRecording, stopRecording, downloadRecording, discardRecording, cleanup, formatTime
    };
};

export default useRecording;
