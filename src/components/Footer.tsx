"use client";

import { Leaf, Mail, Phone } from "lucide-react";

// LinkedIn icon as inline SVG since lucide-react doesn't have it
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Marketplace", href: "/marketplace" },
      { name: "Artists", href: "/artists" },
      { name: "Impact", href: "/impact" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      // { name: "Careers", href: "/careers" },
      // { name: "Press", href: "/press" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Email Us", href: "mailto:hello.renewcanvas.africa@gmail.com", external: true },
      // { name: "Help Center", href: "/help" },
      // { name: "Shipping", href: "/shipping" },
      // { name: "Returns", href: "/returns" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/brand/renewcanvas-icon-full-color.png"
                alt="RenewCanvas Africa logo"
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">
                <span className="text-white">Renew</span>
                <span className="text-teal-400">Canvas</span>{" "}
                <span style={{ color: "#F7941D" }}>Africa</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Turning waste into art, and art into impact.
            </p>
            <p className="text-sm text-gray-400 mb-4">Kigali, Rwanda</p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <a
                href="mailto:hello.renewcanvas.africa@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>hello.renewcanvas.africa@gmail.com</span>
              </a>
              <a
                href="tel:+250798654776"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+250 798 654 776</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/renewcanvas-africa/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4 text-white" />
              </a>
              <a
                href="mailto:hello.renewcanvas.africa@gmail.com"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center items-center">
          <p className="text-sm text-gray-400 flex items-center gap-2 flex-wrap justify-center">
            <span>
              &copy; {currentYear} RenewCanvas{" "}
              <span className="text-amber-500">Africa</span>. All rights
              reserved.
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-teal-500" />
              Built for a sustainable future
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
