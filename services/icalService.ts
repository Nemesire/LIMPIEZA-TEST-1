
import { Reservation } from '../types';

export const icalService = {
  /**
   * Intenta obtener el calendario utilizando diferentes proxies para mayor fiabilidad.
   */
  async fetchWithProxy(url: string): Promise<string> {
    const proxies = [
      (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}&timestamp=${Date.now()}`,
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    ];

    let lastError: any = null;

    for (const proxyFn of proxies) {
      try {
        const proxyUrl = proxyFn(url);
        console.log(`[ICAL-SYNC] Intentando proxy: ${proxyUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) continue;
        
        const text = await response.text();
        if (text.includes('BEGIN:VCALENDAR')) {
          return text;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[ICAL-SYNC] Proxy fallido, intentando siguiente...`, err);
      }
    }

    throw lastError || new Error('Todos los proxies de sincronización fallaron');
  },

  /**
   * Obtiene y procesa el calendario real de Airbnb.
   */
  async syncLink(propertyId: string, icalLink: { id: string, url: string }): Promise<Reservation[]> {
    try {
      const icsText = await this.fetchWithProxy(icalLink.url);
      return this.parseICS(icsText, propertyId, icalLink.id);
    } catch (error) {
      console.error("[REAL-SYNC] Error definitivo en la sincronización:", error);
      return [];
    }
  },

  /**
   * Parser lógico que recorre el archivo .ics real
   */
  parseICS(icsText: string, propertyId: string, icalLinkId: string): Reservation[] {
    const reservations: Reservation[] = [];
    const events = icsText.split('BEGIN:VEVENT');
    
    for (let i = 1; i < events.length; i++) {
      const eventContent = events[i];
      
      const startMatch = eventContent.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
      const endMatch = eventContent.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);
      const summaryMatch = eventContent.match(/SUMMARY:(.*)/);
      const descriptionMatch = eventContent.match(/DESCRIPTION:(.*)/);

      if (startMatch && endMatch) {
        const s = startMatch[1];
        const e = endMatch[1];
        
        const checkIn = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
        const checkOut = `${e.substring(0, 4)}-${e.substring(4, 6)}-${e.substring(6, 8)}`;
        
        let guestName = 'Reserva Externa';
        let resCode = '';
        let phoneSuff = '';
        let guests = 1;
        let observations = '';

        if (summaryMatch) {
          const summary = summaryMatch[1].trim();
          guestName = summary
            .replace('Reserved - ', '')
            .replace('Airbnb (', '')
            .replace(')', '')
            .trim();
        }

        if (guestName.toUpperCase().includes('NOT AVAILABLE')) {
          guestName = 'BLOQUEO PROPIETARIO';
        }

        if (descriptionMatch) {
          const desc = descriptionMatch[1].replace(/\\n/g, '\n').replace(/\\/g, '');
          
          const codeRegex = /Reservation Code:\s*([A-Z0-9]+)/i;
          const codeMatch = desc.match(codeRegex);
          if (codeMatch) resCode = codeMatch[1];

          const phoneRegex = /Phone Number \(Last 4 Digits\):\s*(\d+)/i;
          const phoneMatch = desc.match(phoneRegex);
          if (phoneMatch) phoneSuff = phoneMatch[1];

          const guestRegex = /Number of Guests:\s*(\d+)/i;
          const guestMatch = desc.match(guestRegex);
          if (guestMatch) guests = parseInt(guestMatch[1], 10);

          observations = desc.split('\n')[0];
        }

        reservations.push({
          id: `real-${icalLinkId}-${s}-${i}`,
          propertyId,
          icalLinkId,
          guestName: guestName.toUpperCase(),
          checkIn,
          checkOut,
          status: 'upcoming',
          guestCount: guests,
          reservationCode: resCode,
          phoneSuffix: phoneSuff,
          observations: observations
        });
      }
    }

    return reservations;
  }
};
