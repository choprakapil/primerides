import fs from "fs";
import path from "path";

const srcDir = path.resolve("src");

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getFiles(srcDir);
const graph = {};

files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const imports = [];
  const lines = content.split("\n");
  lines.forEach((line) => {
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      const importPath = match[1];
      if (importPath.startsWith("@/")) {
        const resolved = path.resolve(importPath.replace("@/", "src/"));
        imports.push(resolved);
      } else if (importPath.startsWith(".")) {
        const resolved = path.resolve(path.dirname(file), importPath);
        imports.push(resolved);
      }
    }
  });
  graph[file] = imports;
});

function findCycles(node, visited = new Set(), pathStack = []) {
  visited.add(node);
  pathStack.push(node);

  const neighbors = graph[node] || [];
  for (const neighbor of neighbors) {
    // try exact match or with extensions
    let resolvedNeighbor = neighbor;
    if (!graph[resolvedNeighbor]) {
      if (graph[neighbor + ".ts"]) resolvedNeighbor = neighbor + ".ts";
      else if (graph[neighbor + ".tsx"]) resolvedNeighbor = neighbor + ".tsx";
      else if (graph[path.join(neighbor, "index.ts")]) resolvedNeighbor = path.join(neighbor, "index.ts");
      else if (graph[path.join(neighbor, "index.tsx")]) resolvedNeighbor = path.join(neighbor, "index.tsx");
    }

    if (graph[resolvedNeighbor]) {
      if (pathStack.includes(resolvedNeighbor)) {
        const cycle = pathStack.slice(pathStack.indexOf(resolvedNeighbor));
        cycle.push(resolvedNeighbor);
        console.log("CYCLE FOUND:", cycle.map((p) => path.relative(srcDir, p)).join(" -> "));
      } else if (!visited.has(resolvedNeighbor)) {
        findCycles(resolvedNeighbor, visited, pathStack);
      }
    }
  }

  pathStack.pop();
}

files.forEach((file) => {
  findCycles(file);
});

console.log("Circular dependency analysis complete.");
