import type { SimpleShopProduct } from "./types.js";

const BASE_URL = "https://api.simpleshop.cz/2.0";

export class SimpleShopClient {
  private authHeader: string;

  constructor(email: string, apiKey: string) {
    this.authHeader =
      "Basic " + Buffer.from(`${email}:${apiKey}`).toString("base64");
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`SimpleShop API error ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async listProducts(): Promise<SimpleShopProduct[]> {
    // API returns a flat array (no pagination)
    return this.request<SimpleShopProduct[]>("/product/");
  }
}
