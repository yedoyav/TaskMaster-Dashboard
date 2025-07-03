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

import {run} from 'genkit/dev';

// Note: You do not need to have a file exactly like this.
// You just need to have your flows imported somewhere in your project.
// This is just one way to do it.
import './genkit';

run({
  // The dev server will listen on this port.
  // The default is 3400.
  port: 3400,
});
