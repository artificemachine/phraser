const PhraserHand = ({
  width,
  height,
}: {
  width?: number | string;
  height?: number | string;
}) => (
  <svg
    width={width || 126}
    height={height || 135}
    viewBox="0 0 126 135"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="phraserWaveGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4CAF50" />
        <stop offset="40%" stopColor="#FFC107" />
        <stop offset="100%" stopColor="#FF9800" />
      </linearGradient>
    </defs>
    {/* Waveform bars */}
    <rect
      x="8"
      y="52"
      width="12"
      height="31"
      rx="6"
      fill="url(#phraserWaveGrad)"
    />
    <rect
      x="25"
      y="35"
      width="12"
      height="65"
      rx="6"
      fill="url(#phraserWaveGrad)"
    />
    <rect
      x="42"
      y="18"
      width="12"
      height="99"
      rx="6"
      fill="url(#phraserWaveGrad)"
    />
    <rect
      x="59"
      y="30"
      width="12"
      height="75"
      rx="6"
      fill="url(#phraserWaveGrad)"
    />
    <rect
      x="76"
      y="45"
      width="12"
      height="45"
      rx="6"
      fill="url(#phraserWaveGrad)"
    />
    {/* Arrow */}
    <path
      d="M96 67.5 L108 67.5"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <path
      d="M104 58 L113 67.5 L104 77"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default PhraserHand;
