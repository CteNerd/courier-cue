// PDF generation using pdf-lib
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getObject } from './s3.js';

interface ReceiptData {
  org: {
    orgName: string;
    logoUrl?: string;
    legalName?: string;
  };
  load: {
    loadId: string;
    serviceAddress: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      contact?: string;
      phone?: string;
    };
    items: Array<{ type: string; qty: number }>;
    unloadLocation?: string;
    shipVia?: string;
    trailer?: {
      dropped?: boolean;
      picked?: boolean;
      liveLoad?: boolean;
      percentFull?: number;
    };
    notes?: string;
  };
  signature: {
    signerName: string;
    signedAt: string;
    geo?: { lat: number; lng: number; accuracy?: number };
    s3Key: string;
  };
  driver: {
    displayName: string;
    userId: string;
  };
}

export async function generateReceipt(data: ReceiptData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  const margin = 50;
  const lineHeight = 15;

  // Header
  page.drawText(data.org.orgName, {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  if (data.org.legalName) {
    page.drawText(data.org.legalName, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= lineHeight;
  }

  y -= 20;
  page.drawText('DELIVERY RECEIPT', {
    x: margin,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Load ID
  page.drawText(`Load ID: ${data.load.loadId}`, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // Service Address
  page.drawText('DELIVERED TO:', {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(data.load.serviceAddress.name, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(data.load.serviceAddress.street, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(
    `${data.load.serviceAddress.city}, ${data.load.serviceAddress.state} ${data.load.serviceAddress.zip}`,
    {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    }
  );
  y -= lineHeight;

  if (data.load.serviceAddress.contact) {
    page.drawText(`Contact: ${data.load.serviceAddress.contact}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  if (data.load.serviceAddress.phone) {
    page.drawText(`Phone: ${data.load.serviceAddress.phone}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  y -= 20;

  // Items
  page.drawText('ITEMS:', {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  for (const item of data.load.items) {
    page.drawText(`${item.qty}x ${item.type}`, {
      x: margin + 10,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  y -= 10;

  // Additional details
  if (data.load.unloadLocation) {
    page.drawText(`Unload Location: ${data.load.unloadLocation}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  if (data.load.shipVia) {
    page.drawText(`Ship Via: ${data.load.shipVia}`, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  }

  if (data.load.trailer) {
    const trailerInfo = [];
    if (data.load.trailer.dropped) trailerInfo.push('Trailer Dropped');
    if (data.load.trailer.picked) trailerInfo.push('Trailer Picked');
    if (data.load.trailer.liveLoad) trailerInfo.push('Live Load');
    if (data.load.trailer.percentFull) trailerInfo.push(`${data.load.trailer.percentFull}% Full`);

    if (trailerInfo.length > 0) {
      page.drawText(`Trailer: ${trailerInfo.join(', ')}`, {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
  }

  if (data.load.notes) {
    y -= 10;
    page.drawText('Notes:', {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
    page.drawText(data.load.notes, {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0, 0, 0),
      maxWidth: width - margin * 2,
    });
    y -= lineHeight * 2;
  }

  y -= 20;

  // Signature section
  page.drawText('SIGNATURE:', {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  // Try to embed signature image
  try {
    const signatureBuffer = await getObject(data.signature.s3Key);
    const signatureImage = await pdfDoc.embedPng(signatureBuffer);
    const signatureDims = signatureImage.scale(0.3);

    page.drawImage(signatureImage, {
      x: margin,
      y: y - signatureDims.height,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    y -= signatureDims.height + 10;
  } catch (error) {
    console.error('Failed to embed signature image:', error);
    page.drawText('[Signature image not available]', {
      x: margin,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= lineHeight * 2;
  }

  page.drawText(`Signed by: ${data.signature.signerName}`, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  const signedDate = new Date(data.signature.signedAt);
  page.drawText(`Date/Time: ${signedDate.toLocaleString('en-US')}`, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  if (data.signature.geo) {
    page.drawText(
      `Location: ${data.signature.geo.lat.toFixed(6)}, ${data.signature.geo.lng.toFixed(6)}`,
      {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      }
    );
    y -= lineHeight;
  }

  y -= 20;

  // Driver info
  page.drawText(`Driver: ${data.driver.displayName}`, {
    x: margin,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  // Footer disclaimer
  y = 50;
  page.drawText(
    'This receipt confirms delivery of the items listed above. Please retain for your records.',
    {
      x: margin,
      y,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
      maxWidth: width - margin * 2,
    }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
