import { moneyFromNumber } from "@/lib/format";
import type {
  Collection,
  Money,
  Product,
  ProductCategory,
  ProductShape,
  ProductVariant,
  Species,
} from "@/lib/commerce/types";

interface CatalogDraft {
  handle: string;
  title: string;
  description: string;
  species: Species;
  category: ProductCategory;
  vendor: string;
  material: string;
  price: number;
  compareAtPrice?: number;
  sizes?: string[];
  unavailableSizes?: string[];
  tags: string[];
  features: string[];
  createdAt: string;
  visual: {
    background: string;
    accent: string;
    shape: ProductShape;
  };
}

function money(amount: number): Money {
  return moneyFromNumber(amount);
}

function htmlFromDescription(description: string, features: string[]): string {
  const paragraphs = description
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
  const list = features.map((feature) => `<li>${feature}</li>`).join("");
  return `${paragraphs}<ul>${list}</ul>`;
}

function buildVariants(draft: CatalogDraft): ProductVariant[] {
  const sizes = draft.sizes ?? ["Default"];
  const unavailable = new Set(draft.unavailableSizes ?? []);

  return sizes.map((size) => {
    const available = !unavailable.has(size);
    return {
      id: `gid://demo/ProductVariant/${draft.handle}-${size.toLowerCase().replace(/\s+/g, "-")}`,
      title: size,
      availableForSale: available,
      quantityAvailable: available ? 12 : 0,
      selectedOptions: [{ name: sizes.length > 1 ? "Size" : "Title", value: size }],
      price: money(draft.price),
      compareAtPrice: draft.compareAtPrice ? money(draft.compareAtPrice) : null,
      image: null,
    };
  });
}

