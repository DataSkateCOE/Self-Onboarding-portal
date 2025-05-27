import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Self Partner Onboarding Portal for streamlining the registration and integration process for business partners.';
document.head.appendChild(metaDescription);

// Add title
const title = document.createElement('title');
title.textContent = 'Self Partner Onboarding Portal';
document.head.appendChild(title);

// Add Open Graph tags
const ogTitle = document.createElement('meta');
ogTitle.setAttribute('property', 'og:title');
ogTitle.content = 'Self Partner Onboarding Portal';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute('property', 'og:description');
ogDescription.content = 'Streamline your business integration process with our Self Partner Onboarding Portal.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute('property', 'og:type');
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
