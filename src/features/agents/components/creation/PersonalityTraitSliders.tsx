"use client";
import { useTranslations } from "next-intl";
import {
  type PersonalityTraits,
  type TraitDimension,
  TRAIT_DIMENSIONS,
  traitToText,
} from "@/lib/agents/personalityTraits";

type PersonalityTraitSlidersProps = {
  traits: PersonalityTraits;
  onChange: (traits: PersonalityTraits) => void;
};

export const PersonalityTraitSliders = ({
  traits,
  onChange,
}: PersonalityTraitSlidersProps) => {
  const t = useTranslations("createAgent");

  const handleChange = (dimension: TraitDimension, value: number) => {
    onChange({ ...traits, [dimension]: value });
  };

  return (
    <div className="space-y-4">
      {TRAIT_DIMENSIONS.map((dim) => {
        const value = traits[dim];
        const label = traitToText(dim, value);
        return (
          <div key={dim} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground capitalize">
                {t(`trait_${dim}`)}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {label}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={(e) => handleChange(dim, parseInt(e.target.value, 10))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              aria-label={`${dim}: ${label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
              aria-valuetext={label}
            />
          </div>
        );
      })}
    </div>
  );
};
