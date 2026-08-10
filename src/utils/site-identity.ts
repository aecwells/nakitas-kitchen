/** Resolved media reference from getSiteSettings() */
export interface MediaReference {
	mediaId: string;
	alt?: string;
	url?: string;
}

export interface BlogSiteIdentitySettings {
	title?: string;
	tagline?: string;
	logo?: MediaReference;
	favicon?: MediaReference;
}

const DEFAULT_SITE_TITLE = "Nakita's Kitchen";
const DEFAULT_SITE_TAGLINE = "Live-Fire BBQ, Outdoor Smoker Cooking & Artisanal Sourdough Journal.";

export function resolveBlogSiteIdentity(settings?: BlogSiteIdentitySettings) {
	return {
		siteTitle: settings?.title && settings.title !== "My Blog" ? settings.title : DEFAULT_SITE_TITLE,
		siteTagline: settings?.tagline && !settings.tagline.includes("Thoughts") ? settings.tagline : DEFAULT_SITE_TAGLINE,
		siteLogo: settings?.logo?.url ? settings.logo : null,
	};
}
