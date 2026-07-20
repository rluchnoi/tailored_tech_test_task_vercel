/**
 * Builds a tiny but valid single-page PDF from a list of text lines, so the
 * seeded demo files are real, openable PDFs rather than empty placeholders.
 * Byte offsets in the xref table are computed exactly so browsers render it
 * without falling back to recovery mode.
 */
export function buildSamplePdf(title: string, lines: string[]): Blob {
  const escape = (s: string) => s.replace(/([\\()])/g, "\\$1");

  const content =
    `BT /F1 20 Tf 72 720 Td (${escape(title)}) Tj ET\n` +
    lines
      .map(
        (line, i) =>
          `BT /F1 12 Tf 72 ${680 - i * 20} Td (${escape(line)}) Tj ET`,
      )
      .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
      "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
