import { useState, useEffect, useCallback } from 'react';
import { initDB, addToHistory, getHistory, HistoryEntry } from '../utils/indexedDB';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => {
        setIsReady(true);
        return getHistory();
      })
      .then(setHistory)
      .catch((err) => console.error('History DB init error:', err));
  }, []);

  const addHistoryEntry = useCallback(
    async (entry: Omit<HistoryEntry, 'timestamp'> & { id: string }) => {
      if (!isReady) return;
      const fullEntry: HistoryEntry = { ...entry, timestamp: Date.now() };
      try {
        await addToHistory(fullEntry);
        const updated = await getHistory();
        setHistory(updated);
      } catch (err) {
        console.error('Failed to add history entry:', err);
      }
    },
    [isReady]
  );

  const refreshHistory = useCallback(async () => {
    try {
      const updated = await getHistory();
      setHistory(updated);
    } catch (err) {
      console.error('Failed to refresh history:', err);
    }
  }, []);

  return { history, addHistoryEntry, refreshHistory };
}
