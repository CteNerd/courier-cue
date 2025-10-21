// Email helpers using SES
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({ region: process.env.REGION || 'us-east-1' });

const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@couriercue.app';

interface SendReceiptEmailParams {
  to: string;
  cc?: string[];
  orgName: string;
  loadId: string;
  shipperName: string;
  driverName: string;
  signedAt: string;
  receiptUrl: string;
  emailFrom?: string;
}

/**
 * Send delivery receipt email to shipper
 */
export async function sendReceiptEmail(params: SendReceiptEmailParams): Promise<void> {
  const {
    to,
    cc = [],
    orgName,
    loadId,
    shipperName,
    driverName,
    signedAt,
    receiptUrl,
    emailFrom = DEFAULT_FROM,
  } = params;

  const signedDate = new Date(signedAt);
  const formattedDate = signedDate.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Receipt</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 10px 0; color: #2c3e50;">Delivery Receipt</h2>
    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">${orgName}</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 15px 0;">Dear ${shipperName},</p>
    
    <p style="margin: 0 0 15px 0;">
      This email confirms that your delivery (Load ID: <strong>${loadId}</strong>) was successfully completed on ${formattedDate}.
    </p>
    
    <p style="margin: 0 0 15px 0;">
      <strong>Driver:</strong> ${driverName}
    </p>
    
    <div style="margin: 20px 0;">
      <a href="${receiptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">View Receipt</a>
    </div>
    
    <p style="margin: 20px 0 0 0; color: #7f8c8d; font-size: 12px;">
      Please retain this receipt for your records. If you have any questions, please contact ${orgName}.
    </p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #95a5a6; font-size: 12px;">
    <p style="margin: 0;">This is an automated message from ${orgName} via CourierCue.</p>
    <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Delivery Receipt - ${orgName}

Dear ${shipperName},

This email confirms that your delivery (Load ID: ${loadId}) was successfully completed on ${formattedDate}.

Driver: ${driverName}

View your receipt: ${receiptUrl}

Please retain this receipt for your records. If you have any questions, please contact ${orgName}.

---
This is an automated message from ${orgName} via CourierCue.
Please do not reply to this email.
  `.trim();

  const command = new SendEmailCommand({
    Source: emailFrom,
    Destination: {
      ToAddresses: [to],
      CcAddresses: cc.length > 0 ? cc : undefined,
    },
    Message: {
      Subject: {
        Data: `Delivery Receipt - Load ${loadId}`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await client.send(command);
    console.log(`Receipt email sent to ${to} for load ${loadId}`);
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    throw new Error('Failed to send receipt email');
  }
}

interface SendInviteEmailParams {
  to: string;
  displayName: string;
  orgName: string;
  temporaryPassword: string;
  loginUrl: string;
  emailFrom?: string;
}

/**
 * Send user invite email
 */
export async function sendInviteEmail(params: SendInviteEmailParams): Promise<void> {
  const { to, displayName, orgName, temporaryPassword, loginUrl, emailFrom = DEFAULT_FROM } =
    params;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CourierCue</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin: 0 0 10px 0; color: #2c3e50;">Welcome to CourierCue</h2>
    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">${orgName}</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 15px 0;">Hello ${displayName},</p>
    
    <p style="margin: 0 0 15px 0;">
      You have been invited to join <strong>${orgName}</strong> on CourierCue. Use the credentials below to log in:
    </p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${to}</p>
      <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${temporaryPassword}</code></p>
    </div>
    
    <p style="margin: 0 0 15px 0; color: #e74c3c; font-size: 14px;">
      ⚠️ You will be required to change your password on first login.
    </p>
    
    <div style="margin: 20px 0;">
      <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to CourierCue</a>
    </div>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #95a5a6; font-size: 12px;">
    <p style="margin: 0;">If you did not expect this invitation, please ignore this email.</p>
  </div>
</body>
</html>
  `.trim();

  const textBody = `
Welcome to CourierCue - ${orgName}

Hello ${displayName},

You have been invited to join ${orgName} on CourierCue. Use the credentials below to log in:

Email: ${to}
Temporary Password: ${temporaryPassword}

⚠️ You will be required to change your password on first login.

Login here: ${loginUrl}

If you did not expect this invitation, please ignore this email.
  `.trim();

  const command = new SendEmailCommand({
    Source: emailFrom,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: `Welcome to ${orgName} on CourierCue`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await client.send(command);
    console.log(`Invite email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send invite email:', error);
    throw new Error('Failed to send invite email');
  }
}
