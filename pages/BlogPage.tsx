

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost, BlogPageContent, UIText } from '../types';
import PageBanner from '../components/PageBanner';
import { useI18n, useTranslate } from '../i18n';

interface BlogPageProps {
  content: BlogPageContent;
  posts: BlogPost[];
  uiText: UIText;
}

const BlogPage: React.FC<BlogPageProps> = ({ content, posts, uiText }) => {
  const { language } = useI18n();
  const t = useTranslate();

  if (!posts || posts.length === 0) {
    return (
      <>
        <PageBanner
          title={content.banner.title[language]}
          imageUrl={content.banner.imageUrl}
        />
        <div className="bg-white py-16 text-center">
            <p>{t('noBlogPosts')}</p>
        </div>
      </>
    );
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <>
      <PageBanner
        title={content.banner.title[language]}
        imageUrl={content.banner.imageUrl}
      />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Featured Post */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-brand-green-dark mb-4 border-b pb-2">{content.featuredPostTitle[language]}</h2>
                <ReactRouterDOM.NavLink to={`/blog/${featuredPost.slug}`} className="group block rounded-lg shadow-xl overflow-hidden relative text-white">
                    <img src={featuredPost.imageUrl} alt={featuredPost.imageAlt} className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <p className="text-sm text-gray-300 mb-1">{featuredPost.author} &bull; {new Date(featuredPost.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <h3 className="text-4xl font-extrabold mb-2">{featuredPost.title[language]}</h3>
                        <p className="text-gray-200 leading-relaxed max-w-2xl">{featuredPost.summary[language]}</p>
                    </div>
                </ReactRouterDOM.NavLink>
            </div>

            {/* Other Posts Grid */}
            {otherPosts.length > 0 && (
                <div className="flex flex-wrap justify-center -m-4">
                    {otherPosts.map((post) => (
                        <div key={post.id} className="w-full md:w-1/2 lg:w-1/3 p-4">
                            <ReactRouterDOM.NavLink to={`/blog/${post.slug}`} className="group bg-brand-green-light rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl h-full">
                                <div className="h-56 overflow-hidden">
                                    <img src={post.imageUrl} alt={post.imageAlt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <p className="text-sm text-gray-500 mb-1">{post.author} &bull; {new Date(post.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <h3 className="text-xl font-bold text-brand-green-dark mb-2 flex-grow">{post.title[language]}</h3>
                                    <p className="font-bold text-brand-green group-hover:text-brand-accent mt-4 self-start">
                                        {uiText.readMore[language]} &rarr;
                                    </p>
                                </div>
                            </ReactRouterDOM.NavLink>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;