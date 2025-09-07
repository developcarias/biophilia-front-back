
import React, { useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Project, ProjectDetailPageContent } from '../types';
import { useI18n } from '../i18n';
import PageBanner from '../components/PageBanner';

interface ProjectDetailPageProps {
  projects: Project[];
  content: ProjectDetailPageContent;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projects, content }) => {
  const { projectId } = ReactRouterDOM.useParams<{ projectId: string }>();
  const { hash } = ReactRouterDOM.useLocation();
  const { language } = useI18n();
  const project = projects.find(p => p.id === projectId);
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  const activityRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (hash && project) {
      const activityId = hash.substring(1); // remove '#'
      const activityIndex = project.activities.findIndex(a => a.id === activityId);
      if (activityIndex !== -1 && activityRefs.current[activityIndex]) {
        setTimeout(() => {
          activityRefs.current[activityIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [hash, project]);


  if (!project) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Program not found</h1>
        <ReactRouterDOM.NavLink to="/projects" className="text-brand-green hover:underline mt-4 inline-block">
          Back to Programs
        </ReactRouterDOM.NavLink>
      </div>
    );
  }

  const isOddLength = project.activities.length % 2 !== 0;
  const basePath = `projects.${projectIndex}`;

  return (
    <>
      <PageBanner
        title={project.title[language]}
        imageUrl={project.detailImageUrl}
        basePath={`${basePath}.title`}
        localizedText={project.title}
        titleVerticalAlign="bottom"
      />
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {project.activities.map((activity, index) => {
              const isLastItem = index === project.activities.length - 1;

              if (isOddLength && isLastItem) {
                // WIDE CARD for the last item if total is odd
                return (
                  <div
                    key={activity.id}
                    id={activity.id}
                    ref={el => { activityRefs.current[index] = el; }}
                    className="md:col-span-2 scroll-mt-28 bg-brand-green-light/50 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
                  >
                    <div className="md:w-1/3 lg:w-2/5 flex-shrink-0">
                      <img src={activity.imageUrl} alt={activity.title[language]} className="w-full h-64 md:h-full object-cover" />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <p className="text-sm text-gray-500 mb-2">{new Date(activity.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="text-2xl font-bold text-brand-green-dark mb-4">{activity.title[language]}</h3>
                      <div className="prose max-w-none text-brand-gray whitespace-pre-line leading-relaxed">
                        {activity.description[language]}
                      </div>
                    </div>
                  </div>
                );
              }
              
              // NORMAL CARD
              return (
                <div
                  key={activity.id}
                  id={activity.id}
                  ref={el => { activityRefs.current[index] = el; }}
                  className="scroll-mt-28 bg-brand-green-light/50 rounded-lg shadow-lg overflow-hidden flex flex-col"
                >
                  <img src={activity.imageUrl} alt={activity.title[language]} className="w-full h-64 object-cover" />
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-sm text-gray-500 mb-2">{new Date(activity.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h3 className="text-xl font-bold text-brand-green-dark mb-4">{activity.title[language]}</h3>
                    <div className="prose prose-sm max-w-none text-brand-gray whitespace-pre-line leading-relaxed flex-grow">
                      {activity.description[language]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 text-center">
            <ReactRouterDOM.NavLink
              to="/projects"
              className="bg-brand-accent text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg"
            >
              {content.backToProjects[language]}
            </ReactRouterDOM.NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailPage;