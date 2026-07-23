import { useEffect, useState } from "react";

interface TransparentLogoProps {
  src: string;
  className?: string;
  alt?: string;
  scrolled?: boolean;
}

export default function TransparentLogo({ src, className, alt = "Logo", scrolled }: TransparentLogoProps) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) return;

    // Create a new image to process
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Make near-white pixels transparent with a soft edge threshold
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Calculate brightness/whiteness
        // Pure white is 255, 255, 255.
        // We use a threshold of 240 to safely catch JPEG artifacts and JPEG-like compression
        if (r > 240 && g > 240 && b > 240 && a > 0) {
          // Make it fully transparent
          data[i + 3] = 0;
        } else if (r > 220 && g > 220 && b > 220 && a > 0) {
          // Soft blending for anti-aliasing near the edges
          const factor = (r + g + b) / 3; // 220 to 240
          const alphaRatio = (240 - factor) / 20; // 1 to 0
          data[i + 3] = Math.round(data[i + 3] * alphaRatio);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
    
    img.onerror = () => {
      console.error("Failed to load logo image for transparency processing");
    };
  }, [src]);

  // On non-scrolled (dark) header, we might want to make the logo look cleaner if it's too dark.
  // We can apply standard CSS filters or styles dynamically if needed.
  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={`${className} transition-all duration-300`}
    />
  );
}
