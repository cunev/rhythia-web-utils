import { readdirSync, readFileSync } from "fs";
import path from "path";
import { rateMap } from "../src";
import { SSPMParser } from "../src/sspmParser";

async function main() {
  const files = readdirSync("./test/testing-maps");

  for (const file of files) {
    const filePath = path.join("./test/testing-maps", file);
    const parser = new SSPMParser(readFileSync(filePath));

    const parsedData = await parser.parse();
    parsedData.markers.sort((a, b) => a.position - b.position);

    let rating = rateMap(parsedData);
    console.log(parsedData.strings.mapName, rating);
  }
}

main();
