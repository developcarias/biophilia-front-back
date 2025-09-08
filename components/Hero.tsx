
import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { HeroSlide, UIText } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface HeroProps {
  slides: HeroSlide[];
  uiText: UIText;
}

const Hero: React.FC<HeroProps> = ({ slides, uiText }) => {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides.length]);

  const prevSlide = () => {
    if (slides.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  }

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  if (slides.length === 0) {
    return <div className="h-screen w-full bg-brand-green-dark flex items-center justify-center text-white">Loading Hero...</div>
  }
  
  const currentSlide = slides[currentIndex];
  const buttonLink = (currentSlide.projectId && currentSlide.activityId)
    ? `#/projects/${currentSlide.projectId}#${currentSlide.activityId}`
    : (currentSlide.projectId ? `#/projects/${currentSlide.projectId}` : '#/donate');

  return (
    <div className="group relative h-screen w-full overflow-hidden -mt-28">
        {slides.map((slide, slideIndex) => (
            <div
                key={slide.id}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${slideIndex === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                style={{ backgroundImage: `url('${slide.imageUrl}')` }}
            />
        ))}

        {/* Overlays */}
        <div
            className="absolute inset-0 hidden lg:block z-10 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(22, 101, 52, 0.9) 10%, rgba(22, 101, 52, 0.5) 70%, transparent 90%)' }}
        />
        <div className="lg:hidden absolute inset-0 bg-brand-green-dark bg-opacity-50 z-10"></div>


        <div className="relative container mx-auto px-4 sm:px-6 lg:px-20 h-full flex flex-col justify-center items-start text-left text-white z-20 pt-28">
            <div className="lg:w-1/2 xl:w-2/5">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">{currentSlide.title[language]}</h1>
                <p className="mt-4 max-w-2xl text-xl md:text-2xl drop-shadow-md whitespace-pre-line opacity-90">{currentSlide.subtitle[language]}</p>
                {(currentSlide.projectId || currentSlide.activityId) && (
                  <div className="mt-8">
                  <a href={buttonLink} className="bg-brand-accent text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg">
                      {uiText.learnMore[language]}
                  </a>
                  </div>
                )}
            </div>
        </div>

        <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeftIcon className="h-8 w-8" />
        </button>
        <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRightIcon className="h-8 w-8" />
        </button>

        <div className="absolute bottom-32 w-full z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex hidden justify-center space-x-2 lg:w-1/2 xl:w-2/5 lg:justify-start">
                    {slides.map((_, slideIndex) => (
                        <button
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className={`h-3 w-3 rounded-full transition-colors ${slideIndex === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                            aria-label={`Go to slide ${slideIndex + 1}`}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Hero;
