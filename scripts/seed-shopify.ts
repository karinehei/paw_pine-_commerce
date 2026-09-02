/**
 * Seed the Shopify Dev Store from the Paw & Pine demo catalogue.
 * Uses the Admin GraphQL API (not Storefront).
 *
 * Auth (Dev Dashboard app, 2026): SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET
 * are exchanged for a 24h Admin token. Do not paste Client ID/Secret into
 * SHOPIFY_ADMIN_ACCESS_TOKEN. Optional legacy: SHOPIFY_ADMIN_ACCESS_TOKEN (shpat_…).
 *
 *   npm run seed:shopify
 *   npm run seed:shopify -- --archive-samples
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setDefaultResultOrder } from "node:dns";
import { demoCollections, demoProducts } from "../src/lib/commerce/demo/catalog";
import { parseAmount } from "../src/lib/format";
import { normaliseShopifyDomain } from "../src/lib/security";
import type { Product } from "../src/lib/commerce/types";

/** WSL often has broken IPv6; Node's fetch then throws a bare "fetch failed". */
setDefaultResultOrder("ipv4first");

const API_VERSION = "2026-07";

function loadEnvLocal(): void {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }
      const eq = line.indexOf("=");
      if (eq < 1) {
        continue;
      }
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Env can also come from the shell.
  }
}

loadEnvLocal();
console.log("[seed] starting");

function networkErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "failed";
  }
  const cause =
    error.cause && typeof error.cause === "object"
      ? (error.cause as { message?: string; code?: string })
      : undefined;
  return [error.message, cause?.code, cause?.message].filter(Boolean).join(" — ");
}

async function resolveAdminToken(domain: string): Promise<string> {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();

  if (clientId && clientSecret) {
    try {
      const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      const payload = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
        scope?: string;
        error?: string;
        error_description?: string;
      };
      if (response.ok && payload.access_token) {
        console.log(
          `[seed] Admin token via client credentials${payload.scope ? ` (${payload.scope})` : ""}`,
        );
        return payload.access_token;
      }
      console.warn(
        `[seed] client credentials: ${payload.error_description ?? payload.error ?? `HTTP ${response.status}`}`,
      );
    } catch (error) {
      console.warn(`[seed] client credentials: ${networkErrorMessage(error)}`);
    }
  }

  if (staticToken) {
    if (!/^(shpat_|shpca_|shppa_)/i.test(staticToken)) {
      console.warn(
        "[seed] SHOPIFY_ADMIN_ACCESS_TOKEN does not look like a legacy Admin token (shpat_…). Prefer SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET from the Dev Dashboard.",
      );
    }
    console.log("[seed] Admin token via SHOPIFY_ADMIN_ACCESS_TOKEN");
    return staticToken;
  }

  throw new Error(
    "Set SHOPIFY_STORE_DOMAIN plus SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (Dev Dashboard App settings), or a legacy SHOPIFY_ADMIN_ACCESS_TOKEN (shpat_…).",
  );
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function adminFetch<T>(
  domain: string,
  token: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? `Admin API HTTP ${response.status}`);
  }
  if (!payload.data) {
    throw new Error("Admin API returned no data.");
  }
  return payload.data;
}

function userErrorMessage(errors?: Array<{ message: string }>): string | undefined {
  return errors?.[0]?.message;
}

function tagsFor(product: Product): string[] {
  const tags = new Set<string>([
    "catalog:paw-pine",
    "paw-pine",
    `species:${product.species}`,
    `category:${product.category}`,
    `material:${product.material}`,
    `sku:${product.sku}`,
    ...product.tags,
    ...product.features.slice(0, 3).map((feature) => `feature:${feature.slice(0, 80)}`),
  ]);
  return [...tags];
}

function productInput(product: Product, locationId?: string | null) {
  const optionName = product.options[0]?.name ?? "Title";
  const values = product.variants.map(
    (variant) => variant.selectedOptions[0]?.value ?? variant.title,
  );

  return {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.descriptionHtml,
    vendor: product.vendor,
    productType: product.category,
    status: "ACTIVE",
    tags: tagsFor(product),
    productOptions: [
      {
        name: optionName,
        values: [...new Set(values)].map((name) => ({ name })),
      },
    ],
    variants: product.variants.map((variant) => ({
      optionValues: [
        {
          optionName,
          name: variant.selectedOptions[0]?.value ?? variant.title,
        },
      ],
      price: parseAmount(variant.price),
      compareAtPrice: variant.compareAtPrice
        ? parseAmount(variant.compareAtPrice)
        : undefined,
      sku: `${product.sku}-${(variant.selectedOptions[0]?.value ?? "default").replace(/\s+/g, "-")}`,
      inventoryPolicy: "CONTINUE",
      inventoryItem: { tracked: Boolean(locationId) },
      ...(locationId
        ? {
            inventoryQuantities: [
              { locationId, name: "available", quantity: 99 },
            ],
          }
        : {}),
    })),
  };
}

