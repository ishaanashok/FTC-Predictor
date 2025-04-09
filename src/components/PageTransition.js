import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const PageTransition = ({ children }) => {
  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          scale: {
            duration: 0.3,
          },
        }}
        style={{
          width: '100%',
          height: '100%',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </Box>
  );
};

export default PageTransition;