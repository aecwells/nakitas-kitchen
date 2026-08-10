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
		} catch (e) {}

		const ai = cfWorkers?.env?.AI || (locals as any)?.env?.AI || (locals as any)?.runtime?.env?.AI;

		let extractedInfo = {
			title: "",
			prep_time: "15 mins",
			cook_time: "35-45 mins",
			servings: "2-4 servings (990 Calories)",
			ingredients: "",
			instructions: "",
			source: "HelloFresh",
			allergens: "",
		};

		async function runVisionOCR(dataUrl: string, promptText: string) {
			if (!ai || !dataUrl) return null;
			try {
				const base64Clean = dataUrl.split(",")[1] || dataUrl;
				const binaryString = atob(base64Clean);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				const byteArray = Array.from(bytes);

				let aiResponse: any = null;

				// Try LLaVA 1.5 7B Vision Model
				try {
					aiResponse = await ai.run("@cf/llava-hf/llava-1.5-7b-hf", {
						prompt: promptText,
						image: byteArray,
						max_tokens: 512,
					});
				} catch (err1: any) {
					console.error("[LLAVA ERR]", err1?.message || err1);
					try {
						aiResponse = await ai.run("@cf/meta/llama-3.2-11b-vision-instruct", {
							prompt: `agree\n${promptText}`,
							image: byteArray,
							max_tokens: 512,
						});
					} catch (err2: any) {
						console.error("[LLAMA VISION ERR]", err2?.message || err2);
					}
				}

				const resultText = aiResponse?.description || aiResponse?.response || (typeof aiResponse === "string" ? aiResponse : "");
				return resultText;
			} catch (e) {
				console.error("[RUN VISION OCR ERR]", e);
				return null;
			}
		}

		function cleanTitleText(raw: string): string {
			if (!raw) return "";
			let text = raw.split("\n")[0].trim();
			text = text.replace(/^\\*"?title\\*"?\s*:\s*\\*"?/gi, "");
			text = text.replace(/^(?:the recipe title is|this recipe is|the dish is|recipe title|title|recipe|dish|name):\s*/gi, "");
			text = text.replace(/[\/\\*#`"'{},]+/g, " ").trim();
			text = text.replace(/^(?:the recipe title is|this recipe is|the dish is|recipe title|title|recipe|dish|name)\s+/gi, "");
			return text.trim();
		}

		// Run Front and Back Card Vision OCR in Parallel (Promise.all)
		const frontTask = (async () => {
			if (!frontImageData) return;
			const frontPrompt = "Look at the front of this HelloFresh recipe card image. Read the main bold dish title printed to the right of the HELLO FRESH logo (e.g. Cheesy Smashed Burgers). Read the cook time (e.g. 35-45 Minutes). Read all itemized ingredients with exact form variations and quantities from the right column (e.g. 10 oz Ground Beef, 12 oz Yukon Gold Potatoes, 2 Potato Buns, 1/2 Cup White Cheddar Cheese, 1 TBSP Old Bay Seasoning, 2 TBSP Mayonnaise). Identify common allergens (Dairy, Wheat, Nuts, Soy). Output plain text formatted as:\nTitle: <Title>\nCook Time: <Time>\nAllergens: <Allergens>\nIngredients:\n• <Ing1>\n• <Ing2>";
			const frontText = await runVisionOCR(frontImageData, frontPrompt);
			if (frontText) {
				console.log("[FRONT OCR RAW]:", frontText);
				
				// 1. Extract Title
				const titleMatch = frontText.match(/(?:title|dish|recipe):\s*([^\n]+)/i);
				if (titleMatch) {
					extractedInfo.title = cleanTitleText(titleMatch[1]);
				} else {
					const cleanLines = frontText.split("\n").map(cleanTitleText).filter(l => l.length > 3);
					if (cleanLines.length > 0) extractedInfo.title = cleanLines[0];
				}

				// 2. Extract Cook Time
				const cookMatch = frontText.match(/(?:cook time|time|minutes):\s*([^\n]+)/i);
				if (cookMatch) extractedInfo.cook_time = cookMatch[1].trim();

				// 3. Extract Allergens
				const allergenMatch = frontText.match(/(?:allergens|allergen|contains):\s*([^\n]+)/i);
				if (allergenMatch) extractedInfo.allergens = allergenMatch[1].trim();

				// 4. Extract Ingredients List
				const ingIndex = frontText.toLowerCase().indexOf("ingredients");
				if (ingIndex !== -1) {
					const ingLines = frontText.slice(ingIndex).split("\n").map(l => l.trim()).filter(l => l.length > 2 && !l.toLowerCase().includes("ingredients:"));
					if (ingLines.length > 0) {
						extractedInfo.ingredients = ingLines.map(l => l.startsWith("•") || l.startsWith("-") ? l : `• ${l}`).join("\n");
					}
				}
			}
		})();

		const backTask = (async () => {
			if (!backImageData) return;
			const backPrompt = "Look at the back of this recipe card image. Extract all step-by-step cooking instructions (numbered 1., 2., 3., 4., 5., 6.). Output plain text formatted as:\n1. <Step 1>\n2. <Step 2>\n3. <Step 3>\n4. <Step 4>\n5. <Step 5>\n6. <Step 6>";
			const backText = await runVisionOCR(backImageData, backPrompt);
			if (backText) {
				console.log("[BACK OCR RAW]:", backText);
				if (backText.length > 20) {
					// Clean up raw step text
					const cleanText = backText.replace(/[\{\}"]/g, "").trim();
					extractedInfo.instructions = cleanText;
				}
			}
		})();

		await Promise.all([frontTask, backTask]);

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
