const VARIANT_LIST_FIELDS = `
  id
  title
  availableForSale
  selectedOptions { name value }
  price { amount currencyCode }
  compareAtPrice { amount currencyCode }
`;

const PRODUCT_CARD_FIELDS = `
  id
  handle
  title
  description
  vendor
  productType
  tags
  createdAt
  availableForSale
  featuredImage {
    url
    altText
    width
    height
  }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  options {
    id
    name
    values
  }
  variants(first: 50) {
    nodes { ${VARIANT_LIST_FIELDS} }
  }
`;

const PRODUCT_FIELDS = `
  ${PRODUCT_CARD_FIELDS}
  descriptionHtml
  images(first: 8) {
    nodes {
      url
      altText
      width
      height
    }
  }
`;

export const PRODUCTS_QUERY = `
  query Products($query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: 50, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 30) {
      nodes {
        id
        handle
        title
        description
        image { url altText width height }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: 50, sortKey: $sortKey, reverse: $reverse) {
        nodes { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

export const SEARCH_QUERY = `
  query SearchProducts($query: String!) {
    search(query: $query, first: 50, types: PRODUCT) {
      nodes {
        ... on Product { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

export const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          selectedOptions { name value }
          price { amount currencyCode }
          image { url altText width height }
          product { handle title }
        }
      }
    }
  }
`;

export const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) { ${CART_FRAGMENT} }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FRAGMENT} }
      userErrors { code message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { code message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FRAGMENT} }
      userErrors { code message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FRAGMENT} }
      userErrors { code message }
    }
  }
`;
