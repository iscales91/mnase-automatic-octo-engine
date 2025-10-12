import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ImageCarousel({ images, autoPlay = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlay, interval, images.length]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '16px' }} data-testid="image-carousel">
      {/* Images */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {images.map((image, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentIndex === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              zIndex: currentIndex === index ? 1 : 0
            }}
            data-testid={`carousel-slide-${index}`}
          >
            <img
              src={image.url}
              alt={image.alt || `Slide ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Overlay for text visibility */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
            }} />
            
            {/* Text overlay */}
            {(image.title || image.description) && (
              <div style={{
                position: 'absolute',
                bottom: '3rem',
                left: '3rem',
                right: '3rem',
                color: 'white',
                zIndex: 2
              }}>
                {image.title && (
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }} data-testid={`carousel-title-${index}`}>
                    {image.title}
                  </h2>
                )}
                {image.description && (
                  <p style={{
                    fontSize: '1.2rem',
                    opacity: 0.95,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                  }} data-testid={`carousel-description-${index}`}>
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              opacity: isTransitioning ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            data-testid="carousel-prev-btn"
          >
            <ChevronLeft size={24} color="#1e293b" />
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              opacity: isTransitioning ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
            data-testid="carousel-next-btn"
          >
            <ChevronRight size={24} color="#1e293b" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              style={{
                width: currentIndex === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                background: currentIndex === index ? '#dc2626' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentIndex === index ? '0 2px 8px rgba(220, 38, 38, 0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (currentIndex !== index) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentIndex !== index) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                }
              }}
              data-testid={`carousel-dot-${index}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
