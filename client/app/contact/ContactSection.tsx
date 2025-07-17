"use client";
import React from "react";
import ContactForm from "./ContactForm";
import { Mail } from "lucide-react";

const ContactSection = () => {
  return (
    <div className="contact-section">
      <div className="contact-icon">
        <Mail size={45} className="text-primary-600" />
      </div>
      <h1 className="contact-title">تواصل معنا</h1>
      <p className="contact-subtitle">
        هل لديك سؤال أو ملاحظة؟ نود أن نسمع منك.
      </p>
      <ContactForm />
      <style jsx>{`
        .contact-section {
          // background: var(--bg-secondary);
          border-radius: 1.5rem;
          // box-shadow: 0 2px 16px 0 rgba(14,165,233,0.07);
          padding: 2.5rem 1.5rem 1.5rem 1.5rem;
          max-width: 600px;
          margin: 2.5rem auto 0 auto;
          text-align: center;
          animation: fadeIn 0.7s;
          margin-bottom:55px;
        }
        .contact-icon {
          margin-bottom: 0.5rem;
          animation: bounceIn 0.7s;
        }
        .contact-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--primary-800);
          letter-spacing: 0.03em;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 8px rgba(14,165,233,0.08);
        }
        .contact-subtitle {
          font-size: 1.15rem;
          color: var(--primary-600);
          margin-bottom: 1.5rem;
          max-width: 90%;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes bounceIn {
          0% { transform: scale(0.7);}
          60% { transform: scale(1.1);}
          100% { transform: scale(1);}
        }
      `}</style>
    </div>
  );
};

export default ContactSection; 