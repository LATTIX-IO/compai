type JsPDFModule = typeof import('jspdf');
export type JsPDFConstructor = JsPDFModule['jsPDF'];
export type JsPDFDocument = InstanceType<JsPDFConstructor>;

let cachedJsPDF: JsPDFConstructor | null = null;

/**
 * Load jsPDF only when a PDF is actually being generated.
 * This keeps deploy-critical API startup paths from eagerly pulling in
 * jspdf/fflate during cold starts.
 */
export function getJsPDF(): JsPDFConstructor {
  if (cachedJsPDF) {
    return cachedJsPDF;
  }

  const module = require('jspdf') as JsPDFModule;
  cachedJsPDF = module.jsPDF;
  return cachedJsPDF;
}
