import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer = ({ src, alt, isOpen, onClose }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatty-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Controls */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 bg-card/90 backdrop-blur-md rounded-full px-3 py-2 border border-border shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-muted-foreground px-3 min-w-[60px] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0 rounded-full"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="h-8 w-8 p-0 rounded-full"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 rounded-full text-primary"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-4 right-4 z-10"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 rounded-full bg-card/90 backdrop-blur-md border border-border hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <motion.img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
              drag
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              dragElastic={0.1}
              onDoubleClick={handleReset}
            />
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-card/90 backdrop-blur-md rounded-lg px-4 py-2 border border-border shadow-lg">
              <p className="text-xs text-muted-foreground text-center">
                Double-click to reset • Drag to move
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};