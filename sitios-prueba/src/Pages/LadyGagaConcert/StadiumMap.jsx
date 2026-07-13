import React from 'react';

export const StadiumMap = ({
  sections,
  selectedId,
  hoveredId,
  onSelectSection,
  onHoverSection,
}) => {
  const sectors = [
    {
      id: 'campo_delantero',
      name: 'Campo Delantero',
      color: 'fill-emerald-500 hover:fill-emerald-400',
      activeColor: 'fill-emerald-600 stroke-emerald-300 stroke-2',
      path: 'M 130,45 L 270,45 L 270,140 L 130,140 Z',
      labelX: 200,
      labelY: 92.5,
    },
    {
      id: 'campo_trasero',
      name: 'Campo Trasero',
      color: 'fill-green-600 hover:fill-green-500',
      activeColor: 'fill-green-700 stroke-green-300 stroke-2',
      path: 'M 130,145 L 270,145 L 284.9,274.9 A 120,120 0 0 1 115.1,274.9 Z',
      labelX: 200,
      labelY: 210,
    },
    {
      id: 'sivori_alta',
      name: 'Sivori Alta',
      color: 'fill-rose-600 hover:fill-rose-500',
      activeColor: 'fill-rose-700 stroke-rose-300 stroke-2',
      path: 'M 323.7,313.7 A 175,175 0 0 1 76.3,313.7 L 97.5,292.5 A 145,145 0 0 0 302.5,292.5 Z',
      labelX: 200,
      labelY: 350,
    },
    {
      id: 'sivori_media',
      name: 'Sivori Media',
      color: 'fill-pink-400 hover:fill-pink-300',
      activeColor: 'fill-pink-500 stroke-pink-200 stroke-2',
      path: 'M 299.0,289.0 A 140,140 0 0 1 101.0,289.0 L 115.1,274.9 A 120,120 0 0 0 284.9,274.9 Z',
      labelX: 200,
      labelY: 320,
    },
    {
      id: 'platea_san_martin_alta',
      name: 'Platea San Martin Alta',
      color: 'fill-amber-400 hover:fill-amber-300',
      activeColor: 'fill-amber-500 stroke-amber-200 stroke-2',
      path: 'M 76.3,313.7 A 175,175 0 0 1 65.9,77.5 L 88.9,96.8 A 145,145 0 0 0 97.5,292.5 Z',
      labelX: 40.2,
      labelY: 197,
    },
    {
      id: 'platea_preferencial_alta',
      name: 'Platea Preferencial Alta',
      color: 'fill-sky-400 hover:fill-sky-300',
      activeColor: 'fill-sky-500 stroke-sky-200 stroke-2',
      path: 'M 101.0,289.0 A 140,140 0 0 1 92.8,100.0 L 108.1,112.9 A 120,120 0 0 0 115.1,274.9 Z',
      labelX: 70.1,
      labelY: 195.7,
    },
    {
      id: 'platea_preferencial_media',
      name: 'Platea Preferencial Media',
      color: 'fill-sky-400 hover:fill-sky-300',
      activeColor: 'fill-sky-500 stroke-sky-200 stroke-2',
      path: 'M 118.7,271.3 A 115,115 0 0 1 111.9,116.1 L 127.2,128.9 A 95,95 0 0 0 132.8,257.2 Z',
      labelX: 95.1,
      labelY: 194.6,
    },
    {
      id: 'platea_preferencial_baja',
      name: 'Platea Preferencial Baja',
      color: 'fill-sky-400 hover:fill-sky-300',
      activeColor: 'fill-sky-500 stroke-sky-200 stroke-2',
      path: 'M 136.4,253.6 A 90,90 0 0 1 131.1,132.1 L 142.5,141.8 A 75,75 0 0 0 147.0,243.0 Z',
      labelX: 117.6,
      labelY: 193.6,
    },
    {
      id: 'platea_pref_vision_lateral',
      name: 'Platea Pref. Visión lateral',
      color: 'fill-blue-600 hover:fill-blue-500',
      activeColor: 'fill-blue-700 stroke-blue-300 stroke-2',
      path: 'M 92.8,100.0 A 140,140 0 0 1 140.8,63.1 L 168.3,122.0 A 75,75 0 0 0 142.5,141.8 Z',
      labelX: 134.6,
      labelY: 104.7,
    },
    {
      id: 'centenario_media_vision_restringida',
      name: 'Centenario Media Visión Restringida',
      color: 'fill-purple-400 hover:fill-purple-300',
      activeColor: 'fill-purple-500 stroke-purple-200 stroke-2',
      path: 'M 140.8,63.1 A 140,140 0 0 1 175.7,52.1 L 179.2,71.8 A 120,120 0 0 0 149.3,81.2 Z M 224.3,52.1 A 140,140 0 0 1 259.2,63.1 L 250.7,81.2 A 120,120 0 0 0 220.8,71.8 Z',
      labelX: 240.0,
      labelY: 66.0,
    },
    {
      id: 'centenario_alta_vision_restringida',
      name: 'Centenario Alta Visión Restringida',
      color: 'fill-purple-600 hover:fill-purple-500',
      activeColor: 'fill-purple-700 stroke-purple-300 stroke-2',
      path: 'M 126.0,31.4 A 175,175 0 0 1 169.6,17.7 L 174.8,47.2 A 145,145 0 0 0 138.7,58.6 Z M 230.4,17.7 A 175,175 0 0 1 274.0,31.4 L 261.3,58.6 A 145,145 0 0 0 225.2,47.2 Z',
      labelX: 250.0,
      labelY: 37.4,
    },
    {
      id: 'platea_belgrano_alta',
      name: 'Platea Belgrano Alta',
      color: 'fill-amber-400 hover:fill-amber-300',
      activeColor: 'fill-amber-500 stroke-amber-200 stroke-2',
      path: 'M 334.1,77.5 A 175,175 0 0 1 323.7,313.7 L 302.5,292.5 A 145,145 0 0 0 311.1,96.8 Z',
      labelX: 359.8,
      labelY: 197.0,
    },
  ];

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 shadow-xl sticky top-24 select-none">
      <h3 className="text-lg font-bold text-white mb-4 text-center">
        Mapa de Ubicaciones - Estadio River Plate
      </h3>

      <div className="relative w-full max-w-[380px] mx-auto bg-black/60 rounded-2xl p-4 border border-neutral-900">
        <svg
          viewBox="0 0 400 380"
          className="w-full h-auto drop-shadow-[0_0_15px_rgba(236,72,153,0.05)]"
        >
          {/* Grilla / Lineas decorativas */}
          <circle cx="200" cy="190" r="170" className="stroke-neutral-900 fill-none" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="200" cy="190" r="120" className="stroke-neutral-900 fill-none" strokeWidth="1" strokeDasharray="5,5" />

          {/* STADIUM SECTORS */}
          {sectors.map((sec) => {
            const sectionInfo = sections.find((s) => s.id === sec.id) || {};
            const isSoldOut = sectionInfo.status === 'soldout';
            const isSelected = selectedId === sec.id;
            const isHovered = hoveredId === sec.id;

            // Determine rendering classes
            let fillClass = sec.color;
            if (isSoldOut) {
              fillClass = 'fill-neutral-800 stroke-black/50 cursor-not-allowed';
            } else if (isSelected) {
              fillClass = sec.activeColor;
            } else if (isHovered) {
              // Strip the 'hover:' prefix so that when hovered from the list, 
              // it receives the brightened color directly.
              const hoverVariant = sec.color.split(' ')[1]?.replace('hover:', '') || sec.color.split(' ')[0];
              fillClass = `${hoverVariant} stroke-white/50 stroke-1`;
            }

            return (
              <g key={sec.id}>
                <path
                  d={sec.path}
                  className={`transition-all duration-200 cursor-pointer stroke-black/80 stroke-1 ${fillClass}`}
                  onClick={() => !isSoldOut && onSelectSection(sec.id)}
                  onMouseEnter={() => !isSoldOut && onHoverSection(sec.id)}
                  onMouseLeave={() => onHoverSection(null)}
                />
                
                {/* Visual indicator dot if hovered/selected */}
                {(isHovered || isSelected) && !isSoldOut && (
                  <circle
                    cx={sec.labelX}
                    cy={sec.labelY}
                    r="4"
                    className="fill-white animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* Decorative background shapes for right-side preferenciales (always grey/soldout) */}
          <path d="M 307.2,100.0 A 140,140 0 0 1 299.0,289.0 L 284.9,274.9 A 120,120 0 0 0 291.9,112.9 Z" className="fill-neutral-800 stroke-black stroke-1" />
          <path d="M 288.1,116.1 A 115,115 0 0 1 281.3,271.3 L 267.2,257.2 A 95,95 0 0 0 272.8,128.9 Z" className="fill-neutral-800 stroke-black stroke-1" />
          <path d="M 268.9,132.1 A 90,90 0 0 1 263.6,253.6 L 253.0,243.0 A 75,75 0 0 0 257.5,141.8 Z" className="fill-neutral-800 stroke-black stroke-1" />
          <path d="M 259.2,63.1 A 140,140 0 0 1 307.2,100.0 L 257.5,141.8 A 75,75 0 0 0 231.7,122.0 Z" className="fill-neutral-800 stroke-black stroke-1" />

          {/* ESCENARIO / STAGE */}
          <g>
            {/* Main Stage Rectangle */}
            <rect
              x="140"
              y="12"
              width="120"
              height="30"
              className="fill-black stroke-neutral-800 stroke-2 rounded-md"
              rx="2"
            />
            <text
              x="200"
              y="31"
              className="fill-neutral-400 text-[10px] font-black tracking-widest text-center"
              textAnchor="middle"
            >
              STAGE
            </text>
            
            {/* Runway / Pasarela (T-Shape + Diamond) */}
            <rect x="193" y="42" width="14" height="98" className="fill-black stroke-neutral-900" />
            <rect x="160" y="130" width="80" height="10" className="fill-black stroke-neutral-900" />
            <polygon points="200,83 209,92 200,101 191,92" className="fill-black stroke-neutral-900" />
          </g>
        </svg>
      </div>

      {/* Map Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] text-neutral-400 border-t border-neutral-900/60 pt-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
          <span>Campo Delantero</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600 block"></span>
          <span>Campo Trasero</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span>
          <span>Plateas Altas</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block"></span>
          <span>Plateas Preferenciales</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block"></span>
          <span>Sívori Alta</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 block"></span>
          <span>Sívori Media</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
          <span>Visión Lateral</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 block"></span>
          <span>Restringida / Agotado</span>
        </div>
      </div>
    </div>
  );
};
