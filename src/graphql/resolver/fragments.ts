import {
	Enclosure,
	Phase2Person,
	Phase3AltEnclosure,
	Phase4Value,
	Phase4ValueRecipient,
	Phase1Transcript,
} from "https://esm.sh/podcast-partytime@4.7.0";

type AlternativeEnclosureSource = {
	contentType: string;
	uri: string;
};

type ParsedImageDensity = {
	url: string;
	density: number;
};

type ParsedImageUrl = {
	url: string;
};
type ParsedImageWidth = {
	url: string;
	width: number;
};

type PageInfo = {
	cursor?: string;
	count: number;
};

const fragments = {
	ParsedImageUrl: {
		url: (root: ParsedImageUrl) => root.url,
	},
	ParsedImageWidth: {
		url: (root: ParsedImageWidth) => root.url,
		width: (root: ParsedImageWidth) => root.width,
	},
	ParsedImageDensity: {
		url: (root: ParsedImageDensity) => root.url,
		density: (root: ParsedImageDensity) => root.density,
	},
	Recipient: {
		name: (root: Phase4ValueRecipient) => root.name,
		customKey: (root: Phase4ValueRecipient) => root.customKey,
		customValue: (root: Phase4ValueRecipient) => root.customValue,
		type: (root: Phase4ValueRecipient) => root.type,
		address: (root: Phase4ValueRecipient) => root.address,
		split: (root: Phase4ValueRecipient) => root.split,
		fee: (root: Phase4ValueRecipient) => root.fee,
	},
	Enclosure: {
		url: (root: Enclosure) => root.url,
		type: (root: Enclosure) => root.type,
		length: (root: Enclosure) => root.length,
	},
	Value: {
		type: (root: Phase4Value) => root.type,
		method: (root: Phase4Value) => root.method,
		recipients: (root: Phase4Value) => root.recipients,
		suggested: (root: Phase4Value) => root.suggested,
	},
	Person: {
		group: (root: Phase2Person) => root.group,
		href: (root: Phase2Person) => root.href,
		img: (root: Phase2Person) => root.img,
		name: (root: Phase2Person) => root.name,
		role: (root: Phase2Person) => root.role,
	},
	AlternativeEnclosureSource: {
		contentType: (root: AlternativeEnclosureSource) => root.contentType,
		uri: (root: AlternativeEnclosureSource) => root.uri,
	},
	AlternativeEnclosure: {
		title: (root: Phase3AltEnclosure) => root.title,
		type: (root: Phase3AltEnclosure) => root.type,
		length: (root: Phase3AltEnclosure) => root.length,
		source: (root: Phase3AltEnclosure) => root.source,
		bitrate: (root: Phase3AltEnclosure) => root.bitrate,
		codecs: (root: Phase3AltEnclosure) => root.codecs,
		default: (root: Phase3AltEnclosure) => root.default,
		height: (root: Phase3AltEnclosure) => root.height,
		lang: (root: Phase3AltEnclosure) => root.lang,
		rel: (root: Phase3AltEnclosure) => root.rel,
	},
	Transcript: {
		url: (root: Phase1Transcript) => root.url,
		type: (root: Phase1Transcript) => root.type,
		language: (root: Phase1Transcript) => root.language,
	},
	PageInfo: {
		count: (root: PageInfo) => root.count,
		endCursor: (root: PageInfo) => root.cursor,
	},
};

export default fragments;
