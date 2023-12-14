export const EnumSince = /* GraphQL */ `
	"""
	Enum Since
	"""
	enum Since {
		"""
		current value
		"""
		CURRENT
		"""
		day value
		"""
		DAY
		"""
		week value
		"""
		WEEK
		"""
		month value
		"""
		MONTH
	}
`;

export const EnumLanguage = /* GraphQL */ `
	"""
	Enum language for Fetch
	"""
	enum Language {
		"""
		English (en, en-US, en-GB, etc.)
		"""
		EN
		"""
		Bahasa Indonesia
		"""
		IN
	}
`;

export const EpisodeTypeEnum = /* GraphQL */ `
	enum EpisodeType {
		FULL
		TRAILER
		BONUS
	}
`;

export const EnumCategory = /* GraphQL */ `
	"""
	Enum category. Simplify categories from PodcastIndex categories.
	"""
	enum Category {
		"""
		Arts category. Includes arts, design, visual, and beauty.
		"""
		ARTS
		"""
		Business category. Includes business, careers, entrepreneurship, investing, management, marketing, and non-profit.
		"""
		BUSINESS
		"""
		Comedy category. Includes comedy and stand-up.
		"""
		COMEDY
		"""
		Education category. Includes education, courses, how-to, language, learning, and self-improvement.
		"""
		EDUCATION
		"""
		Fiction category. Includes fiction and drama.
		"""
		FICTION
		"""
		History category. Only history.
		"""
		HISTORY
		"""
		Health and Fitness category. Includes health, fitness, and mental.
		"""
		HEALTH_FITNESS
		"""
		Kids and Family category. Includes kids, family, parenting, pets, animals, and stories.
		"""
		KIDS_FAMILY
		"""
		Leisure category. Includes leisure, automotive, aviation, crafts, hobbies, home, and garden.
		"""
		LEISURE
		"""
		Music category.
		"""
		MUSIC
		"""
		News category. Includes news, daily, and entertainment.
		"""
		NEWS
		"""
		Politics category. Includes government and politics.
		"""
		POLITICS
		"""
		Science category
		"""
		SCIENCE
		"""
		Society and Culture category. Includes society and culture.
		"""
		SOCIETY_CULTURE
		"""
		Sports category.
		"""
		SPORTS
		"""
		Technology category.
		"""
		TECHNOLOGY
		"""
		True Crime category.
		"""
		TRUE_CRIME
		"""
		TV and Film category. Includes tv, film, after-shows, and reviews.
		"""
		TV_FILM
	}
`;
