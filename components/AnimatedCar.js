function AnimatedCar({ brand, model, className }) {
  const [carPosition, setCarPosition] = React.useState(0);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition(prev => (prev + 1) % 100);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Car SVG animation
  const carAnimation = (
    <svg width="64" height="48" viewBox="0 0 64 48" className={className}>
      {/* Car body with gradient animation */}
      <defs>
        <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d4ff">
            <animate attributeName="stop-color" values="#00d4ff;#ff4081;#ffab40;#00d4ff" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#ff4081">
            <animate attributeName="stop-color" values="#ff4081;#ffab40;#00d4ff;#ff4081" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        
        {/* Shadow filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      {/* Road */}
      <rect x="0" y="36" width="64" height="12" fill="#333" opacity="0.3"/>
      
      {/* Road lines animation */}
      <line x1={10 + (carPosition % 20)} y1="42" x2={15 + (carPosition % 20)} y2="42" stroke="#fff" strokeWidth="1" opacity="0.5"/>
      <line x1={30 + (carPosition % 20)} y1="42" x2={35 + (carPosition % 20)} y2="42" stroke="#fff" strokeWidth="1" opacity="0.5"/>
      <line x1={50 + (carPosition % 20)} y1="42" x2={55 + (carPosition % 20)} y2="42" stroke="#fff" strokeWidth="1" opacity="0.5"/>
      
      {/* Car shadow */}
      <ellipse cx="32" cy="40" rx="18" ry="3" fill="#000" opacity="0.2" filter="url(#shadow)"/>
      
      {/* Car body */}
      <path d="M12 28 Q12 24 16 24 L20 24 L24 20 L40 20 L44 24 L48 24 Q52 24 52 28 L52 32 Q52 36 48 36 L16 36 Q12 36 12 32 Z" 
            fill="url(#carGradient)" 
            stroke="#fff" 
            strokeWidth="0.5">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-1; 0,0"
          dur="1s"
          repeatCount="indefinite"/>
      </path>
      
      {/* Windows */}
      <path d="M22 22 L26 22 L28 24 L22 24 Z" fill="#1a1a2e" opacity="0.8"/>
      <path d="M36 22 L40 22 L42 24 L36 24 Z" fill="#1a1a2e" opacity="0.8"/>
      
      {/* Wheels with rotation animation */}
      <g>
        {/* Front wheel */}
        <circle cx="18" cy="36" r="4" fill="#222" stroke="#fff" strokeWidth="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 36"
            to="360 18 36"
            dur="0.5s"
            repeatCount="indefinite"/>
        </circle>
        <circle cx="18" cy="36" r="1.5" fill="#666"/>
        
        {/* Rear wheel */}
        <circle cx="46" cy="36" r="4" fill="#222" stroke="#fff" strokeWidth="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 46 36"
            to="360 46 36"
            dur="0.5s"
            repeatCount="indefinite"/>
        </circle>
        <circle cx="46" cy="36" r="1.5" fill="#666"/>
      </g>
      
      {/* Headlights */}
      <circle cx="51" cy="28" r="1.5" fill="#ffeb3b" opacity="0.8">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Taillights */}
      <circle cx="13" cy="28" r="1" fill="#f44336" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Exhaust smoke animation */}
      <circle cx="10" cy="32" r="1" fill="#999" opacity="0.3">
        <animate attributeName="cx" values="10;8;6" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="32;30;28" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="r" values="1;2;3" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.2;0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="10" cy="32" r="1" fill="#999" opacity="0.3">
        <animate attributeName="cx" values="10;8;6" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="cy" values="32;30;28" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="r" values="1;2;3" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.2;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );

  // Fallback to simple text if SVG doesn't render
  const fallback = (
    <div className={`w-16 h-12 flex items-center justify-center bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded ${className}`}>
      <div className="text-white text-xs font-bold">CAR</div>
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {carAnimation}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">
          {brand && model ? `${brand} ${model}` : 'Car Animation'}
        </div>
      </div>
    </div>
  );
}