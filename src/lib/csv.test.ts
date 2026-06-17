import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("joins headers and rows with CRLF", () => {
    expect(toCsv(["A", "B"], [["1", "2"], ["3", "4"]])).toBe("A,B\r\n1,2\r\n3,4");
  });

  it("quotes fields containing commas, quotes or newlines", () => {
    expect(
      toCsv(["X"], [["a,b"], ['he said "hi"'], ["line\nbreak"]]),
    ).toBe('X\r\n"a,b"\r\n"he said ""hi"""\r\n"line\nbreak"');
  });

  it("renders null and undefined as empty cells", () => {
    expect(toCsv(["X", "Y"], [[null, undefined]])).toBe("X,Y\r\n,");
  });
});
