import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server");

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("./auth", () => ({
  auth: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("./profile", () => ({
  getProfile: vi.fn(),
  isProfileComplete: vi.fn(),
}));

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getDb } from "./db";
import { getProfile, isProfileComplete } from "./profile";
import { requireUserId, requireCompleteProfile } from "./session";

const redirectMock = vi.mocked(redirect);
const authMock = vi.mocked(auth);
const getDbMock = vi.mocked(getDb);
const getProfileMock = vi.mocked(getProfile);
const isProfileCompleteMock = vi.mocked(isProfileComplete);

const findUniqueMock = vi.fn();

beforeEach(() => {
  redirectMock.mockClear();
  authMock.mockReset();
  getDbMock.mockReset();
  findUniqueMock.mockReset();
  getProfileMock.mockReset();
  isProfileCompleteMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
  getDbMock.mockReturnValue({ user: { findUnique: findUniqueMock } } as unknown as ReturnType<typeof getDb>);
});

describe("requireUserId", () => {
  it("returns the user id when signed in and the user still exists", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findUniqueMock.mockResolvedValue({ id: "user-1" });
    await expect(requireUserId()).resolves.toBe("user-1");
  });

  it("redirects to sign-in when not signed in", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUserId()).rejects.toThrow("REDIRECT:/api/auth/signin");
  });

  it("redirects to sign-in when the session's user no longer exists in the DB", async () => {
    authMock.mockResolvedValue({ user: { id: "stale-user" } });
    findUniqueMock.mockResolvedValue(null);
    await expect(requireUserId()).rejects.toThrow("REDIRECT:/api/auth/signin");
  });
});

describe("requireCompleteProfile", () => {
  it("returns the user id when the profile is complete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findUniqueMock.mockResolvedValue({ id: "user-1" });
    getProfileMock.mockResolvedValue({ bio: "hi" });
    isProfileCompleteMock.mockReturnValue(true);
    await expect(requireCompleteProfile()).resolves.toBe("user-1");
  });

  it("redirects to profile setup when the profile is incomplete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    findUniqueMock.mockResolvedValue({ id: "user-1" });
    getProfileMock.mockResolvedValue(null);
    isProfileCompleteMock.mockReturnValue(false);
    await expect(requireCompleteProfile()).rejects.toThrow("REDIRECT:/profile/setup");
  });
});
