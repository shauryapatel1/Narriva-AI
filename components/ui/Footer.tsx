import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background-dark-secondary py-12 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Logo size="sm" />
            <p className="text-text-tertiary text-sm mt-4">
              AI-powered interactive storytelling platform that creates personalized narratives.
            </p>
          </div>
          <div>
            <h4 className="text-text-primary font-bold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/stories" className="text-text-tertiary hover:text-text-primary text-sm">Discover</Link></li>
              <li><Link href="/#how-it-works" className="text-text-tertiary hover:text-text-primary text-sm">How It Works</Link></li>
              <li><Link href="/#pricing" className="text-text-tertiary hover:text-text-primary text-sm">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-text-primary font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/terms" className="text-text-tertiary hover:text-text-primary text-sm">Terms</Link></li>
              <li><Link href="/legal/privacy" className="text-text-tertiary hover:text-text-primary text-sm">Privacy</Link></li>
              <li><Link href="/legal/cookies" className="text-text-tertiary hover:text-text-primary text-sm">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-text-primary font-bold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-text-tertiary hover:text-text-primary text-sm">Contact</Link></li>
              <li><a href="https://twitter.com/narrivaapp" target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-text-primary text-sm">Twitter</a></li>
              <li><a href="https://discord.gg/narriva" target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-text-primary text-sm">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-tertiary text-sm">© 2024 Narriva. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/#accessibility" className="text-text-tertiary hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link href="/#audio-settings" className="text-text-tertiary hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </Link>
            <Link href="/account" className="text-text-tertiary hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 