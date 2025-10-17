function CarImageGallery({ car }) {
  try {
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [showLightbox, setShowLightbox] = React.useState(false);
    
    const [carImageBasePaths, setCarImageBasePaths] = React.useState([]);

    
    React.useEffect(() => {
      const processImages = (images, carModelName) => {
        console.log('Original car.images:', images);
        console.log('car.objectData.model_name:', carModelName);
        if (!Array.isArray(images)) return [];
        const formattedModelName = carModelName ? carModelName.toLowerCase().replace(/ /g, '_') : 'unknown';
        console.log('Formatted Model Name:', formattedModelName);
        return images.map(img => {
          let rawImageString = null;
          if (typeof img === 'string') rawImageString = img;
          else if (img && typeof img === 'object') rawImageString = img.image_url || img.url || img.src || null;
          console.log('Raw Image String:', rawImageString);

          if (rawImageString) {
            // Strip common size suffixes and .webp extension from the filename to get the base path
            const filenameWithoutSuffixAndExtension = rawImageString
              .replace(/-\d+(?=\.webp$)/, ''); // Remove any size suffix like -400, -800, -1200 before .webp, ensuring .webp remains
            console.log('Filename Without Suffix and Extension:', filenameWithoutSuffixAndExtension);
            
            let finalPath;
            // Normalize path: remove leading slash if present
            const normalizedFilename = filenameWithoutSuffixAndExtension.startsWith('/') ? filenameWithoutSuffixAndExtension.substring(1) : filenameWithoutSuffixAndExtension;
            
            // Check if the raw string already contains the full path
            if (normalizedFilename.startsWith('assets/car-images/')) {
              finalPath = normalizedFilename;
            } else {
              // Otherwise, construct the full path
              finalPath = `assets/car-images/${formattedModelName}/${normalizedFilename}`;
            }
            console.log('Processed Image Base Path:', finalPath);
            return finalPath;
          }
          return null;
        }).filter(img => img !== null && img !== undefined);
      };
      setCarImageBasePaths(processImages(car.images, car.objectData.model_name));
    }, [car]);

    const currentImageBasePath = carImageBasePaths[selectedImage] || (carImageBasePaths.length > 0 ? carImageBasePaths[0] : null);
    const mainImageSrc = currentImageBasePath ? `${currentImageBasePath.replace('.webp', '')}-400.webp` : 'https://via.placeholder.com/400x300?text=No+Image';

    return (
      <div className="space-y-6">
        {/* Main Image */}
        <div className="glass-card overflow-hidden hover-lift cursor-pointer relative" onClick={() => setShowLightbox(true)}>
          <ImageWithFallback
            src={mainImageSrc}
            alt={`${car.objectData.model_name || car.objectData.model} - View ${selectedImage + 1}`}
            className="w-full h-96"
          />
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm flex items-center">
            <div className="icon-zoom-in mr-2"></div>
            Click to enlarge
          </div>
        </div>

        {/* Thumbnail Gallery */}
        <div className="grid grid-cols-5 gap-3">
          {carImageBasePaths.map((basePath, idx) => {
            const thumbImageSrc = basePath ? `${basePath.replace('.webp', '')}-400.webp` : 'https://via.placeholder.com/200x150?text=Car';
            return (
              <div
                key={idx}
                className={`glass-card overflow-hidden cursor-pointer hover-glow transition-all duration-300 ${
                  selectedImage === idx ? 'ring-2 ring-[var(--primary-color)] scale-105' : ''
                }`}
                onClick={() => setSelectedImage(idx)}
              >
                <ImageWithFallback
                  src={thumbImageSrc}
                  alt={`${car.objectData.model_name || car.objectData.model} view ${idx + 1}`}
                  className="w-full h-20"
                />
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {showLightbox && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowLightbox(false)}>
            <div className="relative max-w-6xl w-full">
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
              >
                <div className="icon-x text-2xl"></div>
              </button>
              
              <img
                src={mainImageSrc} // Use the same main image src for lightbox
                alt={`${car.objectData.model_name || car.objectData.model} - Large view`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Navigation */}
              {selectedImage > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(selectedImage - 1);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <div className="icon-chevron-left text-2xl"></div>
                </button>
              )}
              
              {selectedImage < carImageBasePaths.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(selectedImage + 1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <div className="icon-chevron-right text-2xl"></div>
                </button>
              )}
              
              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                {selectedImage + 1} / {carImageBasePaths.length}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('CarImageGallery component error:', error);
    return null;
  }
}