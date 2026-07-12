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
    <div style="background-color: #FFFDF5; padding: 40px 20px; min-height: 100%;">
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 3px solid #1E293B; border-radius: 16px; background-color: #ffffff; box-shadow: 6px 6px 0px 0px #1E293B;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1E293B; font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -0.5px;">
            <span style="background-color: #0070f3; color: #ffffff; padding: 2px 8px; border-radius: 4px; border: 2px solid #1E293B; margin-right: 4px;">T</span>TransitOps
          </h2>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1.5px; margin-top: 8px;">
            Smart Operations Engine
          </div>
        </div>
        <div style="border-top: 3px solid #1E293B; padding-top: 25px; margin-bottom: 25px;">
          <h3 style="color: #1E293B; font-size: 22px; font-weight: 900; text-transform: uppercase; margin-top: 0; letter-spacing: -0.5px;">Welcome, ${userName}!</h3>
          <p style="color: #1E293B; line-height: 1.6; font-size: 14px; font-weight: bold; margin-bottom: 16px;">Your corporate account on the TransitOps Platform is active.</p>
          <p style="color: #64748b; line-height: 1.6; font-size: 13px; font-weight: 500; margin-bottom: 24px;">You can now log in to manage fleet vehicles, assign available drivers, audit fuel card logs, and utilize our real-time AI Fleet Copilot tools.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://transitops-blond.vercel.app/login" style="background-color: #0070f3; color: #ffffff; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 28px; border: 2px solid #1E293B; border-radius: 6px; display: inline-block; text-transform: uppercase; box-shadow: 3px 3px 0px 0px #1E293B;">Access Console</a>
          </div>
        </div>
        <div style="border-top: 3px solid #1E293B; padding-top: 20px; text-align: center; color: #64748b; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          &copy; 2026 TransitOps Inc. All rights reserved.
        </div>
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
    <div style="background-color: #FFFDF5; padding: 40px 20px; min-height: 100%;">
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 3px solid #1E293B; border-radius: 16px; background-color: #ffffff; box-shadow: 6px 6px 0px 0px #1E293B;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1E293B; font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -0.5px;">
            <span style="background-color: #0070f3; color: #ffffff; padding: 2px 8px; border-radius: 4px; border: 2px solid #1E293B; margin-right: 4px;">T</span>TransitOps
          </h2>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1.5px; margin-top: 8px;">
            Trip Dispatch Assignment
          </div>
        </div>
        
        <div style="border-top: 3px solid #1E293B; padding-top: 25px; margin-bottom: 25px;">
          <h3 style="color: #1E293B; font-size: 20px; font-weight: 900; text-transform: uppercase; margin-top: 0; letter-spacing: -0.5px;">Hello, ${driver.name}!</h3>
          <p style="color: #1E293B; line-height: 1.6; font-size: 14px; font-weight: bold; margin-bottom: 20px;">You have been assigned to a new operational trip dispatch.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #ffffff; border-radius: 8px; border: 3px solid #1E293B; box-shadow: 4px 4px 0px 0px #1E293B; overflow: hidden;">
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; width: 40%; text-transform: uppercase;">Trip ID</td>
              <td style="padding: 14px 16px; font-size: 13px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: 900; color: #1E293B; border-bottom: 2px solid #1E293B;">${trip.id}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; text-transform: uppercase;">Route Path</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #0070f3; border-bottom: 2px solid #1E293B; text-transform: uppercase;">${trip.source} ➔ ${trip.destination}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; text-transform: uppercase;">Assigned Truck</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B; border-bottom: 2px solid #1E293B;">${vehicle.name} (${vehicle.reg})</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; text-transform: uppercase;">Cargo Load</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B; border-bottom: 2px solid #1E293B;">${trip.weight} Tons</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; text-transform: uppercase;">Planned Dist</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B;">${trip.distance} KM</td>
            </tr>
          </table>
          
          <p style="color: #64748b; line-height: 1.6; font-size: 12px; font-style: italic; font-weight: bold; margin-top: 24px;">Note: Please adhere to cargo speed limits and safety guidelines during transit operations.</p>
        </div>
        
        <div style="border-top: 3px solid #1E293B; padding-top: 20px; text-align: center; color: #64748b; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          &copy; 2026 TransitOps Inc. All rights reserved.
        </div>
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
    <div style="background-color: #FFFDF5; padding: 40px 20px; min-height: 100%;">
      <div style="font-family: 'Outfit', 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 3px solid #1E293B; border-radius: 16px; background-color: #ffffff; box-shadow: 6px 6px 0px 0px #1E293B;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1E293B; font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -0.5px;">
            <span style="background-color: #0070f3; color: #ffffff; padding: 2px 8px; border-radius: 4px; border: 2px solid #1E293B; margin-right: 4px;">T</span>TransitOps
          </h2>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1.5px; margin-top: 8px;">
            Transit Update
          </div>
        </div>
        
        <div style="border-top: 3px solid #1E293B; padding-top: 25px; margin-bottom: 25px;">
          <h3 style="color: #1E293B; font-size: 20px; font-weight: 900; text-transform: uppercase; margin-top: 0; letter-spacing: -0.5px;">Hello, ${driver.name}!</h3>
          <p style="color: #1E293B; line-height: 1.6; font-size: 14px; font-weight: bold; margin-bottom: 20px;">The status of your active trip dispatch has changed:</p>
          
          <div style="background-color: ${statusColor}; border: 3px solid #1E293B; color: ${status === 'completed' || status === 'in_transit' ? '#1E293B' : '#ffffff'}; padding: 16px; margin: 24px 0; border-radius: 8px; box-shadow: 4px 4px 0px 0px #1E293B;">
            <span style="font-size: 9px; font-weight: 900; color: inherit; opacity: 0.8; text-transform: uppercase; display: block; font-family: 'JetBrains Mono', 'Courier New', monospace; letter-spacing: 1px; margin-bottom: 4px;">NEW TRIP STATUS</span>
            <span style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">${status.replace('_', ' ')}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #ffffff; border-radius: 8px; border: 3px solid #1E293B; box-shadow: 4px 4px 0px 0px #1E293B; overflow: hidden;">
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; width: 40%; text-transform: uppercase;">Trip ID</td>
              <td style="padding: 14px 16px; font-size: 13px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: 900; color: #1E293B; border-bottom: 2px solid #1E293B;">${trip.id}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: 2px solid #1E293B; text-transform: uppercase;">Route Path</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B; border-bottom: 2px solid #1E293B; text-transform: uppercase;">${trip.source} ➔ ${trip.destination}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: ${status === 'completed' ? '2px solid #1E293B' : 'none'}; text-transform: uppercase;">Vehicle Assigned</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B; border-bottom: ${status === 'completed' ? '2px solid #1E293B' : 'none'};">${vehicle.name} (${vehicle.reg})</td>
            </tr>
            ${status === 'completed' && trip.actualDistance ? `
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; border-bottom: ${trip.actualFuelCost ? '2px solid #1E293B' : 'none'}; text-transform: uppercase;">Actual Distance</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #1E293B; border-bottom: ${trip.actualFuelCost ? '2px solid #1E293B' : 'none'};">${trip.actualDistance} KM</td>
            </tr>
            ` : ''}
            ${status === 'completed' && trip.actualFuelCost ? `
            <tr>
              <td style="padding: 14px 16px; font-size: 12px; font-family: 'JetBrains Mono', 'Courier New', monospace; font-weight: bold; color: #64748b; text-transform: uppercase;">Actual Fuel Cost</td>
              <td style="padding: 14px 16px; font-size: 13px; font-weight: 900; color: #10b981;">₹${trip.actualFuelCost.toLocaleString()}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="border-top: 3px solid #1E293B; padding-top: 20px; text-align: center; color: #64748b; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          &copy; 2026 TransitOps Inc. All rights reserved.
        </div>
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
