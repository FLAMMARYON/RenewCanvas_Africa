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

// ============================================================================
// Admin Notification Templates
// ============================================================================

export type ContactFormEmailInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: "contact_form" | "artist_application" | "partnership_inquiry" | "waste_supply_request";
  siteUrl?: string;
};

export function contactFormEmail(input: ContactFormEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const typeLabels: Record<string, string> = {
    contact_form: "Contact Form Submission",
    artist_application: "Artist Application",
    partnership_inquiry: "Partnership Inquiry",
    waste_supply_request: "Waste Supply Request",
  };
  const typeLabel = typeLabels[input.type] || "Message";

  return {
    subject: `[RenewCanvas] New ${typeLabel}: ${input.subject || "No Subject"}`,
    body: `New ${typeLabel} received on RenewCanvas Africa.

Sender Details
--------------
Name: ${input.name}
Email: ${input.email}
${input.phone ? `Phone: ${input.phone}` : ""}

${input.subject ? `Subject: ${input.subject}` : ""}

Message
-------
${input.message}

---
View and respond to this message:
${siteUrl}/dashboard/admin/messages

---
RenewCanvas Africa Admin Notification
`,
  };
}

export type ArtistApplicationEmailInput = {
  artistName: string;
  email: string;
  phone?: string;
  portfolio?: string;
  experience: string;
  motivation: string;
  siteUrl?: string;
};

export function artistApplicationEmail(input: ArtistApplicationEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  return {
    subject: `[RenewCanvas] New Artist Application: ${input.artistName}`,
    body: `A new artist has applied to join RenewCanvas Africa.

Applicant Details
-----------------
Name: ${input.artistName}
Email: ${input.email}
${input.phone ? `Phone: ${input.phone}` : ""}
${input.portfolio ? `Portfolio: ${input.portfolio}` : ""}

Experience
----------
${input.experience}

Why They Want to Join
---------------------
${input.motivation}

---
Review this application:
${siteUrl}/dashboard/admin/artists

---
RenewCanvas Africa Admin Notification
`,
  };
}

export type CommissionRequestEmailInput = {
  buyerName: string;
  buyerEmail: string;
  artistName: string;
  description: string;
  budget?: string;
  deadline?: string;
  siteUrl?: string;
};

export function commissionRequestEmail(input: CommissionRequestEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  return {
    subject: `[RenewCanvas] New Commission Request for ${input.artistName}`,
    body: `A new commission request has been submitted.

Buyer Details
-------------
Name: ${input.buyerName}
Email: ${input.buyerEmail}

Requested Artist: ${input.artistName}

Commission Details
------------------
${input.description}

${input.budget ? `Budget: ${input.budget}` : ""}
${input.deadline ? `Deadline: ${input.deadline}` : ""}

---
Review this commission:
${siteUrl}/dashboard/admin/commissions

---
RenewCanvas Africa Admin Notification
`,
  };
}

export type OrderAwaitingDeliveryEmailInput = {
  orderId: string;
  buyerName: string;
  artistName: string;
  artworkTitle: string;
  daysSincePaid: number;
  siteUrl?: string;
};

export function orderAwaitingDeliveryEmail(input: OrderAwaitingDeliveryEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  return {
    subject: `[RenewCanvas] Order ${input.orderId} awaiting delivery (${input.daysSincePaid} days)`,
    body: `An order has been paid but not yet delivered.

Order Details
-------------
Order ID: ${input.orderId}
Artwork: ${input.artworkTitle}
Artist: ${input.artistName}
Buyer: ${input.buyerName}
Days Since Payment: ${input.daysSincePaid}

Action Required
---------------
Please follow up with the artist to ensure timely delivery.

---
View order details:
${siteUrl}/dashboard/admin/orders

---
RenewCanvas Africa Admin Notification
`,
  };
}

// ============================================================================
// Artist Notification Templates
// ============================================================================

export type PayoutProcessedEmailInput = {
  artistName: string;
  payoutAmount: number;
  currency: string;
  payoutMethod: string;
  referenceNumber?: string;
  siteUrl?: string;
};

