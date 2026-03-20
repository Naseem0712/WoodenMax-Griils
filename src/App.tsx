/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calculator, LayoutGrid, Ruler, IndianRupee, Settings2, Info, Box, Layers, Hammer, Wrench, ShoppingCart, FileText, Plus, Check } from 'lucide-react';
import QuotationModal, { QuotationItem } from './components/QuotationModal';

// --- Constants & Options ---
const OUTER_PROFILES = ['12x12', '12x38', '12x50', '16x16', '19x19', '20x40', '25x25', '25x38', '25x50'];
const INNER_RECT_PROFILES = ['12x12', '12x25', '12x38', '12x50', '16x16', '18x18', '19x19', '20x40', '25x25', '25x38', '25x50'];
const INNER_ROUND_PROFILES = ['12', '15', '18'];
const INNER_OVAL_PROFILES = ['15x38'];
const THICKNESSES = [1.2, 1.5, 1.6, 2.0, 2.2];
const ROD_SIZES = [0, 8, 10]; // 0 means None
const STANDARD_LENGTHS = [12, 16]; // in feet

const UNIT_MULTIPLIERS: Record<string, number> = {
  'in': 1,
  'mm': 1 / 25.4,
  'cm': 1 / 2.54,
  'ft': 12,
  'm': 39.3700787,
};

// --- Helper Math Functions ---
const parseProfile = (profileStr: string) => {
  const parts = profileStr.split('x').map(Number);
  const w = parts[0];
  const h = parts[1] || parts[0];
  return { 
    face: Math.min(w, h), 
    depth: Math.max(w, h),
    w, h 
  };
};

const ACTUAL_WEIGHTS_12FT: Record<string, number> = {
  // Rectangular / Square
  '12x12_1.2': 0.550,
  '12x12_1.5': 0.688,
  '12x12_2': 0.917,
  '19x19_1.2': 0.950,
  '19x19_1.5': 1.188,
  '19x19_2': 1.583,
  '20x40_1.2': 1.450,
  '20x40_1.5': 1.813,
  '20x40_2': 2.417,
  '25x25_1.2': 1.250,
  '25x25_1.5': 1.563,
  '25x25_2': 2.083,
  '25x38_1.2': 1.050,
  '25x38_1.5': 1.313,
  '25x38_2': 2.300,
  '25x50_1.2': 1.900,
  '25x50_1.5': 2.375,
  '25x50_2': 3.167,
  
  // Round
  '12_1.2': 0.435,
  '12_1.5': 0.544,
  '12_1.6': 0.580,
  '12_2': 0.725,
  '12_2.2': 0.960,
  '18_1.2': 0.630,
  '18_1.5': 0.788,
  '18_2': 1.050,
};

const getAluWeightPerMeter = (shape: string, w: number, h: number, t: number) => {
  let key = '';
  if (shape === 'rect' || shape === 'outer') {
    key = `${w}x${h}_${t}`;
  } else if (shape === 'round') {
    key = `${w}_${t}`;
  }

  const weight12ft = ACTUAL_WEIGHTS_12FT[key];
  if (weight12ft) {
    return weight12ft / 3.6576; // Convert 12ft weight to per meter
  }

  let area = 0;
  if (shape === 'rect' || shape === 'outer') {
    area = (w * h) - ((w - 2 * t) * (h - 2 * t));
  } else if (shape === 'round') {
    area = (Math.PI / 4) * (w * w - Math.pow(w - 2 * t, 2));
  } else if (shape === 'oval') {
    const minor = Math.min(w, h);
    const major = Math.max(w, h);
    const outerArea = (major - minor) * minor + (Math.PI / 4) * minor * minor;
    const innerMinor = Math.max(0, minor - 2 * t);
    const innerMajor = Math.max(0, major - 2 * t);
    const innerArea = (innerMajor - innerMinor) * innerMinor + (Math.PI / 4) * innerMinor * innerMinor;
    area = outerArea - innerArea;
  }
  return Math.max(0, area * 0.0027); // Density of Alu ~ 2.7 g/cm3 -> 0.0027 kg/m per mm2
};

const getIronWeightPerMeter = (d: number) => {
  if (!d) return 0;
  const area = (Math.PI / 4) * d * d;
  return area * 0.00785; // Density of Iron ~ 7.85 g/cm3 -> 0.00785 kg/m per mm2
};

// 1D Bin Packing (First Fit Decreasing)
const calculateBins = (lengths: number[], binSize: number) => {
  const sortedLengths = [...lengths].sort((a, b) => b - a);
  const bins: number[] = [];
  for (const len of sortedLengths) {
    if (len > binSize) {
      // If a single piece is longer than the standard length, it requires a custom joint or longer profile.
      // We will count it as requiring ceil(len / binSize) bins just for estimation, 
      // though practically it's an issue.
      bins.push(binSize - (len % binSize));
      continue;
    }
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      if (bins[i] >= len) {
        bins[i] -= len;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push(binSize - len);
    }
  }
  return bins.length;
};

const TypewriterLabel = ({ text, suffix = null, delay = 0, className = "" }: { text: string, suffix?: React.ReactNode, delay?: number, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <span className={className}>
      {displayedText}
      {suffix}
      {isTyping && <span className="animate-pulse ml-[2px] inline-block w-[2px] h-[1em] bg-emerald-500 align-middle"></span>}
    </span>
  );
};

