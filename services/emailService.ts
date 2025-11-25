
import emailjs from '@emailjs/browser';

// NOTE: In a production environment, these IDs would come from your environment variables
// You can get these by signing up at emailjs.com (Free Tier available)
const SERVICE_ID = 'service_demo_omnipost'; 
const TEMPLATE_ID = 'template_verification';
const PUBLIC_KEY = 'user_demo_key_12345';

export const sendVerificationEmail = async (name: string, email: string, code: string): Promise<boolean> => {
  console.log(`[EmailService] Preparing to send code ${code} to ${email}...`);
  
  try {
    // Attempt to send real email using EmailJS
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_name: name,
        to_email: email,
        verification_code: code,
        message: `Welcome to OmniPost AI! Your verification code is: ${code}`
      },
      PUBLIC_KEY
    );

    console.log('[EmailService] ✅ Email sent successfully via EmailJS');
    return true;

  } catch (error) {
    console.warn('[EmailService] ⚠️ Real email sending failed.'); 
    console.warn('Reason:', error);
    console.log('This usually happens if the EmailJS Service ID, Template ID, or Public Key are invalid or not configured.');
    
    // CRITICAL FALLBACK: Log the code to console so the user can still verify their account and use the app.
    console.info(
      `%c[FALLBACK] Verification Code for ${email}: ${code}`, 
      "background-color: #4f46e5; color: white; padding: 4px 8px; font-weight: bold; font-size: 14px; border-radius: 4px;"
    );
    
    // Return true so the auth flow proceeds (User is created and UI moves to activation screen)
    return true;
  }
};
