import ReactDOM from 'react-dom/client';
import App from './App';
import { initTheme } from './lib/theme';

/* ── Fonts — imported as Vite assets so paths work in Electron (file://) ── */
import 'material-symbols/outlined.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

import './index.css';

// Apply saved theme before first paint to prevent flash of un-themed content
initTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
