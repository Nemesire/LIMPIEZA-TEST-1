
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  /**
   * Genera un reporte corto de limpieza.
   */
  async generateCleaningReport(tasks: any[], inventory: any[]) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const lowStock = inventory.filter(i => i.stock < i.minStock).map(i => i.name).join(', ');
      const completedCount = tasks.filter(t => t.isCompleted).length;

      const prompt = `Resume el estado de limpieza actual. 
      Tareas completadas: ${completedCount}/${tasks.length}. 
      Productos con bajo stock: ${lowStock}.
      Genera un párrafo corto y profesional para el anfitrión en español.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "No se pudo generar el reporte automático.";
    }
  }

  /**
   * Procesa una captura de pantalla de Airbnb/Booking y extrae las reservas con máximo rigor.
   */
  async parseReservationsFromImage(base64Image: string, propertyList: string[]) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const currentYear = new Date().getFullYear();
      
      const prompt = `ACTÚA COMO UN EXPERTO EN LOGÍSTICA HOTELERA Y RECEPCIÓN. 
      Analiza esta captura de pantalla de reservas (Airbnb, Booking o similar). 
      
      LISTA DE PROPIEDADES EN EL SISTEMA (Mapea los datos a estos nombres):
      ${propertyList.join(', ')}

      REGLAS CRÍTICAS DE EXTRACCIÓN:
      1. Extrae CADA reserva visible en la tabla. El rigor es vital: no puedes omitir ninguna.
      2. guestName: Nombre completo del huésped.
      3. guestCount: Número de personas.
      4. checkIn / checkOut: Fechas en formato YYYY-MM-DD. 
         - Si la imagen dice "Hoy", usa la fecha actual.
         - Si no hay año (ej: "23 nov"), asume el año ${currentYear}.
      5. propertyName: Identifica a cuál de las propiedades de la lista superior pertenece la reserva.
      6. reservationCode: El código identificador (ej: HM..., CONF...).
      
      Ignora las reservas que tengan un estado explícito de "Cancelada".
      
      RESPUESTA: Devuelve EXCLUSIVAMENTE un array JSON puro. Sin explicaciones ni bloques de código Markdown.`;

      const imagePart = {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image.split(',')[1] || base64Image,
        },
      };

      // Usamos gemini-3-flash-preview para razonamiento multimodal superior
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: prompt }] }
      });

      const responseText = response.text || "";
      
      // Limpiar posibles residuos de texto del modelo
      const jsonStart = responseText.indexOf('[');
      const jsonEnd = responseText.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("La IA no pudo estructurar los datos. Asegúrate de que la captura sea legible.");
      }

      const cleanJson = responseText.substring(jsonStart, jsonEnd);

      try {
        const parsed = JSON.parse(cleanJson);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error("JSON Parse Error:", cleanJson);
        throw new Error("Formato de datos corrupto. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Gemini Vision Error:", error);
      throw new Error(error instanceof Error ? error.message : "Error desconocido al procesar la imagen.");
    }
  }
}

export const geminiService = new GeminiService();
