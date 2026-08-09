import { createRequire } from "node:module";

if (typeof (globalThis as any).require === "undefined") {
	const req = createRequire(import.meta?.url || "file:///worker.js");
	(globalThis as any).require = (id: string) => {
		try {
			return req(id);
		} catch {
			return req(id.startsWith("node:") ? id : `node:${id}`);
		}
	};
}

// Worker entry: Astro's fetch handler plus EmDash's scheduled() handler, which
// the Cron Trigger in wrangler.jsonc drives. PluginBridge is the sandbox
// Durable Object, re-exported here so its binding resolves.
export { default, PluginBridge } from "@emdash-cms/cloudflare/worker";
