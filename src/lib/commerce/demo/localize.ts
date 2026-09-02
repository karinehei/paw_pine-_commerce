import type { Cart, Collection, Product } from "@/lib/commerce/types";
import type { Locale } from "@/lib/i18n/config";

const products: Record<
  string,
  { title: string; description: string; features: string[]; material?: string }
> = {
  "oakwood-chew-ring": {
    title: "Tamminen pureskelurengas",
    description:
      "Hillitysti sorvattu rengas eurooppalaisesta tammesta. Tarpeeksi sileä sisäleikkiin, tarpeeksi tiheä kestämään vakavan pureskelun iltapäivän.\n\nViimeistelty elintarviketurvallisella öljyllä ja jätetty hieman tuntuvaksi, jotta se tuntuisi keittiön esineeltä eikä lelukorista poimitulta.",
    features: [
      "Massiivinen eurooppalainen tammi, elintarviketurvallinen öljy",
      "Suunniteltu kohtuullisille pureskelijoille",
      "Helppo pyyhkiä puhtaaksi",
    ],
    material: "Tammi",
  },
  "canvas-tug-rope": {
    title: "Canvas-vetoköysi",
    description:
      "Kolmisäikeinen veto valkaisemattomasta puuvillacanvasista. Painoa juuri sen verran että leikki on oikea, ilman neonpalettia joka yleensä kuuluu mukaan.\n\nPäät on sidottu tummemmalla twillillä, jotta ne pysyvät siisteinä pesun jälkeen.",
    features: [
      "Valkaisematon puuvillacanvas",
      "Kestää konepesun",
      "Painotettu vetoleikkiin",
    ],
    material: "Puuvilla",
  },
  "trail-harness": {
    title: "Polkuvaljaat",
    description:
      "Päivittäiset valjaat kierrätetystä nylonista, leikattu hiljaiseen siluettiin. Metalliosat ovat harjattua messinkiä, ei kiiltävää muovia.",
    features: ["Kierrätetty nylon", "Neljä säätöpistettä", "Messinkinen solki"],
    material: "Nylon",
  },
  "everyday-walk-harness": {
    title: "Arkivaljaat",
    description:
      "Kevyemmät valjaat tavalliseen kävelyyn. Sama hillitty leikkaus, pehmeämpi kosketus kaulalle.",
    features: ["Pehmeä kaulavuori", "Heijastavat tikkaukset", "Pikalukko"],
    material: "Nylon",
  },
  "wool-nest-bed": {
    title: "Villapesä",
    description:
      "Huovutettu villapesä, joka pitää muotonsa. Reuna on tarpeeksi korkea että koira voi nojata, tarpeeksi matala että se näyttää huonekalulta.",
    features: ["Huovutettu villa", "Irrotettava pellavapäällinen", "Pestävä"],
    material: "Villa",
  },
  "raised-rest-bed": {
    title: "Korotettu lepopaikka",
    description:
      "Tammirunko ja pellavakangas. Ilma kiertää alla. Seisoo kuin pieni penkki, ei kuin urheiluväline.",
    features: ["Tamminen runko", "Pellavakangas", "Kokoontaittuva kuljetusta varten"],
    material: "Tammi",
  },
  "stoneware-bowl-set": {
    title: "Kivitavara-astiasto",
    description:
      "Kaksi kivitavarakuppia, lasitettu sisältä. Pohja on raskas, jotta kuppi pysyy keittiötasolla.",
    features: ["Kivitavara", "Elintarvikekelpoinen lasite", "Kaksi kokoa"],
    material: "Kivitavara",
  },
  "slow-feeder-bowl": {
    title: "Hidastusruokakuppi",
    description:
      "Kierteinen kivitavarakuppi, joka hidastaa ahmimista ilman muovilabyrinttiä.",
    features: ["Kierteinen sisäpinta", "Kivitavara", "Konepesun kestävä"],
    material: "Kivitavara",
  },
  "felt-mouse-trio": {
    title: "Huopahiirikolmikko",
    description:
      "Kolme huovutettua hiirtä villasta. Ei muovisia silmiä, ei kilinää. Leikki joka voi olla sohvalla.",
    features: ["Huovutettu villa", "Catnip-tasku", "Käsityötä"],
    material: "Villa",
  },
  "willow-wand-teaser": {
    title: "Pajuvapa",
    description:
      "Pajukeppi ja pellavalanka. Yksinkertainen houkutin, joka ei näytä stadionmainokselta.",
    features: ["Pajuvarsi", "Vaihdettava pellavapää", "Kevyt"],
    material: "Paju",
  },
  "sisal-scratch-column": {
    title: "Sisalpylväs",
    description:
      "Sisalpylväs tammijalustalla. Omistettu pinta, jotta sohva saa olla sohva.",
    features: ["Sisal", "Tamminen jalusta", "Vaihdettava kääre"],
    material: "Sisal",
  },
  "wall-scratch-panel": {
    title: "Seinäraapimapaneeli",
    description:
      "Seinään kiinnitettävä sisalpaneeli. Vie vähän lattiaa, antaa kissalle pystysuunnan.",
    features: ["Sisal", "Piilotetut kiinnikkeet", "Kaksi kokoa"],
    material: "Sisal",
  },
  "window-perch": {
    title: "Ikkunataso",
    description:
      "Pellavaistuin ja kiinnike vuokraikkunaan. Ei poraamista, ei jälkeä maaliin.",
    features: ["Pellavaistuin", "Kiristettävä kiinnike", "Irrotettava päällinen"],
    material: "Pellava",
  },
  "cave-bed": {
    title: "Luolapesä",
    description:
      "Huovutettu luola kissalle, joka haluaa kattaa näkymän. Reikä on tarpeeksi suuri, sisus tarpeeksi hämärä.",
    features: ["Huovutettu villa", "Tukeva muoto", "Pestävä pussi"],
    material: "Villa",
  },
  "ceramic-dish": {
    title: "Keramiikkakulho",
    description:
      "Yksi keramiikkakulho, lähellä keittiön astioita. Raskas pohja, hillitty lasite.",
    features: ["Keramiikka", "Raskas pohja", "Konepesun kestävä"],
    material: "Keramiikka",
  },
  "puzzle-feeder": {
    title: "Älyruokinta-alusta",
    description:
      "Pyökkialusta, joka hidastaa ruokailua. Ei muovisia nuppeja, vain koverrettuja koloja.",
    features: ["Pyökki", "Öljytty pinta", "Käsienpesu"],
    material: "Pyökki",
  },
};

