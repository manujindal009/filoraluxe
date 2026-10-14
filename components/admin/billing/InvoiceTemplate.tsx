"use client";

import React from "react";
import { Invoice } from "@/types/invoice";
import { formatPrice } from "@/lib/utils";

interface InvoiceTemplateProps {
  invoice: Partial<Invoice>;
  isPdfView?: boolean;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, isPdfView = false }) => {
  const business = invoice.business || {
    name: "Filora Luxe",
    tagline: "HANDMADE LUXURY CROCHET",
    address: "Handcrafted with ♥ in India",
    cityStatePin: "Punjab, India",
    email: "filoraluxe@yahoo.com",
    phone: "+91 9888812872",
    website: "filoraluxe.in",
    instagram: "@filora.luxe",
    gstin: "",
    logoUrl: "/logo.png"
  };

  const customer = invoice.customer || {
    name: "Customer Name",
    email: "customer@example.com",
    phone: "",
    address: "Shipping Address",
    city: "City",
    state: "State",
    pin: "000000",
    gstin: ""
  };

  const items = invoice.items || [];
  const vis = invoice.visibilitySettings || {
    showLogo: true,
    showGst: false,
    showDiscount: true,
    showShipping: true,
    showCustomerPhone: true,
    showCustomerEmail: true,
    showCustomerGstin: true,
    showNotes: true,
    showPaymentRef: true,
    showDueDate: true,
    showCareInstructions: true,
    showSignature: true,
    signatureTitle: "Authorized Signatory",
    signatureName: "Anshuma • Founder & Creator"
  };

  const payment = invoice.payment || {
    method: "upi",
    status: "pending",
    amountPaid: 0,
    balanceDue: invoice.total || 0,
    transactionId: ""
  };

  // Rose brand color matching the edit button
  const brandColor = "#c06c74";

  const formattedDate = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "—";

  const formattedDueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "";

  return (
    <div
      id="invoice-template-printable"
      className={`mx-auto bg-white text-[#36322E] font-sans border border-secondary/60 shadow-lg relative flex flex-col justify-between ${
        isPdfView ? "w-[210mm] min-h-[297mm] p-10" : "w-full max-w-[800px] p-6 sm:p-10 rounded-xl"
      }`}
      style={{ backgroundColor: "#FFFFFF", color: "#36322E" }}
    >
      <div>
        {/* Top Header & Branding Bar */}
        <div
          className="border-b-2 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
          style={{ borderColor: `${brandColor}40` }}
        >
          <div className="flex items-center gap-4">
            {/* Brand Logo */}
            {vis.showLogo !== false && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl || "/logo.png"}
                alt={business.name || "Filora Luxe"}
                className="h-16 sm:h-20 w-auto object-contain flex-shrink-0"
              />
            )}
            <div>
              <h1
                className="font-serif text-3xl sm:text-4xl font-bold tracking-tight uppercase"
                style={{ color: brandColor }}
              >
                {business.name || "FILORA LUXE"}
              </h1>
              <p className="text-xs font-semibold text-[#8c8273] tracking-widest uppercase mt-1">
                {business.tagline || "HANDMADE LUXURY CROCHET"}
              </p>
              <p
                className="text-xs italic mt-1 font-serif"
                style={{ color: brandColor }}
              >
                &quot;A brand by Anshuma • Handcrafted with ♥ in India&quot;
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-[#FAF9F7] px-4 py-3 rounded-lg border border-[#F3F4ED] min-w-[200px]">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: brandColor }}
            >
              TAX INVOICE
            </span>
            <div className="mt-2 space-y-1 text-xs">
              <p className="font-mono text-sm font-bold text-foreground">
                <span className="text-foreground/50 font-sans font-normal">Invoice No: </span>
                {invoice.invoiceNumber || "INV-0000"}
              </p>
              {invoice.orderNumber && (
                <p className="font-mono text-foreground/80">
                  <span className="text-foreground/50 font-sans font-normal">Order No: </span>
                  {invoice.orderNumber}
                </p>
              )}
              <p className="text-foreground/70">
                <span className="text-foreground/50">Date: </span>
                {formattedDate}
              </p>
              {vis.showDueDate && formattedDueDate && (
                <p className="text-foreground/70">
                  <span className="text-foreground/50">Due Date: </span>
                  {formattedDueDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FROM & BILL TO Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* FROM */}
          <div className="bg-[#FAF9F7] p-5 rounded-lg border border-[#F3F4ED]">
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1"
              style={{ color: brandColor, borderColor: `${brandColor}20` }}
            >
              FROM
            </h3>
            <p className="font-serif font-semibold text-sm text-foreground">{business.name}</p>
            <p className="text-xs text-foreground/70 mt-1 leading-relaxed whitespace-pre-line">
              {business.address}
            </p>
            {business.cityStatePin && (
              <p className="text-xs text-foreground/70">{business.cityStatePin}</p>
            )}
            <p className="text-xs text-foreground/70 mt-2">
              <span className="font-medium text-foreground/80">Email:</span> {business.email}
            </p>
            {business.phone && (
              <p className="text-xs text-foreground/70">
                <span className="font-medium text-foreground/80">Phone:</span> {business.phone}
              </p>
            )}
            {vis.showGst && business.gstin && (
              <p className="text-xs text-foreground/70 mt-1 font-mono">
                <span className="font-medium text-foreground/80 font-sans">GSTIN:</span> {business.gstin}
              </p>
            )}
          </div>

          {/* BILL TO */}
          <div className="bg-[#FAF9F7] p-5 rounded-lg border border-[#F3F4ED]">
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1"
              style={{ color: brandColor, borderColor: `${brandColor}20` }}
            >
              BILL TO
            </h3>
            <p className="font-serif font-semibold text-sm text-foreground">
              {customer.name || "Guest Customer"}
            </p>
            <p className="text-xs text-foreground/70 mt-1 leading-relaxed whitespace-pre-line">
              {customer.address || "No billing address provided"}
            </p>
            {(customer.city || customer.state || customer.pin) && (
              <p className="text-xs text-foreground/70">
                {[customer.city, customer.state, customer.pin].filter(Boolean).join(", ")}
              </p>
            )}
            {vis.showCustomerEmail && customer.email && (
              <p className="text-xs text-foreground/70 mt-2">
                <span className="font-medium text-foreground/80">Email:</span> {customer.email}
              </p>
            )}
            {vis.showCustomerPhone && customer.phone && (
              <p className="text-xs text-foreground/70">
                <span className="font-medium text-foreground/80">Phone:</span> {customer.phone}
              </p>
            )}
            {vis.showCustomerGstin && customer.gstin && (
              <p className="text-xs text-foreground/70 mt-1 font-mono">
                <span className="font-medium text-foreground/80 font-sans">GSTIN:</span> {customer.gstin}
              </p>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div className="mb-8 overflow-x-auto rounded-lg border border-[#F3F4ED]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className="text-white uppercase font-medium tracking-wider"
                style={{ backgroundColor: brandColor }}
              >
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">ITEM / DESCRIPTION</th>
                <th className="py-3 px-3 text-center w-16">QTY</th>
                <th className="py-3 px-3 text-right w-24">UNIT PRICE</th>
                {vis.showDiscount && <th className="py-3 px-3 text-right w-28">DISC / UNIT</th>}
                <th className="py-3 px-4 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4ED]">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={vis.showDiscount ? 6 : 5}
                    className="py-8 text-center text-foreground/40 italic"
                  >
                    No items added to this invoice.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-[#FAF9F7]/50">
                    <td className="py-3 px-3 text-center text-foreground/50 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground text-xs sm:text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-foreground/60 mt-0.5 whitespace-pre-line">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatPrice(item.unitPrice)}</td>
                    {vis.showDiscount && (
                      <td className="py-3 px-3 text-right font-mono text-emerald-600">
                        {item.discount > 0 ? `-${formatPrice(item.discount)}` : "—"}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-bold font-mono text-foreground">
                      {formatPrice(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Lower Layout: Payment Info / Notes (Left) & Calculations Summary (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Payment & Notes */}
          <div className="space-y-4">
            {/* Payment Info */}
            <div className="bg-[#FAF9F7] p-4 rounded-lg border border-[#F3F4ED]">
              <h4
                className="text-xs font-bold uppercase tracking-wider mb-2 border-b pb-1"
                style={{ color: brandColor, borderColor: `${brandColor}20` }}
              >
                PAYMENT INFORMATION
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/70">Payment Method:</span>
                  <span className="font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-secondary text-xs">
                    {payment.method || "UPI"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground/70">Payment Status:</span>
                  <span
                    className={`font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full ${
                      payment.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : payment.status === "partially_paid"
                        ? "bg-amber-100 text-amber-700"
                        : payment.status === "cancelled" || payment.status === "refunded"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {payment.status ? payment.status.replace("_", " ") : "PENDING"}
                  </span>
                </div>

                {payment.status === "partially_paid" && (
                  <div className="pt-2 border-t border-secondary/50 space-y-1">
                    <div className="flex justify-between text-foreground/70">
                      <span>Total Amount:</span>
                      <span className="font-mono">{formatPrice(invoice.total || 0)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Amount Paid:</span>
                      <span className="font-mono">{formatPrice(payment.amountPaid || 0)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Balance Due:</span>
                      <span className="font-mono">{formatPrice(payment.balanceDue || 0)}</span>
                    </div>
                  </div>
                )}

                {vis.showPaymentRef && payment.transactionId && (
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-foreground/70">Ref / UTR:</span>
                    <span className="font-mono font-medium text-foreground">{payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Field */}
            {vis.showNotes && invoice.notes && (
              <div className="bg-[#FAF9F7] p-4 rounded-lg border border-[#F3F4ED]">
                <h4
                  className="text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: brandColor }}
                >
                  NOTES & INSTRUCTIONS
                </h4>
                <p className="text-xs text-foreground/80 italic leading-relaxed whitespace-pre-line">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Calculations Summary */}
          <div className="bg-[#FAF9F7] p-5 rounded-lg border border-[#F3F4ED] flex flex-col justify-between space-y-3">
            {(() => {
              const grossSubtotal = (items || []).reduce(
                (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
                0
              );
              const itemsDiscount = (items || []).reduce(
                (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.discount) || 0),
                0
              );
              const overallDiscount = Number(invoice.discount) || 0;
              const totalDiscount = itemsDiscount + overallDiscount;
              const displaySubtotal = grossSubtotal > 0 ? grossSubtotal : (invoice.subtotal || 0);

              return (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatPrice(displaySubtotal)}
                    </span>
                  </div>

                  {vis.showDiscount && totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span className="font-mono">-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}

              {vis.showShipping && (
                <div className="flex justify-between text-foreground/70">
                  <span>Shipping & Delivery</span>
                  <span className="font-mono font-medium text-foreground">
                    {(invoice.shipping || 0) === 0 ? "FREE" : formatPrice(invoice.shipping || 0)}
                  </span>
                </div>
              )}

                  {invoice.taxEnabled && (
                    <div className="flex justify-between text-foreground/70">
                      <span>GST / Tax ({invoice.taxRate || 0}%)</span>
                      <span className="font-mono font-medium text-foreground">
                        {formatPrice(invoice.tax || 0)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div
              className="border-t-2 pt-3 flex justify-between items-center"
              style={{ borderColor: brandColor }}
            >
              <span className="font-serif text-base font-bold" style={{ color: brandColor }}>
                TOTAL
              </span>
              <span
                className="font-serif text-xl sm:text-2xl font-bold tracking-tight"
                style={{ color: brandColor }}
              >
                {formatPrice(invoice.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Signature Block */}
        {vis.showSignature !== false && (
          <div className="flex justify-end mb-6">
            <div className="text-center min-w-[200px]">
              <div
                className="font-serif italic text-2xl tracking-wide mb-1"
                style={{ color: brandColor, fontFamily: "Playfair Display, serif" }}
              >
                {vis.signatureName || "Anshuma"}
              </div>
              <div
                className="border-t w-full my-1"
                style={{ borderColor: `${brandColor}40` }}
              />
              <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                {vis.signatureTitle || "Authorized Signatory"}
              </p>
              <p className="text-[10px] text-foreground/50 italic">For Filora Luxe</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding & Care Instructions */}
      <div
        className="border-t pt-6 mt-6 text-center space-y-3"
        style={{ borderColor: `${brandColor}30` }}
      >
        <p className="font-serif text-sm font-semibold italic" style={{ color: brandColor }}>
          Thank you for choosing handmade. ♡
        </p>
        <p className="text-[11px] text-[#8c8273] max-w-lg mx-auto leading-relaxed">
          Every Filora Luxe piece is handcrafted, so small variations are part of what makes your piece unique.
        </p>

        {vis.showCareInstructions && (
          <div className="bg-[#FAF9F7] py-2 px-4 rounded-md inline-block max-w-full">
            <span
              className="text-[10px] font-bold tracking-wider uppercase mr-2"
              style={{ color: brandColor }}
            >
              CARE:
            </span>
            <span className="text-[11px] text-foreground/70 italic">
              Hand wash gently • Dry flat • Reshape while damp • Do not wring
            </span>
          </div>
        )}

        <div className="pt-2 text-[11px] text-foreground/50 flex flex-wrap justify-center items-center gap-4 border-t border-secondary/30">
          <span>{business.website || "filoraluxe.in"}</span>
          <span>•</span>
          <span>{business.instagram || "@filora.luxe"}</span>
          <span>•</span>
          <span>{business.email || "filoraluxe@yahoo.com"}</span>
        </div>
      </div>
    </div>
  );
};
