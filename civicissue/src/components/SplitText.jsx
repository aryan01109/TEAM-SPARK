// src/components/SplitText.jsx
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Props:
 *  - text (string) required
 *  - splitType: 'chars' | 'words'  (default 'chars')
 *  - tag: html tag to render (default 'h1')
 *  - className: additional classes
 *  - stagger: number (seconds between chars) default 0.03
 *  - from: animation start state (object) default { y: 40, opacity: 0 }
 *  - to: animation end state (object) default { y: 0, opacity: 1 }
 *  - duration: animation duration per item in seconds (default 0.6)
 *  - once: boolean to run once when it enters viewport (default true)
 *  - rootMargin, threshold: ScrollTrigger config (optional)
 *  - onComplete: callback when animation completes
 */
export default function SplitText({
  text,
  splitType = "chars",
  tag = "h1",
  className = "",
  stagger = 0.03,
  from = { y: 40, opacity: 0 },
  to = { y: 0, opacity: 1 },
  duration = 0.6,
  once = true,
  rootMargin = "0px 0px -100px 0px",
  threshold = 0,
  onComplete,
  style
}) {
  const elRef = useRef(null);

  // helper: split into nodes
  function buildNodes(str) {
    if (!str) return [];
    if (splitType === "words") {
      return str.split(" ").map((w, i) => ({ text: w, key: `w-${i}` }));
    }
    // default: chars
    return Array.from(str).map((ch, i) => ({ text: ch, key: `c-${i}` }));
  }

  useEffect(() => {
    const node = elRef.current;
    if (!node) return;
    // clear previous content
    node.innerHTML = "";

    // create inline wrapper spans
    const parts = buildNodes(text);
    parts.forEach((p, idx) => {
      const span = document.createElement("span");
      span.className = "split-item";
      span.setAttribute("data-index", idx);
      span.style.display = "inline-block";
      span.style.whiteSpace = "pre";
      span.textContent = p.text;
      node.appendChild(span);
      // add a small space between words (if splitting by words)
      if (splitType === "words" && idx !== parts.length - 1) {
        const space = document.createElement("span");
        space.textContent = " ";
        space.className = "split-space";
        space.style.display = "inline-block";
        node.appendChild(space);
      }
    });

    const targets = node.querySelectorAll(".split-item");

    // create animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: node,
        start: `top bottom${rootMargin ? `+=${parseInt(rootMargin, 10) || 0}` : ""}`,
        // using once flag to optionally allow repeat
        once,
        // tune threshold if needed (0 = when top enters viewport)
        // Note: ScrollTrigger doesn't accept threshold directly; we rely on start & rootMargin.
      }
    });

    tl.fromTo(
      targets,
      { ...from },
      {
        ...to,
        duration,
        ease: "power3.out",
        stagger: { each: stagger, from: "start" },
        onComplete: () => {
          onComplete?.();
        }
      }
    );

    // cleanup on unmount
    return () => {
      // kill timeline and ScrollTrigger(s)
      try {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === node) st.kill();
        });
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, splitType, stagger, JSON.stringify(from), JSON.stringify(to), duration, once]);

  const Tag = tag;

  return (
    <Tag
      ref={elRef}
      className={`split-text ${className}`}
      style={{ display: "inline-block", overflow: "hidden", ...style }}
      aria-label={text}
    />
  );
}
