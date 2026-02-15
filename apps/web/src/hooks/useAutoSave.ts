import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { debounce } from "../utils/debounce";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";
type httpMethod = "post" | "patch" | "put";

export const useAutosave = <T>(
  url: string,
  httpMethod: httpMethod,
  data: T,
  enabled: boolean,
  delay = 1500
) => {
  const [status, setStatus] = useState<AutosaveStatus>("idle");

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstRender = useRef(true);

  const debouncedSave = useRef(
    debounce(async (latestData: T) => {
      try {
        // Avoid saving if data is identical
        const serialized = JSON.stringify(latestData);
        if (serialized === lastSavedRef.current) return;

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setStatus("saving");

        await api[httpMethod](url, latestData, {
          signal: controller.signal,
        });

        lastSavedRef.current = serialized;
        setStatus("saved");

      } catch (error: any) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return; // expected cancellation
        }

        console.error("Autosave error:", error);
        setStatus("error");
      }
    }, delay)
  ).current;

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    if (isFirstRender.current) {
        isFirstRender.current = false;
        lastSavedRef.current = JSON.stringify(data);
        return;
    }
    debouncedSave(data);
  }, [data, enabled, debouncedSave]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { status };
};
