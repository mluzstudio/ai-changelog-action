import * as fs from "fs";

export function updateChangelog(
  releaseNotes: string,
  tag: string,
  filePath: string
): void {
  const today = new Date().toISOString().split("T")[0];
  const entry = `## [${tag}] - ${today}\n\n${releaseNotes}`;

  if (!fs.existsSync(filePath)) {
    const content = `# Changelog\n\n${entry}\n`;
    fs.writeFileSync(filePath, content, "utf-8");
    return;
  }

  const existing = fs.readFileSync(filePath, "utf-8");
  const headerPattern = /^# Changelog\s*$/m;
  const match = headerPattern.exec(existing);

  if (match) {
    const insertPos = match.index + match[0].length;
    const before = existing.substring(0, insertPos);
    const after = existing.substring(insertPos);
    const content = `${before}\n\n${entry}\n${after}`;
    fs.writeFileSync(filePath, content, "utf-8");
  } else {
    const content = `${entry}\n\n${existing}`;
    fs.writeFileSync(filePath, content, "utf-8");
  }
}
