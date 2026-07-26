import jsPDF from "jspdf";
import { TourPackage } from "../types";

export function getTourCode(pkg: TourPackage): string {
  if (pkg.code && pkg.code.trim().length > 0) {
    return pkg.code.trim().toUpperCase();
  }
  const nameClean = (pkg.name || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const idClean = (pkg.id || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  const combined = (nameClean + idClean + "AHLAN").slice(0, 6);
  return `${combined}-KH`;
}

export function getPackageSlug(pkg: TourPackage): string {
  if (!pkg || !pkg.name) return "package";
  return pkg.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generatePackagePdf(pkg: TourPackage, tourCode: string, destinationsStr?: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 15;

  const checkPageBreak = (neededHeight: number = 10) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // 1. Header Banner / Brand
  doc.setFillColor(15, 22, 38); // Brand dark charcoal
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AHLAN CAMBODIA", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("LUXURY MUSLIM TRAVEL & SANCTUARY DMC", margin, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55); // Gold Accent
  doc.text(`TOUR CODE: ${tourCode}`, pageWidth - margin, 15, { align: "right" });

  y = 36;

  // 2. Package Title
  doc.setTextColor(15, 22, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(pkg.name, pageWidth - (margin * 2));
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 7) + 2;

  // 3. Price & Key Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 86, 179);
  doc.text(`Price: $${pkg.price.toLocaleString()} USD per person`, margin + 5, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Duration: ${pkg.duration}`, margin + 5, y + 15);

  if (destinationsStr) {
    doc.text(`Destinations: ${destinationsStr}`, margin + 90, y + 8);
  }
  doc.text(`Dining: Verified 100% Halal Meals Included`, margin + 90, y + 15);

  y += 28;

  // 4. Brief / Description
  if (pkg.brief || pkg.description) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 22, 38);
    doc.text("OVERVIEW", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const descText = pkg.brief || pkg.description;
    const splitDesc = doc.splitTextToSize(descText, pageWidth - (margin * 2));
    doc.text(splitDesc, margin, y);
    y += (splitDesc.length * 4.5) + 6;
  }

  // 5. KEY PACKAGE HIGHLIGHTS
  const highlights = pkg.keyHighlights && pkg.keyHighlights.filter(h => h && h.trim().length > 0);
  if (highlights && highlights.length > 0) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 22, 38);
    doc.text("KEY PACKAGE HIGHLIGHTS", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 22, 38);

    highlights.forEach((hl) => {
      checkPageBreak(8);
      doc.setFillColor(212, 175, 55); // Gold bullet
      doc.circle(margin + 2, y - 1.2, 1, "F");

      const splitHl = doc.splitTextToSize(hl.trim(), pageWidth - (margin * 2) - 8);
      doc.text(splitHl, margin + 6, y);
      y += (splitHl.length * 4.2) + 2.5;
    });
    y += 4;
  }

  // 6. SERVICE SPECIFICATIONS GRID (6 Cards: Duration, Destinations, Accommodations, Halal Dining, Transport & Guide, Pace & Style)
  checkPageBreak(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 22, 38);
  doc.text("SERVICE SPECIFICATIONS", margin, y);
  y += 6;

  // Derive specs
  const specDuration = (pkg.duration || "5 DAYS / 4 NIGHTS").toUpperCase();
  const specDestinations = (destinationsStr || pkg.destinations?.join(", ") || "PHNOM PENH, SIEM REAP").toUpperCase();
  
  let specHotel = "KHEMARA ANGKOR HOTEL & SPA";
  const hotelNames: string[] = [];

  if (pkg.packageHotelsList && pkg.packageHotelsList.length > 0) {
    pkg.packageHotelsList.forEach(item => {
      if (item.customHotel?.name) {
        hotelNames.push(item.customHotel.name.toUpperCase());
      } else if (item.hotelId) {
        const formatted = item.hotelId.replace(/-/g, " ").toUpperCase();
        hotelNames.push(formatted);
      }
    });
  } else if (pkg.hotelIds && pkg.hotelIds.length > 0) {
    pkg.hotelIds.forEach(hid => {
      hotelNames.push(hid.replace(/-/g, " ").toUpperCase());
    });
  }

  if (pkg.customHotels && pkg.customHotels.length > 0) {
    pkg.customHotels.forEach(ch => {
      if (ch.name && !hotelNames.includes(ch.name.toUpperCase())) {
        hotelNames.push(ch.name.toUpperCase());
      }
    });
  } else if (pkg.customHotel?.name && !hotelNames.includes(pkg.customHotel.name.toUpperCase())) {
    hotelNames.push(pkg.customHotel.name.toUpperCase());
  }

  if (hotelNames.length > 0) {
    specHotel = hotelNames.join(" • ");
  }

  const specDining = "MUSLIM MEALS";
  const specTransport = "PRIVATE TRANSFER & GUIDE";
  const specPace = "LEISURE";

  const specCards = [
    { label: "DURATION", value: specDuration },
    { label: "DESTINATIONS", value: specDestinations },
    { label: "ACCOMMODATIONS", value: specHotel },
    { label: "HALAL DINING", value: specDining },
    { label: "TRANSPORT & GUIDE", value: specTransport },
    { label: "PACE & STYLE", value: specPace }
  ];

  const gridCols = 3;
  const colGap = 5;
  const colWidth = (pageWidth - (margin * 2) - ((gridCols - 1) * colGap)) / gridCols; // ~56.6mm
  const cardHeight = 15;
  const rowGap = 4;

  specCards.forEach((card, idx) => {
    const col = idx % gridCols;
    const row = Math.floor(idx / gridCols);

    if (col === 0 && row > 0) {
      y += cardHeight + rowGap;
      checkPageBreak(cardHeight + rowGap);
    }

    const x = margin + col * (colWidth + colGap);
    const cardY = y;

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, colWidth, cardHeight, 2, 2, "FD");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 3.5, cardY + 5);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 22, 38);

    const valLines = doc.splitTextToSize(card.value, colWidth - 7);
    doc.text(valLines[0] || "", x + 3.5, cardY + 10.5);
  });

  y += cardHeight + 8;

  // 7. PACKAGE INCLUSIONS
  const inclusions = pkg.features && pkg.features.length > 0
    ? pkg.features
    : ["Certified 100% Halal Dining", "Private Air-Conditioned Chauffeur", "Professional Muslim Guide", "5-Star / Boutique Hotel Accommodations"];

  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 22, 38);
  doc.text("PACKAGE INCLUSIONS", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  inclusions.forEach((feat) => {
    checkPageBreak(6);
    doc.setTextColor(16, 185, 129); // Green checkmark
    doc.text("✓", margin + 2, y);

    doc.setTextColor(30, 41, 59);
    const splitFeat = doc.splitTextToSize(feat, pageWidth - (margin * 2) - 8);
    doc.text(splitFeat, margin + 7, y);
    y += (splitFeat.length * 4.2) + 2;
  });
  y += 4;

  // 8. PACKAGE EXCLUSIONS
  const exclusions = pkg.exclusions && pkg.exclusions.length > 0
    ? pkg.exclusions
    : ["International flights and airport departure taxes", "Personal travel insurance and medical expenses", "Personal expenses (laundry, telephone, tipping, etc.)", "Visa fees (if applicable)"];

  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 22, 38);
  doc.text("PACKAGE EXCLUSIONS", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  exclusions.forEach((excl) => {
    checkPageBreak(6);
    doc.setTextColor(225, 29, 72); // Rose cross mark
    doc.text("✕", margin + 2, y);

    doc.setTextColor(71, 85, 105);
    const splitExcl = doc.splitTextToSize(excl, pageWidth - (margin * 2) - 8);
    doc.text(splitExcl, margin + 7, y);
    y += (splitExcl.length * 4.2) + 2;
  });
  y += 6;

  // 9. DAY-BY-DAY ITINERARY OVERVIEW
  checkPageBreak(25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 22, 38);
  doc.text("DAY-BY-DAY ITINERARY OVERVIEW", margin, y);
  y += 6;

  const rawItineraryItems = pkg.itineraryDetails && pkg.itineraryDetails.length > 0
    ? pkg.itineraryDetails
    : (pkg.itineraryOverview || []).map((desc, idx) => ({ day: idx + 1, title: `Day ${idx + 1}`, description: desc, meals: "", highlights: "" }));

  rawItineraryItems.forEach((rawItem, idx) => {
    const dayNum = rawItem.day || (idx + 1);
    let title = (rawItem.title || "").trim();
    let desc = (rawItem.description || "").trim();

    // Clean up title and description if title is redundant like "Day 1" or if description starts with "Day 1 - Arrive Siem Reap: ..."
    if (!title || /^Day\s*\d+\s*$/i.test(title) || /^Day\s*\d+\s*[:\-]\s*$/i.test(title)) {
      const match = desc.match(/^Day\s*\d+\s*[:\-]\s*([^:\.]+)(?:[:\.]\s*|\s*)([\s\S]*)$/i);
      if (match) {
        title = match[1].trim();
        desc = match[2].trim();
      } else {
        title = "";
      }
    } else {
      title = title.replace(/^Day\s*\d+\s*[:\-]?\s*/i, "").trim();
    }

    // Format final header title string
    const headerTitle = title ? `DAY ${dayNum}: ${title.toUpperCase()}` : `DAY ${dayNum}`;

    const splitItin = doc.splitTextToSize(desc, pageWidth - (margin * 2) - 4);
    const boxHeight = 8;
    const itemHeightNeeded = boxHeight + 4 + (rawItem.highlights ? 5 : 0) + (splitItin.length * 4.5) + 6;

    checkPageBreak(itemHeightNeeded > 45 ? 25 : itemHeightNeeded);

    // Header Box
    doc.setFillColor(240, 247, 255);
    doc.setDrawColor(219, 234, 254);
    doc.rect(margin, y, pageWidth - (margin * 2), boxHeight, "FD");

    // Header Text inside Box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0, 86, 179);
    doc.text(headerTitle, margin + 3, y + 5.5);

    if (rawItem.meals) {
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text(`[${rawItem.meals}]`, pageWidth - margin - 3, y + 5.5, { align: "right" });
    }

    // Move y past the header box with ample clear vertical padding (no overlap possible)
    y += boxHeight + 4;

    if (rawItem.highlights) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Highlights: ${rawItem.highlights}`, margin + 2, y);
      y += 5;
    }

    // Paragraph Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    doc.text(splitItin, margin + 2, y);
    y += (splitItin.length * 4.5) + 6;
  });

  // Footer / Contact
  checkPageBreak(20);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 22, 38);
  doc.text("Ahlan Cambodia - Concierge & Bookings", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Email: concierge@ahlancambodia.com | Tel / WhatsApp: +855 23 999 888 | www.ahlancambodia.com", margin, y + 4);

  // Save the PDF
  const cleanName = pkg.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Ahlan_Cambodia_Itinerary_${tourCode}_${cleanName}.pdf`);
}
