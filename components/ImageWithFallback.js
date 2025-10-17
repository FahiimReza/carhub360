// Smart Image Component with Automatic Fallback
function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  carModel, 
  category = 'sedan',
  onImageUpdate,
  srcset,
  sizes
}) {
  try {
    const [imageSrc, setImageSrc] = React.useState(src);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [retryCount, setRetryCount] = React.useState(0);
    const maxRetries = 3;

    React.useEffect(() => {
      if (src) {
        setImageSrc(src);
        setIsLoading(true);
        setHasError(false);
      }
    }, [src]);

    const handleImageLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleImageError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return (
      <div className={`relative overflow-hidden ${className}`} data-name="image-with-fallback" data-file="components/ImageWithFallback.js">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <div className="icon-image text-gray-400 text-2xl"></div>
          </div>
        )}
        
        {hasError && retryCount >= maxRetries && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="icon-image-off text-gray-400 text-2xl mb-2"></div>
              <div className="text-gray-500 text-sm">Image not available</div>
            </div>
          </div>
        )}

        <img
          src={imageSrc}
          alt={alt}
          srcSet={srcset ? srcset.split(', ').map(s => {
            const [url, width] = s.trim().split(' ');
            return `${url} ${width}`;
          }).join(', ') : ''}
          sizes={sizes}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />

        {/* No retry button needed without scraping */}
      </div>
    );
  } catch (error) {
    console.error('ImageWithFallback component error:', error);
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
        <div className="icon-image-off text-gray-400 text-2xl"></div>
      </div>
    );
  }
}