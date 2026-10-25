export async function downloadInvoicePdf(
  elementId: string,
  filename: string = "Invoice.pdf"
) {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element #${elementId} not found for PDF generation.`);
    return;
  }

  try {
  const html2pdf = (await import("html2pdf.js")).default;



// Create a clean copy so the live preview is not affected
const clone = element.cloneNode(true) as HTMLElement;

// Copy computed styles inline so html2canvas
// does not have to parse Tailwind's oklch/oklab colors.
const originalElements = [
  element,
  ...Array.from(element.querySelectorAll("*"))
];

const clonedElements = [
  clone,
  ...Array.from(clone.querySelectorAll("*"))
];

originalElements.forEach((original, index) => {
  const cloned = clonedElements[index] as HTMLElement;

  if (!cloned || !(original instanceof HTMLElement)) return;

  const computed = window.getComputedStyle(original);

  for (let i = 0; i < computed.length; i++) {
    const property = computed[i];
    const value = computed.getPropertyValue(property);

    if (value) {
      cloned.style.setProperty(property, value);
    }
  }

  // Remove Tailwind classes so html2canvas doesn't
  // re-parse the original Tailwind CSS.
  cloned.removeAttribute("class");
});

    clone.style.width = "190mm";
    clone.style.maxWidth = "190mm";
    clone.style.minHeight = "auto";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.zoom = "0.9";

    // Remove screen-only overflow behaviour
    clone.querySelectorAll("*").forEach((child) => {
      const el = child as HTMLElement;

      if (el.classList.contains("overflow-x-auto")) {
        el.style.overflow = "visible";
      }
    });

    // Temporary container for PDF generation
    const container = document.createElement("div");

    container.style.position = "fixed";
    container.style.left = "-100000px";
    container.style.top = "0";
    container.style.width = "190mm";
    container.style.background = "#ffffff";
    container.style.padding = "0";
    container.style.margin = "0";

    container.appendChild(clone);
    document.body.appendChild(container);

    const opt = {
      margin: [10, 10, 10, 10] as [
        number,
        number,
        number,
        number
      ],
      filename,
      image: {
        type: "jpeg" as const,
        quality: 0.98
      },
      html2canvas: {
  scale: 2,
  useCORS: true,
  logging: false,
  backgroundColor: "#ffffff",
  onclone: (clonedDoc: Document) => {
    clonedDoc.querySelectorAll("*").forEach((node) => {
      const el = node as HTMLElement;

      const computed = window.getComputedStyle(el);

      if (computed.color.includes("oklab")) {
        el.style.color = "#333333";
      }

      if (computed.backgroundColor.includes("oklab")) {
        el.style.backgroundColor = "#ffffff";
      }

      if (computed.borderColor.includes("oklab")) {
        el.style.borderColor = "#eadfe0";
      }
    });
  }
},
      pagebreak: {
  mode: ["css", "legacy"] as string[],
  avoid: ["tr"]
},
      jsPDF: {
        unit: "mm" as const,
        format: "a4",
        orientation: "portrait" as const
      }
    };

    await html2pdf()
      .set(opt)
      .from(clone)
      .save();

    // Remove temporary copy
    document.body.removeChild(container);

  } catch (err) {
    console.error("html2pdf generation error:", err);
  }
}

export function printInvoice(elementId: string) {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element #${elementId} not found for printing.`);
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1200");

  if (!printWindow) {
    console.error("Unable to open print window.");
    return;
  }

  const styles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((node) => node.outerHTML)
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Filora Luxe Invoice</title>
        ${styles}

        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          body {
            display: block;
          }

         #invoice-template-printable,
         #expense-voucher-printable {
  width: 211mm !important;
  max-width: 211mm !important;
  min-height: auto !important;
  margin: 0 auto !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  zoom: 0.9;
}
        </style>
      </head>

      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };
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
