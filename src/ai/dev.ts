import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-webpage-content.ts';
import '@/ai/flows/generate-reply-to-message.ts';
import '@/ai/flows/generate-ideas-from-prompt.ts';