import fs from 'fs';

import migrate from './migratePaymentModes.js';

migrate().catch((err) => {
  console.error('Unexpected error:', err);
  fs.writeFileSync('unexpected-error.log', err.toString());
});
