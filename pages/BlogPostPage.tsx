import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost, BlogPageContent, UIText } from '../types';
import PageBanner from '../components/PageBanner';
import { useI18n } from '../i18n';
import FacebookIcon from '../components/icons/FacebookIcon';
import XIcon from '../components/icons/XIcon';
import LinkedInIcon from '../components/icons/LinkedInIcon';

interface BlogPostPageProps {
  posts: BlogPost[];
  content: BlogPageContent;
  uiText: UIText;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ posts, content, uiText }) => {
  const { slug } = ReactRouterDOM.useParams<{ slug: string }>();
  const { language } = useI18n();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
        <div className="text-center py-20">
            <h1 className="text-3xl font-bold">Post not found</h1>
            <ReactRouterDOM.NavLink to="/blog" className="text-brand-green hover:underline mt-4 inline-block">Back to Blog</ReactRouterDOM.NavLink>
        </div>
    );
  }

  const postUrl = window.location.href;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title[language]);
  
  const recentPosts = posts.filter(p => p.slug !== slug).slice(0, 3);


  return (
    <>
      <PageBanner
        title={post.title[language]}
        imageUrl={post.imageUrl}
      />
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-gray-500">By {post.author}</p>
            <p className="text-gray-500">{new Date(post.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
          </div>
          <div className="prose lg:prose-xl max-w-none text-brand-gray leading-relaxed whitespace-pre-line">
            {post.content[language]}
          </div>

          {/* Social Share */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-center text-xl font-bold text-brand-gray mb-4">{content?.sharePostTitle?.[language] || 'Share this Post'}</h3>
            <div className="flex justify-center space-x-4">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-brand-gray hover:text-brand-accent transition-colors">
                    <FacebookIcon className="h-8 w-8" />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="text-brand-gray hover:text-brand-accent transition-colors">
                    <XIcon className="h-8 w-8" />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="text-brand-gray hover:text-brand-accent transition-colors">
                    <LinkedInIcon className="h-8 w-8" />
                </a>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <ReactRouterDOM.NavLink to="/blog" className="font-bold text-brand-green hover:text-brand-accent">
                &larr; Back to Blog
            </ReactRouterDOM.NavLink>
          </div>
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
            <div className="max-w-7xl mx-auto mt-20 pt-12 border-t">
                <h2 className="text-3xl font-bold text-brand-green-dark text-center mb-8">{content?.recentPostsTitle?.[language] || 'Recent Posts'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((recentPost) => (
                        <ReactRouterDOM.NavLink to={`/blog/${recentPost.slug}`} key={recentPost.id} className="group bg-brand-green-light rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="h-56 overflow-hidden">
                                <img src={recentPost.imageUrl} alt={recentPost.imageAlt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-brand-green-dark mb-2 flex-grow">{recentPost.title[language]}</h3>
                                <p className="font-bold text-brand-green group-hover:text-brand-accent mt-4 self-start">
                                    {uiText.readMore[language]} &rarr;
                                </p>
                            </div>
                        </ReactRouterDOM.NavLink>
                    ))}
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default BlogPostPage;