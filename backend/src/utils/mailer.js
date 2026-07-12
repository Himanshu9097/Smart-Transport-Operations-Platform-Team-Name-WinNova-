const nodemailer = require('nodemailer');

// Initialize SMTP transporter using Gmail App Password
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Mailer Warning: EMAIL_USER or GMAIL_APP_PASSWORD environment variables not set. Emails will log to console.');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

/**
 * Send a generic HTML Email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const from = `TransitOps Platform <${process.env.EMAIL_USER || 'no-reply@transitops.com'}>`;

  if (!transporter) {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    console.log(`Text Body: ${text}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failure to ${to}:`, error.message);
  }
};

/**
 * Send Registration Confirmation Email
 */
const sendRegisterEmail = async (userEmail, userName) => {
  const subject = 'Welcome to TransitOps - Account Activated 🚀';
  const text = `Hello ${userName},\n\nYour operator account on the TransitOps Smart Transport Operations Platform has been successfully registered and activated. You can now access the dispatch console.\n\nBest regards,\nTransitOps Team`;
  
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #7C3AED; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: 1px;">TransitOps</h2>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 2px;">Smart Operations Engine</span>
      </div>
      <div style="border-top: 2px solid #7C3AED; padding-top: 25px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; font-size: 20px; font-weight: bold; margin-top: 0;">Welcome, ${userName}!</h3>
        <p style="color: #475569; line-height: 1.6; font-size: 14px;">Your corporate account on the **TransitOps Platform** is active.</p>
        <p style="color: #475569; line-height: 1.6; font-size: 14px;">You can now log in to manage fleet vehicles, assign available drivers, log fuel logs, and utilize our AI Fleet Copilot tool.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://transitops-blond.vercel.app/login" style="background-color: #7C3AED; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 30px; rounded: 12px; border-radius: 12px; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3);">Access Console</a>
        </div>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold;">
        &copy; 2026 TransitOps Inc. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Send Trip Created / Dispatched Email
 */
const sendTripCreatedEmail = async (trip, driver, vehicle) => {
  if (!driver || !driver.email) return;

  const subject = `New Trip Assigned: ${trip.id} [${trip.source} ➔ ${trip.destination}] 🚛`;
  const text = `Hello ${driver.name},\n\nYou have been assigned to Trip ${trip.id}.\nSource: ${trip.source}\nDestination: ${trip.destination}\nVehicle: ${vehicle.name} (${vehicle.reg})\nCargo Weight: ${trip.weight} Tons\nPlanned Distance: ${trip.distance} KM\n\nPlease log in to review and coordinate dispatch.`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #7C3AED; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: 1px;">TransitOps</h2>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 2px;">Trip Dispatch Assignment</span>
      </div>
      <div style="border-top: 2px solid #7C3AED; padding-top: 25px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: bold; margin-top: 0;">Hello, ${driver.name}!</h3>
        <p style="color: #475569; line-height: 1.6; font-size: 14px;">You have been assigned to a new operational trip log.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Trip Reference ID</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${trip.id}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Route Path</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #7C3AED; border-bottom: 1px solid #e2e8f0;">${trip.source} ➔ ${trip.destination}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Assigned Truck</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${vehicle.name} (${vehicle.reg})</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Cargo Load</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${trip.weight} Tons</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b;">Planned Distance</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b;">${trip.distance} KM</td>
          </tr>
        </table>
        
        <p style="color: #475569; line-height: 1.6; font-size: 13px; font-style: italic;">Note: Keep safety parameters and cargo guidelines active at all times during the transit route.</p>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold;">
        &copy; 2026 TransitOps Inc. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail({ to: driver.email, subject, html, text });
};

/**
 * Send Trip Status Update Notification Email
 */
const sendTripStatusEmail = async (trip, driver, vehicle, status) => {
  if (!driver || !driver.email) return;

  const statusLabel = status === 'in_transit' ? 'In Transit ➔' : status === 'completed' ? 'Completed ✓' : status.toUpperCase();
  const subject = `Trip ${trip.id} Status Update: ${statusLabel}`;
  
  const text = `Hello ${driver.name},\n\nThe status of your Trip ${trip.id} has changed to: ${statusLabel}.\nRoute: ${trip.source} to ${trip.destination}\nVehicle: ${vehicle.name} (${vehicle.reg})\n\nSafe travels!\nTransitOps Platform`;

  const statusColor = status === 'completed' ? '#10B981' : status === 'in_transit' ? '#F59E0B' : '#7C3AED';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #7C3AED; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: 1px;">TransitOps</h2>
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 2px;">Transit Update</span>
      </div>
      <div style="border-top: 2px solid ${statusColor}; padding-top: 25px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: bold; margin-top: 0;">Hello, ${driver.name}!</h3>
        <p style="color: #475569; line-height: 1.6; font-size: 14px;">The status of your active trip dispatch has changed:</p>
        
        <div style="background-color: ${statusColor}10; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; display: block; font-family: monospace;">NEW TRIP STATUS</span>
          <span style="font-size: 18px; font-weight: 800; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.5px;">${status.replace('_', ' ')}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Trip Reference ID</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${trip.id}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Route Path</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${trip.source} ➔ ${trip.destination}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Vehicle Assigned</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${vehicle.name} (${vehicle.reg})</td>
          </tr>
          ${status === 'completed' && trip.actualDistance ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Actual Distance</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">${trip.actualDistance} KM</td>
          </tr>
          ` : ''}
          ${status === 'completed' && trip.actualFuelCost ? `
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #64748b;">Actual Fuel Cost</td>
            <td style="padding: 12px 16px; font-size: 13px; font-weight: bold; color: #10B981;">₹${trip.actualFuelCost.toLocaleString()}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold;">
        &copy; 2026 TransitOps Inc. All rights reserved.
      </div>
    </div>
  `;

  await sendEmail({ to: driver.email, subject, html, text });
};

module.exports = {
  sendRegisterEmail,
  sendTripCreatedEmail,
  sendTripStatusEmail
};
