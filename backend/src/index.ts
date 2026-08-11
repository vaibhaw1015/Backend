import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const PORT = parseInt(env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Fundsroom ERP/CRM Backend running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
});
