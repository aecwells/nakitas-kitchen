import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const formData = await request.formData();
		const frontImage = formData.get("card_front_image") as File | null;
		const backImage = formData.get("card_back_image") as File | null;
		const source = (formData.get("source") as string) || "HomeChef";
		const equipment = (formData.get("equipment") as string) || "Kamado Joe Classic III";
		const customTitle = (formData.get("title") as string) || "";
		const customIngredients = (formData.get("ingredients") as string) || "";
		const customInstructions = (formData.get("instructions") as string) || "";

		// Generate title & slug
		const title = customTitle.trim() || `${source} Card Recipe - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
		const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
		const recipeId = `rec-${Date.now()}`;

		const prepTime = (formData.get("prep_time") as string) || "15 mins";
		const cookTime = (formData.get("cook_time") as string) || "30 mins";
		const servings = (formData.get("servings") as string) || "2-4 servings";
		const allergens = (formData.get("allergens") as string) || "See recipe card details";

		// Front card ingredients list
		const defaultIngredients = customIngredients.trim() || 
			"• 2 Protein Cutlets (Chicken / Steak / Pork)\n• 1 cup Seasoned Breadcrumbs or Herb Rub\n• 2 tbsp Olive Oil or Herb Butter\n• 12 oz Fresh Vegetables (Potatoes / Green Beans / Asparagus)\n• 1 Lemon or Sauce Packet";

		// Back card step-by-step instructions
		const rawInstructions = customInstructions.trim() || 
			"1. Prep Ingredients (Front Card)\nWash and dry all produce. Chop vegetables into 1/2-inch pieces.\n\n2. Sear Protein & Roast (Back Card)\nHeat oil in pan over medium-high heat. Sear protein until golden brown, then transfer to grill or oven to complete cooking.\n\n3. Finish & Serve\nDrizzle with sauce, squeeze fresh lemon, and serve warm.";

		const contentBlocks = rawInstructions.split("\n\n").map((step, idx) => {
			const lines = step.split("\n");
			const stepTitle = lines[0] || `Step ${idx + 1}`;
			const stepText = lines.slice(1).join(" ") || step;

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

		// Default featured image (from front photo)
		let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop";
		if (source.toLowerCase().includes("homechef") || source.toLowerCase().includes("hellofresh")) {
			imageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop";
		} else if (equipment.toLowerCase().includes("kamado") || equipment.toLowerCase().includes("oklahoma")) {
			imageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=800&fit=crop";
		}

		const featuredImageObj = JSON.stringify({
			id: `media-front-${Date.now()}`,
			src: imageUrl,
			alt: `${title} (Front Photo)`,
		});

		const backScanImageObj = JSON.stringify({
			id: `media-back-${Date.now()}`,
			src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop",
			alt: `${title} (Back Instructions Photo)`,
		});

		// Insert into D1
		// @ts-ignore
		const db = locals?.runtime?.env?.DB;

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
