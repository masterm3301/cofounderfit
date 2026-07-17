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

vi.mock("./profile", () => ({
  getProfile: vi.fn(),
  isProfileComplete: vi.fn(),
}));

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getProfile, isProfileComplete } from "./profile";
import { requireUserId, requireCompleteProfile } from "./session";

const redirectMock = vi.mocked(redirect);
const authMock = vi.mocked(auth);
const getProfileMock = vi.mocked(getProfile);
const isProfileCompleteMock = vi.mocked(isProfileComplete);

beforeEach(() => {
  redirectMock.mockClear();
  authMock.mockReset();
  getProfileMock.mockReset();
  isProfileCompleteMock.mockReset();
  redirectMock.mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
});

describe("requireUserId", () => {
  it("returns the user id when signed in", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    await expect(requireUserId()).resolves.toBe("user-1");
  });

  it("redirects to sign-in when not signed in", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUserId()).rejects.toThrow("REDIRECT:/api/auth/signin");
  });
});

describe("requireCompleteProfile", () => {
  it("returns the user id when the profile is complete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    getProfileMock.mockResolvedValue({ bio: "hi" });
    isProfileCompleteMock.mockReturnValue(true);
    await expect(requireCompleteProfile()).resolves.toBe("user-1");
  });

  it("redirects to profile setup when the profile is incomplete", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    getProfileMock.mockResolvedValue(null);
    isProfileCompleteMock.mockReturnValue(false);
    await expect(requireCompleteProfile()).rejects.toThrow("REDIRECT:/profile/setup");
  });
});
