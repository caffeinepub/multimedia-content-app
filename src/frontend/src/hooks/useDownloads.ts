import { useCallback, useEffect, useState } from "react";
import {
  type DownloadEntry,
  addToDownloads,
  deleteFromDownloads,
  getBlobURL,
  getDownloads,
  initDB,
} from "../utils/indexedDB";

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => {
        setIsReady(true);
        return getDownloads();
      })
      .then(setDownloads)
      .catch((err) => console.error("Downloads DB init error:", err));
  }, []);

  const addDownload = useCallback(
    async (entry: DownloadEntry) => {
      if (!isReady) return;
      try {
        await addToDownloads(entry);
        const updated = await getDownloads();
        setDownloads(updated);
      } catch (err) {
        console.error("Failed to add download:", err);
        throw err;
      }
    },
    [isReady],
  );

  const deleteDownload = useCallback(async (id: string) => {
    try {
      await deleteFromDownloads(id);
      const updated = await getDownloads();
      setDownloads(updated);
    } catch (err) {
      console.error("Failed to delete download:", err);
    }
  }, []);

  const playDownload = useCallback((entry: DownloadEntry): string => {
    return getBlobURL(entry.blob);
  }, []);

  const refreshDownloads = useCallback(async () => {
    try {
      const updated = await getDownloads();
      setDownloads(updated);
    } catch (err) {
      console.error("Failed to refresh downloads:", err);
    }
  }, []);

  return {
    downloads,
    addDownload,
    deleteDownload,
    playDownload,
    refreshDownloads,
  };
}
