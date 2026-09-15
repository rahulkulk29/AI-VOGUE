import fs from "fs-extra";
import { Client, Databases, ID } from "node-appwrite";
import pLimit from "p-limit";

// ---------- CONFIG (FORCED NYC) ----------
const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("68dd18860033ab7dffac")
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Updated to new database and refined collections
const DATABASE_ID = "691f253500375353b25f";
const PANTS_COLLECTION_ID = "pant";   // pants listing collection
const SHIRTS_COLLECTION_ID = "shirt"; // shirts listing collection
const SHOES_COLLECTION_ID = "shoe";   // shoes listing collection

const CONCURRENCY = 5;

// Helper: given the file text and a marker like "//pants", extract the full
// JSON object that starts after the marker, using brace counting.
function extractJsonObject(raw, marker) {
  const markerIndex = raw.indexOf(marker);
  if (markerIndex === -1) return null;

  // Find first '{' after the marker
  let start = raw.indexOf("{", markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1; // include closing brace
        break;
      }
    }
  }

  if (end === -1) return null;
  return raw.slice(start, end);
}

// Load and split scraped.json into pants, shirts and shoes sections based on line comments.
async function loadSections() {
  const raw = await fs.readFile("./scraped.json", "utf8");

  const pantsJson = extractJsonObject(raw, "//pants");
  const shirtsJson = extractJsonObject(raw, "//shirts");
  const shoesJson = extractJsonObject(raw, "//shoes");

  if (!pantsJson || !shirtsJson) {
    throw new Error("Could not find both //pants and //shirts JSON blocks in scraped.json");
  }

  const pantsObj = JSON.parse(pantsJson);
  const shirtsObj = JSON.parse(shirtsJson);
  const shoesObj = shoesJson ? JSON.parse(shoesJson) : { items: [] };

  const pantsItems = Array.isArray(pantsObj.items) ? pantsObj.items : [];
  const shirtsItems = Array.isArray(shirtsObj.items) ? shirtsObj.items : [];
  const shoesItems = Array.isArray(shoesObj.items) ? shoesObj.items : [];

  if (!shoesJson) {
    console.warn("Warning: //shoes JSON block not found in scraped.json; skipping shoes import.");
  }

  return { pantsItems, shirtsItems, shoesItems };
}

async function insertOne(p, collectionId) {
  const payload = {
    brand: p.brand,
    title: p.title,
    link: p.link,
    image: p.image,
    price: p.price,
    originalPrice: p.originalPrice,
    // Appwrite 'tags' attribute is a string (max 50 chars), but scraped.json has an array.
    // Join array values into a comma-separated string, or use empty string.
    tags: Array.isArray(p.tags) ? p.tags.join(", ").slice(0, 50) : (p.tags || ""),
    // Appwrite 'sizes' attribute is a string (max 20 chars). Scraped data may be null,
    // an array, or a string; always coerce to a short string to avoid type errors.
    sizes: (() => {
      if (Array.isArray(p.sizes)) return p.sizes.join(",").slice(0, 20);
      if (p.sizes == null) return "";
      return String(p.sizes).slice(0, 20);
    })()
  };
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      collectionId,
      ID.unique(),
      payload
    );
    console.log("Created:", p.id);
  } catch (err) {
    console.error("Create failed for", p.id, "-", err.message);
  }
}

async function main(){
  const { pantsItems, shirtsItems, shoesItems } = await loadSections();

  const limit = pLimit(CONCURRENCY);

  // Import pants
  console.log("Importing", pantsItems.length, "pants items into collection '" + PANTS_COLLECTION_ID + "'...");
  await Promise.all(pantsItems.map(p => limit(() => insertOne(p, PANTS_COLLECTION_ID))));

  // Import shirts
  console.log("Importing", shirtsItems.length, "shirts items into collection '" + SHIRTS_COLLECTION_ID + "'...");
  await Promise.all(shirtsItems.map(p => limit(() => insertOne(p, SHIRTS_COLLECTION_ID))));

  // Import shoes (if present)
  if (shoesItems.length > 0) {
    console.log("Importing", shoesItems.length, "shoes items into collection '" + SHOES_COLLECTION_ID + "'...");
    await Promise.all(shoesItems.map(p => limit(() => insertOne(p, SHOES_COLLECTION_ID))));
  } else {
    console.log("No shoes items found to import (shoesItems.length === 0).");
  }

  console.log("Import finished for pants, shirts" + (shoesItems.length ? " and shoes" : "") + ".");
}

main();
