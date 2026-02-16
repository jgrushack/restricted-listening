import { useState, useEffect } from 'react';

// Simple color extraction without external library
const extractColorsFromImage = (imageUrl: string): Promise<[number, number, number][]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        
        // Sample pixels and find dominant colors
        const colorMap: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 128) {
            const key = `${Math.floor(r / 16) * 16},${Math.floor(g / 16) * 16},${Math.floor(b / 16) * 16}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
          }
        }
        
        // Get top colors
        const sortedColors = Object.entries(colorMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color.split(',').map(Number) as [number, number, number]);
        
        resolve(sortedColors);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

export interface ColorPalette {
  primary: string;
  secondary: string;
  gradient: string;
}

export function useColorExtraction(imageUrl?: string): ColorPalette | null {
  const [palette, setPalette] = useState<ColorPalette | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setPalette(null);
      return;
    }

    const extractColors = async () => {
      try {
        const colors = await extractColorsFromImage(imageUrl);
        
        if (colors.length > 0) {
          const primary = `rgb(${colors[0][0]}, ${colors[0][1]}, ${colors[0][2]})`;
          const secondary = colors.length > 1 
            ? `rgb(${colors[1][0]}, ${colors[1][1]}, ${colors[1][2]})`
            : `rgb(${Math.max(0, colors[0][0] - 40)}, ${Math.max(0, colors[0][1] - 40)}, ${Math.max(0, colors[0][2] - 40)})`;
          
          // Create a gradient with the extracted colors
          const gradient = `linear-gradient(135deg, ${primary}, ${secondary}, #1a0b2e)`;
          
          setPalette({
            primary,
            secondary,
            gradient
          });
        }
      } catch (error) {
        console.error('Error extracting colors:', error);
        setPalette(null);
      }
    };

    extractColors();
  }, [imageUrl]);

  return palette;
}