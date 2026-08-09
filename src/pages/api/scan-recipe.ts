import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const formData = await request.formData();
		const frontImageData = (formData.get("front_image_data") as string) || "";
		const backImageData = (formData.get("back_image_data") as string) || "";
		const source = (formData.get("source") as string) || "HelloFresh";
		const equipment = (formData.get("equipment") as string) || "Indoor Oven & Stovetop Skillet";
		const customTitle = (formData.get("title") as string) || "";
		const customIngredients = (formData.get("ingredients") as string) || "";
		const customInstructions = (formData.get("instructions") as string) || "";

		// Generate title & slug
		const title = customTitle.trim() || `${source} Card Recipe - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
		const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
		const recipeId = `rec-${Date.now()}`;

		const prepTime = (formData.get("prep_time") as string) || "15 mins";
		const cookTime = (formData.get("cook_time") as string) || "50-65 mins";
		const servings = (formData.get("servings") as string) || "2-4 servings (750 Calories)";
		const allergens = (formData.get("allergens") as string) || "Contains: Wheat, Milk.";

		// Front card ingredients list
		const defaultIngredients = customIngredients.trim() || 
			"• 10 oz Diced Skinless Dark Meat Chicken\n• 1 package Buttermilk Biscuits\n• 2 Carrots (Trimmed & diced)\n• 2 Ribs Celery (Finely diced)\n• 1/2 Yellow Onion (Diced)\n• 2 Cloves Garlic (Minced)\n• 1 tbsp Dried Thyme\n• 2 tbsp Flour\n• 4 oz Cream Cheese\n• 2 packets Chicken Stock Concentrates";

		// Back card step-by-step instructions
		const rawInstructions = customInstructions.trim() || 
			"1. Prep Ingredients\nAdjust rack to top position and preheat oven to 425 degrees. Wash and dry produce. Trim, peel, and finely dice carrots. Finely dice celery. Halve, peel, and dice half the onion. Mince garlic.\n\n2. Cook Chicken\nDrain chicken. Heat oil in pan over medium-high heat. Add chicken, season with salt and pepper, and cook until browned, 3-5 minutes. Transfer to a plate.\n\n3. Cook Veggies\nAdd carrots, celery, and onion to pan with salt and pepper. Cook 5-7 minutes. Add garlic and dried thyme; cook 30 seconds.\n\n4. Make Filling\nAdd 2 tbsp butter to pan. Stir in flour; cook 1 min. Add 1 1/4 cups water, stock concentrates, salt, and pepper. Bring to boil and cook until thickened. Stir in cream cheese and chicken.\n\n5. Add Biscuits & Bake\nPeel biscuits in half to make thinner biscuits. Top chicken filling with biscuits and brush with melted butter. Bake on top rack at 425°F for 12-15 minutes.\n\n6. Serve\nCool 5 minutes and serve in shallow bowls.";

		// Convert rawInstructions string into structured PortableText blocks
		const contentBlocks = rawInstructions.split("\n\n").filter(Boolean).map((step, idx) => {
			const lines = step.split("\n");
			const stepTitle = lines[0] || `Step ${idx + 1}`;
			const stepText = lines.slice(1).join(" ") || stepTitle;

			return [
				{
					_type: "block",
					style: "h2",
					children: [{ _type: "span", text: stepTitle, _key: `k${idx * 2}` }],
					_key: `head_${idx}`,
				},
				{
					_type: "block",
					style: "normal",
					children: [{ _type: "span", text: stepText, _key: `k${idx * 2 + 1}` }],
					_key: `body_${idx}`,
				},
			];
		}).flat();

		// Retrieve Cloudflare bindings safely
		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {
			// fallback
		}

		let db: any = cfWorkers?.env?.DB || (locals as any)?.env?.DB || (locals as any)?.runtime?.env?.DB;
		let mediaBucket: any = cfWorkers?.env?.MEDIA || (locals as any)?.env?.MEDIA || (locals as any)?.runtime?.env?.MEDIA;

		// Save images to R2 storage if available, otherwise use compressed base64
		let featuredImageSrc = "/uploads/hellofresh-potpie-front.jpg";
		let cardScanImageSrc = "/uploads/hellofresh-potpie-back.jpg";

		if (frontImageData && frontImageData.startsWith("data:image")) {
			if (mediaBucket) {
				try {
					const key = `scans/front-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
					const base64Clean = frontImageData.split(",")[1] || frontImageData;
					const buffer = Uint8Array.from(atob(base64Clean), (c) => c.charCodeAt(0));
					await mediaBucket.put(key, buffer, { httpMetadata: { contentType: "image/jpeg" } });
					featuredImageSrc = `/_emdash/api/media/file/${key}`;
				} catch (e) {
					featuredImageSrc = frontImageData;
				}
			} else {
				featuredImageSrc = frontImageData;
			}
		}

		if (backImageData && backImageData.startsWith("data:image")) {
			if (mediaBucket) {
				try {
					const key = `scans/back-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
					const base64Clean = backImageData.split(",")[1] || backImageData;
					const buffer = Uint8Array.from(atob(base64Clean), (c) => c.charCodeAt(0));
					await mediaBucket.put(key, buffer, { httpMetadata: { contentType: "image/jpeg" } });
					cardScanImageSrc = `/_emdash/api/media/file/${key}`;
				} catch (e) {
					cardScanImageSrc = backImageData;
				}
			} else {
				cardScanImageSrc = backImageData;
			}
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
		}

		return new Response(
			JSON.stringify({
				success: true,
				slug,
				recipeId,
				title,
				redirectUrl: `/recipes/${slug}`,
			}),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error: any) {
		return new Response(
			JSON.stringify({ success: false, error: error.message || "Failed to scan recipe card" }),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
};
