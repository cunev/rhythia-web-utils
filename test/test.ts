import { readdirSync, readFileSync } from "fs";
import path from "path";
import { calculatePerformancePoints, rateMap } from "../src";
import { SSPMParser } from "../src/sspmParser";

async function main() {
  const files = readdirSync("./test/testing-maps");

  for (const file of files) {
    const filePath = path.join("./test/testing-maps", file);
    const parser = new SSPMParser(readFileSync(filePath));

    const parsedData = await parser.parse();
    parsedData.markers.sort((a, b) => a.position - b.position);

    let rating = await rateMap(parsedData);
    console.log(
      file,
      Math.round(rating * 100) / 100,
      calculatePerformancePoints(rating, 1),
      calculatePerformancePoints(rating, 0.99496)
    );
  }
}

main();
