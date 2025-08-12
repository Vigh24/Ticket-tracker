import "./DarkVeil.css";

// CSS-based animated gradient component for dark mode background
// This provides a beautiful animated gradient background similar to the WebGL version

export default function DarkVeil({
  hueShift = 280,
  speed = 0.5,
}) {
  return (
    <div className="darkveil-container">
      {/* Primary animated gradient layer */}
      <div
        className="darkveil-gradient darkveil-gradient-1"
        style={{
          animationDuration: `${20 / speed}s`,
          filter: `hue-rotate(${hueShift}deg)`,
        }}
      />

      {/* Secondary gradient layer for depth */}
      <div
        className="darkveil-gradient darkveil-gradient-2"
        style={{
          animationDuration: `${30 / speed}s`,
          filter: `hue-rotate(${hueShift + 60}deg)`,
        }}
      />

      {/* Tertiary gradient layer for complexity */}
      <div
        className="darkveil-gradient darkveil-gradient-3"
        style={{
          animationDuration: `${40 / speed}s`,
          filter: `hue-rotate(${hueShift - 30}deg)`,
        }}
      />

      {/* Noise overlay for texture */}
      <div className="darkveil-noise" />
    </div>
  );
}
