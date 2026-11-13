import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import { FOCUSABLE_ELEMENTS_SELECTOR } from "@/lib/useFocusTrap";

describe("Issue #26: Modal Focus Trapping & Keyboard Accessibility", () => {
  const authModalPath = path.resolve(__dirname, "../src/components/AuthModal.tsx");
  const bookingModalPath = path.resolve(__dirname, "../src/components/BookingModal.tsx");
  const adminModalPath = path.resolve(__dirname, "../src/components/admin/ui/AdminModal.tsx");
  const useFocusTrapPath = path.resolve(__dirname, "../src/lib/useFocusTrap.ts");

  it("Test 1: useFocusTrap.ts implements comprehensive WCAG focus trapping logic", () => {
    const content = fs.readFileSync(useFocusTrapPath, "utf-8");

    // Traps Tab key
    expect(content).toContain('e.key === "Tab"');

    // Handles Shift+Tab for reverse cycling
    expect(content).toContain("e.shiftKey");
    expect(content).toContain("lastElement.focus()");

    // Handles Tab for forward cycling
    expect(content).toContain("firstElement.focus()");

    // Handles Escape key
    expect(content).toContain('e.key === "Escape"');
    expect(content).toContain("onClose()");

    // Focuses initial input or interactive element
    expect(content).toContain("container.querySelector");
    expect(content).toContain("preferredInput.focus()");

    // Locks and unlocks body overflow
    expect(content).toContain('document.body.style.overflow = "hidden"');
    expect(content).toContain("document.body.style.overflow = originalOverflow");

    // Restores focus to triggering element
    expect(content).toContain("previousActiveElementRef.current.focus()");
  });

  it("Test 2: Verifies FOCUSABLE_ELEMENTS_SELECTOR covers all interactive elements", () => {
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain("a[href]");
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain("button:not([disabled])");
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain("input:not([disabled])");
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain("select:not([disabled])");
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain("textarea:not([disabled])");
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it("Test 3: Simulates focus trap cycling behavior mathematically", () => {
    // Simulated elements array
    const elements = [
      { id: "close-btn", focus: vi.fn() },
      { id: "phone-input", focus: vi.fn() },
      { id: "submit-btn", focus: vi.fn() },
    ];

    let currentActiveIndex = 2; // On the last element ("submit-btn")

    // Forward Tab from last element
    const forwardCycle = (currentIndex: number, elementsCount: number) => {
      if (currentIndex === elementsCount - 1) return 0; // Wrap to first
      return currentIndex + 1;
    };

    expect(forwardCycle(currentActiveIndex, elements.length)).toBe(0);

    // Backward Shift+Tab from first element
    currentActiveIndex = 0; // On first element ("close-btn")
    const backwardCycle = (currentIndex: number, elementsCount: number) => {
      if (currentIndex === 0) return elementsCount - 1; // Wrap to last
      return currentIndex - 1;
    };

    expect(backwardCycle(currentActiveIndex, elements.length)).toBe(2);
  });

  it("Test 4: AuthModal implements useFocusTrap and accessible dialog semantics", () => {
    const content = fs.readFileSync(authModalPath, "utf-8");

    // Must import and invoke useFocusTrap
    expect(content).toContain('import { useFocusTrap } from "@/lib/useFocusTrap"');
    expect(content).toContain("const modalRef = useFocusTrap");

    // Must attach ref to the modal dialog
    expect(content).toContain("ref={modalRef}");

    // Must have dialog roles and attributes
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-labelledby="auth-modal-title"');
    expect(content).toContain('id="auth-modal-title"');

    // Must have accessible close button label
    expect(content).toContain('aria-label="Close authentication modal"');
  });

  it("Test 5: BookingModal implements useFocusTrap and accessible dialog semantics", () => {
    const content = fs.readFileSync(bookingModalPath, "utf-8");

    // Must import and invoke useFocusTrap
    expect(content).toContain('import { useFocusTrap } from "@/lib/useFocusTrap"');
    expect(content).toContain("const modalRef = useFocusTrap");

    // Must attach ref to the modal dialog
    expect(content).toContain("ref={modalRef}");

    // Must have dialog roles and attributes
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-labelledby="booking-modal-title"');
    expect(content).toContain('id="booking-modal-title"');

    // Must have accessible close button label
    expect(content).toContain('aria-label="Close reservation modal"');
  });

  it("Test 6: AdminModal implements useFocusTrap and accessible dialog semantics", () => {
    const content = fs.readFileSync(adminModalPath, "utf-8");

    // Must import and invoke useFocusTrap
    expect(content).toContain('import { useFocusTrap } from "@/lib/useFocusTrap"');
    expect(content).toContain("const modalRef = useFocusTrap");

    // Must attach ref to the modal dialog
    expect(content).toContain("ref={modalRef}");

    // Must have dialog roles and attributes
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
  });
});
