import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate .env file locations
const envCandidates = [
  path.join(__dirname, '.env'),                // backend/.env
  path.resolve(__dirname, '..', '.env'),        // root .env
  path.resolve(process.cwd(), '.env'),          // current working directory .env
  path.resolve(process.cwd(), 'backend', '.env') // cwd/backend/.env
];

let loadedFrom = null;

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    if (!loadedFrom) loadedFrom = envPath;
  }
}

// Fallback to default dotenv
dotenv.config();

/**
 * Get configured AI API key supporting standard aliases
 */
export function getApiKey() {
  const key = process.env.GEMINI_API_KEY ||
              process.env.GOOGLE_API_KEY ||
              process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
              process.env.API_KEY ||
              '';
  return key.trim();
}

/**
 * Check if a valid API key is present
 */
export function hasValidApiKey() {
  const key = getApiKey();
  return Boolean(key && key !== 'your_gemini_api_key_here' && key.length > 10);
}

/**
 * Safe key preview for logs without exposing secret
 * e.g. "AIza...xxxx" (length 39)
 */
export function getMaskedKeyPreview() {
  const key = getApiKey();
  if (!key || key === 'your_gemini_api_key_here') return 'NONE';
  if (key.length <= 8) return '****';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)} (length: ${key.length})`;
}

/**
 * Log server-side environment state safely
 */
export function logEnvironmentStatus() {
  console.log('[Config] Environment loader initialized.');
  console.log('[Config] Primary .env loaded from:', loadedFrom || 'System / process.env');
  console.log('[Config] AI Key Present:', hasValidApiKey() ? 'YES' : 'NO');
  console.log('[Config] Key Masked Preview:', getMaskedKeyPreview());
}

logEnvironmentStatus();
