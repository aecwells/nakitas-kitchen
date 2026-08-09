import type { APIRoute } from "astro";

export const prerender = false;

const DEFAULT_INGREDIENTS = [
	"Ground Beef",
	"Yukon Gold Potatoes",
	"Yellow Onion",
	"Garlic Cloves",
	"Old Bay Seasoning",
	"Mayonnaise",
	"Ketchup",
	"Yellow Mustard",
	"Cheddar Cheese",
	"Skinless Dark Meat Chicken",
	"Buttermilk Biscuits",
	"Carrots",
	"Celery",
	"Dried Thyme",
	"Flour",
	"Cream Cheese",
	"Chicken Stock Concentrate",
	"Kosher Salt",
	"Black Pepper",
	"Unsalted Butter",
	"Fresh Rosemary",
	"Lemon",
	"Tilapia Fillets",
	"Jasmine Rice",
	"Green Beans",
	"Scallions",
	"Ginger",
	"Soy Sauce",
	"Sourdough Starter",
	"Bread Flour",
	"Lump Charcoal",
	"Applewood Chunks",
];

export const GET: APIRoute = async ({ locals }) => {
	try {
		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {}

		const db = cfWorkers?.env?.DB || (locals as any)?.env?.DB || (locals as any)?.runtime?.env?.DB;

		let ingredients = [...DEFAULT_INGREDIENTS];

		if (db) {
			try {
				await db.prepare(`
					CREATE TABLE IF NOT EXISTS ec_available_ingredients (
						id TEXT PRIMARY KEY,
						name TEXT UNIQUE NOT NULL,
						category TEXT,
						created_at DATETIME DEFAULT CURRENT_TIMESTAMP
					)
				`).run();

				const { results } = await db.prepare(`SELECT name FROM ec_available_ingredients ORDER BY name ASC`).all();
				if (results && results.length > 0) {
					const dbNames = results.map((r: any) => r.name);
					// merge defaults with DB names
					const set = new Set([...ingredients, ...dbNames]);
					ingredients = Array.from(set).sort();
				}
			} catch (dbErr) {
				console.error("[INGREDIENTS DB ERR]", dbErr);
			}
		}

		return new Response(JSON.stringify({ ingredients }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ ingredients: DEFAULT_INGREDIENTS }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}
};

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const newIngredients: string[] = body.ingredients || [];

		if (!Array.isArray(newIngredients) || newIngredients.length === 0) {
			return new Response(JSON.stringify({ success: true }), { status: 200 });
		}

		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {}

		const db = cfWorkers?.env?.DB || (locals as any)?.env?.DB || (locals as any)?.runtime?.env?.DB;

		if (db) {
			await db.prepare(`
				CREATE TABLE IF NOT EXISTS ec_available_ingredients (
					id TEXT PRIMARY KEY,
					name TEXT UNIQUE NOT NULL,
					category TEXT,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();

			for (const ing of newIngredients) {
				const clean = ing.replace(/^[\s•\-\d\/A-Za-z]+\s+(?:oz|tbsp|tsp|cup|cups|lb|lbs|package|packages|cloves|ribs)?\s*/i, "").trim();
				if (clean.length > 2) {
					const id = `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
					try {
						await db.prepare(`INSERT OR IGNORE INTO ec_available_ingredients (id, name) VALUES (?, ?)`).bind(id, clean).run();
					} catch (e) {}
				}
			}
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err?.message }), { status: 500 });
	}
};
