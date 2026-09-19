/**
 * AfyaConnect Notification & Multi-Channel Dispatch Service
 * Manages SMS, WhatsApp, and USSD (*384#) communications for Kenyan healthcare access.
 */

export interface DispatchedNotification {
  id: string;
  recipientPhone: string;
  channel: 'SMS' | 'WHATSAPP' | 'USSD' | 'IN_APP';
  message: string;
  tokenPass?: string;
  dispatchedAt: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
}

export const DISPATCH_LOG: DispatchedNotification[] = [];

export function dispatchAppointmentConfirmedNotification(
  phone: string,
  doctorName: string,
  hospitalName: string,
  slotTime: string,
  tokenPass: string
): DispatchedNotification {
  const message = `[AfyaConnect] Habari! Miadi yako imethibitishwa na ${doctorName} katika ${hospitalName} kwa wakati wa ${slotTime}. Token yako ya geti: ${tokenPass}. Fika dakika 15 mapema ukiwa na kitambulisho chako cha SHA/National ID. Piga 1199 kwa dharura.`;

  const notification: DispatchedNotification = {
    id: `notif-${Date.now()}`,
    recipientPhone: phone,
    channel: 'SMS',
    message,
    tokenPass,
    dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'DELIVERED',
  };

  DISPATCH_LOG.unshift(notification);
  return notification;
}

export function dispatchAppointmentProposalNotification(
  phone: string,
  doctorName: string,
  slotTime: string
): DispatchedNotification {
  const message = `[AfyaConnect] Daktari ${doctorName} anapatikana ${slotTime}. Bonyeza kiungo kwenye ujumbe kuthibitisha nafasi hii au piga *384# kuikubali bure.`;

  const notification: DispatchedNotification = {
    id: `notif-${Date.now()}`,
    recipientPhone: phone,
    channel: 'SMS',
    message,
    dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'DELIVERED',
  };

  DISPATCH_LOG.unshift(notification);
  return notification;
}