export default function App() {
  // --- State ---
  // Units
  const [unit, setUnit] = useState<'in'|'mm'|'cm'|'ft'|'m'>('in');

  // Dimensions (in selected unit)
  const [grillName, setGrillName] = useState<string>('');
  const [coatingColor, setCoatingColor] = useState<string>('');
  const [coatingFinish, setCoatingFinish] = useState<'plain' | 'texture' | 'wooden'>('plain');
  const [width, setWidth] = useState<number>(48);
  const [height, setHeight] = useState<number>(48);
  
  // Outer Frame
  const [outerProfile, setOuterProfile] = useState<string>('25x25');
  const [outerThickness, setOuterThickness] = useState<number>(1.5);

  // Inner Pipes
  const [innerShape, setInnerShape] = useState<'rect' | 'round' | 'oval'>('rect');
  const [innerProfile, setInnerProfile] = useState<string>('12x12');
  const [innerThickness, setInnerThickness] = useState<number>(1.2);

  // Threaded Rods
  const [rodSize, setRodSize] = useState<number>(8);

  // Pattern Settings
  const [pattern, setPattern] = useState<'vertical' | 'horizontal'>('vertical');
  const [hasDividers, setHasDividers] = useState<boolean>(false);
  const [dividerCount, setDividerCount] = useState<number>(1);
  const [dividerLayout, setDividerLayout] = useState<'equal' | 'center'>('equal');
  const [dividerCenterGap, setDividerCenterGap] = useState<number>(2);
  const [gapType, setGapType] = useState<'uniform' | 'alternating2' | 'alternating3'>('alternating2');
  const [gap1, setGap1] = useState<number>(2);
  const [gap2, setGap2] = useState<number>(3);
  const [gap3, setGap3] = useState<number>(4);

  // Pricing (Removed old manual pricing states)
  
  // Quotation
  const [qty, setQty] = useState<number>(1);
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle shape change to reset profile
  const handleShapeChange = (shape: 'rect' | 'round' | 'oval') => {
    setInnerShape(shape);
    if (shape === 'rect') setInnerProfile(INNER_RECT_PROFILES[0]);
    if (shape === 'round') setInnerProfile(INNER_ROUND_PROFILES[0]);
    if (shape === 'oval') setInnerProfile(INNER_OVAL_PROFILES[0]);
  };

  // Select input text on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleAddToQuotation = () => {
    let svgContent = '';
    if (svgRef.current) {
      svgContent = svgRef.current.outerHTML;
    }

    const seriesNumber = `G${(quotationItems.length + 1).toString().padStart(2, '0')}`;
    const designKey = `${outerProfile}-${innerProfile}-${pattern}-${gapType}-${gap1}-${gap2}-${gap3}-${hasDividers}-${dividerCount}-${rodSize}-${coatingColor}-${coatingFinish}`;
    
    let gapText = `${gap1}${unit}`;
    if (gapType === 'alternating2') gapText = `${gap1}${unit}, ${gap2}${unit}`;
    if (gapType === 'alternating3') gapText = `${gap1}${unit}, ${gap2}${unit}, ${gap3}${unit}`;

    const ironPerSqft = results.totalAreaSqFt > 0 ? (results.totalIronWeight / results.totalAreaSqFt).toFixed(2) : '0.00';

    const descParts = [
      `Outer: ${outerProfile}mm (${outerThickness}mm wall)`,
      `Inner: ${innerProfile}mm ${innerShape} (${innerThickness}mm wall)`,
      `Pattern: ${pattern.charAt(0).toUpperCase() + pattern.slice(1)}`,
      `Gaps: ${gapText} (${gapType})`,
    ];
    if (hasDividers) {
      descParts.push(`Supports: ${dividerCount} (${dividerLayout})`);
    }
    if (rodSize > 0) {
      descParts.push(`Iron Rods: ${rodSize}mm (${ironPerSqft} kg/sqft)`);
    }
    if (coatingColor) {
      descParts.push(`Color: ${coatingColor} (${coatingFinish})`);
    } else {
      descParts.push(`Finish: ${coatingFinish}`);
    }

    const description = descParts.join('\n');

    const newItem: QuotationItem = {
      id: editingItemId || Math.random().toString(36).substr(2, 9),
      seriesNumber: editingItemId ? quotationItems.find(i => i.id === editingItemId)?.seriesNumber || seriesNumber : seriesNumber,
      grillName: grillName.trim() || 'Custom Grill',
      designKey,
      width,
      height,
      unit,
      qty,
      areaSqft: results.totalAreaSqFt,
      totalWeightAlu: results.totalAluWeight,
      totalWeightIron: results.totalIronWeight,
      rodQty: results.rodQty,
      amount: results.finalSellingPrice,
      perSqftRate: results.perSqftRate,
      wastageCost: results.wastageCost,
      installationCost: results.installationCost,
      description,
      svgContent,
      config: {
        width, height, unit, qty, grillName, coatingColor, coatingFinish,
        outerProfile, outerThickness, innerProfile, innerThickness, innerShape,
        pattern, gapType, gap1, gap2, gap3,
        hasDividers, dividerCount, dividerLayout, rodSize,
        discountType, discountValue
      }
    };

    if (editingItemId) {
      setQuotationItems(prev => prev.map(item => item.id === editingItemId ? newItem : item));
      setEditingItemId(null);
    } else {
      setQuotationItems(prev => [...prev, newItem]);
    }

    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 2000);
  };

  const handleEditItem = (id: string) => {
    const item = quotationItems.find(i => i.id === id);
    if (!item || !item.config) return;
    const c = item.config;
    setWidth(c.width); setHeight(c.height); setUnit(c.unit); setQty(c.qty);
    setGrillName(c.grillName); setCoatingColor(c.coatingColor || ''); setCoatingFinish(c.coatingFinish || 'plain');
    setOuterProfile(c.outerProfile); setOuterThickness(c.outerThickness);
    setInnerProfile(c.innerProfile); setInnerThickness(c.innerThickness); setInnerShape(c.innerShape);
    setPattern(c.pattern); setGapType(c.gapType); setGap1(c.gap1); setGap2(c.gap2); setGap3(c.gap3);
    setHasDividers(c.hasDividers); setDividerCount(c.dividerCount); setDividerLayout(c.dividerLayout);
    setRodSize(c.rodSize);
    setDiscountType(c.discountType || 'percentage');
    setDiscountValue(c.discountValue || 0);
    setEditingItemId(id);
  };

  const handleImportItems = (items: QuotationItem[]) => {
    setQuotationItems(items);
  };

  const handleRemoveItem = (id: string) => {
    setQuotationItems(quotationItems.filter(item => item.id !== id));
  };

  const results = useMemo(() => {
    const MM_TO_IN = 1 / 25.4;
    const mult = UNIT_MULTIPLIERS[unit];

    // Convert inputs to inches for internal math
    const wInches = width * mult;
    const hInches = height * mult;
    const g1Inches = gap1 * mult || 0.1; // prevent 0
    const g2Inches = gap2 * mult || 0.1;
    const g3Inches = gap3 * mult || 0.1;

    // Parse Profiles
    const outerP = parseProfile(outerProfile);
    const innerP = parseProfile(innerProfile);

    // Face widths in inches (for drawing and gap calculation)
    const outerFaceInches = outerP.face * MM_TO_IN;
    const innerFaceInches = innerP.face * MM_TO_IN;

    // 1. Outer Frame Calculations
    let outerLengthInches = (wInches * 2) + (hInches * 2);

    // 2. Inner Pipes & Dividers Calculations & Auto-Gap Adjustment
    const pipeDirSpaceInches = (pattern === 'vertical' ? wInches : hInches) - (2 * outerFaceInches);
    const supportDirSpaceInches = (pattern === 'vertical' ? hInches : wInches) - (2 * outerFaceInches);

    let sectionSpacesInches: number[] = [];
    let actualDividerCount = 0;

    if (!hasDividers || dividerCount <= 0) {
      sectionSpacesInches = [supportDirSpaceInches];
    } else {
      actualDividerCount = dividerCount;
      if (dividerLayout === 'equal') {
        const space = (supportDirSpaceInches - (actualDividerCount * outerFaceInches)) / (actualDividerCount + 1);
        sectionSpacesInches = Array(actualDividerCount + 1).fill(Math.max(0, space));
      } else if (dividerLayout === 'center') {
        const centerGapInches = dividerCenterGap * mult;
        const totalCenterGaps = (actualDividerCount - 1) * centerGapInches;
        const sideSpace = (supportDirSpaceInches - (actualDividerCount * outerFaceInches) - totalCenterGaps) / 2;
        sectionSpacesInches.push(Math.max(0, sideSpace));
        for (let i = 0; i < actualDividerCount - 1; i++) {
          sectionSpacesInches.push(Math.max(0, centerGapInches));
        }
        sectionSpacesInches.push(Math.max(0, sideSpace));
      }
    }

    // Add dividers to outer length
    outerLengthInches += actualDividerCount * pipeDirSpaceInches;

    const outerLengthMeters = outerLengthInches * 0.0254;
    const outerWeightPerM = getAluWeightPerMeter('outer', outerP.w, outerP.h, outerThickness);
    const outerWeightTotal = outerLengthMeters * outerWeightPerM;

    let pipeCount = 0;
    const pipes: { x: number, y: number, w: number, h: number, isRound: boolean }[] = [];
    const dividers: { x: number, y: number, w: number, h: number }[] = [];
    let exactGaps: number[] = [];

    // Calculate number of pipes based on nominal gaps across the full width/height
    if (gapType === 'uniform') {
      const gAvg = g1Inches;
      pipeCount = Math.max(0, Math.round((pipeDirSpaceInches - gAvg) / (innerFaceInches + gAvg)));
      const totalGapSpace = pipeDirSpaceInches - (pipeCount * innerFaceInches);
      const exactGap = pipeCount >= 0 ? totalGapSpace / (pipeCount + 1) : pipeDirSpaceInches;
      exactGaps = Array(pipeCount + 1).fill(exactGap);
    } else if (gapType === 'alternating2') {
      const gAvg = (g1Inches + g2Inches) / 2;
      pipeCount = Math.max(0, Math.round((pipeDirSpaceInches - gAvg) / (innerFaceInches + gAvg)));
      const totalGapSpace = pipeDirSpaceInches - (pipeCount * innerFaceInches);
      
      let sumNominal = 0;
      for (let i = 0; i <= pipeCount; i++) {
        sumNominal += (i % 2 === 0) ? g1Inches : g2Inches;
      }
      const scale = sumNominal > 0 ? totalGapSpace / sumNominal : 0;
      
      for (let i = 0; i <= pipeCount; i++) {
        exactGaps.push(((i % 2 === 0) ? g1Inches : g2Inches) * scale);
      }
    } else if (gapType === 'alternating3') {
      const gAvg = (g1Inches + g2Inches + g3Inches) / 3;
      pipeCount = Math.max(0, Math.round((pipeDirSpaceInches - gAvg) / (innerFaceInches + gAvg)));
      const totalGapSpace = pipeDirSpaceInches - (pipeCount * innerFaceInches);
      
      let sumNominal = 0;
      for (let i = 0; i <= pipeCount; i++) {
        sumNominal += (i % 3 === 0) ? g1Inches : (i % 3 === 1) ? g2Inches : g3Inches;
      }
      const scale = sumNominal > 0 ? totalGapSpace / sumNominal : 0;
      
      for (let i = 0; i <= pipeCount; i++) {
        exactGaps.push(((i % 3 === 0) ? g1Inches : (i % 3 === 1) ? g2Inches : g3Inches) * scale);
      }
    }

    let currentSupportPos = outerFaceInches;

    for (let s = 0; s < sectionSpacesInches.length; s++) {
      const segmentLength = sectionSpacesInches[s];
      let currentPipePos = outerFaceInches + exactGaps[0];

      for (let i = 0; i < pipeCount; i++) {
        if (pattern === 'vertical') {
          pipes.push({ 
            x: currentPipePos, 
            y: currentSupportPos, 
            w: innerFaceInches, 
            h: segmentLength,
            isRound: innerShape === 'round'
          });
        } else {
          pipes.push({ 
            x: currentSupportPos, 
            y: currentPipePos, 
            w: segmentLength, 
            h: innerFaceInches,
            isRound: innerShape === 'round'
          });
        }
        currentPipePos += innerFaceInches + exactGaps[i + 1];
      }

      currentSupportPos += segmentLength;

      // Add divider after this section (if not the last section)
      if (s < sectionSpacesInches.length - 1) {
        if (pattern === 'vertical') {
          // Divider is horizontal
          dividers.push({
            x: outerFaceInches,
            y: currentSupportPos,
            w: pipeDirSpaceInches,
            h: outerFaceInches
          });
        } else {
          // Divider is vertical
          dividers.push({
            x: currentSupportPos,
            y: outerFaceInches,
            w: outerFaceInches,
            h: pipeDirSpaceInches
          });
        }
        currentSupportPos += outerFaceInches;
      }
    }

    const totalPipeCount = pipeCount * sectionSpacesInches.length;
    const innerLengthInches = sectionSpacesInches.reduce((a, b) => a + b, 0) * pipeCount;
    const innerLengthMeters = innerLengthInches * 0.0254;
    const innerWeightPerM = getAluWeightPerMeter(innerShape, innerP.w, innerP.h, innerThickness);
    const innerWeightTotal = innerLengthMeters * innerWeightPerM;

    // 3. Threaded Rods Calculations
    // Rods go through the entire width/height including outer frames
    const singleRodLengthInches = pattern === 'vertical' ? hInches : wInches;
    const rodLengthInches = pipeCount * singleRodLengthInches;
    const rodLengthMeters = rodLengthInches * 0.0254;
    const rodWeightPerM = getIronWeightPerMeter(rodSize);
    const rodWeightTotal = rodLengthMeters * rodWeightPerM;

    // Nuts
    const nutsCount = rodSize > 0 ? pipeCount * 2 : 0;

    // 4. Material Quantities (Bin Packing)
    const outerPieces = [wInches, wInches, hInches, hInches];
    for (let i = 0; i < actualDividerCount; i++) {
      outerPieces.push(pipeDirSpaceInches);
    }
    
    const innerPieces: number[] = [];
    for (let s = 0; s < sectionSpacesInches.length; s++) {
      for (let i = 0; i < pipeCount; i++) {
        innerPieces.push(sectionSpacesInches[s]);
      }
    }

    const totalAreaSqFt = (wInches * hInches) / 144;
    const totalAreaSqMt = totalAreaSqFt * 0.092903;

    // --- NEW BOTTOM-UP COSTING ENGINE ---
    
    // 1. Aluminium Costing (Find best standard length: 12ft or 16ft)
    const allOuterLengths = Array(qty).fill(outerPieces).flat();
    const allInnerLengths = Array(qty).fill(innerPieces).flat();

    const calcAluCostForStdLength = (stdLenInches: number) => {
      const outerBins = calculateBins(allOuterLengths, stdLenInches);
      const innerBins = calculateBins(allInnerLengths, stdLenInches);
      
      const totalOuterPurchasedMeters = outerBins * (stdLenInches * 0.0254);
      const totalInnerPurchasedMeters = innerBins * (stdLenInches * 0.0254);
      
      const totalOuterPurchasedWeight = totalOuterPurchasedMeters * outerWeightPerM;
      const totalInnerPurchasedWeight = totalInnerPurchasedMeters * innerWeightPerM;
      const totalPurchasedWeight = totalOuterPurchasedWeight + totalInnerPurchasedWeight;
      
      const usedWeight = (outerWeightTotal + innerWeightTotal) * qty;
      const wastageWeight = Math.max(0, totalPurchasedWeight - usedWeight);
      
      const usedCost = usedWeight * 550;
      const wastageCost = wastageWeight * 380;
      
      return {
        stdLenInches,
        outerBins,
        innerBins,
        purchasedWeight: totalPurchasedWeight,
        usedWeight,
        wastageWeight,
        usedCost,
        wastageCost,
        totalAluCost: usedCost
      };
    };

    const cost12ft = calcAluCostForStdLength(144);
    const cost16ft = calcAluCostForStdLength(192);
    const bestAluCost = cost12ft.totalAluCost <= cost16ft.totalAluCost ? cost12ft : cost16ft;

    // 2. Powder Coating Cost
    const maxPipeSize = Math.max(outerP.w, outerP.h, innerP.w, innerP.h);
    let baseCoatingRate = maxPipeSize >= 20 ? 50 : 35;
    let finishExtra = 0;
    if (coatingFinish === 'texture') finishExtra = 15;
    if (coatingFinish === 'wooden') finishExtra = 30;
    const coatingRatePerSqft = baseCoatingRate + finishExtra;
    const totalCoatingCost = totalAreaSqFt * qty * coatingRatePerSqft;

    // 3. Labor Cost
    const makingCost = 50 * totalAreaSqFt * qty;
    const installationCost = 30 * totalAreaSqFt * qty;

    // 4. Hardware Cost (Rods & Nuts)
    let totalRodCost = 0;
    let totalNutsCost = 0;
    let rodQty = 0;
    
    if (rodSize > 0) {
      const reqRodLenMeters = singleRodLengthInches * 0.0254;
      let purchasedLenPerRod = 0;
      if (reqRodLenMeters <= 1) purchasedLenPerRod = 1;
      else if (reqRodLenMeters <= 1.5) purchasedLenPerRod = 1.5;
      else if (reqRodLenMeters <= 2) purchasedLenPerRod = 2;
      else if (reqRodLenMeters <= 3) purchasedLenPerRod = 3;
      else purchasedLenPerRod = Math.ceil(reqRodLenMeters / 3) * 3;

      const ratePerMeter6mm = 65 / 2; // 32.5 rs/m
      const ratePerMeterCurrent = ratePerMeter6mm * ((rodSize * rodSize) / 36);
      
      const costPerRod = purchasedLenPerRod * ratePerMeterCurrent;
      rodQty = pipeCount;
      totalRodCost = rodQty * qty * costPerRod;
      totalNutsCost = nutsCount * qty * 3;
    }

    // 5. Total Cost & Profit
    const totalManufacturingCost = bestAluCost.totalAluCost + totalCoatingCost + makingCost + totalRodCost + totalNutsCost;
    const profit = totalManufacturingCost * 0.30;
    const baseSellingPrice = totalManufacturingCost + profit;
    
    // Discount Calculation
    const discountAmountTotal = discountType === 'percentage' 
      ? (baseSellingPrice * (discountValue || 0) / 100) 
      : (discountValue || 0) * qty;
      
    const finalSellingPrice = baseSellingPrice - discountAmountTotal;
    
    // Per Sqft Rate
    const perSqftRate = finalSellingPrice / (totalAreaSqFt * qty);

    const totalAluWeight = outerWeightTotal + innerWeightTotal;
    const totalIronWeight = rodWeightTotal;
    const totalWeight = totalAluWeight + totalIronWeight;

    return {
      wInches,
      hInches,
      pipeLines: pipeCount,
      pipeSegments: totalPipeCount,
      totalAreaSqFt,
      totalAreaSqMt,
      outerWeightTotal,
      innerWeightTotal,
      totalAluWeight,
      rodWeightTotal,
      totalWeight,
      finalSellingPrice,
      baseSellingPrice,
      discountAmount: discountAmountTotal,
      wastageCost: bestAluCost.wastageCost,
      installationCost,
      perSqftRate,
      pipes,
      dividers,
      outerFaceInches,
      outerQty: bestAluCost.outerBins,
      innerQty: bestAluCost.innerBins,
      stdLenInches: bestAluCost.stdLenInches,
      rodQty,
      nutsCount,
      exactGaps
    };
  }, [width, height, unit, outerProfile, outerThickness, innerShape, innerProfile, innerThickness, rodSize, pattern, gapType, gap1, gap2, gap3, hasDividers, dividerCount, dividerLayout, dividerCenterGap, qty, coatingFinish, discountType, discountValue]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200 pb-20">
      {/* Header */}
      <header className="bg-zinc-900 text-white py-6 px-4 sm:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ALLUKRAFT</h1>
            <p className="text-zinc-400 text-sm mt-1 uppercase tracking-widest">Crafting premium outdoor living</p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <button 
              onClick={() => setIsQuotationModalOpen(true)}
              className="flex items-center space-x-2 text-zinc-900 bg-white px-4 py-2 rounded-full font-medium hover:bg-zinc-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">View Quotation ({quotationItems.length})</span>
            </button>
            <div className="flex items-center space-x-2 text-zinc-400 bg-zinc-800 px-4 py-2 rounded-full">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Grill Calculator Pro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dimensions & Details Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Ruler className="w-5 h-5 text-zinc-500" />
                  <h2 className="text-lg font-semibold">Grill Details & Dimensions</h2>
                </div>
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-md text-xs font-medium outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="mm">Millimeters (mm)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                  <option value="ft">Feet (ft)</option>
                  <option value="m">Meters (m)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Grill Name / Location</label>
                  <input type="text" placeholder="e.g. Balcony Grill" value={grillName} onChange={(e) => setGrillName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                </div>
                <div className="col-span-12 sm:col-span-3">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Coating Color</label>
                  <input type="text" placeholder="e.g. Matte Black" value={coatingColor} onChange={(e) => setCoatingColor(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                </div>
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Coating Finish</label>
                  <div className="flex rounded-lg p-1 bg-zinc-100">
                    <button onClick={() => setCoatingFinish('plain')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${coatingFinish === 'plain' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Plain
                    </button>
                    <button onClick={() => setCoatingFinish('texture')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${coatingFinish === 'texture' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Texture
                    </button>
                    <button onClick={() => setCoatingFinish('wooden')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${coatingFinish === 'wooden' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Wooden
                    </button>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Quantity</label>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} onFocus={handleFocus}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                </div>
                <div className="col-span-12 sm:col-span-6">
                  <label className="block text-sm font-medium text-zinc-600 mb-1">Discount</label>
                  <div className="flex gap-2">
                    <div className="flex rounded-lg p-1 bg-zinc-100 flex-1">
                      <button onClick={() => setDiscountType('percentage')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${discountType === 'percentage' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                        %
                      </button>
                      <button onClick={() => setDiscountType('fixed')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${discountType === 'fixed' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                        ₹/Unit
                      </button>
                    </div>
                    <input type="number" min="0" value={discountValue || ''} onChange={(e) => setDiscountValue(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))} onFocus={handleFocus}
                      className="w-full flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1"><TypewriterLabel text="Width" suffix={` (${unit})`} /></label>
                  <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} onFocus={handleFocus}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1"><TypewriterLabel text="Height" suffix={` (${unit})`} /></label>
                  <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} onFocus={handleFocus}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all" />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleAddToQuotation}
                  className={`flex-1 py-3 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm ${
                    showAddedFeedback 
                      ? 'bg-emerald-500 hover:bg-emerald-600 scale-[1.02]' 
                      : 'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  {showAddedFeedback ? (
                    <>
                      <Check className="w-5 h-5" />
                      {editingItemId ? 'Updated Successfully!' : 'Added to Quotation!'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <TypewriterLabel text={editingItemId ? 'Update Quotation Item' : 'Add to Quotation'} suffix={` (₹${results.finalSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })})`} />
                    </>
                  )}
                </button>
                {editingItemId && (
                  <button 
                    onClick={() => setEditingItemId(null)}
                    className="px-4 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Materials Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Box className="w-5 h-5 text-zinc-500" />
                  <h2 className="text-lg font-semibold"><TypewriterLabel text="Materials & Profiles" /></h2>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Outer Frame */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <h3 className="text-sm font-semibold mb-3 text-zinc-700">Outer Frame</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Profile (mm)</label>
                      <select value={outerProfile} onChange={(e) => setOuterProfile(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
                        {OUTER_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Wall Thick (mm)</label>
                      <select value={outerThickness} onChange={(e) => setOuterThickness(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
                        {THICKNESSES.map(t => <option key={t} value={t}>{t} mm</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inner Pipes */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <h3 className="text-sm font-semibold mb-3 text-zinc-700">Inner Pipes</h3>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Shape</label>
                    <div className="flex rounded-lg p-1 bg-zinc-200/50">
                      {(['rect', 'round', 'oval'] as const).map(shape => (
                        <button key={shape} onClick={() => handleShapeChange(shape)}
                          className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${innerShape === shape ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Profile (mm)</label>
                      <select value={innerProfile} onChange={(e) => setInnerProfile(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
                        {innerShape === 'rect' && INNER_RECT_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                        {innerShape === 'round' && INNER_ROUND_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                        {innerShape === 'oval' && INNER_OVAL_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Wall Thick (mm)</label>
                      <select value={innerThickness} onChange={(e) => setInnerThickness(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
                        {THICKNESSES.map(t => <option key={t} value={t}>{t} mm</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Divider / Support Settings */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasDividers"
                        checked={hasDividers}
                        onChange={(e) => setHasDividers(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
                      />
                      <label htmlFor="hasDividers" className="text-sm font-semibold text-zinc-700">
                        <TypewriterLabel text="Use Outer Profile as Inner Support" />
                      </label>
                    </div>
                  </div>
                  
                  {hasDividers && (
                    <div className="pl-6 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Layout</label>
                          <select 
                            value={dividerLayout} 
                            onChange={(e) => setDividerLayout(e.target.value as 'equal' | 'center')}
                            className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                          >
                            <option value="equal">Equally Spaced</option>
                            <option value="center">Center Grouped</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Count</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={dividerCount}
                            onChange={(e) => setDividerCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                            onFocus={handleFocus}
                          />
                        </div>
                      </div>
                      
                      {dividerLayout === 'center' && dividerCount > 1 && (
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Gap Between Supports ({unit})</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={dividerCenterGap}
                            onChange={(e) => setDividerCenterGap(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-md text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                            onFocus={handleFocus}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Threaded Rods */}
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <h3 className="text-sm font-semibold mb-3 text-zinc-700 flex items-center gap-2">
                    <Hammer className="w-4 h-4" /> <TypewriterLabel text="Threaded / Iron Rods" />
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Rod Size (mm)</label>
                    <select value={rodSize} onChange={(e) => setRodSize(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none">
                      {ROD_SIZES.map(r => <option key={r} value={r}>{r === 0 ? 'None' : `${r} mm`}</option>)}
                    </select>
                    <p className="text-[10px] text-zinc-400 mt-1">Inserted into all inner pipes for strength.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern & Gaps Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center space-x-2 mb-4">
                <LayoutGrid className="w-5 h-5 text-zinc-500" />
                <h2 className="text-lg font-semibold"><TypewriterLabel text="Pattern & Gaps" /></h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-2">Direction</label>
                  <div className="flex rounded-lg p-1 bg-zinc-100">
                    <button onClick={() => setPattern('vertical')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${pattern === 'vertical' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Vertical
                    </button>
                    <button onClick={() => setPattern('horizontal')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${pattern === 'horizontal' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Horizontal
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-600">Gap Style</label>
                    <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Auto-adjusted to fit perfectly</span>
                  </div>
                  <div className="flex rounded-lg p-1 bg-zinc-100 mb-3">
                    <button onClick={() => setGapType('uniform')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${gapType === 'uniform' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Uniform
                    </button>
                    <button onClick={() => setGapType('alternating2')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${gapType === 'alternating2' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Alt (2)
                    </button>
                    <button onClick={() => setGapType('alternating3')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${gapType === 'alternating3' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                      Alt (3)
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">
                        {gapType === 'uniform' ? 'Gap Size' : 'Gap 1'}
                      </label>
                      <div className="relative">
                        <input type="number" step="0.1" value={gap1} onChange={(e) => setGap1(Number(e.target.value) || 0)} onFocus={handleFocus}
                          className="w-full pl-3 pr-7 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-sm" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">{unit}</span>
                      </div>
                    </div>
                    {gapType !== 'uniform' && (
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">Gap 2</label>
                        <div className="relative">
                          <input type="number" step="0.1" value={gap2} onChange={(e) => setGap2(Number(e.target.value) || 0)} onFocus={handleFocus}
                            className="w-full pl-3 pr-7 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-sm" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">{unit}</span>
                        </div>
                      </div>
                    )}
                    {gapType === 'alternating3' && (
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">Gap 3</label>
                        <div className="relative">
                          <input type="number" step="0.1" value={gap3} onChange={(e) => setGap3(Number(e.target.value) || 0)} onFocus={handleFocus}
                            className="w-full pl-3 pr-7 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-sm" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">{unit}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Preview & Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Results Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Area</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-xl font-semibold">{(results.totalAreaSqFt * qty).toFixed(2)}</p>
                    <span className="text-xs font-normal text-zinc-400">sq ft</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <p className="text-sm font-medium text-zinc-300">{(results.totalAreaSqMt * qty).toFixed(2)}</p>
                    <span className="text-[10px] font-normal text-zinc-500">sq mt</span>
                  </div>
                </div>
                {qty > 1 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Per Grill</p>
                    <p className="text-xs text-zinc-400">{results.totalAreaSqFt.toFixed(2)} sq ft</p>
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Weight</p>
                <p className="text-xl font-semibold text-zinc-900">{(results.totalWeight * qty).toFixed(2)} <span className="text-xs font-normal text-zinc-400">kg</span></p>
                {qty > 1 && (
                  <div className="mt-2 pt-2 border-t border-zinc-100">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Per Grill</p>
                    <p className="text-xs text-zinc-400">{results.totalWeight.toFixed(2)} kg</p>
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Inner Pipes</p>
                <p className="text-xl font-semibold text-zinc-900">{results.pipeLines} <span className="text-xs font-normal text-zinc-400">lines</span></p>
                {hasDividers && results.dividers.length > 0 && (
                  <p className="text-[10px] text-zinc-500 mt-1">{results.pipeSegments} segments, {results.dividers.length} supports</p>
                )}
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between">
                <div>
                  <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-1">Est. Price / Unit</p>
                  <p className="text-xl font-semibold text-emerald-700">₹{(results.finalSellingPrice / qty).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  {results.discountAmount > 0 && (
                    <p className="text-[10px] text-emerald-600 mt-1 line-through">
                      ₹{(results.baseSellingPrice / qty).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-sm font-semibold mb-4 text-zinc-800 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-zinc-500" /> Material Required (Qty)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Outer Frame</p>
                  <p className="text-lg font-semibold text-zinc-900">{results.outerQty} <span className="text-xs font-normal text-zinc-500">x {results.stdLenInches / 12}'</span></p>
                </div>
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Inner Pipes</p>
                  <p className="text-lg font-semibold text-zinc-900">{results.innerQty} <span className="text-xs font-normal text-zinc-500">x {results.stdLenInches / 12}'</span></p>
                </div>
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Threaded Rods</p>
                  <p className="text-lg font-semibold text-zinc-900">{results.rodQty} <span className="text-xs font-normal text-zinc-500">x 1m-3m</span></p>
                </div>
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Hardware Nuts</p>
                  <p className="text-lg font-semibold text-zinc-900">{results.nutsCount} <span className="text-xs font-normal text-zinc-500">pcs</span></p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-3 text-center">Quantities calculated using 1D Bin Packing to minimize wastage based on {results.stdLenInches / 12}ft standard lengths.</p>
            </div>

            {/* Weight Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-sm font-semibold mb-4 text-zinc-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-500" /> Weight Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600">Outer Frame ({outerProfile} @ {outerThickness}mm)</span>
                  <span className="font-medium">{results.outerWeightTotal.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600">Inner Pipes ({innerProfile} @ {innerThickness}mm)</span>
                  <span className="font-medium">{results.innerWeightTotal.toFixed(2)} kg</span>
                </div>
                {rodSize > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600">Threaded Rods ({rodSize}mm)</span>
                    <span className="font-medium">{results.rodWeightTotal.toFixed(2)} kg</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-800">Total Aluminium</span>
                  <span className="font-semibold text-zinc-800">{results.totalAluWeight.toFixed(2)} kg</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200">
              <h3 className="text-sm font-semibold mb-4 text-zinc-800 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-zinc-500" /> Pricing Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600">Base Price (Material + Making + Profit)</span>
                  <span className="font-medium">₹{results.baseSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                {results.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600">
                    <span>Discount</span>
                    <span className="font-medium">- ₹{results.discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-800">Final Grill Price</span>
                  <span className="font-semibold text-zinc-800">₹{results.finalSellingPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-zinc-100 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Additional Costs (Not included in Grill Price)</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600">Wastage Cost</span>
                    <span className="font-medium text-orange-600">₹{results.wastageCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600">Installation Cost</span>
                    <span className="font-medium text-blue-600">₹{results.installationCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 flex flex-col h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-zinc-500" />
                  Live Preview
                </h2>
                <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                  <Info className="w-3 h-3" />
                  <span>Scale to fit</span>
                </div>
              </div>
              
              <div className="flex-1 bg-zinc-100/50 rounded-xl overflow-hidden flex items-center justify-center p-8 border border-zinc-200 relative">
                <svg 
                  ref={svgRef}
                  viewBox={`0 0 ${results.wInches} ${results.hInches}`} 
                  className="w-full h-full drop-shadow-md"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <path 
                    d={`M0,0 H${results.wInches} V${results.hInches} H0 Z M${results.outerFaceInches},${results.outerFaceInches} V${results.hInches - results.outerFaceInches} H${results.wInches - results.outerFaceInches} V${results.outerFaceInches} Z`}
                    fill="#27272a"
                    fillRule="evenodd"
                  />
                  
                  {/* Dividers */}
                  {hasDividers && results.dividers.map((div, i) => (
                    <rect 
                      key={`div-${i}`} 
                      x={div.x} 
                      y={div.y} 
                      width={div.w} 
                      height={div.h} 
                      fill="#3f3f46" 
                      stroke="#27272a"
                      strokeWidth={Math.max(results.wInches, results.hInches) * 0.001}
                    />
                  ))}

                  {/* Inner Pipes */}
                  {results.pipes.map((pipe, i) => (
                    <rect 
                      key={i} 
                      x={pipe.x} 
                      y={pipe.y} 
                      width={pipe.w} 
                      height={pipe.h} 
                      fill="#a1a1aa" 
                      stroke="#52525b"
                      strokeWidth={Math.max(results.wInches, results.hInches) * 0.001}
                      rx={pipe.isRound || innerShape === 'oval' ? Math.min(pipe.w, pipe.h) / 2 : Math.max(results.wInches, results.hInches) * 0.002}
                    />
                  ))}
                  
                  {/* Draw Rods inside if enabled */}
                  {rodSize > 0 && results.pipes.map((pipe, i) => {
                    // Draw a thin dark line inside to represent the rod
                    const isVert = pattern === 'vertical';
                    const cx = pipe.x + pipe.w / 2;
                    const cy = pipe.y + pipe.h / 2;
                    return (
                      <line 
                        key={`rod-${i}`}
                        x1={isVert ? cx : pipe.x}
                        y1={isVert ? pipe.y : cy}
                        x2={isVert ? cx : pipe.x + pipe.w}
                        y2={isVert ? pipe.y + pipe.h : cy}
                        stroke="#18181b"
                        strokeWidth={Math.max(results.wInches, results.hInches) * 0.003}
                        strokeDasharray="4 2"
                        opacity="0.6"
                      />
                    );
                  })}
                </svg>

                {/* Dimension Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-zinc-700 shadow-sm border border-zinc-200">
                  {width} {unit} W
                </div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-zinc-700 shadow-sm border border-zinc-200 -rotate-90 origin-center">
                  {height} {unit} H
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <QuotationModal 
        isOpen={isQuotationModalOpen} 
        onClose={() => setIsQuotationModalOpen(false)} 
        items={quotationItems} 
        onRemoveItem={handleRemoveItem}
        onEditItem={handleEditItem}
        onImportItems={handleImportItems}
      />
    </div>
  );
}