export function payoutProcessedEmail(input: PayoutProcessedEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const formattedAmount = formatCurrency(input.payoutAmount, input.currency);
  const methodLabel = input.payoutMethod === "momo" ? "MTN Mobile Money" :
                      input.payoutMethod === "bank" ? "Bank Transfer" : input.payoutMethod;

  return {
    subject: `[RenewCanvas] Payout Processed: ${formattedAmount}`,
    body: `Hi ${input.artistName},

Great news! Your payout has been processed.

Payout Details
--------------
Amount: ${formattedAmount}
Method: ${methodLabel}
${input.referenceNumber ? `Reference: ${input.referenceNumber}` : ""}

The funds should arrive in your account within 1-3 business days depending on your provider.

View your earnings and payout history:
${siteUrl}/dashboard/artist/analytics

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export type CommissionRequestArtistEmailInput = {
  artistName: string;
  buyerName: string;
  description: string;
  budget?: string;
  deadline?: string;
  siteUrl?: string;
};

export function commissionRequestArtistEmail(input: CommissionRequestArtistEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  return {
    subject: `[RenewCanvas] New Commission Request from ${input.buyerName}`,
    body: `Hi ${input.artistName},

You have a new commission request!

Buyer: ${input.buyerName}

Request Details
---------------
${input.description}

${input.budget ? `Budget: ${input.budget}` : ""}
${input.deadline ? `Deadline: ${input.deadline}` : ""}

---
Review and respond to this request:
${siteUrl}/dashboard/artist/commissions

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

// ============================================================================
// User Notification Templates
// ============================================================================

export type WelcomeEmailInput = {
  userName: string;
  role: "buyer" | "artist";
  siteUrl?: string;
};

export function welcomeEmail(input: WelcomeEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const dashboardPath = input.role === "artist"
    ? "/dashboard/artist"
    : "/dashboard/buyer";

  const roleSpecificContent = input.role === "artist"
    ? `As an artist on RenewCanvas, you can:
- List your upcycled artworks for sale
- Receive commission requests from buyers
- Track your sales and earnings
- Access recycled materials for your creations

Get started by completing your artist profile and uploading your first artwork.`
    : `As a buyer on RenewCanvas, you can:
- Discover unique artworks made from recycled materials
- Support African artists directly
- Track the environmental impact of your purchases
- Request custom commissions

Start exploring our marketplace to find your perfect piece.`;

  return {
    subject: `Welcome to RenewCanvas Africa, ${input.userName}!`,
    body: `Hi ${input.userName},

Welcome to RenewCanvas Africa! We're excited to have you join our community of art lovers and environmental advocates.

${roleSpecificContent}

---
Go to your dashboard:
${siteUrl}${dashboardPath}

Browse the marketplace:
${siteUrl}/marketplace

Learn about our impact:
${siteUrl}/impact

---
Questions? Contact us at ${siteUrl}/contact

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export type ShipmentUpdateEmailInput = {
  buyerName: string;
  orderId: string;
  artworkTitle: string;
  status: "shipped" | "out_for_delivery" | "delivered";
  trackingNumber?: string;
  estimatedDelivery?: string;
  siteUrl?: string;
};

export function shipmentUpdateEmail(input: ShipmentUpdateEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";

  const statusMessages = {
    shipped: "Your order has been shipped and is on its way!",
    out_for_delivery: "Your order is out for delivery today!",
    delivered: "Your order has been delivered. We hope you love your new artwork!",
  };

  return {
    subject: `[RenewCanvas] Order ${input.orderId} - ${input.status === "delivered" ? "Delivered!" : "Shipping Update"}`,
    body: `Hi ${input.buyerName},

${statusMessages[input.status]}

Order Details
-------------
Order ID: ${input.orderId}
Artwork: ${input.artworkTitle}
${input.trackingNumber ? `Tracking Number: ${input.trackingNumber}` : ""}
${input.estimatedDelivery ? `Estimated Delivery: ${input.estimatedDelivery}` : ""}

---
Track your order:
${siteUrl}/dashboard/buyer/orders

${input.status === "delivered" ? `
We'd love to hear about your experience! Leave a review on the artwork page to help other buyers and support the artist.
` : ""}
---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}

export type AuctionUpdateEmailInput = {
  userName: string;
  artworkTitle: string;
  auctionId: string;
  updateType: "outbid" | "won" | "ended_no_bids" | "ending_soon";
  currentBid?: number;
  yourBid?: number;
  currency?: string;
  endsAt?: string;
  siteUrl?: string;
};

export function auctionUpdateEmail(input: AuctionUpdateEmailInput) {
  const siteUrl = input.siteUrl || "https://renewcanvas.africa";
  const currency = input.currency || "RWF";

  let subject: string;
  let body: string;

  switch (input.updateType) {
    case "outbid":
      subject = `[RenewCanvas] You've been outbid on "${input.artworkTitle}"`;
      body = `Hi ${input.userName},

Someone has placed a higher bid on "${input.artworkTitle}".

Current highest bid: ${formatCurrency(input.currentBid || 0, currency)}
Your bid: ${formatCurrency(input.yourBid || 0, currency)}

Don't let this one get away! Place a new bid now:
${siteUrl}/auctions/${input.auctionId}`;
      break;

    case "won":
      subject = `[RenewCanvas] Congratulations! You won "${input.artworkTitle}"`;
      body = `Hi ${input.userName},

Congratulations! You've won the auction for "${input.artworkTitle}"!

Winning bid: ${formatCurrency(input.currentBid || 0, currency)}

Complete your purchase to claim this beautiful piece:
${siteUrl}/checkout?auction=${input.auctionId}`;
      break;

    case "ending_soon":
      subject = `[RenewCanvas] Auction ending soon: "${input.artworkTitle}"`;
      body = `Hi ${input.userName},

The auction for "${input.artworkTitle}" is ending soon!

Current bid: ${formatCurrency(input.currentBid || 0, currency)}
${input.endsAt ? `Ends: ${input.endsAt}` : ""}

Place your bid before it's too late:
${siteUrl}/auctions/${input.auctionId}`;
      break;

    default:
      subject = `[RenewCanvas] Auction update for "${input.artworkTitle}"`;
      body = `Hi ${input.userName},

There's an update on the auction for "${input.artworkTitle}".

View auction details:
${siteUrl}/auctions/${input.auctionId}`;
  }

  return {
    subject,
    body: `${body}

---
RenewCanvas Africa
Transforming Plastic Waste into Sustainable Creative Value
`,
  };
}
