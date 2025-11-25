
import emailjs from '@emailjs/browser';

const STORAGE_KEY = 'omnipost_email_config';

// Default keys provided by user
const DEFAULT_CONFIG = {
  serviceId: 'service_demo_omnipost', // Note: You might need to update this to your specific Service ID (e.g., 'service_gmail')
  templateId: 'template_lb9y1pu',
  publicKey: '2g4ntCEQeQPWjMuJM'
};

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const getEmailConfig = (): EmailConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const saveEmailConfig = (config: EmailConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearEmailConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isEmailConfigured = (): boolean => {
  const config = getEmailConfig();
  // Consider configured if the key is not the old placeholder
  return config.publicKey !== 'user_demo_key_12345' && config.publicKey.length > 5;
};

export const sendVerificationEmail = async (name: string, email: string, code: string): Promise<boolean> => {
  const config = getEmailConfig();
  console.log(`[EmailService] Attempting to send code to ${email}...`);
  
  try {
    // Attempt to send real email using EmailJS
    await emailjs.send(
      config.serviceId,
      config.templateId,
      {
        to_name: name,
        to_email: email,
        verification_code: code,
        message: `Welcome to OmniPost AI! Your verification code is: ${code}`
      },
      config.publicKey
    );

    console.log('[EmailService] ✅ Email sent successfully via EmailJS');
    return true;

  } catch (error) {
    console.warn('[EmailService] ⚠️ Real email sending failed.'); 
    console.warn('Reason:', error);
    
    // CRITICAL FALLBACK: Log the code to console so the user can still verify their account and use the app.
    console.info(
      `%c[FALLBACK] Verification Code for ${email}: ${code}`, 
      "background-color: #4f46e5; color: white; padding: 4px 8px; font-weight: bold; font-size: 14px; border-radius: 4px;"
    );
    
    return false;
  }
};
