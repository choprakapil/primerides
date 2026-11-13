"use client";

import { useEffect, useRef } from "react";

export const FOCUSABLE_ELEMENTS_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  autoFocus?: boolean;
}

/**
 * Custom React hook for WCAG 2.1 AA compliant modal focus management.
 * - Traps Tab navigation strictly within the active dialog container.
 * - Cycles backward on Shift+Tab from first element to last element.
 * - Handles Escape key to dismiss the dialog.
 * - Locks body scroll while modal is mounted.
 * - Restores focus to the triggering element upon closing.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  autoFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) {
      hasFocusedRef.current = false;
      return;
    }

    // 1. Remember triggering element to restore focus on modal dismissal
    if (typeof document !== "undefined" && !hasFocusedRef.current) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    }

    const container = containerRef.current;
    if (!container) return;

    // 2. Set initial focus inside modal ONLY ONCE per opening session
    if (autoFocus && !hasFocusedRef.current) {
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR);
      if (focusable.length > 0) {
        // Focus first primary input if available, else first focusable element
        const preferredInput = container.querySelector<HTMLElement>("input:not([type='hidden']), select, textarea");
        if (preferredInput) {
          preferredInput.focus();
        } else {
          focusable[0].focus();
        }
      } else {
        container.focus();
      }
      hasFocusedRef.current = true;
    }

    // 3. Keydown listener for Escape and Tab trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const onClose = onCloseRef.current;
        if (onClose) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: reverse cycle from first to last
          if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: forward cycle from last to first
          if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // 4. Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // 5. Restore focus to previous triggering element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, autoFocus]);

  return containerRef;
}
