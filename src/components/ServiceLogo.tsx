"use client";

import { useState } from "react";
import Image from "next/image";

type ServiceLogoProps = {
  serviceId: string;
  name: string;
  fallbackColor: string;
  size?: number;
  className?: string;
};

/**
 * Displays a real SVG logo for a service with a graceful fallback
 * to a colored square with 2-letter abbreviation.
 */
export const ServiceLogo = ({
  serviceId,
  name,
  fallbackColor,
  size = 28,
  className = "",
}: ServiceLogoProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-bold text-white ${className}`}
        style={{
          backgroundColor: fallbackColor,
          width: size,
          height: size,
          fontSize: Math.max(8, Math.round(size * 0.36)),
        }}
        aria-hidden="true"
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={`/logos/${serviceId}.svg`}
      alt={name}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
};
