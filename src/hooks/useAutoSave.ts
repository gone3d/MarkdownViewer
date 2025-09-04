import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoSaveOptions {
  interval: number; // Auto-save interval in milliseconds
  enabled: boolean; // Whether auto-save is enabled
  onSave: (content: string) => Promise<void>; // Save function
  content: string; // Current content
  lastSaveTime?: Date | null; // External save time to sync with
}

interface UseAutoSaveReturn {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  nextSaveIn: number; // Seconds until next save
  hasUnsavedChanges: boolean;
  triggerAutoSave: () => Promise<void>;
}

export const useAutoSave = ({
  interval,
  enabled,
  onSave,
  content,
  lastSaveTime,
}: UseAutoSaveOptions): UseAutoSaveReturn => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [nextSaveIn, setNextSaveIn] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const lastContentRef = useRef<string>(content);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIdRef = useRef<NodeJS.Timeout | null>(null);

  // Manual trigger for auto-save
  const triggerAutoSave = useCallback(async () => {
    if (!enabled || !hasUnsavedChanges || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      lastContentRef.current = content;
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [enabled, hasUnsavedChanges, isAutoSaving, onSave, content]);

  // Update countdown timer
  const updateCountdown = useCallback(() => {
    if (!enabled || !hasUnsavedChanges) {
      setNextSaveIn(0);
      return;
    }

    const now = Date.now();
    const lastSaveTime = lastSaved?.getTime() || now;
    const timeElapsed = now - lastSaveTime;
    const timeRemaining = Math.max(0, interval - timeElapsed);

    setNextSaveIn(Math.ceil(timeRemaining / 1000));
  }, [enabled, hasUnsavedChanges, lastSaved, interval]);

  // Track content changes
  useEffect(() => {
    if (content !== lastContentRef.current) {
      setHasUnsavedChanges(true);
      if (!lastSaved) {
        setLastSaved(new Date()); // Set initial timestamp for countdown
      }
    }
  }, [content, lastSaved]);

  // Setup auto-save interval
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    intervalIdRef.current = setInterval(() => {
      triggerAutoSave();
    }, interval);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [enabled, hasUnsavedChanges, interval, triggerAutoSave]);

  // Setup countdown timer
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) {
      if (countdownIdRef.current) {
        clearInterval(countdownIdRef.current);
        countdownIdRef.current = null;
      }
      setNextSaveIn(0);
      return;
    }

    // Update countdown immediately
    updateCountdown();

    // Then update every second
    countdownIdRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownIdRef.current) {
        clearInterval(countdownIdRef.current);
      }
    };
  }, [enabled, hasUnsavedChanges, updateCountdown]);

  // Sync with external save time (manual saves)
  useEffect(() => {
    if (lastSaveTime && lastSaveTime > (lastSaved || new Date(0))) {
      setLastSaved(lastSaveTime);
      setHasUnsavedChanges(false);
      lastContentRef.current = content;
    }
  }, [lastSaveTime, lastSaved, content]);

  return {
    isAutoSaving,
    lastSaved,
    nextSaveIn,
    hasUnsavedChanges,
    triggerAutoSave,
  };
};
