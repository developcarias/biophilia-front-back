import React, { useState, useEffect } from 'react';
// FIX: Imported LocalizedText type to resolve 'Cannot find name' error.
import { HomePageContent, ValueItem, AlliancePartner, Project, UIText, OurNumbersSection as OurNumbersSectionType, LocalizedText, Statistic } from '../types';
import Hero from '../components/Hero';
import ParallaxSection from '../components/ParallaxSection';
import LatestProjects from '../components/LatestProjects';
import { useI18n } from '../i18n';
import LeafIcon from '../components/icons/LeafIcon';
import UsersIcon from '../components/icons/UsersIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import BeakerIcon from '../components/icons/BeakerIcon';
import MegaphoneIcon from '../components/icons/MegaphoneIcon';
import HandshakeIcon from '../components/icons/HandshakeIcon';
import SustainabilityIcon from '../components/icons/SustainabilityIcon';
import EquityIcon from '../components/icons/EquityIcon';
import Editable from '../components/Editable';
import EditableImage from '../components/EditableImage';

interface HomePageProps {
  content: HomePageContent;
  uiText: UIText;
  projects: Project[];
}

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
  LeafIcon,
  UsersIcon,
  BookOpenIcon,
  BeakerIcon,
  MegaphoneIcon,
  HandshakeIcon,
  SustainabilityIcon,
  EquityIcon,
};

