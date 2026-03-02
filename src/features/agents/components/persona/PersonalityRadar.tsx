"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  type PersonalityTraits,
  type TraitDimension,
  TRAIT_DIMENSIONS,
} from "@/lib/agents/personalityTraits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PersonalityRadarProps = {
  traits: PersonalityTraits;
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (traits: PersonalityTraits) => void;
  comparison?: PersonalityTraits;
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

const AXIS_COUNT = TRAIT_DIMENSIONS.length; // 5
const ANGLE_OFFSET = -Math.PI / 2; // start at top

/** Return the (x, y) for a given axis index at a given radius, centred at (cx, cy). */
const pointOnAxis = (index: number, radius: number, cx: number, cy: number) => {
  const angle = ANGLE_OFFSET + (2 * Math.PI * index) / AXIS_COUNT;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
};

/** Build a polygon points string for an array of radii (one per axis). */
const polygonPoints = (radii: number[], cx: number, cy: number) =>
  radii
    .map((r, i) => {
      const { x, y } = pointOnAxis(i, r, cx, cy);
      return `${x},${y}`;
    })
    .join(" ");

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PersonalityRadar = ({
  traits,
  size = 240,
  className,
  interactive = false,
  onChange,
  comparison,
}: PersonalityRadarProps) => {
  const t = useTranslations("createAgent");
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<TraitDimension | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38; // leave room for labels
  const labelRadius = size * 0.47;

  // Grid rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Map trait values (0-100) to radii
  const traitRadii = TRAIT_DIMENSIONS.map(
    (dim) => (traits[dim] / 100) * maxRadius,
  );
  const comparisonRadii = comparison
    ? TRAIT_DIMENSIONS.map((dim) => (comparison[dim] / 100) * maxRadius)
    : null;

  // ---------------------------------------------------------------------------
  // Interaction helpers
  // ---------------------------------------------------------------------------

  const traitFromPointer = useCallback(
    (clientX: number, clientY: number, dim: TraitDimension) => {
      if (!svgRef.current) return traits[dim];
      const rect = svgRef.current.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;

      const dx = px - cx;
      const dy = py - cy;

      const idx = TRAIT_DIMENSIONS.indexOf(dim);
      const axisAngle = ANGLE_OFFSET + (2 * Math.PI * idx) / AXIS_COUNT;
      const axisX = Math.cos(axisAngle);
      const axisY = Math.sin(axisAngle);

      // Project pointer vector onto axis direction
      const projection = dx * axisX + dy * axisY;
      const value = Math.round(
        Math.max(0, Math.min(100, (projection / maxRadius) * 100)),
      );
      return value;
    },
    [cx, cy, maxRadius, traits],
  );

  const handlePointerDown = useCallback(
    (dim: TraitDimension) => (e: React.PointerEvent) => {
      if (!interactive || !onChange) return;
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDragging(dim);
      const value = traitFromPointer(e.clientX, e.clientY, dim);
      onChange({ ...traits, [dim]: value });
    },
    [interactive, onChange, traits, traitFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !onChange) return;
      const value = traitFromPointer(e.clientX, e.clientY, dragging);
      onChange({ ...traits, [dragging]: value });
    },
    [dragging, onChange, traits, traitFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
      onPointerLeave={interactive ? handlePointerUp : undefined}
      role="img"
      aria-label={`Personality radar: ${TRAIT_DIMENSIONS.map((d) => `${d} ${traits[d]}`).join(", ")}`}
    >
      {/* Background grid rings */}
      {rings.map((fraction) => (
        <polygon
          key={fraction}
          points={polygonPoints(
            Array.from({ length: AXIS_COUNT }, () => maxRadius * fraction),
            cx,
            cy,
          )}
          fill="none"
          stroke="currentColor"
          className="text-border/40"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {TRAIT_DIMENSIONS.map((_, i) => {
        const { x, y } = pointOnAxis(i, maxRadius, cx, cy);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            className="text-border/30"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Comparison overlay (dashed grey) */}
      {comparisonRadii && (
        <polygon
          points={polygonPoints(comparisonRadii, cx, cy)}
          fill="currentColor"
          className="text-muted-foreground/10"
          stroke="currentColor"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          style={{ color: "var(--color-muted-foreground, #888)" }}
        />
      )}

      {/* Primary shape */}
      <polygon
        points={polygonPoints(traitRadii, cx, cy)}
        fill="currentColor"
        className="text-primary/15"
        stroke="currentColor"
        strokeWidth={2}
        style={{ color: "var(--color-primary, #6366f1)" }}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {TRAIT_DIMENSIONS.map((dim, i) => {
        const { x, y } = pointOnAxis(i, traitRadii[i], cx, cy);
        return (
          <circle
            key={`point-${dim}`}
            cx={x}
            cy={y}
            r={interactive ? 6 : 4}
            fill="currentColor"
            style={{ color: "var(--color-primary, #6366f1)" }}
            className={interactive ? "cursor-grab active:cursor-grabbing" : ""}
            onPointerDown={interactive ? handlePointerDown(dim) : undefined}
          />
        );
      })}

      {/* Vertex labels */}
      {TRAIT_DIMENSIONS.map((dim, i) => {
        const { x, y } = pointOnAxis(i, labelRadius, cx, cy);
        return (
          <text
            key={`label-${dim}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[10px] font-medium capitalize"
            style={{ fontSize: 10 }}
          >
            {t(`trait_${dim}`)}
          </text>
        );
      })}
    </svg>
  );
};
