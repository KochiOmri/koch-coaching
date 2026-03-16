export interface WhatsAppAppointment {
  name: string;
  date: string;
  time: string;
  service?: string;
  meetLink?: string;
}

function formatPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "").replace(/^0/, "972");
}

export function sendWhatsAppMessage(phone: string, message: string): string {
  const cleaned = formatPhone(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export function generateReminderMessage(apt: WhatsAppAppointment): string {
  const date = new Date(apt.date + "T00:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return `Hi ${apt.name}! 🏋️ This is a reminder that your ${apt.service || "session"} is tomorrow at ${apt.time}. Location: KOCH Functional Patterns Studio. See you there!`;
}

export function generateFollowUpMessage(apt: WhatsAppAppointment): string {
  return `Hi ${apt.name}! 💪 How are you feeling after your session? Remember to practice the exercises we worked on. Book your next session: https://koch-fp.com/#booking`;
}

export function generateConfirmationMessage(apt: WhatsAppAppointment): string {
  const date = new Date(apt.date + "T00:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  let msg = `✅ Your ${apt.service || "session"} on ${formatted} at ${apt.time} has been confirmed!`;
  if (apt.meetLink) {
    msg += ` Join online: ${apt.meetLink}`;
  }
  return msg;
}

export function generateWelcomeMessage(name: string): string {
  return `Hi ${name}! 👋 Welcome to KOCH Functional Patterns. We're excited to help you move better and feel stronger. If you have any questions before your session, feel free to reach out!`;
}
