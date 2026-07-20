/**
 * Seeds a small, realistic Data Room on first load so the app is not an empty
 * void when a reviewer opens it. Runs only when the store is completely empty,
 * so it never fights with user-created content.
 */

import { countNodes, createFile, createFolder } from "./nodeRepository";
import { buildSamplePdf } from "@/lib/samplePdf";

function pdfFile(name: string, title: string, lines: string[]): File {
  const blob = buildSamplePdf(title, lines);
  return new File([blob], name, { type: "application/pdf" });
}

export async function seedIfEmpty(): Promise<boolean> {
  if ((await countNodes()) > 0) return false;

  // Acme Corp. acquisition due-diligence structure.
  const financial = await createFolder(null, "Financials");
  const legal = await createFolder(null, "Legal");
  await createFolder(null, "Product & Technology");

  const contracts = await createFolder(legal.id, "Contracts");

  await createFile(
    null,
    pdfFile("README.pdf", "Acme Corp. Data Room", [
      "Welcome to the Acme Corp. acquisition data room.",
      "",
      "Use the sidebar to create folders and upload PDF documents.",
      "Every folder can be nested, renamed, and deleted.",
      "Click any file to preview it here in the browser.",
    ]),
  );

  await createFile(
    financial.id,
    pdfFile("Q4-Financial-Report.pdf", "Q4 Financial Report", [
      "Revenue: $482.1M (+18% YoY)",
      "Gross margin: 71%",
      "Net income: $63.4M",
      "This is sample content for demonstration purposes.",
    ]),
  );

  await createFile(
    contracts.id,
    pdfFile("Master-Services-Agreement.pdf", "Master Services Agreement", [
      "This Agreement is entered into by and between the parties",
      "for the provision of services described herein.",
      "Sample legal document for demonstration purposes.",
    ]),
  );

  return true;
}
