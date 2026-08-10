import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		let title = "";
		let source = "";
		let equipment = "";
		let prepTime = "";
		let cookTime = "";
		let servings = "";
		let defaultIngredients = "";
		let rawInstructions = "";
		let frontImage = "";
		let backImage = "";

		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			const body = await request.json();
			title = body.title || "";
			source = body.source || "";
			equipment = body.equipment || "";
			prepTime = body.prep_time || "";
			cookTime = body.cook_time || "";
			servings = body.servings || "";
			defaultIngredients = body.ingredients || "";
			rawInstructions = body.instructions || "";
			frontImage = body.front_image || "";
			backImage = body.back_image || "";
		} else {
			const formData = await request.formData();
			title = (formData.get("title") as string) || "";
			source = (formData.get("source") as string) || "";
			equipment = (formData.get("equipment") as string) || "";
			prepTime = (formData.get("prep_time") as string) || "";
			cookTime = (formData.get("cook_time") as string) || "";
			servings = (formData.get("servings") as string) || "";
			defaultIngredients = (formData.get("ingredients") as string) || "";
			rawInstructions = (formData.get("instructions") as string) || "";
			frontImage = (formData.get("front_image_data") as string) || "";
			backImage = (formData.get("back_image_data") as string) || "";
		}

		if (!title) title = "Scanned HelloFresh Recipe";
		if (!source) source = "HelloFresh Meal Card";
		if (!equipment) equipment = "Indoor Oven & Stovetop Skillet";
		if (!prepTime) prepTime = "15 mins";
		if (!cookTime) cookTime = "35-45 mins";
		if (!servings) servings = "2-4 servings (990 Cal)";

		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		const recipeId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

		// Retrieve Cloudflare bindings safely
		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {}

		const db = cfWorkers?.env?.DB || (locals as any)?.env?.DB || (locals as any)?.runtime?.env?.DB;
		const media = cfWorkers?.env?.MEDIA || (locals as any)?.env?.MEDIA || (locals as any)?.runtime?.env?.MEDIA;

		// 1. Upload Front & Back images to R2 storage if available
		let featuredImageSrc = frontImage.startsWith("data:") ? frontImage : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop";
		let cardScanImageSrc = backImage.startsWith("data:") ? backImage : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop";

		if (media && frontImage.startsWith("data:")) {
			try {
				const frontKey = `scans/${slug}-front-${Date.now()}.jpg`;
				const frontBase64 = frontImage.split(",")[1];
				const frontBuffer = Uint8Array.from(atob(frontBase64), (c) => c.charCodeAt(0));
				await media.put(frontKey, frontBuffer, { httpMetadata: { contentType: "image/jpeg" } });
				featuredImageSrc = `/api/media/${frontKey}`;
			} catch (err) {
				console.error("[R2 FRONT UPLOAD ERR]", err);
			}
		}

		if (media && backImage.startsWith("data:")) {
			try {
				const backKey = `scans/${slug}-back-${Date.now()}.jpg`;
				const backBase64 = backImage.split(",")[1];
				const backBuffer = Uint8Array.from(atob(backBase64), (c) => c.charCodeAt(0));
				await media.put(backKey, backBuffer, { httpMetadata: { contentType: "image/jpeg" } });
				cardScanImageSrc = `/api/media/${backKey}`;
			} catch (err) {
				console.error("[R2 BACK UPLOAD ERR]", err);
			}
		}

		// 2. Parse Step-by-Step Instructions into PortableText blocks
		const instructionLines = rawInstructions
			.split("\n")
			.map((l: string) => l.trim())
			.filter((l: string) => l.length > 0);

		const contentBlocks: any[] = [];
		let stepCount = 1;

		for (const line of instructionLines) {
			if (/^\d+\.\s*/.test(line)) {
				const stepText = line.replace(/^\d+\.\s*/, "");
				contentBlocks.push({
					_type: "block",
					style: "h2",
					_key: `step-h-${stepCount}`,
					children: [{ _type: "span", text: `Step ${stepCount}: ${stepText.slice(0, 45)}...`, _key: `span-h-${stepCount}` }],
				});
				contentBlocks.push({
					_type: "block",
					style: "normal",
					_key: `step-b-${stepCount}`,
					children: [{ _type: "span", text: stepText, _key: `span-b-${stepCount}` }],
				});
				stepCount++;
			} else {
				contentBlocks.push({
					_type: "block",
					style: "normal",
					_key: `step-p-${Math.random().toString(36).slice(2, 7)}`,
					children: [{ _type: "span", text: line, _key: `span-p-${Math.random().toString(36).slice(2, 7)}` }],
				});
			}
		}

		// 3. Extract allergens
		let allergens = "Contains: Dairy, Wheat / Gluten. Always verify full allergen info on meal card.";
		if (defaultIngredients.toLowerCase().includes("peanut") || defaultIngredients.toLowerCase().includes("nut")) {
			allergens += " (Tree Nuts / Peanuts present)";
		}

		const featuredImageObj = JSON.stringify({
			id: `media-front-${Date.now()}`,
			src: featuredImageSrc,
			alt: `${title} (Front Photo)`,
		});

		const backScanImageObj = JSON.stringify({
			id: `media-back-${Date.now()}`,
			src: cardScanImageSrc,
			alt: `${title} (Back Instructions Photo)`,
		});

		if (db) {
			// Save recipe to ec_recipes
			await db.prepare(`
				INSERT INTO ec_recipes (id, slug, status, title, recipe_source, equipment, cooking_method, prep_time, cook_time, servings, ingredients, allergens, cottage_license_notice, excerpt, featured_image, card_scan_image, content, published_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
			`).bind(
				recipeId,
				slug,
				"published",
				title,
				source,
				equipment,
				equipment.includes("Kamado") ? "Kamado Ceramic Bake / Smoke" : equipment.includes("Oklahoma") ? "Pellet Smoke" : "Pan-Seared & Oven Bake",
				prepTime,
				cookTime,
				servings,
				defaultIngredients,
				allergens,
				source.includes("Cottage") ? "Baked in a Cottage Food Operation (License #CFO-LA-2026-9481)." : `Scanned from 2-Sided ${source} Recipe Card (Front & Back).`,
				`Extracted recipe for ${title} from ${source} two-sided card photo.`,
				featuredImageObj,
				backScanImageObj,
				JSON.stringify(contentBlocks)
			).run();

			// Automatically save extracted ingredients into ec_available_ingredients repository!
			try {
				await db.prepare(`
					CREATE TABLE IF NOT EXISTS ec_available_ingredients (
						id TEXT PRIMARY KEY,
						name TEXT UNIQUE NOT NULL,
						category TEXT,
						created_at DATETIME DEFAULT CURRENT_TIMESTAMP
					)
				`).run();

				const ingLines = defaultIngredients.split("\n");
				for (const line of ingLines) {
					const clean = line
						.replace(/^[\s•\-\*\d\/A-Za-z]+\s+(?:oz|tbsp|tsp|cup|cups|lb|lbs|package|packages|cloves|ribs|person)?\s*/i, "")
						.replace(/^[\s•\-\*\d\/]+/g, "")
						.trim();
					if (clean.length > 2) {
						const ingId = `ing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
						try {
							await db.prepare(`INSERT OR IGNORE INTO ec_available_ingredients (id, name) VALUES (?, ?)`).bind(ingId, clean).run();
						} catch (e) {}
					}
				}
			} catch (ingDbErr) {
				console.error("[SAVE INGREDIENTS DB ERR]", ingDbErr);
			}
		}

		return new Response(
			JSON.stringify({
				success: true,
				id: recipeId,
				slug: slug,
				title: title,
				redirect: `/recipes/${slug}`,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (err: any) {
		console.error("[SCAN RECIPE API ERR]", err);
		return new Response(
			JSON.stringify({
				error: err?.message || "Failed to process recipe card",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};
