/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {genkit} from 'genkit';
import {googleAI} from 'genkit/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini 1.5 API key is preferantially read from the
      // GOOGLE_GENAI_API_KEY environment variable.
      //
      // You can also pass the API key to the plugin constructor:
      // apiKey: 'your-api-key',
    }),
  ],
  // The AI-backed parts of this app are logged to the console.
  // You can also use OpenTelemetry to export traces to a supported provider.
  // For more information, see: https://genkit.dev/docs/observability
  // Your flow's state is persisted to files in the .genkit/state directory.
  // Production apps should use a database instead.
  // For more information, see: https://genkit.dev/docs/plugins/prisma
});
