import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Style from './static.module.css'
import images from '../assets'

const ContactFormspree = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        submitted: true,
        success: false,
        message: 'Please fill in all required fields.'
      });
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        submitted: true,
        success: false,
        message: 'Please enter a valid email address.'
      });
      setLoading(false);
      return;
    }

    try {
      // Send to Formspree - replace 'your-formspree-id' with your actual form ID
      const response = await fetch('https://formspree.io/f/your-formspree-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Contact Form Submission',
          message: formData.message,
          _subject: `New contact form submission from ${formData.name}`
        }),
      });

      if (response.ok) {
        setStatus({
          submitted: true,
          success: true,
          message: 'Thank you! Your message has been sent successfully to chatxcontactus@gmail.com.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus({
        submitted: true,
        success: false,
        message: 'Oops! Something went wrong. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.container}>
      <div className={Style.header}>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out with any questions or feedback.</p>
      </div>
      
      <div className={Style.content}>
        <div className={Style.contactForm}>
          <h2>Send us a message</h2>
          
          {status.submitted && (
            <div className={`${Style.statusMessage} ${status.success ? Style.success : Style.error}`}>
              {status.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={Style.formGroup}>
              <label>Name <span className={Style.required}>*</span></label>
              <input 
                type="text" 
                name="name" 
                placeholder="Your name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={Style.formGroup}>
              <label>Email <span className={Style.required}>*</span></label>
              <input 
                type="email" 
                name="email" 
                placeholder="Your email address" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={Style.formGroup}>
              <label>Subject</label>
              <input 
                type="text" 
                name="subject" 
                placeholder="What is this regarding?" 
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            
            <div className={Style.formGroup}>
              <label>Message <span className={Style.required}>*</span></label>
              <textarea 
                name="message" 
                placeholder="Your message..." 
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className={Style.submitBtn}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        
        <div className={Style.contactInfo}>
          <h2>Other ways to connect</h2>
          
          <div className={Style.infoItem}>
            <div className={Style.infoIcon}>
              <Image src={images.accountName} alt="Email" width={30} height={30} />
            </div>
            <div>
              <h3>Email</h3>
              <p>chatxcontactus@gmail.com</p>
            </div>
          </div>
          
          <div className={Style.infoItem}>
            <div className={Style.infoIcon}>
              <Image src={images.accountName} alt="Location" width={30} height={30} />
            </div>
            <div>
              <h3>Location</h3>
              <p>123 Blockchain Street, Crypto Valley, Web3 City</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={Style.footer}>
        <Link href="/">
          <button className={Style.backBtn}>Back to Chat</button>
        </Link>
      </div>
    </div>
  )
}

export default ContactFormspree 