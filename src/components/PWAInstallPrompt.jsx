import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/**
 * PWA install prompt — surfaces the browser's beforeinstallprompt event
 * as a discrete brass chip in the corner. Tapping it triggers the
 * native install dialog. Dismissable for the session.
 *
 * Behavior:
 * - Hidden by default
 * - Listens for `beforeinstallprompt`; when fired, shows the chip
 * - On click: calls deferredPrompt.prompt(), waits for user choice
 * - On dismiss: hides for the session
 * - Detects already-installed (display-mode: standalone) and hides entirely
 */
export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("v21-install-dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => {
    // Already installed? (running in standalone window)
    if (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) {
      return;
    }
    if (dismissed) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      // Defer the chip until after a short delay so it doesn't compete with first paint
      setTimeout(() => setVisible(true), 4000);
    };
    const onInstalled = () => {
      setDeferred(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [dismissed]);

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      // Either accepted or dismissed — hide the chip either way
      setVisible(false);
      setDeferred(null);
      if (choice?.outcome !== "accepted") {
        try { sessionStorage.setItem("v21-install-dismissed", "1"); } catch { /* ignore */ }
      }
    } catch {
      setVisible(false);
    }
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { sessionStorage.setItem("v21-install-dismissed", "1"); } catch { /* ignore */ }
  };

  if (!visible || !deferred) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 shadow-lg backdrop-blur"
      style={{
        background: "oklch(0.16 0.012 50 / 0.92)",
        border: "1px solid oklch(0.82 0.10 78 / 0.36)",
        color: "var(--page-text)",
        fontFamily: "var(--font-sans)",
        animation: "v21-install-in 320ms cubic-bezier(0.2, 1.1, 0.4, 1)",
      }}
      role="dialog"
      aria-label="Install Velvet 21"
    >
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.10em]"
        style={{
          background: "linear-gradient(160deg, oklch(0.82 0.10 78) 0%, oklch(0.66 0.11 64) 100%)",
          color: "oklch(0.14 0.014 50)",
          border: "1px solid oklch(0.82 0.10 78 / 0.6)",
        }}
      >
        <Download className="h-3.5 w-3.5" />
        Install Velvet 21
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="flex h-6 w-6 items-center justify-center rounded-full opacity-60 hover:opacity-100"
        style={{ color: "var(--panel-muted, oklch(0.62 0.008 60))" }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
