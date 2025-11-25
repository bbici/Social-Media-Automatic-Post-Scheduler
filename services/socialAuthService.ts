import { ApiConfig } from "../types";

// Simulates an OAuth 2.0 Provider flow
// In a real app, this would be `https://twitter.com/i/oauth2/authorize?response_type=code...`
export const initiateOAuthFlow = async (platform: string): Promise<Record<string, string>> => {
  return new Promise((resolve, reject) => {
    
    // 1. Calculate dimensions to center the popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // 2. Open a popup window
    // Since we don't have a real backend to handle the callback, we open a blank window 
    // and manipulate it or simply use a timeout to simulate the user "logging in"
    const popup = window.open(
      '', 
      `Connect ${platform}`, 
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup) {
      reject(new Error("Popup blocked. Please allow popups for this site."));
      return;
    }

    // 3. Write content to the popup to look like a login page
    popup.document.write(`
      <html>
        <head>
          <title>Connect to ${platform}</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9f9f9; }
            .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; }
            h2 { margin-bottom: 8px; color: #333; }
            p { color: #666; margin-bottom: 24px; font-size: 14px; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            button { background: #000; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; width: 100%; }
            .brand { margin-bottom: 20px; font-size: 40px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">${getPlatformEmoji(platform)}</div>
            <h2>Authorize OmniPost</h2>
            <p>OmniPost AI wants to access your ${platform} account to post content on your behalf.</p>
            
            <div id="loading">
              <div class="loader"></div>
              <p>Connecting...</p>
            </div>
            
            <div id="consent" style="display:none">
               <button id="authBtn">Authorize App</button>
            </div>
          </div>
          <script>
            // Simulate network delay then show button
            setTimeout(() => {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('consent').style.display = 'block';
            }, 1000);

            document.getElementById('authBtn').addEventListener('click', () => {
              document.getElementById('consent').innerHTML = '<div class="loader"></div><p>Redirecting...</p>';
              // Send message back to parent
              setTimeout(() => {
                 window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: '${platform}' }, '*');
                 window.close();
              }, 800);
            });
          </script>
        </body>
      </html>
    `);

    // 4. Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS' && event.data?.platform === platform) {
        window.removeEventListener('message', handleMessage);
        resolve(generateMockCredentials(platform));
      }
    };

    window.addEventListener('message', handleMessage);

    // 5. Detect if popup was closed manually without auth
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        // If we haven't resolved yet, it means user closed it
        // We reject (or just ignore) - but here let's assume if it closed without message, it's a cancel
        // Note: Promise state cannot be checked easily, so we rely on the message listener being removed if successful
      }
    }, 500);
  });
};

const getPlatformEmoji = (p: string) => {
  switch(p) {
    case 'twitter': return '🐦';
    case 'linkedin': return '💼';
    case 'instagram': return '📸';
    case 'tiktok': return '🎵';
    default: return '🔗';
  }
}

// Generate realistic looking tokens for the demo
const generateMockCredentials = (platform: string): any => {
  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  switch(platform) {
    case 'twitter':
      return { bearerToken: `mock_bearer_${token}_twitter` };
    case 'linkedin':
      return { accessToken: `mock_access_${token}`, personUrn: 'urn:li:person:mock123' };
    case 'instagram':
      return { accessToken: `mock_graph_${token}`, accountId: '1784140000000000' };
    case 'tiktok':
      return { accessToken: `mock_tk_${token}`, openId: 'user_open_id_mock' };
    default:
      return {};
  }
}