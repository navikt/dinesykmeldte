import fs from "node:fs";
import path from "node:path";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

const docsDirectory = path.join(process.cwd(), "src/docs");

export async function markdownFileToSource(
  file: string,
): Promise<MDXRemoteSerializeResult> {
  const fileContents = fs.readFileSync(path.join(docsDirectory, file), "utf8");

  return await serialize(fileContents);
}
