import React, { useState } from 'react';
import { thumbUrl } from '../utils/media';

type ImgProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string };

/** Shows the small WebP thumbnail of an uploaded photo, falling back to the original if there is none yet. */
export const Thumb = ({ src, onError, ...props }: ImgProps) => {
  const thumb = thumbUrl(src);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const useThumb = thumb !== null && failedFor !== src;

  return (
    <img
      {...props}
      src={useThumb ? thumb : src}
      onError={(e) => (useThumb ? setFailedFor(src) : onError?.(e))}
    />
  );
};

/** Full-size photo for the viewer: the cached thumbnail shows at once while the original loads on top. */
export const ProgressiveImage = ({ src, className = '', ...props }: ImgProps) => {
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const hasThumb = thumbUrl(src) !== null;
  const loaded = loadedFor === src;

  return (
    <span className="relative block w-full h-full">
      {hasThumb && !loaded && (
        <Thumb src={src} alt="" aria-hidden draggable={false} className={`absolute inset-0 ${className}`} />
      )}
      <img
        {...props}
        src={src}
        onLoad={() => setLoadedFor(src)}
        className={`absolute inset-0 ${className} ${hasThumb ? `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}` : ''}`}
      />
    </span>
  );
};
