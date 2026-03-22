import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

export default function Comparisons() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Aluminium vs Iron Grills & Profiles Comparison | WoodenMax</title>
        <meta name="description" content="Compare Aluminium vs Iron grills, Round vs Rectangle profiles, and Vertical vs Horizontal patterns. Get pricing and choose the best safety grills for your home or project." />
        <link rel="canonical" href="https://grills.woodenmax.in/comparisons" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Aluminium vs Iron Grills & Profiles Comparison",
            "description": "Compare Aluminium vs Iron grills, Round vs Rectangle profiles, and Vertical vs Horizontal patterns. Get pricing and choose the best safety grills for your home or project.",
            "author": {
              "@type": "Organization",
              "name": "WoodenMax"
            }
          })}
        </script>
      </Helmet>

      <div className="mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
          Grill Comparisons & Pricing
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
          Make an informed decision for your window and balcony safety grills. Compare materials, profiles, and patterns.
        </p>
      </div>

      {/* Material Comparison */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <span className="bg-zinc-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Iron vs Aluminium Grills
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="p-4 font-semibold text-zinc-900">Feature</th>
                  <th className="p-4 font-semibold text-zinc-900 border-l border-zinc-200">Aluminium Grills</th>
                  <th className="p-4 font-semibold text-zinc-900 border-l border-zinc-200">Iron Grills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="p-4 font-medium text-zinc-900">Rust & Corrosion</td>
                  <td className="p-4 text-emerald-600 border-l border-zinc-200 flex items-center gap-2"><Check className="w-4 h-4"/> 100% Rust-proof</td>
                  <td className="p-4 text-red-600 border-l border-zinc-200 flex items-center gap-2"><X className="w-4 h-4"/> Prone to rusting</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-900">Weight</td>
                  <td className="p-4 text-zinc-600 border-l border-zinc-200">Lightweight, easy to install</td>
                  <td className="p-4 text-zinc-600 border-l border-zinc-200">Heavy, requires strong support</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-900">Maintenance</td>
                  <td className="p-4 text-emerald-600 border-l border-zinc-200 flex items-center gap-2"><Check className="w-4 h-4"/> Zero maintenance</td>
                  <td className="p-4 text-red-600 border-l border-zinc-200 flex items-center gap-2"><X className="w-4 h-4"/> Regular painting required</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-900">Pricing (Approx)</td>
                  <td className="p-4 text-zinc-900 font-semibold border-l border-zinc-200">₹350 - ₹450 / sq.ft</td>
                  <td className="p-4 text-zinc-900 font-semibold border-l border-zinc-200">₹200 - ₹300 / sq.ft</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-zinc-900">Aesthetics</td>
                  <td className="p-4 text-zinc-600 border-l border-zinc-200">Modern, sleek, powder-coated finishes</td>
                  <td className="p-4 text-zinc-600 border-l border-zinc-200">Traditional, bulky appearance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Profile Comparison */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <span className="bg-zinc-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Inner Profiles: Round vs Rectangle vs Square
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-zinc-900 rounded-full"></div>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Round Profile</h3>
            <p className="text-zinc-600 text-sm mb-4">Classic look, easy to clean, and provides a softer aesthetic. Often used in traditional balcony grills.</p>
            <div className="mb-4">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Pros</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Excellent visibility</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> No sharp edges (child safe)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Easy to clean</li>
              </ul>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Cons</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500 shrink-0"/> Less rigid than rectangle for large spans</li>
              </ul>
            </div>
            <div className="text-sm font-semibold text-zinc-900 bg-zinc-50 p-3 rounded-lg">
              Popular Sizes: 12mm, 15mm, 18mm
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-6 h-4 border-2 border-zinc-900"></div>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Rectangle Profile</h3>
            <p className="text-zinc-600 text-sm mb-4">Modern, sleek, and offers high structural rigidity. Perfect for contemporary window grills.</p>
            <div className="mb-4">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Pros</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> High strength-to-weight ratio</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Premium architectural look</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Excellent for large spans</li>
              </ul>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Cons</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500 shrink-0"/> Sharp edges</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500 shrink-0"/> Can restrict view if placed flat</li>
              </ul>
            </div>
            <div className="text-sm font-semibold text-zinc-900 bg-zinc-50 p-3 rounded-lg">
              Popular Sizes: 12x25, 20x40, 25x50
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-5 h-5 border-2 border-zinc-900"></div>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Square Profile</h3>
            <p className="text-zinc-600 text-sm mb-4">Balanced design, robust, and versatile. Suitable for both safety grills and decorative panels.</p>
            <div className="mb-4">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Pros</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Uniform strength in all directions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Clean geometric lines</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> Easy to fabricate and join</li>
              </ul>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-bold text-zinc-900 mb-2">Cons</h4>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-500 shrink-0"/> Heavier than round for same width</li>
              </ul>
            </div>
            <div className="text-sm font-semibold text-zinc-900 bg-zinc-50 p-3 rounded-lg">
              Popular Sizes: 12x12, 16x16, 25x25
            </div>
          </div>
        </div>
      </section>

      {/* Pattern Comparison */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <span className="bg-zinc-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Pattern: Vertical vs Horizontal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">Vertical Pattern</h3>
            <p className="text-zinc-600 mb-6">
              Vertical grills are the traditional standard for safety. They make it difficult to climb, offering superior security for ground-floor windows and low balconies.
            </p>
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span><strong>Anti-Climb:</strong> Harder for intruders or children to scale.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span><strong>Dust Accumulation:</strong> Less surface area for dust to settle, easier to clean.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span><strong>Illusion of Height:</strong> Makes windows appear taller.</span>
              </li>
            </ul>
          </div>

          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">Horizontal Pattern</h3>
            <p className="text-zinc-600 mb-6">
              Horizontal grills offer a highly modern, streamlined aesthetic. They are increasingly popular in contemporary architecture and high-rise apartments.
            </p>
            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span><strong>Modern Aesthetic:</strong> Aligns with contemporary architectural lines.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span><strong>Wider View:</strong> Can sometimes offer a less obstructed panoramic view.</span>
              </li>
              <li className="flex items-start gap-2">
                <X className="w-5 h-5 text-amber-500 shrink-0" />
                <span><strong>Climbability:</strong> Acts like a ladder; not recommended for ground floors without tight spacing.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="text-center bg-zinc-900 text-white p-12 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">Ready to design your grill?</h2>
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          Use our advanced calculator to design, visualize, and get instant pricing for your custom aluminium grills.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-zinc-100 transition-colors">
          Open Calculator <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
