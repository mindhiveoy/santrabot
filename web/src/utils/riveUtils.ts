import { Script } from '@shared/schema';

export function concatenateScriptFiles(scriptFiles: Script[]): string {
  let result = '';

  for (const scriptFile of scriptFiles) {
    result += scriptFile.data;
  }
  return result;
}
