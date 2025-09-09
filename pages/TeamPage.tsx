

import React from 'react';
import { TeamMember, TeamPageContent } from '../types';
import PageBanner from '../components/PageBanner';
import { useI18n } from '../i18n';
import Editable from '../components/Editable';

interface TeamPageProps {
  content: TeamPageContent;
  team: TeamMember[];
}

const TeamPage: React.FC<TeamPageProps> = ({ content, team }) => {
  const { language } = useI18n();

  return (
    <>
      <PageBanner
        title={content?.banner?.title?.[language] || 'Our Team'}
        imageUrl={content?.banner?.imageUrl || ''}
        basePath="teamPage.banner.title"
        localizedText={content?.banner?.title}
      />
      <div className="bg-white py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center -m-4 text-center">
            {team.map((member, index) => (
              <div key={member.id} className="w-full md:w-1/2 lg:w-1/3 p-4">
                <div className="bg-brand-green-light p-8 rounded-lg shadow-md h-full">
                  <img src={member.imageUrl} alt={member.imageAlt} className="w-40 h-40 rounded-full mx-auto object-cover mb-4 border-4 border-white shadow-lg" />
                  <Editable localizedText={member.name} basePath={`team.${index}.name`}>
                    <h3 className="text-xl font-bold text-brand-green-dark">{member.name[language]}</h3>
                  </Editable>
                  <Editable localizedText={member.role} basePath={`team.${index}.role`}>
                    <p className="text-brand-accent font-semibold mb-2">{member.role[language]}</p>
                  </Editable>
                  <Editable localizedText={member.bio} basePath={`team.${index}.bio`} multiline>
                    <p className="text-brand-gray text-sm">{member.bio[language]}</p>
                  </Editable>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamPage;