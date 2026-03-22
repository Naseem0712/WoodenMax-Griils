import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function GrillTypes() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Types of Grills: Aluminium Window, Balcony & Safety Grills | WoodenMax</title>
        <meta name="description" content="Explore our range of premium aluminium window grills, safety grills, balcony grills, and iron grills. Find the perfect design for your home's security and aesthetics." />
        <link rel="canonical" href="https://grills.woodenmax.in/grill-types" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Types of Grills: Aluminium Window, Balcony & Safety Grills",
            "description": "Explore our range of premium aluminium window grills, safety grills, balcony grills, and iron grills. Find the perfect design for your home's security and aesthetics.",
            "author": {
              "@type": "Organization",
              "name": "WoodenMax"
            }
          })}
        </script>
      </Helmet>

      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
          Types of Safety Grills
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Discover the perfect grill for every application. From modern aluminium window grills to heavy-duty balcony safety enclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {/* Aluminium Window Grills */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="h-48 bg-zinc-100 relative">
            {/* Placeholder for realistic image */}
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
              [Aluminium Window Grill Image]
            </div>
          </div>
          <div className="p-8 flex-grow">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Aluminium Window Grills</h2>
            <p className="text-zinc-600 mb-6">
              The modern standard for residential security. Aluminium window grills offer a sleek, rust-free alternative to traditional iron. Available in various profiles (round, rectangle, square) and finishes (plain, texture, wooden grain).
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 font-medium">
              <li>• 100% Rust-proof</li>
              <li>• Lightweight yet strong</li>
              <li>• Customizable designs</li>
            </ul>
          </div>
        </div>

        {/* Balcony Grills */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="h-48 bg-zinc-100 relative">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
              [Balcony Safety Grill Image]
            </div>
          </div>
          <div className="p-8 flex-grow">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Balcony Safety Grills</h2>
            <p className="text-zinc-600 mb-6">
              Essential for high-rise apartments and homes with children or pets. Balcony grills provide full-height or half-height protection without compromising ventilation or views.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 font-medium">
              <li>• Child & pet safety</li>
              <li>• Unobstructed airflow</li>
              <li>• Seamless integration with facade</li>
            </ul>
          </div>
        </div>

        {/* Safety Grills */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="h-48 bg-zinc-100 relative">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
              [Heavy Duty Safety Grill Image]
            </div>
          </div>
          <div className="p-8 flex-grow">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Heavy-Duty Safety Grills</h2>
            <p className="text-zinc-600 mb-6">
              Designed for ground-floor windows, commercial spaces, and areas requiring maximum security. These grills use thicker profiles (e.g., 2.0mm or 2.2mm) and reinforced joints.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 font-medium">
              <li>• Maximum intrusion resistance</li>
              <li>• Thick gauge aluminium or iron</li>
              <li>• Anti-cut designs</li>
            </ul>
          </div>
        </div>

        {/* Iron Grills */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
          <div className="h-48 bg-zinc-100 relative">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
              [Traditional Iron Grill Image]
            </div>
          </div>
          <div className="p-8 flex-grow">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Traditional Iron Grills</h2>
            <p className="text-zinc-600 mb-6">
              For those who prefer the classic, heavy feel of iron. While they require more maintenance to prevent rust, iron grills offer unmatched raw strength and traditional ornamental designs.
            </p>
            <ul className="space-y-2 text-sm text-zinc-700 font-medium">
              <li>• High raw strength</li>
              <li>• Ornamental & classic designs</li>
              <li>• Cost-effective initial investment</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 text-white rounded-3xl p-12 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
        <h2 className="text-3xl font-bold mb-4">Get a Custom Quote Today</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          Whether you need aluminium window grills, balcony safety enclosures, or heavy-duty iron grills, our calculator helps you design and price your project instantly.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors">
          Start Designing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
