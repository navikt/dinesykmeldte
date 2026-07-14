"use client";

import { usePathname } from "next/navigation";
import React, {
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useRef,
} from "react";
import styles from "./PageLoadingState.module.css";

function PageLoadingState({ children }: PropsWithChildren): ReactElement {
  const [loadingPercentage, setLoadingPercentage] = React.useState(100);
  const pathname = usePathname();
  const initialTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Detect navigation start via anchor clicks (no router.events equivalent in App Router)
  useEffect(() => {
    const onNavigationStart = (e: MouseEvent): void => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor?.href) return;

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      clearTimeout(initialTimerRef.current);
      clearTimeout(timerRef.current);

      initialTimerRef.current = setTimeout(() => {
        setLoadingPercentage(Math.round(Math.random() * 10 + 11));
        timerRef.current = setTimeout(() => {
          setLoadingPercentage(Math.round(Math.random() * 10 + 21));
        }, 569);
      }, 100);
    };

    document.addEventListener("click", onNavigationStart);
    return () => document.removeEventListener("click", onNavigationStart);
  }, []);

  // Detect navigation completion via pathname change
  useEffect(() => {
    if (pathname === null) return;
    clearTimeout(initialTimerRef.current);
    clearTimeout(timerRef.current);
    setLoadingPercentage(100);
  }, [pathname]);

  return (
    <div
      className={styles.loadingRoot}
      style={
        { "--loading-percent": `${loadingPercentage}%` } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default PageLoadingState;
