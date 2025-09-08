

import React from 'react';
import { AboutPageContent, ValueItem, LocalizedText, ContentBlockType } from '../types';
import ContentBlock from '../components/ContentBlock';
import { useI18n } from '../i18n';
import PageBanner from '../components/PageBanner';
import Editable from '../components/Editable';

interface AboutPageProps {
  content: AboutPageContent;
  valuesContent: {
    title: LocalizedText;
    items: ValueItem[];
  };
}

const ValueCard: React.FC<{item: ValueItem, basePath: string}> = ({ item, basePath }) => {
  const { language } = useI18n();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center h-full">
      <img 
        src={item.imageUrl} 
        alt={item.title[language]} 
        className="w-32 h-32 object-cover rounded-full mb-6 shadow-md border-4 border-white" 
      />
      <Editable localizedText={item.title} basePath={`${basePath}.title`}>
        <h3 className="text-xl font-bold text-brand-green-dark mb-2">{item.title[language]}</h3>
      </Editable>
      <Editable localizedText={item.text} basePath={`${basePath}.text`} multiline>
        <p className="text-brand-gray flex-grow">{item.text[language]}</p>
      </Editable>
    </div>
  )
}

const MissionVisionCard: React.FC<{ content: ContentBlockType, basePath: string }> = ({ content, basePath }) => {
  const { language } = useI18n();
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-8 flex-grow flex flex-col">
        <Editable localizedText={content.title} basePath={`${basePath}.title`}>
          <h2 className="text-3xl font-extrabold text-brand-green-dark mb-4">{content.title[language]}</h2>
        </Editable>
        <div className="flex-grow">
          <Editable localizedText={content.text} basePath={`${basePath}.text`} multiline>
            <p className="text-lg text-brand-gray leading-relaxed">{content.text[language]}</p>
          </Editable>
        </div>
      </div>
      <img src={content.imageUrl} alt={content.imageAlt} className="w-full h-64 object-cover object-top" />
    </div>
  );
};


const AboutPage: React.FC<AboutPageProps> = ({ content, valuesContent }) => {
  const { language } = useI18n();

  return (
    <>
      <PageBanner
        title={content.banner.title[language]}
        imageUrl={content.banner.imageUrl}
        basePath="aboutPage.banner.title"
        localizedText={content.banner.title}
      />
      
      {/* Our Story Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="prose lg:prose-lg max-w-none text-brand-gray">
              <Editable localizedText={content.history.title} basePath="aboutPage.history.title">
                <h2 className="text-3xl font-bold text-brand-green-dark mb-6">{content.history.title[language]}</h2>
              </Editable>
              <Editable localizedText={content.history.text} basePath="aboutPage.history.text" multiline>
                <p className="whitespace-pre-line leading-relaxed">{content.history.text[language]}</p>
              </Editable>
            </div>
            <div>
              <img src={content.history.imageUrl} alt="Group of diverse people collaborating" className="rounded-lg shadow-xl object-cover w-full max-h-[450px]" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mission & Vision Section */}
      <div className="bg-brand-green-light py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <MissionVisionCard content={content.mission} basePath="aboutPage.mission" />
                  <MissionVisionCard content={content.vision} basePath="aboutPage.vision" />
              </div>
          </div>
      </div>

      {/* Our Work Section */}
      <div className="bg-white">
        <ContentBlock 
          title={content.work.title}
          text={content.work.text}
          imageUrl={content.work.imageUrl}
          imageAlt={content.work.imageAlt}
          imagePosition="left"
          basePath="aboutPage.work"
        />
      </div>


      {/* Values Section */}
      <div className="bg-brand-green-light pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Editable localizedText={valuesContent.title} basePath="homePage.values.title">
              <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{valuesContent.title[language]}</h2>
            </Editable>
            <div className="flex flex-wrap justify-center -m-4">
              {valuesContent.items.map((item, index) => (
                <div key={item.id} className="w-full sm:w-1/2 lg:w-1/3 p-4">
                  <ValueCard item={item} basePath={`homePage.values.items.${index}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
