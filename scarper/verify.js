import { Client, Databases } from "node-appwrite";
const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("68dd18860033ab7dffac")
  .setKey(process.env.APPWRITE_API_KEY);
const db = new Databases(client);
(async()=> {
  try {
    const r = await db.list();
    console.log("VERIFY OK:", r);
  } catch(e) {
    console.error("VERIFY FAIL:", e);
  }
})();
