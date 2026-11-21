import { describe, expect, test } from "vitest";
import { accountPage } from "./page";

describe("account pages", () => {
  test("shows ten rows and a short last page", () => {
    const accounts = Array.from({ length: 12 }, (_, index) => index + 1);

    expect(accountPage(accounts, 1)).toMatchObject({
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      page: 1,
      pages: 2,
    });
    expect(accountPage(accounts, 2).items).toEqual([11, 12]);
  });
});
