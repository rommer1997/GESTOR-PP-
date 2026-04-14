# Integración con Outlook (Microsoft Graph)

Esta carpeta contiene lo necesario para enviar las propuestas generadas directamente desde una cuenta de Outlook utilizando la API de Microsoft Graph.

## Requisitos Previos

1. **Registro de Aplicación en Azure**:
   - Ve a [Azure Portal > Microsoft Entra ID > App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps).
   - Registra una nueva aplicación (ej: "Verisure Proposal Sender").
   - En **API Permissions**, añade `Mail.Send` (Delegated o Application).
   - Crea un **Client Secret**.

2. **Variables de Entorno**:
   Crea un archivo `.env` en esta carpeta con:
   ```env
   TENANT_ID=tu_tenant_id
   CLIENT_ID=tu_client_id
   CLIENT_SECRET=tu_client_secret
   USER_EMAIL=tu_email@outlook.com
   ```

## Instalación

```bash
npm install
```

## Uso

El script `send_email.ts` está diseñado para ser llamado desde un backend o integrado en un flujo de Power Automate.

```bash
npx tsx send_email.ts --to="cliente@ejemplo.com" --subject="Propuesta Verisure" --html="path/to/proposal.html"
```

## Integración con Power Automate (Recomendado)

Para una implementación más sencilla sin código:
1. Crea un **HTTP Trigger** en Power Automate.
2. Recibe el HTML de la propuesta.
3. Usa el conector de **Office 365 Outlook** -> "Send an email (V2)".
4. Pega el HTML en el cuerpo del mensaje.
