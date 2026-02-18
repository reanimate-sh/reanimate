import { REANIMATE_LOGO_POLYGONS } from "./reanimateLogoData";

export const ReanimateLogo = () => (
  <svg
    className="h-full w-full text-white"
    viewBox="0 0 498 510"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Reanimate logo"
  >
    {REANIMATE_LOGO_POLYGONS.map((points) => (
      <polygon key={points} points={points} fill="currentColor" />
    ))}
  </svg>
);
