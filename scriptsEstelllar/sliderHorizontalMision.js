class StatisticsSlider {
    constructor() {
        this.sliderTrack = document.getElementById('sliderTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        this.cardWidth = 540; // 520px + 20px gap
        this.currentIndex = 0;
        this.maxIndex = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.calculateDimensions();
        this.attachEventListeners();
        this.updateButtons();
        
        console.log('Statistics Slider initialized:', {
            maxIndex: this.maxIndex,
            cardWidth: this.cardWidth,
            scrollWidth: this.sliderTrack.scrollWidth,
            offsetWidth: this.sliderTrack.offsetWidth
        });
    }
    
    calculateDimensions() {
        const cards = this.sliderTrack.querySelectorAll('.statistics-card');
        const totalCards = cards.length;
        const containerWidth = this.sliderTrack.offsetWidth;
        const totalWidth = this.sliderTrack.scrollWidth;
        
        const visibleCards = Math.floor(containerWidth / this.cardWidth);
        this.maxIndex = Math.max(0, totalCards - visibleCards);
        this.maxScrollLeft = Math.max(0, totalWidth - containerWidth);
        
        console.log('Statistics dimensions calculated:', {
            totalCards,
            visibleCards,
            containerWidth,
            totalWidth,
            maxScrollLeft: this.maxScrollLeft,
            maxIndex: this.maxIndex,
            cardWidth: this.cardWidth
        });
    }
    
    attachEventListeners() {
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Statistics prev button clicked, currentIndex:', this.currentIndex);
            this.prevSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Statistics next button clicked, currentIndex:', this.currentIndex);
            this.nextSlide();
        });
        
        this.sliderTrack.addEventListener('wheel', (e) => {
            // Solo activar si es scroll horizontal real
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                e.stopPropagation();
                
                const scrollAmount = e.deltaX * 2.5;
                this.handleWheelScroll(scrollAmount);
            }
            // Si es scroll vertical, no hacer nada y dejar que la página haga scroll normal
            
        }, { passive: false });
        
        this.sliderTrack.addEventListener('scroll', () => {
            if (!this.isAnimating) {
                this.updateCurrentIndexFromScroll();
            }
        });
        
        window.addEventListener('resize', () => {
            this.calculateDimensions();
            this.updateButtons();
        });
        
        this.setupTouchEvents();
    }
    
    handleWheelScroll(scrollAmount) {
        const currentScrollLeft = this.sliderTrack.scrollLeft;
        const newScrollLeft = currentScrollLeft + scrollAmount;
        
        if (newScrollLeft < 0) {
            const overflow = Math.abs(newScrollLeft);
            const dampedOverflow = Math.min(overflow * 0.3, 50);
            this.applyRubberBand(dampedOverflow);
            
        } else if (newScrollLeft > this.maxScrollLeft) {
            const overflow = newScrollLeft - this.maxScrollLeft;
            const dampedOverflow = Math.min(overflow * 0.3, 50);
            this.applyRubberBand(-dampedOverflow);
            
        } else {
            this.resetRubberBand();
            this.sliderTrack.scrollLeft = newScrollLeft;
        }
    }
    
    applyRubberBand(offset) {
        this.sliderTrack.style.transform = `translateX(${offset}px)`;
        
        clearTimeout(this.rubberBandTimer);
        this.rubberBandTimer = setTimeout(() => {
            this.resetRubberBand();
        }, 150);
    }
    
    resetRubberBand() {
        this.sliderTrack.classList.add('statistics-rubber-band');
        this.sliderTrack.style.transform = 'translateX(0px)';
        
        setTimeout(() => {
            this.sliderTrack.classList.remove('statistics-rubber-band');
        }, 400);
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startScrollLeft = 0;
        let isDragging = false;
        let lastTouchX = 0;
        let touchVelocity = 0;
        
        this.sliderTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            lastTouchX = startX;
            startScrollLeft = this.sliderTrack.scrollLeft;
            isDragging = true;
            touchVelocity = 0;
        }, { passive: true });
        
        this.sliderTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            const newScrollLeft = startScrollLeft + diffX;
            
            touchVelocity = (lastTouchX - currentX) * 2;
            lastTouchX = currentX;
            
            if (newScrollLeft < 0) {
                const overflow = Math.abs(newScrollLeft);
                const dampedOverflow = Math.min(overflow * 0.3, 50);
                this.applyRubberBand(dampedOverflow);
            } else if (newScrollLeft > this.maxScrollLeft) {
                const overflow = newScrollLeft - this.maxScrollLeft;
                const dampedOverflow = Math.min(overflow * 0.3, 50);
                this.applyRubberBand(-dampedOverflow);
            } else {
                this.sliderTrack.style.transform = 'translateX(0px)';
                this.sliderTrack.scrollLeft = newScrollLeft;
            }
        }, { passive: true });
        
        this.sliderTrack.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            this.resetRubberBand();
            
            if (Math.abs(touchVelocity) > 3) {
                const inertiaScroll = touchVelocity * 15;
                this.handleWheelScroll(inertiaScroll);
            }
        }, { passive: true });
    }
    
    updateCurrentIndexFromScroll() {
        if (this.isAnimating) return;
        
        const scrollLeft = this.sliderTrack.scrollLeft;
        const newIndex = Math.round(scrollLeft / this.cardWidth);
        
        if (newIndex !== this.currentIndex) {
            this.currentIndex = Math.max(0, Math.min(newIndex, this.maxIndex));
            this.updateButtons();
            console.log('Statistics index updated from scroll:', this.currentIndex);
        }
    }
    
    prevSlide() {
        if (this.currentIndex > 0 && !this.isAnimating) {
            this.currentIndex--;
            this.scrollToIndex();
            console.log('Statistics moving to previous slide:', this.currentIndex, 'of', this.maxIndex);
        }
    }
    
    nextSlide() {
        if (this.currentIndex < this.maxIndex && !this.isAnimating) {
            this.currentIndex++;
            this.scrollToIndex();
            console.log('Statistics moving to next slide:', this.currentIndex, 'of', this.maxIndex);
        }
    }
    
    scrollToIndex() {
        this.isAnimating = true;
        this.resetRubberBand();
        
        const targetScrollLeft = this.currentIndex * this.cardWidth;
        
        console.log('Statistics scrolling to index:', this.currentIndex, 'scrollLeft:', targetScrollLeft);
        
        this.sliderTrack.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            this.isAnimating = false;
            this.updateButtons();
        }, 300);
    }
    
    updateButtons() {
        this.prevBtn.disabled = this.currentIndex <= 0;
        this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
        
        console.log('Statistics buttons updated:', {
            prevDisabled: this.prevBtn.disabled,
            nextDisabled: this.nextBtn.disabled,
            currentIndex: this.currentIndex,
            maxIndex: this.maxIndex
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Statistics slider...');
    
    requestAnimationFrame(() => {
        new StatisticsSlider();
    });
});

// Animaciones de entrada específicas para statistics
const statisticsObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const statisticsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'statistics-slideInUp 0.6s ease forwards';
        }
    });
}, statisticsObserverOptions);

document.addEventListener('DOMContentLoaded', () => {
    const statisticsCards = document.querySelectorAll('.statistics-card');
    statisticsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.animationDelay = `${index * 0.1}s`;
        statisticsObserver.observe(card);
    });
});