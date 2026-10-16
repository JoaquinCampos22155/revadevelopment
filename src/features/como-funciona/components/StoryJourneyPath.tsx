"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

type Point = Readonly<{ x: number; y: number }>;

const colors = ["#3d5a66", "#705b78", "#78434b"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPath(points: readonly Point[]) {
  if (points.length < 2) return "";

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlY = previous.y + (point.y - previous.y) * 0.46;
    return `${path} C ${previous.x} ${controlY}, ${point.x} ${controlY}, ${point.x} ${point.y}`;
  }, "");
}

/** Draws one responsive SVG thread through the live geometry of the REVA story. */
export function StoryJourneyPath({ children }: Readonly<{ children: ReactNode }>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const path = pathRef.current;
    const reveal = revealRef.current;
    const gradient = gradientRef.current;
    if (!wrapper || !path || !reveal || !gradient) return;

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updatePath = () => {
      const bounds = wrapper.getBoundingClientRect();
      const width = wrapper.clientWidth;
      const height = wrapper.scrollHeight;
      const chapters = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-story-chapter]"));
      const map = wrapper.querySelector<HTMLElement>("[data-story-origin-mobile]");
      const hub = wrapper.querySelector<HTMLElement>("[data-story-origin-desktop]");
      const heading = wrapper.querySelector<HTMLElement>("[data-story-heading]");
      const ending = wrapper.querySelector<HTMLElement>("[data-story-end]");

      if (!width || !height || !chapters.length || !map || !hub || !heading || !ending) return;

      const relative = (rect: DOMRect): DOMRect => new DOMRect(
        rect.left - bounds.left,
        rect.top - bounds.top,
        rect.width,
        rect.height,
      );
      const wide = desktopQuery.matches;
      const mapRect = relative(map.getBoundingClientRect());
      const hubRect = relative(hub.getBoundingClientRect());
      const headingRect = relative(heading.getBoundingClientRect());
      const start: Point = wide
        ? { x: hubRect.left + hubRect.width / 2, y: hubRect.bottom }
        : { x: Math.min(10, width * 0.025), y: mapRect.bottom };
      const points: Point[] = [start];
      const chapterMids: number[] = [];

      if (wide) {
        points.push({ x: start.x, y: mapRect.bottom + 12 });
        const headingSide = clamp(headingRect.right + 24, 12, width - 12);
        points.push({ x: headingSide, y: Math.max(mapRect.bottom + 24, headingRect.top - 10) });
        points.push({ x: headingSide, y: headingRect.bottom + 12 });
      }

      chapters.forEach((chapter, index) => {
        const rect = relative(chapter.getBoundingClientRect());
        const figure = chapter.querySelector<HTMLElement>("[data-story-figure]");
        const copy = chapter.querySelector<HTMLElement>("[data-story-copy]");
        let centerX = Math.min(10, width * 0.025);
        let sway = 0;

        if (wide && figure && copy) {
          const figureRect = relative(figure.getBoundingClientRect());
          const copyRect = relative(copy.getBoundingClientRect());
          const gapStart = Math.min(figureRect.right, copyRect.right);
          const gapEnd = Math.max(figureRect.left, copyRect.left);
          const gapWidth = Math.max(0, gapEnd - gapStart);
          centerX = (gapStart + gapEnd) / 2;
          sway = Math.min(18, gapWidth * 0.16) * (index % 2 === 0 ? 1 : -1);
        }

        points.push(
          { x: centerX, y: rect.top + 18 },
          { x: centerX + sway, y: rect.top + rect.height / 2 },
          { x: centerX, y: rect.bottom - 18 },
        );
        chapterMids.push(rect.top + rect.height / 2);
      });

      const endRect = relative(ending.getBoundingClientRect());
      let endX = Math.min(10, width * 0.025);
      if (wide) {
        const [description, link] = Array.from(ending.children).slice(0, 2);
        const descriptionRect = description?.getBoundingClientRect();
        const linkRect = link?.getBoundingClientRect();
        if (descriptionRect && linkRect && descriptionRect.right < linkRect.left) {
          endX = (descriptionRect.right + linkRect.left) / 2 - bounds.left;
        } else {
          endX = width / 2;
        }
      }
      const end = { x: clamp(endX, 4, width - 4), y: endRect.bottom };
      points.push(end);

      path.setAttribute("d", toPath(points));
      path.setAttribute("pathLength", "1");
      reveal.setAttribute("d", toPath(points));
      reveal.setAttribute("pathLength", "1");
      gradient.setAttribute("y2", String(height));

      const offsets = [
        { y: start.y, color: colors[0] },
        { y: chapterMids[0], color: colors[0] },
        { y: chapterMids[1] ?? chapterMids[0], color: colors[1] },
        { y: chapterMids[2] ?? chapterMids[chapterMids.length - 1], color: colors[2] },
        { y: end.y, color: colors[2] },
      ];
      gradient.replaceChildren(...offsets.map(({ y, color }) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", `${clamp((y / height) * 100, 0, 100)}%`);
        stop.setAttribute("stop-color", color);
        return stop;
      }));
      const svg = path.ownerSVGElement;
      svg?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      wrapper.dataset.ready = "true";
    };

    updatePath();
    const observer = new ResizeObserver(updatePath);
    observer.observe(wrapper);
      wrapper.querySelectorAll<HTMLElement>("[data-story-origin-mobile], [data-story-origin-desktop], [data-story-heading], [data-story-chapter], [data-story-end]").forEach((element) => observer.observe(element));
    desktopQuery.addEventListener("change", updatePath);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener("change", updatePath);
    };
  }, []);

  return (
    <div className="story-journey relative" ref={wrapperRef}>
      <div className="relative">{children}</div>
      <svg aria-hidden="true" className="story-journey-overlay" focusable="false" preserveAspectRatio="none" viewBox="0 0 100 1000">
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="reva-story-journey-gradient" ref={gradientRef} x1="0" x2="0" y1="0" y2="1000">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="40%" stopColor={colors[0]} />
            <stop offset="58%" stopColor={colors[1]} />
            <stop offset="82%" stopColor={colors[2]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
        <path className="story-journey-fallback" d="M 50 0 C 67 70, 33 130, 50 205 S 68 330, 50 420 S 32 620, 50 760 S 63 920, 50 1000" fill="none" stroke="url(#reva-story-journey-gradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        <path className="story-journey-path" fill="none" ref={pathRef} stroke="url(#reva-story-journey-gradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        <path className="story-journey-path-reveal" fill="none" ref={revealRef} stroke="url(#reva-story-journey-gradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