function buildProduct(draft: CatalogDraft): Product {
  const variants = buildVariants(draft);
  const availableForSale = variants.some((variant) => variant.availableForSale);
  const image = {
    url: `/products/${draft.handle}.svg`,
    altText: draft.title,
    width: 1200,
    height: 1500,
  };

  return {
    id: `gid://demo/Product/${draft.handle}`,
    handle: draft.handle,
    title: draft.title,
    description: draft.description,
    descriptionHtml: htmlFromDescription(draft.description, draft.features),
    availableForSale,
    featuredImage: image,
    images: [image],
    priceRange: {
      minVariantPrice: money(draft.price),
      maxVariantPrice: money(draft.price),
    },
    compareAtPriceRange: {
      minVariantPrice: draft.compareAtPrice ? money(draft.compareAtPrice) : null,
      maxVariantPrice: draft.compareAtPrice ? money(draft.compareAtPrice) : null,
    },
    variants,
    options:
      draft.sizes && draft.sizes.length > 1
        ? [{ id: `option-${draft.handle}-size`, name: "Size", values: draft.sizes }]
        : [],
    tags: [...new Set(["catalog:paw-pine", "paw-pine", ...draft.tags])],
    vendor: draft.vendor,
    productType: draft.category,
    species: draft.species,
    category: draft.category,
    material: draft.material,
    features: draft.features,
    createdAt: draft.createdAt,
    visual: draft.visual,
    sku: `PP-${draft.handle.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
    dimensions: dimensionsFor(draft),
    care: careFor(draft.material),
  };
}

function careFor(material: string): string {
  const value = material.toLowerCase();
  if (value.includes("wool")) {
    return "Spot clean or gentle wool wash. Dry flat, away from heat.";
  }
  if (value.includes("ceramic") || value.includes("stoneware")) {
    return "Dishwasher safe. Avoid sudden temperature change and metal scourers.";
  }
  if (value.includes("oak") || value.includes("beech") || value.includes("wood")) {
    return "Wipe with a dry cloth. Refresh with food-safe oil if the surface looks dry. Not dishwasher safe.";
  }
  if (value.includes("sisal")) {
    return "Vacuum the sisal. Wipe timber with a dry cloth.";
  }
  if (value.includes("nylon")) {
    return "Hand wash cold and line dry. Do not tumble dry.";
  }
  if (value.includes("cotton") || value.includes("linen") || value.includes("canvas")) {
    return "Machine wash at 30°C. Line dry.";
  }
  if (value.includes("willow")) {
    return "Keep dry. Replace the ribbon when it frays.";
  }
  return "Wipe clean. Avoid harsh chemicals.";
}

function dimensionsFor(draft: CatalogDraft): string {
  if (draft.handle === "trail-harness") {
    return "Neck 28–56 cm depending on size · chest 36–82 cm. Size guide on the harness label.";
  }
  if (draft.handle === "wool-nest-bed") {
    return "S 55 cm · M 70 cm · L 90 cm diameter, 18 cm wall height.";
  }
  if (draft.handle === "window-perch") {
    return "Seat 42 × 28 cm. Fits sills 2–4 cm thick.";
  }
  if (draft.handle === "sisal-scratch-column") {
    return "Height 72 cm · base 32 × 32 cm.";
  }
  if (draft.sizes && draft.sizes.length > 1) {
    return `Available in ${draft.sizes.join(", ")}. Measure before ordering.`;
  }
  switch (draft.category) {
    case "feeding":
      return "Diameter 16 cm · height 5 cm.";
    case "toys":
      return "Approximately 12 × 8 × 3 cm.";
    case "beds":
      return "Diameter 50 cm · height 20 cm.";
    default:
      return "See the product images for scale.";
  }
}

const drafts: CatalogDraft[] = [
  {
    handle: "oakwood-chew-ring",
    title: "Oakwood Chew Ring",
    description:
      "A quietly turned ring in solid European oak. Smooth enough for indoor play, dense enough to last through an afternoon of serious chewing.\n\nFinished with a food-safe oil and left slightly tactile, so it feels like an object from the kitchen rather than a toy from a bin.",
    species: "dog",
    category: "toys",
    vendor: "Pinecraft",
    material: "Oak",
    price: 28,
    compareAtPrice: 34,
    tags: ["bestseller", "dog", "wood"],
    features: [
      "Solid European oak, food-safe oil finish",
      "Designed for moderate chewers",
      "Easy to wipe clean",
    ],
    createdAt: "2025-11-02T08:00:00.000Z",
    visual: { background: "#E4D3B8", accent: "#8B5E34", shape: "ring" },
  },
  {
    handle: "canvas-tug-rope",
    title: "Canvas Tug Rope",
    description:
      "Three-strand tug in unbleached cotton canvas. Weighted just enough for a proper game, without the neon palette that usually comes with it.\n\nThe ends are bound in a darker twill so they stay neat after washing.",
    species: "dog",
    category: "toys",
    vendor: "Fjord",
    material: "Cotton",
    price: 22,
    tags: ["dog", "new"],
    features: [
      "Unbleached cotton canvas",
      "Machine washable at 30°C",
      "Length suited to medium and large dogs",
    ],
    createdAt: "2026-03-18T08:00:00.000Z",
    visual: { background: "#DDD4C4", accent: "#5C5346", shape: "rope" },
  },
  {
    handle: "trail-harness",
    title: "Trail Harness",
    description:
      "A Y-shaped harness cut from recycled nylon with a padded chest panel. Built for daily walks and longer days on gravel paths.\n\nTwo leash points, reflective piping, and hardware that stays quiet against the body.",
    species: "dog",
    category: "harnesses",
    vendor: "Northline",
    material: "Recycled nylon",
    price: 68,
    compareAtPrice: 82,
    sizes: ["XS", "S", "M", "L", "XL"],
    unavailableSizes: ["XL"],
    tags: ["bestseller", "dog", "walk"],
    features: [
      "Recycled nylon with padded chest",
      "Front and back leash attachments",
      "Reflective piping for low light",
    ],
    createdAt: "2025-09-14T08:00:00.000Z",
    visual: { background: "#C9D1C4", accent: "#2C4538", shape: "harness" },
  },
  {
    handle: "everyday-walk-harness",
    title: "Everyday Walk Harness",
    description:
      "A simpler harness for city miles. Soft webbing, a single back clip, and a shape that sits flat under a coat.\n\nIntended to disappear into the day rather than announce itself.",
    species: "dog",
    category: "harnesses",
    vendor: "Northline",
    material: "Nylon",
    price: 54,
    sizes: ["S", "M", "L"],
    tags: ["dog", "walk"],
    features: [
      "Soft nylon webbing",
      "Single back leash point",
      "Adjustable at neck and chest",
    ],
    createdAt: "2026-01-09T08:00:00.000Z",
    visual: { background: "#D7D2C8", accent: "#3F3A34", shape: "harness" },
  },
  {
    handle: "wool-nest-bed",
    title: "Wool Nest Bed",
    description:
      "A round nest in dense merino felt. The walls hold their shape, the base is filled with a wool-cotton mix that recovers after a heavy sleep.\n\nMade in a small run, in a colour that sits comfortably on timber floors.",
    species: "dog",
    category: "beds",
    vendor: "Haven",
    material: "Merino wool",
    price: 148,
    sizes: ["S", "M", "L"],
    tags: ["bestseller", "dog", "wool"],
    features: [
      "Merino felt walls with wool fill",
      "Removable, wool-safe cover",
      "Naturally odour resistant",
    ],
    createdAt: "2025-10-21T08:00:00.000Z",
    visual: { background: "#E7D9C6", accent: "#A58B6A", shape: "bed" },
  },
  {
    handle: "raised-rest-bed",
    title: "Raised Rest Bed",
    description:
      "An elevated frame in oiled oak with a taut linen sling. Keeps the body off cold floors in winter and lets air move through in summer.\n\nThe sling unclips for washing. The frame is built to stay in the room, not the utility cupboard.",
    species: "dog",
    category: "beds",
    vendor: "Haven",
    material: "Oak and linen",
    price: 196,
    sizes: ["M", "L"],
    tags: ["dog", "new", "oak"],
    features: [
      "Oiled oak frame",
      "Removable linen sling",
      "Elevated for airflow and joint comfort",
    ],
    createdAt: "2026-04-02T08:00:00.000Z",
    visual: { background: "#E2D5C0", accent: "#6B4F32", shape: "raised-bed" },
  },
  {
    handle: "stoneware-bowl-set",
    title: "Stoneware Bowl Set",
    description:
      "A pair of wide stoneware bowls, thrown with a slightly weighted base so they do not travel across the floor.\n\nThe glaze is a quiet grey-green, closer to kitchenware than petware.",
    species: "dog",
    category: "feeding",
    vendor: "Kiln",
    material: "Stoneware",
    price: 42,
    tags: ["bestseller", "dog", "ceramic"],
    features: ["Set of two wide bowls", "Weighted base", "Dishwasher safe"],
    createdAt: "2025-08-11T08:00:00.000Z",
    visual: { background: "#D8DCD4", accent: "#6A7568", shape: "bowl" },
  },
  {
    handle: "slow-feeder-bowl",
    title: "Slow Feeder Bowl",
    description:
      "A ceramic slow feeder with a low spiral rather than a maze of plastic ridges. Encourages a calmer meal without turning dinner into a puzzle.",
    species: "dog",
    category: "feeding",
    vendor: "Kiln",
    material: "Ceramic",
    price: 36,
    tags: ["dog", "ceramic"],
    features: [
      "Low spiral slows eating",
      "Ceramic, dishwasher safe",
      "Non-slip unglazed foot",
    ],
    createdAt: "2026-02-16T08:00:00.000Z",
    visual: { background: "#D5D0C7", accent: "#7A6A58", shape: "slow-bowl" },
  },
  {
    handle: "felt-mouse-trio",
    title: "Felt Mouse Trio",
    description:
      "Three small mice in boiled wool, stuffed with a pinch of organic catnip. Light enough to carry, dense enough to survive under the sofa.\n\nEach one is a slightly different grey, as if they did not all arrive from the same drawer.",
    species: "cat",
    category: "toys",
    vendor: "Moss & Whisker",
    material: "Wool felt",
    price: 18,
    tags: ["bestseller", "cat", "wool"],
    features: [
      "Boiled wool with organic catnip",
      "Set of three",
      "No plastic eyes or bells",
    ],
    createdAt: "2025-12-04T08:00:00.000Z",
    visual: { background: "#E6DED2", accent: "#8A7B6A", shape: "mice" },
  },
  {
    handle: "willow-wand-teaser",
    title: "Willow Wand Teaser",
    description:
      "A long willow wand with a linen ribbon and a small wool lure. Flexible enough for slow figure-eights, strong enough not to snap on the first enthusiastic leap.",
    species: "cat",
    category: "toys",
    vendor: "Moss & Whisker",
    material: "Willow",
    price: 16,
    tags: ["cat", "new"],
    features: [
      "Natural willow shaft",
      "Replaceable linen ribbon",
      "Wool lure, no synthetic feathers",
    ],
    createdAt: "2026-05-01T08:00:00.000Z",
    visual: { background: "#E3E0D4", accent: "#6F6A48", shape: "wand" },
  },
  {
    handle: "sisal-scratch-column",
    title: "Sisal Scratch Column",
    description:
      "A freestanding column wrapped in tight sisal, set on a weighted oak base. Tall enough for a full stretch, stable enough not to tip when used with intent.\n\nMade to live beside furniture, not hide behind it.",
    species: "cat",
    category: "scratching",
    vendor: "Perch",
    material: "Sisal",
    price: 89,
    tags: ["bestseller", "cat"],
    features: [
      "Tight sisal wrap",
      "Weighted oak base",
      "Height for a full vertical stretch",
    ],
    createdAt: "2025-07-22T08:00:00.000Z",
    visual: { background: "#DDD6C8", accent: "#9A815C", shape: "column" },
  },
  {
    handle: "wall-scratch-panel",
    title: "Wall Scratch Panel",
    description:
      "A wall-mounted oak panel with a sisal face. Saves floor space and gives a dedicated vertical surface that is not the sofa.\n\nHidden fixings. The oak edge is left visible as a thin frame.",
    species: "cat",
    category: "scratching",
    vendor: "Perch",
    material: "Sisal and oak",
    price: 64,
    tags: ["cat", "new", "oak"],
    features: [
      "Wall mounted to save floor space",
      "Sisal face with oak frame",
      "Concealed fixings included",
    ],
    createdAt: "2026-03-28T08:00:00.000Z",
    visual: { background: "#E0D7C6", accent: "#7A6244", shape: "panel" },
  },
  {
    handle: "window-perch",
    title: "Window Perch",
    description:
      "A compact oak shelf with a linen cushion, designed to clamp to a windowsill without drilling. The seat is wide enough for a loaf, not a sprawl.\n\nCushion cover unzips. The clamp is lined so it will not mark painted wood.",
    species: "cat",
    category: "beds",
    vendor: "Haven",
    material: "Oak and linen",
    price: 112,
    tags: ["bestseller", "cat", "oak"],
    features: [
      "No-drill windowsill clamp",
      "Linen cushion with zip cover",
      "Lined clamp to protect paintwork",
    ],
    createdAt: "2025-09-30T08:00:00.000Z",
    visual: { background: "#E8E2D6", accent: "#4C6A7A", shape: "perch" },
  },
  {
    handle: "cave-bed",
    title: "Cave Bed",
    description:
      "A closed felt cave for cats who prefer to disappear. The interior is a darker charcoal; the exterior is a pale oat so it reads as furniture.\n\nThe structure holds its arch without a plastic skeleton.",
    species: "cat",
    category: "beds",
    vendor: "Haven",
    material: "Wool",
    price: 98,
    compareAtPrice: 120,
    tags: ["cat", "wool"],
    features: [
      "Self-supporting wool felt",
      "Enclosed shape for retreat",
      "Spot clean or gentle wool wash",
    ],
    createdAt: "2026-01-22T08:00:00.000Z",
    visual: { background: "#E4D8C8", accent: "#5C534C", shape: "cave" },
  },
  {
    handle: "ceramic-dish",
    title: "Ceramic Dish",
    description:
      "A low, wide dish for wet food, with a shallow rim that does not crowd whiskers. Thrown in the same clay as the dog bowls, in a smaller scale.",
    species: "cat",
    category: "feeding",
    vendor: "Kiln",
    material: "Ceramic",
    price: 24,
    tags: ["cat", "ceramic", "bestseller"],
    features: [
      "Whisker-friendly shallow rim",
      "Ceramic, dishwasher safe",
      "Unglazed foot for grip",
    ],
    createdAt: "2025-08-11T08:00:00.000Z",
    visual: { background: "#D9D6CF", accent: "#8A8378", shape: "dish" },
  },
  {
    handle: "puzzle-feeder",
    title: "Beech Puzzle Feeder",
    description:
      "A small beech tray with sliding lids. Kibble is portioned into three wells; the cat works the lids rather than a plastic maze.\n\nIntended for slow mornings, not frantic hunger.",
    species: "cat",
    category: "feeding",
    vendor: "Fjord",
    material: "Beech",
    price: 32,
    tags: ["cat", "new", "wood"],
    features: ["Solid beech with food-safe oil", "Three sliding wells", "Hand-wash only"],
    createdAt: "2026-04-18T08:00:00.000Z",
    visual: { background: "#E6D8B8", accent: "#8A6A32", shape: "puzzle" },
  },
];

export const demoProducts: Product[] = drafts.map(buildProduct);

export const demoCollections: Collection[] = [
  {
    id: "gid://demo/Collection/all",
    handle: "all",
    title: "All products",
    description:
      "The full Paw & Pine edit — objects for dogs and cats, chosen for material and daily use.",
    image: null,
  },
  {
    id: "gid://demo/Collection/dogs",
    handle: "dogs",
    title: "Dogs",
    description:
      "Walk gear, rest, and feeding pieces with the same attention you would give the rest of the house.",
    image: null,
  },
  {
    id: "gid://demo/Collection/cats",
    handle: "cats",
    title: "Cats",
    description:
      "Scratching, perches, and quiet toys that can live in a considered room.",
    image: null,
  },
  {
    id: "gid://demo/Collection/toys",
    handle: "toys",
    title: "Toys",
    description: "Wood, wool, and canvas — playthings without the usual visual noise.",
    image: null,
  },
  {
    id: "gid://demo/Collection/harnesses",
    handle: "harnesses",
    title: "Harnesses",
    description:
      "Daily walk harnesses in recycled and standard nylon, cut for a calm silhouette.",
    image: null,
  },
  {
    id: "gid://demo/Collection/beds",
    handle: "beds",
    title: "Beds",
    description: "Nests, raised rest, and window perches in wool, linen, and oak.",
    image: null,
  },
  {
    id: "gid://demo/Collection/feeding",
    handle: "feeding",
    title: "Feeding",
    description:
      "Ceramic and stoneware vessels, plus a beech puzzle tray for slower meals.",
    image: null,
  },
  {
    id: "gid://demo/Collection/scratching",
    handle: "scratching",
    title: "Scratching",
    description:
      "Sisal column and wall panel — dedicated surfaces that belong in the room.",
    image: null,
  },
  {
    id: "gid://demo/Collection/new-arrivals",
    handle: "new-arrivals",
    title: "New arrivals",
    description: "The latest pieces to join the edit.",
    image: null,
  },
  {
    id: "gid://demo/Collection/best-sellers",
    handle: "best-sellers",
    title: "Best sellers",
    description: "The pieces people return for.",
    image: null,
  },
];

export function findDemoProduct(handle: string): Product | undefined {
  return demoProducts.find((product) => product.handle === handle);
}

export function findDemoVariant(variantId: string):
  | {
      product: Product;
      variant: ProductVariant;
    }
  | undefined {
  for (const product of demoProducts) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) {
      return { product, variant };
    }
  }
  return undefined;
}
