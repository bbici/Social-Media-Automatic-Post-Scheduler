import emailjs from '@emailjs/browser';

// NOTE: In a production environment, these IDs would come from your environment variables
// You can get these by signing up at emailjs.com (Free Tier available)
const SERVICE_ID = 'service_demo_omnipost'; 
const TEMPLATE_ID = 'template_verification';
const PUBLIC_KEY = 'user_demo_key_12345';

export const sendVerificationEmail = async (name: string, email: string, code: string): Promise<boolean> => {
  try {
    // We are simulating the 'send' call because we don't have a live EmailJS account for this demo.
    // In your real app, you would uncomment the code below:
    
    /*
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
    */

    // For now, we simulate a successful API call to EmailJS
    console.log(`[EmailService] Sending code ${code} to ${email}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    // We return true to indicate success.
    // If you add your real EmailJS keys above and uncomment the block, this will actually email you.
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
};