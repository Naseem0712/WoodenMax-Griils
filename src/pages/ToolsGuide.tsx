import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Hammer, Wrench, Ruler, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ToolsGuide() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Tools & Materials Guide for Aluminium Grills | WoodenMax</title>
        <meta name="description" content="A comprehensive guide to the tools and materials used in manufacturing and installing premium aluminium window and balcony safety grills." />
        <link rel="canonical" href="https://grills.woodenmax.in/tools-guide" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Tools & Materials Guide for Aluminium Grills",
            "description": "A comprehensive guide to the tools and materials used in manufacturing and installing premium aluminium window and balcony safety grills.",
            "author": {
              "@type": "Organization",
              "name": "WoodenMax"
            }
          })}
        </script>
      </Helmet>

      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
          Tools & Materials Guide
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Discover the precision tools and high-grade materials we use to craft and install your custom aluminium safety grills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Manufacturing Tools */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
            <Hammer className="w-6 h-6 text-zinc-700" />
            Manufacturing Tools
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Precision Mitre Saw</h3>
              <p className="text-zinc-600 text-sm">
                Used for cutting aluminium profiles at exact angles (usually 45° or 90°). Ensures seamless joints for the outer frame and inner pipes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">CNC Drilling Machine</h3>
              <p className="text-zinc-600 text-sm">
                Automated drilling ensures perfectly aligned holes for inserting inner profiles (round, rectangle, or square) into the outer frame, maintaining consistent gaps.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Pneumatic Punching Press</h3>
              <p className="text-zinc-600 text-sm">
                Used for creating slots and holes rapidly and cleanly without deforming the aluminium profiles. Essential for high-volume, high-quality production.
              </p>
            </div>
          </div>
        </div>

        {/* Installation Tools */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
            <Wrench className="w-6 h-6 text-zinc-700" />
            Installation Tools
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Rotary Hammer Drill</h3>
              <p className="text-zinc-600 text-sm">
                Heavy-duty drill used to make precise holes in concrete or brick walls for anchoring the grill securely.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Laser Level</h3>
              <p className="text-zinc-600 text-sm">
                Ensures the grill is installed perfectly plumb and level. Crucial for aesthetics and structural integrity, especially for large balcony grills.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Impact Driver & Fasteners</h3>
              <p className="text-zinc-600 text-sm">
                Used to drive high-tensile anchor bolts (like Hilti or Fischer) into the wall, securing the heavy aluminium frame permanently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Materials */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-zinc-700" />
          Premium Materials
        </h2>
        <div className="bg-zinc-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-emerald-400">6063-T6 Aluminium Alloy</h3>
              <p className="text-zinc-400 text-sm">
                The architectural standard. Offers excellent corrosion resistance, structural strength, and a smooth surface finish perfect for powder coating.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-emerald-400">Jotun Powder Coating</h3>
              <p className="text-zinc-400 text-sm">
                We use premium Jotun or AkzoNobel powders. Baked at 200°C, it provides a tough, scratch-resistant finish in plain, textured, or wooden grain effects.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-emerald-400">SS 304 Fasteners</h3>
              <p className="text-zinc-400 text-sm">
                All screws, bolts, and anchors used in assembly and installation are made of Stainless Steel 304 to ensure zero rusting over the grill's lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
          Calculate Your Grill Cost <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
