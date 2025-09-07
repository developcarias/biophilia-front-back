

import React from 'react';
import { Project, LocalizedText, UIText } from '../types';
import { useI18n } from '../i18n';
import * as ReactRouterDOM from 'react-router-dom';
import Editable from './Editable';

interface LatestProjectsProps {
  title: LocalizedText;
  slogan: LocalizedText;
  subtitle: LocalizedText;
  projects: Project[];
  uiText: UIText;
}

const LatestProjects: React.FC<LatestProjectsProps> = ({ title, slogan, subtitle, projects, uiText }) => {
  const { language } = useI18n();

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Editable localizedText={title} basePath="homePage.latestProjects.title">
            <h2 className="text-4xl font-extrabold text-brand-green-dark">{title[language]}</h2>
          </Editable>
          <Editable localizedText={slogan} basePath="homePage.latestProjects.slogan">
            <p className="mt-4 text-lg text-brand-green-dark italic">{slogan[language]}</p>
          </Editable>
          <Editable localizedText={subtitle} basePath="homePage.latestProjects.subtitle" multiline>
            <p className="mt-2 text-lg text-brand-gray whitespace-pre-line">{subtitle[language].trim()}</p>
          </Editable>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-8 pt-8">
          {projects.map((project) => (
            <div key={project.id} className="group bg-brand-green-light rounded-lg shadow-lg flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="px-6 -mt-8">
                <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="block rounded-lg shadow-xl group-hover:shadow-2xl overflow-hidden">
                  <img src={project.imageUrl} alt={project.imageAlt} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                </ReactRouterDOM.NavLink>
              </div>
              <div className="p-6 pt-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-brand-green-dark mb-2 h-14 overflow-hidden">
                   <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="hover:text-brand-accent transition-colors">
                    {project.title[language]}
                   </ReactRouterDOM.NavLink>
                </h3>
                <p className="text-brand-gray leading-relaxed text-sm flex-grow h-24 overflow-hidden">{project.description[language]}</p>
                <div className="mt-4">
                  <ReactRouterDOM.NavLink to={`/projects/${project.id}`} className="font-bold text-brand-green hover:text-brand-accent transition-colors">
                    {uiText.viewActions[language]} &rarr;
                  </ReactRouterDOM.NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>
        { projects.length > 0 && (
            <div className="text-center mt-12">
                <ReactRouterDOM.NavLink to="/projects" className="bg-brand-accent text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg">
                    {uiText.viewAllProjects[language]}
                </ReactRouterDOM.NavLink>
            </div>
        )}
      </div>
    </div>
  );
};

export default LatestProjects;