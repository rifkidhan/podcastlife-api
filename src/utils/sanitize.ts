import { unified } from "unified";
import rehypeSanitize from "rehype-sanitize";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";

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
