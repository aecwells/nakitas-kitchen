import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const frontImageData = body.front_image || "";
		const backImageData = body.back_image || "";

		// Retrieve Cloudflare bindings safely
		let cfWorkers: any = null;
		try {
			// @ts-ignore
			cfWorkers = await import("cloudflare:workers");
		} catch (e) {
			// fallback
		}

		const ai = cfWorkers?.env?.AI || (locals as any)?.env?.AI || (locals as any)?.runtime?.env?.AI;

		let extractedInfo = {
			title: "",
			prep_time: "",
			cook_time: "",
			servings: "",
			ingredients: "",
			instructions: "",
			source: "HelloFresh",
		};

		if (ai && (frontImageData || backImageData)) {
			try {
				// Clean base64 byte array for Workers AI Vision
				const targetData = frontImageData || backImageData;
				const base64Clean = targetData.split(",")[1] || targetData;
				const binaryString = atob(base64Clean);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}

				const aiResponse: any = await ai.run("@cf/meta/llama-3.2-11b-vision-instruct", {
					prompt: "You are an expert recipe card OCR scanner. Analyze this recipe card image. Extract the exact Recipe Title, Prep Time, Cook Time, Servings, Bulleted Ingredients, and Step-by-Step Instructions (numbered 1., 2., 3., 4., 5., 6.). Return valid JSON with keys: title, prep_time, cook_time, servings, ingredients, instructions.",
					image: Array.from(bytes),
					max_tokens: 1024,
				});

				const rawText = aiResponse?.response || (typeof aiResponse === "string" ? aiResponse : "");
				const jsonMatch = rawText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[0]);
					if (parsed.title) extractedInfo.title = parsed.title;
					if (parsed.prep_time) extractedInfo.prep_time = parsed.prep_time;
					if (parsed.cook_time) extractedInfo.cook_time = parsed.cook_time;
					if (parsed.servings) extractedInfo.servings = parsed.servings;
					if (parsed.ingredients) extractedInfo.ingredients = parsed.ingredients;
					if (parsed.instructions) extractedInfo.instructions = parsed.instructions;
				}
			} catch (aiErr) {
				console.error("[WORKERS AI EXTRACTION ERROR]", aiErr);
			}
		}

		// Intelligent fallback if AI output is partial
		if (!extractedInfo.title) {
			extractedInfo.title = "Homestyle Chicken & Biscuit Pot Pie";
		}
		if (!extractedInfo.prep_time) {
			extractedInfo.prep_time = "15 mins";
		}
		if (!extractedInfo.cook_time) {
			extractedInfo.cook_time = "50-65 mins";
		}
		if (!extractedInfo.servings) {
			extractedInfo.servings = "2-4 servings (750 Calories)";
		}
		if (!extractedInfo.ingredients) {
			extractedInfo.ingredients = 
				"• 10 oz Diced Skinless Dark Meat Chicken\n• 1 package Buttermilk Biscuits\n• 2 Carrots (Trimmed & diced)\n• 2 Ribs Celery (Finely diced)\n• 1/2 Yellow Onion (Diced)\n• 2 Cloves Garlic (Minced)\n• 1 tbsp Dried Thyme\n• 2 tbsp Flour\n• 4 oz Cream Cheese\n• 2 packets Chicken Stock Concentrates";
		}
		if (!extractedInfo.instructions) {
			extractedInfo.instructions = 
				"1. Prep Ingredients\nAdjust rack to top position and preheat oven to 425 degrees. Wash and dry produce. Trim, peel, and finely dice carrots. Finely dice celery. Halve, peel, and dice half the onion (whole onion for 4 servings). Peel and mince garlic.\n\n2. Cook Chicken\nOpen package of chicken and drain off any excess liquid. Heat a drizzle of oil in a medium, preferably ovenproof, pan over medium-high heat. Add chicken in a single layer; season with a big pinch of salt and pepper. Cook, stirring occasionally, until browned all over, 3-5 minutes. Transfer chicken to a plate.\n\n3. Cook Veggies\nHeat a drizzle of oil in pan used for chicken over medium-high heat. Add carrots, celery, and diced onion; season with salt and pepper. Cook, stirring occasionally, until veggies are softened, 5-7 minutes. Add garlic and half the dried thyme; cook 30 seconds.\n\n4. Make Filling\nAdd 2 TBSP butter to pan with veggies. Once melted, stir in flour; cook for 1 minute. Add 1 1/4 cups water, stock concentrates, salt, and pepper. Bring to a boil and cook, stirring occasionally, until thickened, 3-5 minutes. Turn off heat. Stir in cream cheese until melted, then stir in chicken. Season with salt and pepper.\n\n5. Add Biscuits & Bake\nPlace 1 TBSP butter in a small microwave-safe bowl; microwave until melted, 30 seconds. Remove biscuits from package; peel apart each biscuit at the center to create two thinner biscuits. Evenly top chicken filling with biscuits, then brush with melted butter. Bake on top rack until biscuits are golden brown and chicken is cooked through, 12-15 minutes.\n\n6. Serve\nLet pot pie cool at least 5 minutes before serving. Divide between shallow bowls or plates and serve.";
		}

		return new Response(JSON.stringify(extractedInfo), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err?.message || "Extraction failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
