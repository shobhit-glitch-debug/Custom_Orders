export default function JerseyPreview({ name, number, textColor, isJersey, compact }) {
  const size = compact ? 120 : 500
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 200 240" style={{ width: '100%', maxWidth: size, height: 'auto' }}>
        <defs>
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Bebas+Neue&display=swap');`}
          </style>
        </defs>
        <path
          d="M100 20 L160 45 L160 95 Q160 140 100 155 Q40 140 40 95 L40 45 Z"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="38" rx="18" ry="8" fill="#0f172a" />
        <rect x="70" y="85" width="60" height="55" rx="4" fill="#334155" opacity="0.8" />
        {isJersey && (
          <g>
            <text
              x="100"
              y={compact ? 50 : 70}
              textAnchor="middle"
              fontSize={compact ? 40 : 80}
              fontWeight="900"
              fill={textColor || '#ffffff'}
              fontFamily="'Bebas Neue', 'Impact', sans-serif"
              letterSpacing="3"
            >
              {(name || 'NAME').toUpperCase()}
            </text>
            <text
              x="100"
              y={compact ? 65 : 95}
              textAnchor="middle"
              fontSize={compact ? 14 : 24}
              fontWeight="800"
              fill={textColor || '#ffffff'}
              fontFamily="'Poppins', sans-serif"
              letterSpacing="2"
            >
              {number || '0'}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
