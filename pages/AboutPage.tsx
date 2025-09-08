
import React from 'react';
import { AboutPageContent, ValueItem, LocalizedText, ContentBlockType } from '../types';
import ContentBlock from '../components/ContentBlock';
import { useI18n } from '../i18n';
import PageBanner from '../components/PageBanner';
import Editable from '../components/Editable';

import ValueCollaborationIcon from '../components/icons/ValueCollaborationIcon';
import ValueConnectionIcon from '../components/icons/ValueConnectionIcon';
import ValueEducationIcon from '../components/icons/ValueEducationIcon';
import ValueEquityIcon from '../components/icons/ValueEquityIcon';
import ValueLeadershipIcon from '../components/icons/ValueLeadershipIcon';
import ValueScienceIcon from '../components/icons/ValueScienceIcon';
import EditableImage from '../components/EditableImage';


interface AboutPageProps {
  content: AboutPageContent;
  valuesContent: {
    title: LocalizedText;
    items: ValueItem[];
  };
}

const valueIconMap: { [key: string]: React.FC<{className?: string}> } = {
  ValueCollaborationIcon,
  ValueConnectionIcon,
  ValueEducationIcon,
  ValueEquityIcon,
  ValueLeadershipIcon,
  ValueScienceIcon,
};

const ValueCard: React.FC<{item: ValueItem, basePath: string}> = ({ item, basePath }) => {
  const { language } = useI18n();
  const IconComponent = item.icon ? valueIconMap[item.icon] : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center h-full">
      {item.imageUrl ? (
        <img 
          src={item.imageUrl} 
          alt={item.title?.[language] || 'Value Image'} 
          className="w-32 h-32 object-cover rounded-full mb-6 shadow-md border-4 border-white" 
        />
      ) : IconComponent ? (
        <div className="w-32 h-32 flex items-center justify-center mb-6 text-brand-accent">
            <IconComponent className="h-24 w-24" />
        </div>
      ) : (
        <div className="w-32 h-32 flex items-center justify-center mb-6 bg-gray-200 rounded-full"></div>
      )}
      <Editable localizedText={item.title || {en: '', es: ''}} basePath={`${basePath}.title`}>
        <h3 className="text-xl font-bold text-brand-green-dark mb-2">{item.title?.[language]}</h3>
      </Editable>
      <Editable localizedText={item.text || {en: '', es: ''}} basePath={`${basePath}.text`} multiline>
        <p className="text-brand-gray flex-grow">{item.text?.[language]}</p>
      </Editable>
    </div>
  )
}

const MissionVisionCard: React.FC<{ content: ContentBlockType, basePath: string }> = ({ content, basePath }) => {
  const { language } = useI18n();
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-8 flex-grow flex flex-col">
        <Editable localizedText={content?.title || {en:'',es:''}} basePath={`${basePath}.title`}>
          <h2 className="text-3xl font-extrabold text-brand-green-dark mb-4">{content?.title?.[language]}</h2>
        </Editable>
        <div className="flex-grow">
          <Editable localizedText={content?.text || {en:'',es:''}} basePath={`${basePath}.text`} multiline>
            <p className="text-lg text-brand-gray leading-relaxed">{content?.text?.[language]}</p>
          </Editable>
        </div>
      </div>
      <EditableImage src={content?.imageUrl || ''} alt={content?.imageAlt || ''} basePath={`${basePath}.imageUrl`} className="w-full h-64 object-cover object-top" />
    </div>
  );
};


const AboutPage: React.FC<AboutPageProps> = ({ content, valuesContent }) => {
  const { language } = useI18n();

  if (!content) return null; // Prevent crash if content is not loaded

  return (
    <>
      <PageBanner
        title={content.banner?.title?.[language] || 'About Us'}
        imageUrl={content.banner?.imageUrl || ''}
        basePath="aboutPage.banner.title"
        localizedText={content.banner?.title}
      />
      
      {/* Our Story Section */}
      {content.history && (
        <div className="bg-white py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="prose lg:prose-lg max-w-none text-brand-gray">
                <Editable localizedText={content.history.title} basePath="aboutPage.history.title">
                  <h2 className="text-3xl font-bold text-brand-green-dark mb-6">{content.history.title?.[language]}</h2>
                </Editable>
                <Editable localizedText={content.history.text} basePath="aboutPage.history.text" multiline>
                  <p className="whitespace-pre-line leading-relaxed">{content.history.text?.[language]}</p>
                </Editable>
              </div>
              <div>
                <EditableImage src={content.history.imageUrl || ''} alt="Group of diverse people collaborating" basePath="aboutPage.history.imageUrl" className="rounded-lg shadow-xl object-cover w-full max-h-[450px]" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mission & Vision Section */}
      {(content.mission || content.vision) && (
        <div className="bg-brand-green-light py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {content.mission && <MissionVisionCard content={content.mission} basePath="aboutPage.mission" />}
                    {content.vision && <MissionVisionCard content={content.vision} basePath="aboutPage.vision" />}
                </div>
            </div>
        </div>
      )}

      {/* Our Work Section */}
      {content.work && (
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
      )}


      {/* Values Section */}
      {valuesContent?.items && (
        <div className="bg-brand-green-light pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Editable localizedText={valuesContent.title} basePath="homePage.values.title">
                <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{valuesContent.title?.[language]}</h2>
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
      )}
    </>
  );
};

export default AboutPage;
