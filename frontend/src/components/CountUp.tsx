import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  end: number;
  suffix?: string;
  duration?: number;
}

export function CountUp({ end, suffix = "", duration = 1.4 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}
