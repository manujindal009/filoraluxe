export async function downloadInvoicePdf(elementId: string, filename: string = "Invoice.pdf") {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF generation.`);
    return;
  }

  try {
    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;
    
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("html2pdf generation error:", err);
    // Fallback to window.print
    window.print();
  }
}

export function printInvoice(elementId: string) {
  if (typeof window === "undefined") return;
  window.print();
}

export function shareInvoiceWhatsApp(
  customerName: string, 
  invoiceNumber: string, 
  amount: number,
  invoiceIdOrToken?: string,
  customerPhone?: string
) {
  const cleanName = customerName || "Valued Customer";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://filoraluxe.in";
  const invoiceUrl = invoiceIdOrToken ? `${origin}/invoice/${invoiceIdOrToken}` : "";
  
  const linkText = invoiceUrl 
    ? `\n\n📄 View & Download your Official PDF Invoice here:\n${invoiceUrl}` 
    : "";

  const message = `Hi ${cleanName},\n\nThank you for choosing Filora Luxe. ♡\n\nYour invoice ${invoiceNumber} for ₹${amount.toLocaleString("en-IN")} is ready.${linkText}\n\nThank you for supporting handmade.`;

  const cleanPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, "") : "";
  const phoneParam = cleanPhone 
    ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) 
    : "";

  const url = phoneParam 
    ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}
