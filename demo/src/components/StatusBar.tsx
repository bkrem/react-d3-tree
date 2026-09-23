import { useSyncExternalStore } from 'react';
import type { LiveStore, LiveTransform } from '../state/liveTransform.js';

interface StatusBarProps {
  store: LiveStore;
  nodeCount: number;
  /** Shown until `Tree` reports its first transform. */
  fallback: LiveTransform;
}

/** Node count and the live zoom and translate. Subscribes to the store so only this re-renders. */
export function StatusBar({ store, nodeCount, fallback }: StatusBarProps) {
  const live = useSyncExternalStore(store.subscribe, store.get);
  const shown = live ?? fallback;
  return (
    <div className="status" aria-live="off">
      <span>
        <b>{nodeCount.toLocaleString()}</b> nodes
      </span>
      <span>
        zoom <b>{shown.zoom.toFixed(2)}</b>
      </span>
      <span>
        translate <b>{Math.round(shown.translate.x)}</b>, <b>{Math.round(shown.translate.y)}</b>
      </span>
    </div>
  );
}
