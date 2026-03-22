import React, { useState, useRef } from 'react';
import { X, Download, FileText, Plus, Trash2, ShoppingCart, Upload, DownloadCloud, Edit2, Printer, Share2, MessageCircle, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import LZString from 'lz-string';

export interface QuotationItem {
  id: string;
  seriesNumber: string;
  grillName: string;
  designKey: string;
  width: number;
  height: number;
  unit: string;
  qty: number;
  areaSqft: number;
  totalWeightAlu: number;
  totalWeightIron: number;
  rodQty: number;
  amount: number;
  perSqftRate: number;
  wastageCost?: number;
  installationCost?: number;
  description: string;
  svgContent: string;
  config: any;
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuotationItem[];
  onRemoveItem: (id: string) => void;
  onEditItem: (id: string) => void;
  onImportItems: (items: QuotationItem[]) => void;
  sharedData?: any;
}

export default function QuotationModal({ isOpen, onClose, items, onRemoveItem, onEditItem, onImportItems, sharedData }: QuotationModalProps) {
  const [companyDetails, setCompanyDetails] = useState({
    name: 'WoodenMax Architectural Elements',
    address: '5-6-411/413 Aghapura, Nampally, Hyderabad TS-500001',
    gst: '36ARWPA9740L1Z3',
    title: 'QUOTATION',
    website: 'www.woodenmax.in',
    email: 'info@woodenmax.in',
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: 'John Doe',
    address: '456 Residential Complex, City',
    mobile: '',
    email: '',
    contactPerson: 'John Doe',
    gst: '',
  });

  const [metaDetails, setMetaDetails] = useState({
    gstPercent: 18,
    descriptions: 'Supply and installation of custom aluminum grills as per the above specifications.',
    terms: '1. 50% advance along with PO.\n2. Balance against proforma invoice before dispatch.\n3. Validity: 15 days.',
    bankDetails: 'Account Name: WoodenMax Architectural Elements\nAccount Number: 5020092938110\nIFSC Code: HDFC0001996\nBranch: hyderaguda Hyderabad',
    signatory: 'Authorized Signatory',
  });

  React.useEffect(() => {
    if (sharedData) {
      if (sharedData.companyDetails) setCompanyDetails(sharedData.companyDetails);
      if (sharedData.customerDetails) setCustomerDetails(sharedData.customerDetails);
      if (sharedData.metaDetails) setMetaDetails(sharedData.metaDetails);
    }
  }, [sharedData]);

  const previewRef = useRef<HTMLDivElement>(null);

  const [isSharing, setIsSharing] = useState(false);

  const generateShareLink = async (returnUrlOnly = false) => {
    setIsSharing(true);
    try {
      const exportData = {
        version: 2,
        items,
        companyDetails,
        customerDetails,
        metaDetails
      };
      
      const jsonString = JSON.stringify(exportData);
      const compressed = LZString.compressToEncodedURIComponent(jsonString);
      
      const url = new URL(window.location.href);
      url.hash = `data=${compressed}`;
      
      if (returnUrlOnly) {
        setIsSharing(false);
        return url.toString();
      }

      await navigator.clipboard.writeText(url.toString());
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to generate share link:', err);
      alert('Failed to generate share link. The data might be too large.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const link = await generateShareLink(true);
    if (!link) return;
    const text = `Hello WoodenMax,\n\nI have generated a grill quotation using your online estimator.\n\nCustomer: ${customerDetails.name}\nTotal Amount: Rs. ${grandTotal.toLocaleString('en-IN')}\n\nPlease check my quotation here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailInquiry = async () => {
    const link = await generateShareLink(true);
    if (!link) return;
    const subject = `New Grill Quotation Inquiry - ${customerDetails.name}`;
    const body = `Hello WoodenMax Team,\n\nPlease find my grill quotation details below:\n\nCustomer Name: ${customerDetails.name}\nContact: ${customerDetails.mobile || 'N/A'}\nEmail: ${customerDetails.email || 'N/A'}\nTotal Amount: Rs. ${grandTotal.toLocaleString('en-IN')}\n\nQuotation Link: ${link}\n\nThank you.`;
    const cc = customerDetails.email ? `&cc=${customerDetails.email}` : '';
    window.open(`mailto:info@woodenmax.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}${cc}`);
  };

  const exportJSON = () => {
    const exportData = {
      version: 2,
      items,
      companyDetails,
      customerDetails,
      metaDetails
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `woodenmax_quotation_backup_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImportItems(data);
        } else if (data.version === 2) {
          onImportItems(data.items || []);
          if (data.companyDetails) setCompanyDetails(data.companyDetails);
          if (data.customerDetails) setCustomerDetails(data.customerDetails);
          if (data.metaDetails) setMetaDetails(data.metaDetails);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (!isOpen) return null;

  const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalWastage = items.reduce((sum, item) => sum + (item.wastageCost || 0), 0);
  const totalInstallation = items.reduce((sum, item) => sum + (item.installationCost || 0), 0);
  const totalBeforeGST = subTotal + totalWastage + totalInstallation;
  const gstAmount = (totalBeforeGST * metaDetails.gstPercent) / 100;
  const grandTotal = totalBeforeGST + gstAmount;

  const buildPDF = async () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 40;

    // --- Header ---
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.name, 40, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 15;
    doc.text(companyDetails.address, 40, yPos);
    yPos += 12;
    doc.text(`Email: ${companyDetails.email} | Web: ${companyDetails.website}`, 40, yPos);
    yPos += 12;
    doc.text(`GSTIN: ${companyDetails.gst}`, 40, yPos);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.title, pageWidth - 40, 50, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 40, 65, { align: 'right' });
    doc.text(`Quote No: QTN-${Math.floor(Math.random() * 10000)}`, pageWidth - 40, 77, { align: 'right' });

    yPos += 30;
    doc.setDrawColor(200);
    doc.line(40, yPos, pageWidth - 40, yPos);
    yPos += 20;

    // --- Customer Details ---
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation To:', 40, yPos);
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${customerDetails.name}`, 40, yPos);
    yPos += 12;
    doc.text(`Address: ${customerDetails.address}`, 40, yPos);
    yPos += 12;
    if (customerDetails.mobile) {
      doc.text(`Mobile: ${customerDetails.mobile}`, 40, yPos);
      yPos += 12;
    }
    if (customerDetails.email) {
      doc.text(`Email: ${customerDetails.email}`, 40, yPos);
      yPos += 12;
    }
    if (customerDetails.contactPerson) {
      doc.text(`Contact Person: ${customerDetails.contactPerson}`, 40, yPos);
      yPos += 12;
    }
    if (customerDetails.gst) {
      doc.text(`GSTIN: ${customerDetails.gst}`, 40, yPos);
      yPos += 12;
    }

    yPos += 18;

    // --- Items Table ---
    const tableData = items.map((item, index) => {
      const perGrillWt = (item.totalWeightAlu || 0) + (item.totalWeightIron || 0);
      const totalWt = perGrillWt * item.qty;
      
      return [
        item.seriesNumber,
        `${item.grillName}\nSize: ${item.width}x${item.height} ${item.unit}\n\nSpecs:\n${item.description}`,
        item.qty,
        item.qty > 1 
          ? `Per: ${(item.areaSqft || 0).toFixed(2)} sqft\nTotal: ${((item.areaSqft || 0) * item.qty).toFixed(2)} sqft\n\nPer Wt: ${perGrillWt.toFixed(2)} kg\nTotal Wt: ${totalWt.toFixed(2)} kg`
          : `${(item.areaSqft || 0).toFixed(2)} sqft\n\nWt: ${perGrillWt.toFixed(2)} kg`,
        `Rs. ${(item.perSqftRate || 0).toFixed(2)}/sqft`,
        `Rs. ${(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Ref', 'Description', 'Qty', 'Area & Wt', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [39, 39, 42] }, // zinc-900
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 140 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 80 },
        4: { cellWidth: 90 },
        5: { cellWidth: 80, halign: 'right' }
      },
      didDrawPage: (data) => {
        yPos = data.cursor ? data.cursor.y : yPos;
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // --- Totals ---
    const totalsX = pageWidth - 200;
    doc.setFont('helvetica', 'normal');
    doc.text('Sub Total (Grills):', totalsX, yPos);
    doc.text(`Rs. ${subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });
    yPos += 15;
    
    if (totalWastage > 0) {
      doc.text('Wastage Cost:', totalsX, yPos);
      doc.text(`Rs. ${totalWastage.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 15;
    }
    if (totalInstallation > 0) {
      doc.text('Installation Cost:', totalsX, yPos);
      doc.text(`Rs. ${totalInstallation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });
      yPos += 15;
    }
    if (totalWastage > 0 || totalInstallation > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Total Before Tax:', totalsX, yPos);
      doc.text(`Rs. ${totalBeforeGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPos += 15;
    }

    doc.text(`GST (${metaDetails.gstPercent}%):`, totalsX, yPos);
    doc.text(`Rs. ${gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', totalsX, yPos);
    doc.text(`Rs. ${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth - 40, yPos, { align: 'right' });

    yPos += 40;

    // --- Terms & Bank Details ---
    if (yPos > doc.internal.pageSize.getHeight() - 150) {
      doc.addPage();
      yPos = 40;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 40, yPos);
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitDesc = doc.splitTextToSize(metaDetails.descriptions, pageWidth - 80);
    doc.text(splitDesc, 40, yPos);
    yPos += splitDesc.length * 12 + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 40, yPos);
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitTerms = doc.splitTextToSize(metaDetails.terms, pageWidth - 80);
    doc.text(splitTerms, 40, yPos);
    yPos += splitTerms.length * 12 + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details:', 40, yPos);
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitBank = doc.splitTextToSize(metaDetails.bankDetails, pageWidth / 2 - 60);
    doc.text(splitBank, 40, yPos);

    try {
      const upiString = `upi://pay?pa=finilexnaseem-3@okicici&pn=WoodenMax%20Architectural%20Elements&am=${grandTotal.toFixed(2)}&cu=INR`;
      const qrDataUrl = await QRCode.toDataURL(upiString, { margin: 1, width: 80 });
      doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 40, yPos - 12, 80, 80);
      doc.setFontSize(8);
      doc.text('Scan to Pay', pageWidth / 2, yPos + 75, { align: 'center' });
    } catch (err) {
      console.error("Error generating QR code", err);
    }

    yPos += Math.max(splitBank.length * 12, 80) + 20;

    // Signatory
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${companyDetails.name}`, pageWidth - 40, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(metaDetails.signatory, pageWidth - 40, yPos + 40, { align: 'right' });

    // --- Add SVGs at the end ---
    if (items.length > 0) {
      doc.addPage();
      let svgY = 40;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Design Previews', 40, svgY);
      svgY += 30;

      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.designKey]) acc[item.designKey] = [];
        acc[item.designKey].push(item);
        return acc;
      }, {} as Record<string, QuotationItem[]>);

      for (const [key, group] of Object.entries(groupedItems)) {
        const firstItem = group[0];
        
        if (svgY > doc.internal.pageSize.getHeight() - 250) {
          doc.addPage();
          svgY = 40;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Design: ${firstItem.grillName} (Base)`, 40, svgY);
        svgY += 15;
        
        try {
          const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(firstItem.svgContent);
          
          const img = new Image();
          img.src = svgData;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1200 * (firstItem.height / firstItem.width);
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 160;
            const imgHeight = 160 * (firstItem.height / firstItem.width);
            
            doc.addImage(imgData, 'PNG', 40, svgY, imgWidth, imgHeight);
            
            // Add tagline below image
            const taglineY = svgY + imgHeight + 15;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            const c = firstItem.config;
            const tagline = `Outer Frame: ${c.outerProfile}mm | Inner Profile: ${c.innerProfile}mm ${c.innerShape} | Gaps: ${c.gap1}${c.unit} | Pattern: ${c.pattern}`;
            doc.text(tagline, 40, taglineY);

            // List items using this design
            let listY = svgY + 15;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Applied to sizes:', 220, listY);
            listY += 15;
            
            doc.setFont('helvetica', 'normal');
            group.forEach(item => {
              doc.text(`• [${item.seriesNumber}] ${item.width}x${item.height} ${item.unit} (Qty: ${item.qty})`, 220, listY);
              listY += 12;
            });
            
            svgY += Math.max(imgHeight + 25, (group.length * 12) + 30) + 30;
          }
        } catch (e) {
          console.error('Failed to add SVG to PDF', e);
          doc.setFont('helvetica', 'normal');
          doc.text('(Preview image not available)', 40, svgY + 20);
          svgY += 40;
        }
      }
    }

    return doc;
  };

  const generatePDF = async () => {
    const doc = await buildPDF();
    const fileName = `Quotation_${customerDetails.name ? customerDetails.name.replace(/\s+/g, '_') : 'Customer'}.pdf`;
    doc.save(fileName);
  };

  const printPDF = async () => {
    const doc = await buildPDF();
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-zinc-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Quotation Generator</h2>
              <p className="text-sm text-zinc-500">Configure details and generate PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 mr-4 border-r border-zinc-200 pr-4">
              <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors">
                <DownloadCloud className="w-3.5 h-3.5" /> Export JSON
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import JSON
                <input type="file" accept=".json" onChange={importJSON} className="hidden" />
              </label>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Forms */}
            <div className="space-y-8">
              {/* Company Details */}
              <section>
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 border-b pb-2">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Company Name</label>
                    <input type="text" value={companyDetails.name} onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Address</label>
                    <input type="text" value={companyDetails.address} onChange={e => setCompanyDetails({...companyDetails, address: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">GSTIN</label>
                    <input type="text" value={companyDetails.gst} onChange={e => setCompanyDetails({...companyDetails, gst: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
                    <input type="email" value={companyDetails.email} onChange={e => setCompanyDetails({...companyDetails, email: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                </div>
              </section>

              {/* Customer Details */}
              <section>
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 border-b pb-2">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Customer Name <span className="text-red-500">*</span></label>
                    <input type="text" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Required" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Address <span className="text-red-500">*</span></label>
                    <input type="text" value={customerDetails.address} onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Required" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Mobile (Optional)</label>
                    <input type="text" value={customerDetails.mobile} onChange={e => setCustomerDetails({...customerDetails, mobile: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Email (Optional)</label>
                    <input type="email" value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Contact Person (Optional)</label>
                    <input type="text" value={customerDetails.contactPerson} onChange={e => setCustomerDetails({...customerDetails, contactPerson: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">GSTIN (Optional)</label>
                    <input type="text" value={customerDetails.gst} onChange={e => setCustomerDetails({...customerDetails, gst: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                </div>
              </section>

              {/* Meta Details */}
              <section>
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 border-b pb-2">Terms & Bank Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">GST %</label>
                    <input type="number" value={metaDetails.gstPercent} onChange={e => setMetaDetails({...metaDetails, gstPercent: Number(e.target.value)})} className="w-32 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Description</label>
                    <textarea value={metaDetails.descriptions} onChange={e => setMetaDetails({...metaDetails, descriptions: e.target.value})} rows={2} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Terms & Conditions</label>
                    <textarea value={metaDetails.terms} onChange={e => setMetaDetails({...metaDetails, terms: e.target.value})} rows={3} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">Bank Details</label>
                    <textarea value={metaDetails.bankDetails} onChange={e => setMetaDetails({...metaDetails, bankDetails: e.target.value})} rows={3} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none resize-none" />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Items List & Totals */}
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">Quotation Items</h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                {items.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No items added yet.</p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm relative group">
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { onEditItem(item.id); onClose(); }} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md" title="Edit Item">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRemoveItem(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Remove Item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-start pr-16">
                        <div>
                          <p className="font-semibold text-sm text-zinc-900">[{item.seriesNumber}] {item.grillName} - {item.width}x{item.height} {item.unit}</p>
                          <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{item.description}</p>
                          <div className="flex gap-3 mt-2 text-xs font-medium text-zinc-600 bg-zinc-50 inline-flex px-2 py-1 rounded border border-zinc-100">
                            <span>Qty: {item.qty}</span>
                            <span className="w-px bg-zinc-300"></span>
                            <span>Per Grill: {(item.areaSqft || 0).toFixed(2)} sqft</span>
                            {item.qty > 1 && (
                              <>
                                <span className="w-px bg-zinc-300"></span>
                                <span>Total: {((item.areaSqft || 0) * item.qty).toFixed(2)} sqft</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-3 mt-1 text-xs font-medium text-zinc-600 bg-zinc-50 inline-flex px-2 py-1 rounded border border-zinc-100">
                            <span>Per Grill Wt: {((item.totalWeightAlu || 0) + (item.totalWeightIron || 0)).toFixed(2)} kg</span>
                            {item.qty > 1 && (
                              <>
                                <span className="w-px bg-zinc-300"></span>
                                <span>Total Wt: {(((item.totalWeightAlu || 0) + (item.totalWeightIron || 0)) * item.qty).toFixed(2)} kg</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">₹{(item.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            @ ₹{(item.perSqftRate || 0).toFixed(2)}/sqft
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals Box */}
              <div className="bg-zinc-900 text-white p-5 rounded-xl mt-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Sub Total (Grills)</span>
                    <span>₹{subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  {(totalWastage > 0 || totalInstallation > 0) && (
                    <>
                      <div className="flex justify-between text-zinc-400">
                        <span>Wastage Cost</span>
                        <span>₹{totalWastage.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Installation</span>
                        <span>₹{totalInstallation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-zinc-300 pt-2 border-t border-zinc-700">
                        <span>Total Before Tax</span>
                        <span>₹{totalBeforeGST.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>GST ({metaDetails.gstPercent}%)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-zinc-700 flex justify-between items-center">
                    <span className="font-bold text-lg">Grand Total</span>
                    <span className="font-bold text-xl text-emerald-400">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-wrap justify-end gap-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={generateShareLink}
            disabled={items.length === 0 || isSharing || !customerDetails.name || !customerDetails.address}
            className="px-5 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy Link"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Generating...' : 'Link'}
          </button>
          <button 
            onClick={handleWhatsAppShare}
            disabled={items.length === 0 || isSharing || !customerDetails.name || !customerDetails.address}
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button 
            onClick={handleEmailInquiry}
            disabled={items.length === 0 || isSharing || !customerDetails.name || !customerDetails.address}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            Email Inquiry
          </button>
          <button 
            onClick={printPDF}
            disabled={items.length === 0 || !customerDetails.name || !customerDetails.address}
            className="px-5 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button 
            onClick={generatePDF}
            disabled={items.length === 0 || !customerDetails.name || !customerDetails.address}
            className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}