const collections: Record<string, { title: string; description: string }> = {
  all: {
    title: "Kaikki tuotteet",
    description:
      "Koko Paw & Pinen editointi — esineitä koirille ja kissoille, valittu materiaalin ja arjen mukaan.",
  },
  dogs: {
    title: "Koirat",
    description:
      "Kävelyvarusteet, lepo ja ruokinta samalla huolella kuin muun kodin esineet.",
  },
  cats: {
    title: "Kissat",
    description:
      "Raapiminen, tasot ja hiljaiset lelut, jotka sopivat harkittuun huoneeseen.",
  },
  toys: {
    title: "Lelut",
    description:
      "Puuta, villaa ja canvasia — leikkiä ilman tavanomaista visuaalista hälyä.",
  },
  harnesses: {
    title: "Valjaat",
    description:
      "Arkivaljaat kierrätetystä ja tavallisesta nylonista, hillittyyn siluettiin.",
  },
  beds: {
    title: "Pedit",
    description: "Pesät, korotettu lepo ja ikkunatasot villasta, pellavasta ja tammesta.",
  },
  feeding: {
    title: "Ruokinta",
    description:
      "Keraamiset ja kivitavara-astiat sekä pyökkinen älyalusta hitaampaan ateriaan.",
  },
  scratching: {
    title: "Raapiminen",
    description:
      "Sisalpylväs ja seinäpaneeli — omistetut pinnat, jotka kuuluvat huoneeseen.",
  },
  "new-arrivals": {
    title: "Uutuudet",
    description: "Uusimmat kappaleet valikoimaan.",
  },
  "best-sellers": {
    title: "Suosituimmat",
    description: "Kappaleet, joiden perään palataan.",
  },
};

export function localizeProduct(product: Product, locale: Locale): Product {
  const copy = catalogueCopy[locale]?.products[product.handle];
  if (!copy) {
    return product;
  }
  return {
    ...product,
    title: copy.title,
    description: copy.description,
    descriptionHtml: product.descriptionHtml,
    features: copy.features,
    material: copy.material ?? product.material,
    care: "Pyyhi puhtaaksi. Vältä voimakkaita kemikaaleja.",
    dimensions: "Mittakaava näkyy tuotekuvissa.",
  };
}

export function localizeCollection(collection: Collection, locale: Locale): Collection {
  const copy = catalogueCopy[locale]?.collections[collection.handle];
  if (!copy) {
    return collection;
  }
  return { ...collection, ...copy };
}

const catalogueCopy: Partial<
  Record<
    Locale,
    {
      products: typeof products;
      collections: typeof collections;
    }
  >
> = {
  fi: { products, collections },
};

export function localizeCart(cart: Cart, locale: Locale): Cart {
  return {
    ...cart,
    lines: cart.lines.map((line) => {
      const copy = catalogueCopy[locale]?.products[line.merchandise.product.handle];
      if (!copy) {
        return line;
      }
      return {
        ...line,
        merchandise: {
          ...line.merchandise,
          product: { ...line.merchandise.product, title: copy.title },
        },
      };
    }),
  };
}

export function localizeProducts(list: Product[], locale: Locale): Product[] {
  return list.map((product) => localizeProduct(product, locale));
}
