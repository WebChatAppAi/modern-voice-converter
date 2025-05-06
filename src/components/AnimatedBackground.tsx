'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  
  // Generate deterministic particles with a fixed seed
  const generateParticles = () => {
    const seed = 42; // Fixed seed for deterministic randomness
    const particles = [];
    
    for (let i = 0; i < 20; i++) {
      // Use a deterministic approach for "random" values
      const size = ((i % 4) + 1) + ((i * seed) % 4) / 10;
      const x = ((i * 17) % 100);
      const y = ((i * 23) % 100);
      
      particles.push({
        id: i,
        size,
        x,
        y,
      });
    }
    
    return particles;
  };
  
  const particles = generateParticles();
  
  // Only enable animations after client-side hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,30,142,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,86,219,0.1),transparent_65%)]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]">
        <div className="absolute h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDUgTCAyMCA1IE0gNSAwIEwgNSAyMCBNIDAgMTAgTCAyMCAxMCBNIDEwIDAgTCAxMCAyMCBNIDAgMTUgTCAyMCAxNSBNIDE1IDAgTCAxNSAyMCIgc3Ryb2tlPSIjOWE5YTlhIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
      </div>
      
      {/* Animated particles - only animate on client */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-400/30"
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0.3 + ((particle.id % 5) * 0.1),
            scale: 0,
          }}
          animate={isClient ? {
            x: [
              `${particle.x}%`,
              `${particle.x + ((particle.id * 2) % 10) - 5}%`,
              `${particle.x - ((particle.id * 3) % 10) + 5}%`,
              `${particle.x}%`,
            ],
            y: [
              `${particle.y}%`,
              `${particle.y - ((particle.id * 2) % 10) + 5}%`,
              `${particle.y + ((particle.id * 3) % 10) - 5}%`,
              `${particle.y}%`,
            ],
            opacity: [0.3, 0.8, 0.5, 0.3],
            scale: [0, 1, 0.8, 0],
          } : {}}
          transition={isClient ? {
            duration: 20 + (particle.id % 10),
            repeat: Infinity,
            ease: "easeInOut",
          } : {}}
          style={{
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            filter: 'blur(8px)',
          }}
        />
      ))}
      
      {/* Glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-purple-900/20 to-transparent" />
    </div>
  );
};

export default AnimatedBackground; 