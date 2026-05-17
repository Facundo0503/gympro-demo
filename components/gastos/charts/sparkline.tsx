"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

export function Sparkline({ data, color, height = 34 }: SparklineProps) {
  const id = useId().replace(/:/g, "");

  if (data.length < 2) return <div style={{ height }} />;

  const W = 100;
  const H = height;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * (W - pad * 2) + pad,
    H - pad - ((v - min) / range) * (H - pad * 2),
  ]);

  let stroke = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const mx = (p[0] + c[0]) / 2;
    stroke += ` C ${mx} ${p[1]} ${mx} ${c[1]} ${c[0]} ${c[1]}`;
  }

  const last = pts[pts.length - 1];
  const first = pts[0];
  const area = `${stroke} L ${last[0]} ${H} L ${first[0]} ${H} Z`;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${id})`} />
      <path d={stroke} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}
