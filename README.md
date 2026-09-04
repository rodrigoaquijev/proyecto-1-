# Camila y Rodrigo · 21 de noviembre de 2026

Invitación estática en español. El contenido está en `index.html`, la presentación en `styles.css` y las interacciones en `app.js`.

## Desarrollo

Servir la carpeta con un servidor HTTP local. `npm run build` valida enlaces internos, etiquetas, regalos y sintaxis, y copia los cuatro archivos públicos a `dist`. `npm test` comprueba el flujo de confirmación con respuestas simuladas, sin enviar correos.

## Contenido y funcionamiento

- Programa: civil 09:00, ceremonia 11:00, almuerzo 13:00, hora de Lima. El calendario descargable contiene los tres momentos, sin inventar horas de finalización.
- Regalos: 12 disponibles y una mandolina ya regalada. La disponibilidad se actualiza manualmente en el HTML. WhatsApp inicia una coordinación; no crea una reserva automática.
- Cuentas: se conservan deliberadamente los números de ejemplo, también al copiarlos. Actualizar cuentas y titular en `index.html` cuando se reciban los definitivos.
- Confirmación: una respuesta por invitado. Sin acompañantes libres ni cupos inventados. Los momentos indicados siguen sujetos a la invitación de cada persona.
- FormSubmit mantiene el destinatario del proyecto original. El éxito requiere respuesta positiva del servicio; un error conserva los datos y ofrece WhatsApp. Falta validar una entrega real y la activación del destinatario antes de distribuir la invitación.
- No se guarda información de invitados en el navegador. Solo se recuerda localmente la apertura de la invitación.
- Sin fotografías genéricas. La personalización por nombre requiere la lista real de invitados. Direcciones, accesos, traslados y alcance del código de vestimenta requieren confirmación de los novios.

La configuración de Sites está en `.openai/hosting.json`. Solo se empaquetan archivos públicos, nunca el proyecto completo.
