# Instrucciones para Versión Portable y Escalable

Has descargado el proyecto completo del Gestor de Propuestas Verisure. Este paquete incluye la **Versión Portable** que funciona con un solo clic.

## 1. Versión Portable (Doble Clic y Funciona)
Hemos generado un archivo especial que contiene toda la aplicación en un solo lugar.
- **Ubicación**: Busca el archivo llamado `VERISURE_APP_PORTABLE.html` dentro de la carpeta **`PORTABLE`**.
- **Uso**: Simplemente haz **doble clic** en el archivo. Se abrirá en tu navegador y funcionará de forma totalmente autónoma, sin necesidad de instalar nada ni tener conexión a un servidor (solo internet para la IA).
- **IA Rápida**: Hemos configurado por defecto el modelo `Gemini 3.1 Flash Lite`, que es la versión más ligera y rápida disponible para que las respuestas sean instantáneas.

## 2. Cómo cambiar a Microsoft Copilot
Si tu organización prefiere usar **Microsoft Copilot (Azure OpenAI)** en lugar de Gemini, sigue estos pasos técnicos:

1. **Modificar el Servicio de IA**:
   En el archivo `src/App.tsx`, localiza la función `generateAIText`.
2. **Reemplazar el SDK**:
   En lugar de `@google/genai`, deberás instalar y usar el SDK de Azure OpenAI:
   ```bash
   npm install @azure/openai
   ```
3. **Cambiar la lógica de llamada**:
   Sustituye la inicialización de Gemini por la de Azure:
   ```typescript
   const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
   const deploymentName = "tu-despliegue-copilot";
   const result = await client.getChatCompletions(deploymentName, messages);
   ```
4. **Power Automate (Alternativa sin código)**:
   La forma más fácil de usar Copilot es crear un flujo en Power Automate que use el conector "AI Builder" o "Azure OpenAI" y conectar esta App mediante una solicitud HTTP.

## 3. Integración con PowerApps / SharePoint
- **SharePoint**: Puedes subir el archivo `PORTABLE/VERISURE_APP_PORTABLE.html` a una biblioteca. Puedes renombrarlo a `propuesta.aspx` para que se ejecute como una página interna.
- **PowerApps**: Usa el control "Pantalla de HTML" o un "Iframe" apuntando a la dirección del archivo en SharePoint.

## 4. Automatización con Outlook (Carpeta `integrations/outlook`)
Si quieres que el envío sea automático al terminar la propuesta, revisa la carpeta `integrations/outlook` donde tienes el script listo para conectar con tu cuenta de Microsoft 365.

---
*Desarrollado para Verisure - Máxima velocidad y portabilidad.*
