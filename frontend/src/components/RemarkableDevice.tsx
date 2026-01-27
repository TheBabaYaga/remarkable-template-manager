import { motion } from "framer-motion";

const RemarkableDevice = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <svg
        width="220"
        height="280"
        viewBox="0 0 220 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-device"
      >
        {/* Device body */}
        <rect
          x="4"
          y="4"
          width="192"
          height="272"
          rx="12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="opacity-40"
        />
        
        {/* Inner screen bezel */}
        <rect
          x="16"
          y="24"
          width="168"
          height="232"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="opacity-25"
        />
        
        {/* Screen content lines - suggesting paper/notes */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <line x1="32" y1="60" x2="152" y2="60" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="100" x2="160" y2="100" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="120" x2="120" y2="120" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="140" x2="155" y2="140" stroke="currentColor" strokeWidth="1" />
          <line x1="32" y1="160" x2="135" y2="160" stroke="currentColor" strokeWidth="1" />
        </motion.g>
        
        {/* Top left power button */}
        <rect
          x="20"
          y="1"
          width="20"
          height="3"
          rx="1.5"
          fill="currentColor"
          className="opacity-25"
        />
        
        {/* Pen/Stylus attached to top right side */}
        <g className="opacity-35">
          {/* Pen body */}
          <rect
            x="199"
            y="18"
            width="6"
            height="120"
            rx="3"
            fill="currentColor"
          />
          {/* Pen tip */}
          <path
            d="M199 138 L202 150 L205 138"
            fill="currentColor"
          />
          {/* Pen button/grip detail */}
          <rect
            x="200"
            y="35"
            width="4"
            height="18"
            rx="1"
            fill="currentColor"
            className="opacity-50"
          />
        </g>
      </svg>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 blur-3xl opacity-20 bg-device-glow rounded-full scale-75" />
    </motion.div>
  );
};

export default RemarkableDevice;