const PRODUCT_SET = `
  mutation ProductSet(
    $identifier: ProductSetIdentifiers
    $synchronous: Boolean!
    $input: ProductSetInput!
  ) {
    productSet(identifier: $identifier, synchronous: $synchronous, input: $input) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTION_CREATE = `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const COLLECTION_BY_HANDLE = `
  query CollectionByHandle($query: String!) {
    collections(first: 1, query: $query) {
      nodes { id handle }
    }
  }
`;

const ACCESS_SCOPES = `
  query AccessScopes {
    currentAppInstallation {
      accessScopes { handle }
    }
  }
`;

const LOCATIONS = `
  query Locations {
    locations(first: 5) {
      nodes { id name isActive fulfillsOnlineOrders }
    }
  }
`;

const PUBLICATIONS = `
  query Publications {
    publications(first: 25) {
      nodes { id }
    }
  }
`;

const PUBLISH = `
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

const ARCHIVE = `
  mutation Archive(
    $identifier: ProductSetIdentifiers!
    $input: ProductSetInput!
    $synchronous: Boolean!
  ) {
    productSet(identifier: $identifier, synchronous: $synchronous, input: $input) {
      product { id handle status }
      userErrors { field message }
    }
  }
`;

const SAMPLE_HANDLES = new Set([
  "gift-card",
  "selling-plans-ski-wax",
  "the-3p-fulfilled-snowboard",
  "the-archived-snowboard",
  "the-collection-snowboard-hydrogen",
  "the-compare-at-price-snowboard",
  "the-complete-snowboard",
  "the-hidden-snowboard",
  "the-inventory-not-tracked-snowboard",
  "the-multi-location-snowboard",
  "the-out-of-stock-snowboard",
  "the-snowboard-liquid",
  "the-videographer-snowboard",
]);

async function main(): Promise<void> {
  const archiveSamples = process.argv.includes("--archive-samples");
  const domain = normaliseShopifyDomain(process.env.SHOPIFY_STORE_DOMAIN ?? "");
  if (!domain) {
    throw new Error("Set SHOPIFY_STORE_DOMAIN to your-store.myshopify.com.");
  }
  const token = await resolveAdminToken(domain);

  try {
    const { currentAppInstallation } = await adminFetch<{
      currentAppInstallation: { accessScopes: Array<{ handle: string }> };
    }>(domain, token, ACCESS_SCOPES);
    const scopes = currentAppInstallation.accessScopes
      .map((scope) => scope.handle)
      .join(", ");
    console.log(`[seed] token scopes: ${scopes || "(none listed)"}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[seed] could not list token scopes: ${message}`);
  }

  let locationId: string | null = null;
  try {
    const { locations } = await adminFetch<{
      locations: {
        nodes: Array<{ id: string; name: string; isActive: boolean; fulfillsOnlineOrders: boolean }>;
      };
    }>(domain, token, LOCATIONS);
    const chosen =
      locations.nodes.find((node) => node.isActive && node.fulfillsOnlineOrders) ??
      locations.nodes.find((node) => node.isActive) ??
      locations.nodes[0];
    locationId = chosen?.id ?? null;
    console.log(
      locationId
        ? `[seed] inventory location ${chosen?.name ?? locationId}`
        : "[seed] no inventory location; variants will not be quantity-tracked",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[seed] locations unavailable (${message}). Headless carts may still hit out_of_stock.`);
  }

  let publicationInput: Array<{ publicationId: string }> = [];
  try {
    const { publications } = await adminFetch<{
      publications: { nodes: Array<{ id: string }> };
    }>(domain, token, PUBLICATIONS);
    publicationInput = publications.nodes.map((node) => ({ publicationId: node.id }));
    console.log(`[seed] ${publicationInput.length} publication(s)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      [
        `[seed] publications unavailable (${message}).`,
        "Products will still be created. After the seed, in Shopify admin: Products → select the Paw & Pine items → … → Include in sales channels → Headless (and Online Store).",
        "To publish from this script next time: Configuration → Admin API integration, search “Publications”, enable View/Manage publications,",
        "then Install app / Reinstall and paste the new shpat_ token into .env.local.",
      ].join(" "),
    );
  }

  for (const product of demoProducts) {
    const result = await adminFetch<{
      productSet: {
        product: { id: string; handle: string } | null;
        userErrors: Array<{ message: string }>;
      };
    }>(domain, token, PRODUCT_SET, {
      identifier: { handle: product.handle },
      synchronous: true,
      input: productInput(product, locationId),
    });

    const error = userErrorMessage(result.productSet.userErrors);
    if (error || !result.productSet.product) {
      throw new Error(`product ${product.handle}: ${error ?? "no product returned"}`);
    }

    if (publicationInput.length > 0) {
      const published = await adminFetch<{
        publishablePublish: { userErrors: Array<{ message: string }> };
      }>(domain, token, PUBLISH, {
        id: result.productSet.product.id,
        input: publicationInput,
      });
      const publishError = userErrorMessage(published.publishablePublish.userErrors);
      if (publishError) {
        console.warn(`[seed] publish ${product.handle}: ${publishError}`);
      }
    }

    console.log(`[seed] product ${result.productSet.product.handle}`);
  }

  for (const collection of demoCollections) {
    const existing = await adminFetch<{
      collections: { nodes: Array<{ id: string }> };
    }>(domain, token, COLLECTION_BY_HANDLE, { query: `handle:${collection.handle}` });

    let collectionId = existing.collections.nodes[0]?.id;
    if (!collectionId) {
      const tag =
        collection.handle === "all"
          ? "paw-pine"
          : collection.handle === "dogs"
            ? "species:dog"
            : collection.handle === "cats"
              ? "species:cat"
              : collection.handle === "new-arrivals"
                ? "new"
                : collection.handle === "best-sellers"
                  ? "bestseller"
                  : `category:${collection.handle}`;

      const created = await adminFetch<{
        collectionCreate: {
          collection: { id: string; handle: string } | null;
          userErrors: Array<{ message: string }>;
        };
      }>(domain, token, COLLECTION_CREATE, {
        input: {
          title: collection.title,
          handle: collection.handle,
          descriptionHtml: collection.description
            ? `<p>${collection.description}</p>`
            : "",
          ruleSet: {
            appliedDisjunctively: false,
            rules: [{ column: "TAG", relation: "EQUALS", condition: tag }],
          },
        },
      });

      const error = userErrorMessage(created.collectionCreate.userErrors);
      if (error || !created.collectionCreate.collection) {
        throw new Error(
          `collection ${collection.handle}: ${error ?? "no collection returned"}`,
        );
      }
      collectionId = created.collectionCreate.collection.id;
    }

    if (publicationInput.length > 0 && collectionId) {
      const published = await adminFetch<{
        publishablePublish: { userErrors: Array<{ message: string }> };
      }>(domain, token, PUBLISH, { id: collectionId, input: publicationInput });
      const publishError = userErrorMessage(published.publishablePublish.userErrors);
      if (publishError) {
        console.warn(`[seed] publish ${collection.handle}: ${publishError}`);
      }
    }

    console.log(`[seed] collection ${collection.handle}`);
  }

  if (archiveSamples) {
    const listed = await adminFetch<{
      products: { nodes: Array<{ id: string; handle: string }> };
    }>(domain, token, `query { products(first: 50) { nodes { id handle } } }`);
    for (const product of listed.products.nodes) {
      if (!SAMPLE_HANDLES.has(product.handle)) {
        continue;
      }
      const archived = await adminFetch<{
        productSet: { userErrors: Array<{ message: string }> };
      }>(domain, token, ARCHIVE, {
        identifier: { id: product.id },
        synchronous: true,
        input: { status: "ARCHIVED" },
      });
      const error = userErrorMessage(archived.productSet.userErrors);
      if (error) {
        console.warn(`[seed] archive ${product.handle}: ${error}`);
      } else {
        console.log(`[seed] archived ${product.handle}`);
      }
    }
  }

  console.log("[seed] done. Redeploy or wait ~60s for Storefront cache.");
}

main().catch((error: unknown) => {
  console.error("[seed]", networkErrorMessage(error));
  process.exit(1);
});
