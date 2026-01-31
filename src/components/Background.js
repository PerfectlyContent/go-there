import { motion } from 'framer-motion';

const presets = {
  home: {
    base: 'linear-gradient(160deg, #FAF8F5 0%, #F3EAFF 40%, #FFF0E8 70%, #FAF8F5 100%)',
    blobs: [
      { color: 'rgba(167, 139, 250, 0.12)', size: 280, x: '-10%', y: '10%', duration: 18 },
      { color: 'rgba(251, 191, 146, 0.10)', size: 320, x: '70%', y: '60%', duration: 22 },
      { color: 'rgba(196, 181, 253, 0.08)', size: 200, x: '60%', y: '5%', duration: 15 },
    ],
  },
  relationship: {
    base: 'linear-gradient(150deg, #FAF8F5 0%, #EDE9FE 50%, #FCE7F3 100%)',
    blobs: [
      { color: 'rgba(196, 181, 253, 0.14)', size: 300, x: '75%', y: '15%', duration: 20 },
      { color: 'rgba(251, 207, 232, 0.12)', size: 250, x: '10%', y: '70%', duration: 16 },
    ],
  },
  vibe: {
    base: 'linear-gradient(140deg, #FAF8F5 0%, #FEF3C7 40%, #FECDD3 100%)',
    blobs: [
      { color: 'rgba(253, 224, 71, 0.10)', size: 260, x: '20%', y: '20%', duration: 19 },
      { color: 'rgba(252, 165, 165, 0.10)', size: 280, x: '65%', y: '65%', duration: 23 },
      { color: 'rgba(167, 243, 208, 0.08)', size: 200, x: '80%', y: '10%', duration: 17 },
    ],
  },
  saved: {
    base: 'linear-gradient(155deg, #FAF8F5 0%, #FCE4EC 50%, #FFF3E0 100%)',
    blobs: [
      { color: 'rgba(244, 114, 182, 0.10)', size: 260, x: '15%', y: '25%', duration: 21 },
      { color: 'rgba(251, 191, 146, 0.08)', size: 240, x: '70%', y: '55%', duration: 18 },
    ],
  },
  journey: {
    base: 'linear-gradient(145deg, #FAF8F5 0%, #E0E7FF 45%, #CFFAFE 100%)',
    blobs: [
      { color: 'rgba(99, 102, 241, 0.10)', size: 300, x: '10%', y: '15%', duration: 20 },
      { color: 'rgba(103, 232, 249, 0.08)', size: 260, x: '75%', y: '70%', duration: 24 },
    ],
  },
};

function Background({ preset = 'home', children, className = '', style = {} }) {
  const config = presets[preset] || presets.home;

  return (
    <div
      className={`relative ${className}`}
      style={{
        background: config.base,
        minHeight: '100dvh',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Animated gradient blobs */}
      {config.blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="blob-float absolute rounded-full pointer-events-none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: i * 0.2 }}
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animationDuration: `${blob.duration}s`,
            zIndex: 0,
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          zIndex: 0,
        }}
      />

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default Background;
