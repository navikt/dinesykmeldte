import { useRouter } from "next/router";
import React, {
  type PropsWithChildren,
  type ReactElement,
  useEffect,
} from "react";
import styles from "./PageLoadingState.module.css";

function PageLoadingState({ children }: PropsWithChildren): ReactElement {
  const [loadingPercentage, setLoadingPercentage] = React.useState(100);

  const router = useRouter();
  useEffect(() => {
    let initialTimerId: NodeJS.Timeout;
    let timerId: NodeJS.Timeout;
    const onStart = (
      _: unknown,
      opts: { shallow: boolean | undefined },
    ): void => {
      if (opts.shallow === true) return;

      initialTimerId = setTimeout(() => {
        setLoadingPercentage(Math.round(Math.random() * 10 + 11));
        timerId = setTimeout(() => {
          setLoadingPercentage(Math.round(Math.random() * 10 + 21));
        }, 569);
      }, 100);
    };
    const onDone = (): void => {
      clearTimeout(initialTimerId);
      clearTimeout(timerId);
      setLoadingPercentage(100);
    };

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);

    return () => {
      clearTimeout(initialTimerId);
      clearTimeout(timerId);
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
    };
  }, [router.events]);

  return (
    <div
      className={styles.loadingRoot}
      style={
        {
          "--loading-percent": `${loadingPercentage}%`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default PageLoadingState;
