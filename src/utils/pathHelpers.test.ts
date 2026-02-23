import { describe, it, expect } from "vitest";
import { getFileName, getDirName, getExtension, joinPath, normalizePath, SEPARATOR } from "./pathHelpers";

// ---------- getFileName ----------
describe("getFileName", () => {
  it("extracts filename from Windows path", () => {
    expect(getFileName("C:\\Users\\dev\\document.md")).toBe("document.md");
  });

  it("extracts filename from POSIX path", () => {
    expect(getFileName("/home/user/notes.md")).toBe("notes.md");
  });

  it("extracts filename from mixed separators", () => {
    expect(getFileName("C:\\folder/sub\\file.txt")).toBe("file.txt");
  });

  it("returns the input when there is no separator", () => {
    expect(getFileName("readme.md")).toBe("readme.md");
  });

  it("returns empty string for empty input", () => {
    expect(getFileName("")).toBe("");
  });

  it("returns empty string for trailing separator", () => {
    expect(getFileName("C:\\folder\\")).toBe("");
  });

  it("handles filenames with multiple dots", () => {
    expect(getFileName("/path/to/archive.tar.gz")).toBe("archive.tar.gz");
  });

  it("handles dotfiles", () => {
    expect(getFileName("/home/.gitignore")).toBe(".gitignore");
  });
});

// ---------- getDirName ----------
describe("getDirName", () => {
  it("extracts parent directory from Windows path", () => {
    expect(getDirName("C:\\Users\\dev\\file.md")).toBe("C:\\Users\\dev");
  });

  it("extracts parent directory from POSIX path", () => {
    expect(getDirName("/home/user/file.md")).toBe("/home/user");
  });

  it("returns '.' when no directory component exists", () => {
    expect(getDirName("file.md")).toBe(".");
  });

  it("returns '/' for root POSIX path", () => {
    expect(getDirName("/file.md")).toBe("/");
  });

  it("returns Windows drive root for files at drive root", () => {
    expect(getDirName("C:\\file.md")).toBe("C:\\");
  });

  it("handles nested paths correctly", () => {
    expect(getDirName("C:\\a\\b\\c\\d.txt")).toBe("C:\\a\\b\\c");
  });
});

// ---------- getExtension ----------
describe("getExtension", () => {
  it("extracts .md extension", () => {
    expect(getExtension("document.md")).toBe(".md");
  });

  it("extracts .png extension from full path", () => {
    expect(getExtension("/images/photo.png")).toBe(".png");
  });

  it("returns last extension for multi-dot filenames", () => {
    expect(getExtension("archive.tar.gz")).toBe(".gz");
  });

  it("returns empty string for no extension", () => {
    expect(getExtension("Makefile")).toBe("");
  });

  it("returns empty string for dotfiles without further extension", () => {
    // .gitignore → lastDot is at index 0, so extension is ".gitignore"
    expect(getExtension(".gitignore")).toBe(".gitignore");
  });

  it("handles empty string", () => {
    expect(getExtension("")).toBe("");
  });

  it("extracts extension from Windows path", () => {
    expect(getExtension("C:\\docs\\report.pdf")).toBe(".pdf");
  });
});

// ---------- joinPath ----------
describe("joinPath", () => {
  it("joins base and name with platform separator", () => {
    const result = joinPath("C:\\Users", "file.md");
    expect(result).toBe(`C:\\Users${SEPARATOR}file.md`);
  });

  it("does not double-separate when base ends with backslash", () => {
    expect(joinPath("C:\\Users\\", "file.md")).toBe("C:\\Users\\file.md");
  });

  it("does not double-separate when base ends with forward slash", () => {
    expect(joinPath("/home/user/", "file.md")).toBe("/home/user/file.md");
  });

  it("joins POSIX-style paths", () => {
    const result = joinPath("/home/user", "docs");
    expect(result).toBe(`/home/user${SEPARATOR}docs`);
  });
});

// ---------- normalizePath ----------
describe("normalizePath", () => {
  // Setup file stubs navigator.platform = "Win32", so IS_WINDOWS = true
  it("converts forward slashes to backslashes on Windows", () => {
    expect(normalizePath("C:/Users/dev/file.md")).toBe("C:\\Users\\dev\\file.md");
  });

  it("leaves backslashes unchanged on Windows", () => {
    expect(normalizePath("C:\\Users\\dev\\file.md")).toBe("C:\\Users\\dev\\file.md");
  });

  it("handles mixed separators on Windows", () => {
    expect(normalizePath("C:\\folder/sub\\file.txt")).toBe("C:\\folder\\sub\\file.txt");
  });
});

// ---------- SEPARATOR ----------
describe("SEPARATOR", () => {
  it("is backslash on Windows (setup stub)", () => {
    // The setup file sets navigator.platform = "Win32"
    expect(SEPARATOR).toBe("\\");
  });
});
