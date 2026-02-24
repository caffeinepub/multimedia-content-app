import { useRef, useState, useCallback, useEffect } from 'react';

export type FilterMode = 'standard' | 'clean' | 'ultraclean';

interface WebAudioFilterState {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  connectAudioElement: (element: HTMLAudioElement) => void;
  disconnectAudioElement: () => void;
  isConnected: boolean;
}

// Singleton audio context to avoid multiple contexts
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}

export function useWebAudioFilters(): WebAudioFilterState {
  const [filterMode, setFilterModeState] = useState<FilterMode>(() => {
    const saved = sessionStorage.getItem('audioFilterMode');
    return (saved as FilterMode) || 'standard';
  });

  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterNodesRef = useRef<AudioNode[]>([]);
  const connectedElementRef = useRef<HTMLAudioElement | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const disconnectAll = useCallback(() => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      filterNodesRef.current.forEach((node) => {
        try { node.disconnect(); } catch { /* ignore */ }
      });
      filterNodesRef.current = [];
    } catch { /* ignore */ }
  }, []);

  const buildFilterChain = useCallback(
    (ctx: AudioContext, source: MediaElementAudioSourceNode, mode: FilterMode) => {
      disconnectAll();
      filterNodesRef.current = [];

      if (mode === 'standard') {
        source.connect(ctx.destination);
      } else if (mode === 'clean') {
        // High-Pass filter to cut muddy lows
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 200;
        highPass.Q.value = 0.7;

        // Peaking EQ at 3kHz for voice clarity
        const peaking = ctx.createBiquadFilter();
        peaking.type = 'peaking';
        peaking.frequency.value = 3000;
        peaking.gain.value = 4;
        peaking.Q.value = 1;

        source.connect(highPass);
        highPass.connect(peaking);
        peaking.connect(ctx.destination);
        filterNodesRef.current = [highPass, peaking];
      } else if (mode === 'ultraclean') {
        // Band-Pass filter for focused frequency range
        const bandPass = ctx.createBiquadFilter();
        bandPass.type = 'bandpass';
        bandPass.frequency.value = 2000;
        bandPass.Q.value = 0.5;

        // Dynamics compressor for normalized volume
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        source.connect(bandPass);
        bandPass.connect(compressor);
        compressor.connect(ctx.destination);
        filterNodesRef.current = [bandPass, compressor];
      }
    },
    [disconnectAll]
  );

  const connectAudioElement = useCallback(
    (element: HTMLAudioElement) => {
      // If already connected to same element, just rebuild chain
      if (connectedElementRef.current === element && sourceNodeRef.current) {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        buildFilterChain(ctx, sourceNodeRef.current, filterMode);
        setIsConnected(true);
        return;
      }

      // Disconnect previous
      disconnectAll();
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch { /* ignore */ }
        sourceNodeRef.current = null;
      }

      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const source = ctx.createMediaElementSource(element);
        sourceNodeRef.current = source;
        connectedElementRef.current = element;
        buildFilterChain(ctx, source, filterMode);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect audio element to Web Audio API:', err);
        setIsConnected(false);
      }
    },
    [filterMode, buildFilterChain, disconnectAll]
  );

  const disconnectAudioElement = useCallback(() => {
    disconnectAll();
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }
    connectedElementRef.current = null;
    setIsConnected(false);
  }, [disconnectAll]);

  const setFilterMode = useCallback(
    (mode: FilterMode) => {
      setFilterModeState(mode);
      sessionStorage.setItem('audioFilterMode', mode);
      // Rebuild chain if connected
      if (sourceNodeRef.current) {
        const ctx = getAudioContext();
        buildFilterChain(ctx, sourceNodeRef.current, mode);
      }
    },
    [buildFilterChain]
  );

  // Rebuild chain when filterMode changes and we have a connected element
  useEffect(() => {
    if (sourceNodeRef.current) {
      const ctx = getAudioContext();
      buildFilterChain(ctx, sourceNodeRef.current, filterMode);
    }
  }, [filterMode, buildFilterChain]);

  return { filterMode, setFilterMode, connectAudioElement, disconnectAudioElement, isConnected };
}
