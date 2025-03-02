import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaInstagram, FaDiscord, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background-dark-secondary border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-accent-red to-accent-amber bg-clip-text text-transparent">
                Narriva
              </span>
            </Link>
            <p className="text-text-tertiary mb-6 max-w-xs">
              AI-powered interactive storytelling platform where your choices shape unique narratives.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent-amber transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent-amber transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent-amber transition-colors"
                aria-label="Discord"
              >
                <FaDiscord size={20} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-text-tertiary hover:text-accent-amber transition-colors"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="text-text-primary font-medium mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-text-tertiary hover:text-text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-text-primary font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-text-tertiary hover:text-text-primary transition-colors">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-text-primary font-medium mb-4">Stay Updated</h3>
            <p className="text-text-tertiary mb-4">
              Subscribe to our newsletter for the latest stories and updates.
            </p>
            <form className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 bg-ui-dark border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-amber focus:border-transparent text-text-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-accent-red to-accent-amber text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-tertiary text-sm mb-4 md:mb-0">
            &copy; {currentYear} Narriva. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/faq" className="text-text-tertiary hover:text-text-primary transition-colors text-sm">
              FAQ
            </Link>
            <Link href="/support" className="text-text-tertiary hover:text-text-primary transition-colors text-sm">
              Support
            </Link>
            <Link href="/sitemap" className="text-text-tertiary hover:text-text-primary transition-colors text-sm">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 