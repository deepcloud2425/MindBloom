import { describe, it, expect } from "vitest";
import {
  shortAddress,
  formatMinutes,
  formatDate,
  getExplorerLink,
  parseError,
  getNetworkLabel,
  hasContractConfig,
} from "../lib/mindBloom";

describe("shortAddress", () => {
  it("returns 'Not connected' for empty input", () => {
    expect(shortAddress("")).toBe("Not connected");
    expect(shortAddress()).toBe("Not connected");
  });

  it("returns full value for short strings", () => {
    expect(shortAddress("GABCDE")).toBe("GABCDE");
  });

  it("truncates long addresses", () => {
    const addr = "GCTPOHV6SFHW36B45KHJBWNDUJ3N4AUJYEEDZX75MX3WLHLUYA6TR7YQ";
    expect(shortAddress(addr)).toBe("GCTPOH...6TR7YQ");
  });
});

describe("formatMinutes", () => {
  it("formats zero", () => {
    expect(formatMinutes(0)).toBe("0m");
  });

  it("formats minutes under an hour", () => {
    expect(formatMinutes(45)).toBe("45m");
  });

  it("formats exact hours", () => {
    expect(formatMinutes(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatMinutes(150)).toBe("2h 30m");
  });
});

describe("formatDate", () => {
  it("returns placeholder for zero timestamp", () => {
    expect(formatDate(0)).toBe("No mindful sessions logged yet");
  });

  it("formats a valid unix timestamp", () => {
    const result = formatDate(1700000000);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("getExplorerLink", () => {
  it("returns empty string for no hash", () => {
    expect(getExplorerLink("Test SDF Network ; September 2015", "")).toBe("");
  });

  it("returns testnet URL for testnet passphrase", () => {
    const link = getExplorerLink("Test SDF Network ; September 2015", "abc123");
    expect(link).toBe("https://stellar.expert/explorer/testnet/tx/abc123");
  });

  it("returns mainnet URL for mainnet passphrase", () => {
    const link = getExplorerLink("Public Global Stellar Network ; September 2015", "def456");
    expect(link).toBe("https://stellar.expert/explorer/public/tx/def456");
  });
});

describe("parseError", () => {
  it("extracts message from Error object", () => {
    expect(parseError(new Error("something broke"))).toBe("something broke");
  });

  it("handles null input", () => {
    expect(parseError(null)).toBe("Something unexpected happened.");
  });
});

describe("getNetworkLabel", () => {
  it("returns Stellar Testnet", () => {
    expect(getNetworkLabel("Test SDF Network ; September 2015")).toBe("Stellar Testnet");
  });

  it("returns Stellar Mainnet", () => {
    expect(getNetworkLabel("Public Global Stellar Network ; September 2015")).toBe("Stellar Mainnet");
  });

  it("returns Custom for unknown", () => {
    expect(getNetworkLabel("something else")).toBe("Custom Stellar Network");
  });
});

describe("hasContractConfig", () => {
  it("returns a boolean", () => {
    expect(typeof hasContractConfig()).toBe("boolean");
  });
});