const StatCard: React.FC<{stat: Statistic, basePath: string}> = ({stat, basePath}) => {
  const { language } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const IconComponent = iconMap[stat.icon];

  useEffect(() => {
    if (!stat.backgroundImages || stat.backgroundImages.length < 2) return;
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % (stat.backgroundImages?.length || 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [stat.backgroundImages]);

  return (
      <div className="relative p-6 rounded-lg shadow-lg text-center overflow-hidden w-full min-w-[80vw] md:min-w-0 md:w-auto flex-shrink-0 snap-center h-64 flex flex-col justify-center">
        {(stat.backgroundImages || []).map((img, imgIndex) => (
          <div 
            key={imgIndex} 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out" 
            style={{ backgroundImage: `url('${img}')`, opacity: imgIndex === currentImageIndex ? 1 : 0 }} 
          />
        ))}
        <div className="absolute inset-0 bg-brand-green-dark bg-opacity-70"></div>
        <div className="relative text-white z-10 flex flex-col items-center justify-center h-full">
          {IconComponent && <IconComponent className="h-12 w-12 text-white/80 mx-auto mb-4" />}
          <div className="text-5xl font-bold">{stat.value}</div>
          <Editable localizedText={stat.label} basePath={`${basePath}.label`}>
            <div className="text-lg text-white/90 mt-2">{stat.label[language]}</div>
          </Editable>
        </div>
      </div>
  );
};


interface OurNumbersSectionProps {
  content: OurNumbersSectionType;
  basePath: string;
}

const OurNumbersSection: React.FC<OurNumbersSectionProps> = ({ content, basePath }) => {
  const { language } = useI18n();

  if (!content || !content.stats) return null;

  return (
    <div className="bg-brand-green-light py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Editable localizedText={content.title} basePath={`${basePath}.title`}>
            <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{content.title?.[language]}</h2>
          </Editable>
        </div>
        <div className="md:grid md:grid-cols-3 gap-8 flex overflow-x-auto snap-x snap-mandatory md:snap-none py-4 scrollbar-hide">
          {content.stats.map((stat, index) => {
            const statBasePath = `${basePath}.stats.${index}`;
            return (
              <StatCard stat={stat} basePath={statBasePath} key={stat.id} />
            );
          })}
        </div>
      </div>
    </div>
  );
};


const ActionLineCard: React.FC<{item: ValueItem; basePath: string}> = ({ item, basePath }) => {
    const { language } = useI18n();
    const titleText = item.title?.[language] || 'Action Line';
    return (
        <div className="bg-white rounded-lg shadow-lg transition-transform transform hover:-translate-y-2 hover:shadow-2xl flex flex-col text-center h-full p-8 items-center justify-start">
            {item.imageUrl && (
              <EditableImage
                src={item.imageUrl}
                alt={titleText}
                basePath={`${basePath}.imageUrl`}
                className="w-56 h-56 object-cover rounded-full mb-6 shadow-xl border-4 border-green-100 -mt-28"
              />
            )}
            <Editable localizedText={item.title || {en: '', es: ''}} basePath={`${basePath}.title`}>
              <h3 className="text-xl font-bold text-brand-green-dark mb-2">{titleText}</h3>
            </Editable>
            {item.slogan && (
                <Editable localizedText={item.slogan || {en: '', es: ''}} basePath={`${basePath}.slogan`}>
                    <p className="text-brand-green-dark italic mb-2">{item.slogan?.[language]}</p>
                </Editable>
            )}
            <Editable localizedText={item.text || {en: '', es: ''}} basePath={`${basePath}.text`} multiline>
              <p className="text-brand-gray flex-grow whitespace-pre-line">{(item.text?.[language] || '').trim()}</p>
            </Editable>
        </div>
    );
}

const AlliancesSection: React.FC<{title: LocalizedText; description: LocalizedText; partners: AlliancePartner[], basePath: string}> = ({ title, description, partners, basePath }) => {
  const { language } = useI18n();

  return (
    <div className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <Editable localizedText={title} basePath={`${basePath}.title`}>
                  <h2 className="text-4xl font-extrabold text-brand-green-dark mb-4">{title?.[language]}</h2>
                </Editable>
                <Editable localizedText={description} basePath={`${basePath}.description`} multiline>
                  <p className="text-lg text-brand-gray">{description?.[language]}</p>
                </Editable>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12 items-center">
                {(partners || []).map(partner => (
                    <div key={partner.id} className="flex justify-center items-center h-28">
                        <img className="h-24 max-w-full object-contain" src={partner.logoUrl} alt={partner.name} />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ content, uiText, projects }) => {
  const { language } = useI18n();
  const latestProjects = projects.slice(0, 4);

  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsWelcomeVisible(true);
      } else {
        setIsWelcomeVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Hero 
        slides={content.heroSlides || []}
        uiText={uiText}
      />
      
      {content.welcome && (
        <div className={`relative z-10 -mt-[1px] transition-all duration-700 ease-in-out ${isWelcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transform: `translateY(-${isWelcomeVisible ? '2rem' : '0'})` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 lg:p-12">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                <div className="relative">
                  <EditableImage
                    className="rounded-lg shadow-2xl w-full object-cover"
                    src={content.welcome.imageUrl}
                    alt={content.welcome.imageAlt}
                    basePath="homePage.welcome.imageUrl"
                  />
                </div>
                
                <div className="mt-8 lg:mt-0 lg:-ml-16 relative">
                  <div className="bg-brand-green-light p-6 md:p-8 rounded-lg shadow-xl border border-gray-200">
                      <h2 className="text-3xl md:text-4xl text-brand-green-dark mb-4">
                        <Editable localizedText={content.welcome.titlePart1} basePath="homePage.welcome.titlePart1">
                          <span className="font-normal">{content.welcome.titlePart1?.[language]}</span>
                        </Editable>
                          <br />
                        <Editable localizedText={content.welcome.titlePart2} basePath="homePage.welcome.titlePart2">
                          <span className="font-extrabold">{content.welcome.titlePart2?.[language]}</span>
                        </Editable>
                      </h2>
                      <Editable localizedText={content.welcome.slogan} basePath="homePage.welcome.slogan">
                        <p className="text-lg text-brand-green-dark italic mt-2 mb-4">{content.welcome.slogan?.[language]}</p>
                      </Editable>
                      <Editable localizedText={content.welcome.text} basePath="homePage.welcome.text" multiline>
                        <p className="text-lg text-brand-gray leading-relaxed whitespace-pre-line">
                            {(content.welcome.text?.[language] || '').trim()}
                        </p>
                      </Editable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {content.actionLines && (
        <div className="bg-brand-green-light py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                  <Editable localizedText={content.actionLines.title || {en: '', es: ''}} basePath="homePage.actionLines.title">
                    <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{content.actionLines.title?.[language] || 'Thematic Areas'}</h2>
                  </Editable>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-28 sm:gap-y-32 pt-24">
                      {(content.actionLines.items || []).map((item, index) => (
                          <ActionLineCard item={item} key={item.id || `action-line-${index}`} basePath={`homePage.actionLines.items.${index}`} />
                      ))}
                  </div>
              </div>
          </div>
        </div>
      )}
      
      {latestProjects.length > 0 && content.latestProjects && (
        <LatestProjects 
          title={content.latestProjects.title}
          slogan={content.latestProjects.slogan}
          subtitle={content.latestProjects.subtitle}
          projects={latestProjects}
          uiText={uiText} 
        />
      )}
      
      {content.parallax1 && (
        <ParallaxSection 
          title={content.parallax1.title}
          text={content.parallax1.text}
          imageUrl={content.parallax1.imageUrl}
          uiText={uiText}
          basePath="homePage.parallax1"
        />
      )}

      {content.ourNumbers && (
        <OurNumbersSection content={content.ourNumbers} basePath="homePage.ourNumbers" />
      )}

      {content.alliances && (
        <AlliancesSection 
          title={content.alliances.title}
          description={content.alliances.description}
          partners={content.alliances.partners}
          basePath="homePage.alliances"
        />
      )}
      
      {content.parallax2 && (
        <ParallaxSection 
          title={content.parallax2.title}
          text={content.parallax2.text}
          imageUrl={content.parallax2.imageUrl}
          uiText={uiText}
          basePath="homePage.parallax2"
        />
      )}
    </>
  );
};

export default HomePage;