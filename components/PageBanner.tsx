
import React from 'react';
import { LocalizedText } from '../types';
import Editable from './Editable';

interface PageBannerProps {
  title: string;
  imageUrl: string;
  basePath?: string;
  localizedText?: LocalizedText;
  titleVerticalAlign?: 'center' | 'bottom';
}

const PageBanner: React.FC<PageBannerProps> = ({ title, imageUrl, basePath, localizedText, titleVerticalAlign = 'bottom' }) => {
  const content = (
    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">{title}</h1>
  );

  const containerClasses = `relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center text-center pt-28 ${
    titleVerticalAlign === 'center' ? 'justify-center' : 'justify-end pb-6'
  }`;

  return (
    <div className="relative bg-cover bg-center h-72 md:h-80 text-white -mt-28" style={{ backgroundImage: `url('${imageUrl}')` }}>
      <div className="absolute inset-0 bg-brand-green-dark bg-opacity-60"></div>
      <div className={containerClasses}>
        <div className="relative group max-w-4xl">
          {basePath && localizedText ? (
            <Editable basePath={basePath} localizedText={localizedText}>
              {content}
            </Editable>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBanner;