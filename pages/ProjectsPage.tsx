

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Project, ProjectsPageContent, UIText } from '../types';
import PageBanner from '../components/PageBanner';
import { useI18n } from '../i18n';
import Editable from '../components/Editable';

interface ProjectsPageProps {
  content: ProjectsPageContent;
  projects: Project[];
  uiText: UIText;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ content, projects, uiText }) => {
  const { language } = useI18n();
  const isOddLength = projects.length % 2 !== 0;

  return (
    <>
      <PageBanner
        title={content.banner.title[language]}
        imageUrl={content.banner.imageUrl}
        basePath="projectsPage.banner.title"
        localizedText={content.banner.title}
      />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Editable localizedText={content.intro} basePath="projectsPage.intro" multiline>
              <p className="text-xl text-brand-gray">{content.intro[language]}</p>
            </Editable>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 pt-8">
            {projects.map((project, index) => {
              const projectBasePath = `projects.${index}`;
              const isLastItem = index === projects.length - 1;

              if (isOddLength && isLastItem) {
                // Render the wide card for the last item if the total is odd
                return (
                  <div
                    key={project.id}
                    className="md:col-span-2 group bg-brand-green-light rounded-lg shadow-lg flex flex-col md:flex-row transition-transform transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                  >
                    <div className="md:w-1/3 lg:w-2/5">
                      <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="block h-full">
                        <img src={project.imageUrl} alt={project.imageAlt} className="w-full h-64 md:h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </ReactRouterDOM.NavLink>
                    </div>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-center md:w-2/3 lg:w-3/5">
                      <Editable localizedText={project.title} basePath={`${projectBasePath}.title`}>
                        <ReactRouterDOM.NavLink to={`/projects/${project.id}`}>
                            <h3 className="text-2xl font-bold text-brand-green-dark mb-2 hover:text-brand-accent transition-colors">{project.title[language]}</h3>
                        </ReactRouterDOM.NavLink>
                      </Editable>
                      <Editable localizedText={project.description} basePath={`${projectBasePath}.description`} multiline>
                        <p className="text-brand-gray leading-relaxed flex-grow mb-4">{project.description[language]}</p>
                      </Editable>
                      <div className="mt-auto">
                          <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="font-bold text-brand-green hover:text-brand-accent transition-colors">
                            {uiText.viewActions[language]} &rarr;
                          </ReactRouterDOM.NavLink>
                      </div>
                    </div>
                  </div>
                );
              }

              // Render the normal card
              return (
                <div 
                  key={project.id} 
                  className="group bg-brand-green-light rounded-lg shadow-lg flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="px-6 -mt-8">
                    <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="block rounded-lg shadow-xl group-hover:shadow-2xl overflow-hidden">
                      <img src={project.imageUrl} alt={project.imageAlt} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                    </ReactRouterDOM.NavLink>
                  </div>
                  <div className="p-6 pt-4 flex-grow flex flex-col">
                    <Editable localizedText={project.title} basePath={`${projectBasePath}.title`}>
                       <ReactRouterDOM.NavLink to={`/projects/${project.id}`}>
                          <h3 className="text-2xl font-bold text-brand-green-dark mb-2 hover:text-brand-accent transition-colors">{project.title[language]}</h3>
                       </ReactRouterDOM.NavLink>
                    </Editable>
                    <Editable localizedText={project.description} basePath={`${projectBasePath}.description`} multiline>
                      <p className="text-brand-gray leading-relaxed flex-grow">{project.description[language]}</p>
                    </Editable>
                     <div className="mt-4">
                        <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="font-bold text-brand-green hover:text-brand-accent transition-colors">
                          {uiText.viewActions[language]} &rarr;
                        </ReactRouterDOM.NavLink>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;