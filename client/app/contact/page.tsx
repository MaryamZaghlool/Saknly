import React from "react";
import { Metadata } from "next";
import ContactSection from "./ContactSection";

export const metadata: Metadata = {
  title: "Contact Us - Saknly",
  description: "Get in touch with Saknly for any inquiries or support.",
};

export default function ContactUsPage() {
  return <ContactSection />;
}
