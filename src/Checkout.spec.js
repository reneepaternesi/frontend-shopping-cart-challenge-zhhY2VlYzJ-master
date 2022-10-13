/**
 * Attention, do you like Typescript?
 * Just rename this file from .js to .ts and enjoy Type Safety.
 */

import { Checkout } from "./Checkout";

describe("Checkout", () => {
  let checkout;

  beforeEach(() => {
    checkout = new Checkout();
  });

  it("should initialize", () => {
    expect(checkout).toBeInstanceOf(Checkout);
  });
});
