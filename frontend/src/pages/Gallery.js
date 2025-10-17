import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Download, Calendar, User } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Photos', color: '#6b7280' },
    { value: 'general', label: 'General', color: '#3b82f6' },
    { value: 'tournament', label: 'Tournaments', color: '#f59e0b' },
    { value: 'camp', label: 'Camps', color: '#10b981' },
    { value: 'clinic', label: 'Clinics', color: '#8b5cf6' },
    { value: 'event', label: 'Events', color: '#ec4899' },
    { value: 'team', label: 'Teams', color: '#06b6d4' },
    { value: 'facility', label: 'Facilities', color: '#f97316' }
  ];

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, selectedCategory]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/gallery`);
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    if (selectedCategory === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === selectedCategory));
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedIndex(0);
  };

  const nextImage = () => {
    const nextIndex = (selectedIndex + 1) % filteredImages.length;
    setSelectedIndex(nextIndex);
    setSelectedImage(filteredImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = selectedIndex === 0 ? filteredImages.length - 1 : selectedIndex - 1;
    setSelectedIndex(prevIndex);
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedIndex, filteredImages]);

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '4rem 0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            Photo Gallery
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Capturing moments from our programs, tournaments, and events
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ 
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto'
        }}>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedCategory === category.value ? category.color : 'transparent',
                color: selectedCategory === category.value ? 'white' : '#64748b',
                border: selectedCategory === category.value ? 'none' : '1px solid #e5e7eb',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.value) {
                  e.currentTarget.style.background = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {category.label}
              {selectedCategory === category.value && (
                <span style={{ marginLeft: '0.5rem' }}>
                  ({filteredImages.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
            <div style={{ 
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Loading gallery...
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              style={{ margin: '0 auto 2rem', opacity: 0.3 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No photos yet</h2>
            <p>Check back soon for updates from our events and programs</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                onClick={() => openLightbox(image, index)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                  const overlay = e.currentTarget.querySelector('.overlay');
                  if (overlay) overlay.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  const overlay = e.currentTarget.querySelector('.overlay');
                  if (overlay) overlay.style.opacity = '0';
                }}
              >
                <img
                  src={image.image_url}
                  alt={image.category}
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div
                  className="overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1.5rem',
                    color: 'white'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.3rem 0.75rem',
                      background: getCategoryColor(image.category),
                      borderRadius: '15px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      width: 'fit-content'
                    }}
                  >
                    {categories.find(c => c.value === image.category)?.label || image.category}
                  </span>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {formatDate(image.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={24} />
          </button>

          {/* Previous Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              style={{
                position: 'absolute',
                left: '2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {filteredImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              style={{
                position: 'absolute',
                right: '2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.category}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            {/* Image Info */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                marginTop: '1rem',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.4rem 1rem',
                      background: getCategoryColor(selectedImage.category),
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}
                  >
                    {categories.find(c => c.value === selectedImage.category)?.label || selectedImage.category}
                  </span>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    📅 {formatDate(selectedImage.created_at)}
                  </div>
                  {filteredImages.length > 1 && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.5rem' }}>
                      {selectedIndex + 1} of {filteredImages.length}
                    </div>
                  )}
                </div>
                <a
                  href={selectedImage.image_url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
