import { requireBackendConfig } from "./config";
import type { NotificationChannel } from "./notifications";

export type MessageRequest = {
  channel: NotificationChannel;
  to?: string;
  subject?: string | null;
  body: string;
};

export type MessageResult = {
  status: "sent" | "failed" | "skipped";
  providerReference?: string;
  errorMessage?: string;
};

export type MessagingProviderClient = {
  send(input: MessageRequest): Promise<MessageResult>;
};

export function createMessagingProviderClient(): MessagingProviderClient {
  return new RuntimeMessagingProviderClient();
}

class RuntimeMessagingProviderClient implements MessagingProviderClient {
  async send(input: MessageRequest): Promise<MessageResult> {
    if (input.channel === "in_app") return { status: "sent", providerReference: "in_app" };
    if (!input.to) return { status: "failed", errorMessage: "Recipient address is required." };
    if (input.channel === "email") return sendResendEmail(input);
    if (input.channel === "sms" || input.channel === "whatsapp") return sendTwilioMessage(input);
    return { status: "skipped", errorMessage: "Unsupported notification channel." };
  }
}

async function sendResendEmail(input: MessageRequest): Promise<MessageResult> {
  const config = requireBackendConfig();
  if (!config.resendApiKey || !config.emailFrom) {
    return { status: "failed", errorMessage: "RESEND_API_KEY and EMAIL_FROM are required for email sending." };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: input.to,
      subject: input.subject ?? "RenewCanvas Africa",
      text: input.body,
    }),
  });
  const body = (await response.json()) as { id?: string; message?: string };
  if (!response.ok) return { status: "failed", errorMessage: body.message ?? "Email provider rejected the message." };
  return { status: "sent", providerReference: body.id };
}

async function sendTwilioMessage(input: MessageRequest): Promise<MessageResult> {
  const config = requireBackendConfig();
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioMessagingServiceSid) {
    return { status: "failed", errorMessage: "Twilio credentials are required for SMS and WhatsApp sending." };
  }
  const to = input.channel === "whatsapp" && !input.to?.startsWith("whatsapp:") ? `whatsapp:${input.to}` : input.to;
  const auth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString("base64");
  const form = new URLSearchParams({
    To: to ?? "",
    MessagingServiceSid: config.twilioMessagingServiceSid,
    Body: input.body,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const body = (await response.json()) as { sid?: string; message?: string };
  if (!response.ok) return { status: "failed", errorMessage: body.message ?? "Messaging provider rejected the message." };
  return { status: "sent", providerReference: body.sid };
}

/**
 * Convenience function to send an email directly.
 * Used by API routes that need to send emails without going through the notification queue.
 */
export async function sendEmail(input: { to: string; subject: string; body: string }): Promise<MessageResult> {
  const client = createMessagingProviderClient();
  return client.send({
    channel: "email",
    to: input.to,
    subject: input.subject,
    body: input.body,
  });
}
