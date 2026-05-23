type MammothModule = typeof import('mammoth');
type MammothRuntime = Pick<MammothModule, 'convertToHtml' | 'extractRawText'>;

let cachedMammoth: MammothRuntime | null = null;

function resolveMammothRuntime(
  module: MammothModule | { default: MammothModule },
): MammothRuntime {
  return 'default' in module ? module.default : module;
}

/**
 * Load mammoth only when a DOCX file is actually being processed.
 * Vercel file tracing has been dropping mammoth's transitive `underscore`
 * dependency from the API lambda, so we also require it here explicitly.
 */
export function getMammoth(): MammothRuntime {
  if (cachedMammoth) {
    return cachedMammoth;
  }

  require('underscore');
  const mammothModule = require('mammoth') as
    | MammothModule
    | { default: MammothModule };
  cachedMammoth = resolveMammothRuntime(mammothModule);
  return cachedMammoth;
}