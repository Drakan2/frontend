import { useState, useCallback, useRef } from 'react';

export const useUnsavedChanges = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalContentRef = useRef<string>("");
  const isInitializedRef = useRef(false);
  const isResettingRef = useRef(false);

  const setOriginalContent = useCallback((content: string) => {
    console.log("🔄 SET ORIGINAL:", content);
    originalContentRef.current = content;
    isInitializedRef.current = true;
    isResettingRef.current = false;
    setHasUnsavedChanges(false);
  }, []);

  const handleContentChange = useCallback((currentContent: string) => {
    // Ne pas vérifier si pas initialisé ou en cours de reset
    if (!isInitializedRef.current || isResettingRef.current) {
      console.log("⏳ Pas encore initialisé ou en cours de reset, ignore le changement");
      return;
    }
    
    const hasChanges = currentContent !== originalContentRef.current;
    console.log("📝 CHECK CHANGES:", {
      original: originalContentRef.current,
      current: currentContent,
      hasChanges
    });
    setHasUnsavedChanges(hasChanges);
  }, []);

  const reset = useCallback(() => {
    console.log("🧹 RESET");
    isResettingRef.current = true;
    setHasUnsavedChanges(false);
    originalContentRef.current = "";
    isInitializedRef.current = false;
    
    // Débloquer après un tick pour permettre les réinitialisations
    setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
  }, []);

  return {
    hasUnsavedChanges,
    handleContentChange,
    setOriginalContent,
    reset,
  };
};