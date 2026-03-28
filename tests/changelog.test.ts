import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { updateChangelog } from "../src/changelog";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("updateChangelog", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "changelog-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a new changelog file when none exists", () => {
    const filePath = path.join(tmpDir, "CHANGELOG.md");
    const notes = "## Features\n- Added login page";

    updateChangelog(notes, "v1.0.0", filePath);

    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("# Changelog");
    expect(content).toContain("## [v1.0.0]");
    expect(content).toContain("- Added login page");
  });

  it("prepends new entry after the # Changelog header in existing file", () => {
    const filePath = path.join(tmpDir, "CHANGELOG.md");
    fs.writeFileSync(
      filePath,
      "# Changelog\n\n## [v1.0.0] - 2026-01-01\n\n## Features\n- Initial release\n"
    );

    updateChangelog("## Bug Fixes\n- Fixed crash", "v1.1.0", filePath);

    const content = fs.readFileSync(filePath, "utf-8");
    const headerIndex = content.indexOf("# Changelog");
    const newEntryIndex = content.indexOf("## [v1.1.0]");
    const oldEntryIndex = content.indexOf("## [v1.0.0]");

    expect(headerIndex).toBeLessThan(newEntryIndex);
    expect(newEntryIndex).toBeLessThan(oldEntryIndex);
    expect(content).toContain("- Fixed crash");
    expect(content).toContain("- Initial release");
  });

  it("prepends at the top if existing file has no # Changelog header", () => {
    const filePath = path.join(tmpDir, "CHANGELOG.md");
    fs.writeFileSync(filePath, "## [v1.0.0] - 2026-01-01\n\nOld stuff\n");

    updateChangelog("## Features\n- New thing", "v1.1.0", filePath);

    const content = fs.readFileSync(filePath, "utf-8");
    const newEntryIndex = content.indexOf("## [v1.1.0]");
    const oldContentIndex = content.indexOf("Old stuff");

    expect(newEntryIndex).toBeLessThan(oldContentIndex);
  });

  it("includes the current date in the entry header", () => {
    const filePath = path.join(tmpDir, "CHANGELOG.md");

    updateChangelog("## Features\n- Stuff", "v2.0.0", filePath);

    const content = fs.readFileSync(filePath, "utf-8");
    const today = new Date().toISOString().split("T")[0];
    expect(content).toContain(`## [v2.0.0] - ${today}`);
  });
});
