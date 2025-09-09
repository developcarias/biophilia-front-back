

import React, { useState } from 'react';
import { ContactPageContent, GlobalContent } from '../types';
import PageBanner from '../components/PageBanner';
import { useI18n } from '../i18n';
import Editable from '../components/Editable';

interface ContactPageProps {
  content: ContactPageContent;
  globalContent: GlobalContent;
  apiUrl: string;
}

const ContactPage: React.FC<ContactPageProps> = ({ content, globalContent, apiUrl }) => {
  const { language } = useI18n();
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!response.ok) throw new Error('Failed to send message.');
      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  
  if (!content) return null;

  return (
    <>
      <PageBanner
        title={content.banner?.title?.[language] || 'Contact'}
        imageUrl={content.banner?.imageUrl || ''}
        basePath="contactPage.banner.title"
        localizedText={content.banner?.title}
      />
      
      <div id="contact-form" className="bg-white py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Editable localizedText={content.intro || {en:'',es:''}} basePath="contactPage.intro" multiline>
              <p className="text-center text-xl text-brand-gray mb-12">{content.intro?.[language]}</p>
            </Editable>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-brand-green-light p-8 rounded-lg shadow-lg">
              <div>
                <h3 className="text-2xl font-bold text-brand-green-dark mb-4">{content.banner?.title?.[language] || 'Contact'}</h3>
                <p className="mb-2"><strong>{content.addressTitle?.[language] || 'Address'}:</strong> {globalContent.footer.contact.address}</p>
                <p className="mb-4"><strong>{content.emailTitle?.[language] || 'Email'}:</strong> <a href={`mailto:${globalContent.footer.contact.email}`} className="text-brand-green hover:underline">{globalContent.footer.contact.email}</a></p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-green-dark mb-4">{content.form?.title?.[language] || 'Send us a Message'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="name">{content.form?.nameLabel?.[language] || 'Your Name'}</label>
                        <input type="text" id="name" required value={formState.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="email">{content.form?.emailLabel?.[language] || 'Your Email'}</label>
                        <input type="email" id="email" required value={formState.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-brand-gray mb-1" htmlFor="message">{content.form?.messageLabel?.[language] || 'Message'}</label>
                        <textarea id="message" rows={5} required value={formState.message} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-green focus:border-brand-green bg-white text-brand-gray"></textarea>
                    </div>
                    <button type="submit" disabled={status === 'sending'} className="w-full bg-brand-accent text-white font-bold text-lg py-3 rounded-lg hover:bg-brand-accent/90 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400">
                        {status === 'sending' ? 'Sending...' : content.form?.buttonText?.[language] || 'Send Message'}
                    </button>
                    {status === 'success' && <p className="text-brand-green mt-4">Message sent successfully!</p>}
                    {status === 'error' && <p className="text-red-500 mt-4">Failed to send message. Please try again later.</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;