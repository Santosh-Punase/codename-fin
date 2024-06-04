import app from './src/app.js';
import { PORT } from './src/config/env.js';

const DEFAULT_PORT = 5000;

app.listen(PORT || DEFAULT_PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
