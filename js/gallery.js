// =====================================================
// Gallery & Lightbox Functionality
// =====================================================

'use strict';

class Gallery {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightboxImage');
        this.lightboxCaption = document.getElementById('lightboxCaption');
        this.lightboxClose = document.querySelector('.lightbox-close');
        this.lightboxPrev = document.getElementById('lightboxPrev');
        this.lightboxNext = document.getElementById('lightboxNext');

        this.currentIndex = 0;
        this.images = [];

        this.init();
    }

    init() {
        // Collect all images
        this.galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                this.images.push({
                    src: img.src,
                    alt: img.alt,
                    index: index
                });

                // Add click event
                item.addEventListener('click', () => this.openLightbox(index));

                // Add keyboard support for accessibility
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                item.setAttribute('aria-label', `Open image ${index + 1} in lightbox`);

                item.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.openLightbox(index);
                    }
                });
            }
        });

        // Lightbox controls
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
        }

        if (this.lightboxPrev) {
            this.lightboxPrev.addEventListener('click', () => this.previousImage());
        }

        if (this.lightboxNext) {
            this.lightboxNext.addEventListener('click', () => this.nextImage());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Close on background click
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Touch swipe support for mobile
        this.addTouchSupport();
    }

    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightbox();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    updateLightbox() {
        if (this.images[this.currentIndex]) {
            const currentImage = this.images[this.currentIndex];
            this.lightboxImage.src = currentImage.src;
            this.lightboxImage.alt = currentImage.alt;
            this.lightboxCaption.textContent = currentImage.alt;

            // Update aria-label for accessibility
            this.lightbox.setAttribute('aria-label',
                `Image ${this.currentIndex + 1} of ${this.images.length}: ${currentImage.alt}`
            );
        }
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateLightbox();
        this.animateImageTransition('next');
    }

    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateLightbox();
        this.animateImageTransition('prev');
    }

    animateImageTransition(direction) {
        const translateX = direction === 'next' ? '100%' : '-100%';
        this.lightboxImage.style.transform = `translateX(${translateX})`;
        this.lightboxImage.style.opacity = '0';

        setTimeout(() => {
            this.lightboxImage.style.transition = 'none';
            this.lightboxImage.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;

            setTimeout(() => {
                this.lightboxImage.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                this.lightboxImage.style.transform = 'translateX(0)';
                this.lightboxImage.style.opacity = '1';
            }, 50);
        }, 300);
    }

    handleKeyboard(e) {
        if (!this.lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                this.closeLightbox();
                break;
            case 'ArrowRight':
                this.nextImage();
                break;
            case 'ArrowLeft':
                this.previousImage();
                break;
        }
    }

    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        if (this.lightbox) {
            this.lightbox.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.lightbox.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                this.nextImage();
            } else {
                // Swipe right - previous image
                this.previousImage();
            }
        }
    }
}

// =====================================================
// Gallery Filtering (Optional Enhancement)
// =====================================================
class GalleryFilter {
    constructor() {
        this.filterButtons = document.querySelectorAll('.gallery-filter-btn');
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.init();
    }

    init() {
        // Only initialize if filter buttons exist
        if (this.filterButtons.length === 0) return;

        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => this.filterGallery(button));
        });
    }

    filterGallery(button) {
        const filter = button.dataset.filter;

        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter items
        this.galleryItems.forEach(item => {
            const category = item.dataset.category;

            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
}

// =====================================================
// Image Lazy Loading with Blur Effect
// =====================================================
class GalleryLazyLoad {
    constructor() {
        this.images = document.querySelectorAll('.gallery-item img');
        this.init();
    }

    init() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.images.forEach(img => {
            // Add blur effect initially
            img.style.filter = 'blur(10px)';
            img.style.transition = 'filter 0.5s';
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('src');
        if (!src) return;

        const tempImage = new Image();
        tempImage.src = src;

        tempImage.onload = () => {
            img.src = src;
            img.style.filter = 'blur(0)';
            img.classList.add('loaded');
        };
    }
}

// =====================================================
// Gallery Masonry Layout (Optional)
// =====================================================
class GalleryMasonry {
    constructor() {
        this.grid = document.querySelector('.gallery-grid');
        this.items = document.querySelectorAll('.gallery-item');
        this.init();
    }

    init() {
        if (!this.grid) return;

        // Wait for images to load
        window.addEventListener('load', () => {
            this.layoutMasonry();
        });

        // Re-layout on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.layoutMasonry(), 250);
        });
    }

    layoutMasonry() {
        // Simple masonry layout using CSS Grid
        // This is a basic implementation; for more complex needs, consider using a library
        if (window.innerWidth > 768) {
            this.grid.style.display = 'grid';
            this.grid.style.gridAutoFlow = 'dense';
        }
    }
}

// =====================================================
// Initialize Gallery Components
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
    new GalleryFilter();
    new GalleryLazyLoad();
    // new GalleryMasonry(); // Uncomment if you want masonry layout

    // Add zoom effect on hover for desktop
    if (window.innerWidth > 768) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.1)';
                }
            });

            item.addEventListener('mouseleave', function() {
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
        });
    }
});

// =====================================================
// Performance Optimization
// =====================================================

// Preload next/previous images in lightbox for smoother transitions
function preloadAdjacentImages(currentIndex, images) {
    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;

    const nextImg = new Image();
    nextImg.src = images[nextIndex].src;

    const prevImg = new Image();
    prevImg.src = images[prevIndex].src;
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Gallery, GalleryFilter, GalleryLazyLoad, GalleryMasonry };
}
