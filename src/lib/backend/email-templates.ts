/**
 * Email templates for RenewCanvas Africa notifications.
 * All templates return plain text suitable for transactional emails.
 */

export type OrderConfirmationInput = {
  buyerName: string;
  orderId: string;
  artworkTitle: string;
  artistName: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  siteUrl?: string;
};

export type NewOrderAlertInput = {
  artistName: string;
  buyerName: string;
  orderId: string;
  artworkTitle: string;
  orderAmount: number;
  currency: string;
  siteUrl?: string;
};

export type ArtworkDecisionInput = {
  artistName: string;
  artworkTitle: string;
  artworkId: string;
  decision: "approved" | "rejected" | "more_info_requested";
  adminNote?: string;
  siteUrl?: string;
};

export type PasswordResetInput = {
  userName: string;
  resetLink: string;
  expiresInMinutes: number;
};

export function orderConfirmationEmail(input: OrderConfirmationInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const formattedTotal = formatCurrency(input.totalAmount, input.currency);
  const paymentLabel = paymentMethodLabel(input.paymentMethod);

  return {
    subject: `Order Confirmed - ${input.artworkTitle}`,
    body: `Hi ${input.buyerName},

Thank you for your order on RenewCanvas Africa!

Order Details
-------------
Order ID: ${input.orderId}
Artwork: ${input.artworkTitle}
Artist: ${input.artistName}
Total: ${formattedTotal}
Payment Method: ${paymentLabel}

${paymentInstructions(input.paymentMethod, formattedTotal)}

You can track your order status at:
${siteUrl}/dashboard/buyer/orders

Questions? Reply to this email or visit ${siteUrl}/contact

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export function newOrderAlertEmail(input: NewOrderAlertInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const formattedAmount = formatCurrency(input.orderAmount, input.currency);

  return {
    subject: `New Order! "${input.artworkTitle}" has been purchased`,
    body: `Hi ${input.artistName},

Great news! Your artwork has been ordered.

Order Details
-------------
Order ID: ${input.orderId}
Artwork: ${input.artworkTitle}
Buyer: ${input.buyerName}
Amount: ${formattedAmount}

View order details and prepare for shipment:
${siteUrl}/dashboard/artist/orders

Once payment is confirmed, you'll be notified to prepare the artwork for delivery.

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export function artworkDecisionEmail(input: ArtworkDecisionInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  if (input.decision === "approved") {
    return {
      subject: `Artwork Approved: "${input.artworkTitle}" is now listed!`,
      body: `Hi ${input.artistName},

Your artwork "${input.artworkTitle}" has been approved and is now live on the RenewCanvas marketplace!

Buyers can now discover and purchase your artwork. Share it on social media to increase visibility.

View your artwork:
${siteUrl}/artwork/${input.artworkId}

Manage your listings:
${siteUrl}/dashboard/artist/artworks

${input.adminNote ? `Note from reviewer:\n${input.adminNote}\n` : ""}
---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
    };
  }

  if (input.decision === "rejected") {
    return {
      subject: `Artwork Review: "${input.artworkTitle}" needs revision`,
      body: `Hi ${input.artistName},

Thank you for submitting "${input.artworkTitle}" to RenewCanvas.

After review, we were unable to approve this submission in its current form.

${input.adminNote ? `Reviewer feedback:\n${input.adminNote}\n` : ""}
You can update the artwork and resubmit for review:
${siteUrl}/dashboard/artist/artworks/${input.artworkId}

If you have questions about this decision, please contact us at ${siteUrl}/contact

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
    };
  }

  // more_info_requested
  return {
    subject: `Action Required: More info needed for "${input.artworkTitle}"`,
    body: `Hi ${input.artistName},

We're reviewing your artwork "${input.artworkTitle}" and need some additional information before we can complete the approval process.

${input.adminNote ? `What we need:\n${input.adminNote}\n` : "Please provide additional details about your artwork."}
Please submit the requested information here:
${siteUrl}/dashboard/artist/artworks/${input.artworkId}

Your submission will be reviewed again once you provide the requested information.

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export function passwordResetEmail(input: PasswordResetInput) {
  return {
    subject: "Reset your RenewCanvas password",
    body: `Hi ${input.userName},

We received a request to reset your password for your RenewCanvas Africa account.

Click the link below to set a new password:
${input.resetLink}

This link will expire in ${input.expiresInMinutes} minutes.

If you didn't request this, you can safely ignore this email. Your password will remain unchanged.

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

function formatCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  if (currency === "RWF") {
    return `${amount.toLocaleString("en-RW")} RWF`;
  }
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "momo":
      return "MTN Mobile Money";
    case "bank":
      return "Bank Transfer";
    case "card":
      return "Credit/Debit Card";
    default:
      return method;
  }
}

function paymentInstructions(method: string, formattedAmount: string): string {
  if (method === "momo") {
    return `To complete your payment via MTN Mobile Money:
1. Dial *182*8*1#
2. Select "Pay Bill"
3. Enter the merchant code provided in your dashboard
4. Confirm payment of ${formattedAmount}`;
  }

  if (method === "bank") {
    return `To complete your payment via Bank Transfer:
Please transfer ${formattedAmount} to:
Bank: Bank of Kigali
Account Name: RenewCanvas Africa Ltd
Account Number: [Check your order details]
Reference: Your Order ID above`;
  }

  return "Follow the payment instructions in your dashboard.";
}
