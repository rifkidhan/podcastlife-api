import { unified } from "https://esm.sh/unified@11";
import rehypeSanitize from "https://esm.sh/rehype-sanitize@6";
import rehypeParse from "https://esm.sh/rehype-parse@9";
import rehypeStringify from "https://esm.sh/rehype-stringify@10";

export const sanitizeHTML = async (
  content?: string | null,
  tagNames: string[] = ["ul", "ol", "li", "p", "div", "strong"],
) => {
  if (!content) return undefined;

  const data = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize, {
      tagNames,
    })
    .use(rehypeStringify)
    .process(content);

  return String(data);
};
