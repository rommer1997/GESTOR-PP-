import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function sendEmail() {
  const tenantId = process.env.TENANT_ID!;
  const clientId = process.env.CLIENT_ID!;
  const clientSecret = process.env.CLIENT_SECRET!;
  const userEmail = process.env.USER_EMAIL!;

  // Argumentos de línea de comandos
  const args = process.argv.slice(2);
  const to = args.find(a => a.startsWith('--to='))?.split('=')[1];
  const subject = args.find(a => a.startsWith('--subject='))?.split('=')[1] || "Propuesta Verisure";
  const htmlPath = args.find(a => a.startsWith('--html='))?.split('=')[1];

  if (!to || !htmlPath) {
    console.error("Uso: npx tsx send_email.ts --to=email@ejemplo.com --html=propuesta.html");
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });

  const client = Client.initWithMiddleware({ authProvider });

  const sendMail = {
    message: {
      subject: subject,
      body: {
        contentType: "Html",
        content: htmlContent
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    },
    saveToSentItems: "true"
  };

  try {
    await client.api(`/users/${userEmail}/sendMail`).post(sendMail);
    console.log("✅ Email enviado con éxito a:", to);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
}

sendEmail();
