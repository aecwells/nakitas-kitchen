import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
	try {
		const key = params.key;
		if (!key) {
			return new Response("Missing image key", { status: 400 });
		}

		// Retrieve Cloudflare bindings safely
		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {}

		const media = cfWorkers?.env?.MEDIA || (locals as any)?.env?.MEDIA || (locals as any)?.runtime?.env?.MEDIA;

		if (!media) {
			return new Response("R2 Storage unavailable", { status: 500 });
		}

		const object = await media.get(key);

		if (!object) {
			return new Response("Image Not Found", { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set("etag", object.httpEtag);
		headers.set("cache-control", "public, max-age=31536000, immutable");
		if (!headers.has("content-type")) {
			if (key.endsWith(".png")) headers.set("content-type", "image/png");
			else if (key.endsWith(".webp")) headers.set("content-type", "image/webp");
			else headers.set("content-type", "image/jpeg");
		}

		return new Response(object.body, {
			headers,
		});
	} catch (err: any) {
		return new Response("Error serving media image", { status: 500 });
	}
};
