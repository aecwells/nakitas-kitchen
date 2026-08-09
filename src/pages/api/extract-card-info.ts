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
			prep_time: "",
			cook_time: "",
			servings: "",
			ingredients: "",
			instructions: "",
			source: "HelloFresh",
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

				// Try Messages format for Llama 3.2 11B Vision
				try {
					aiResponse = await ai.run("@cf/meta/llama-3.2-11b-vision-instruct", {
						messages: [
							{
								role: "user",
								content: [
									{ type: "text", text: promptText },
									{ type: "image", image: byteArray },
								],
							},
						],
						max_tokens: 768,
					});
				} catch (err1) {
					console.error("[VISION MSG ERR]", err1);
					try {
						aiResponse = await ai.run("@cf/unum/uform-gen2-qwen-500m", {
							prompt: promptText,
							image: byteArray,
						});
					} catch (err2) {
						console.error("[UFORM ERR]", err2);
					}
				}

				return aiResponse?.response || (typeof aiResponse === "string" ? aiResponse : "");
			} catch (e) {
				console.error("[RUN VISION OCR ERR]", e);
				return null;
			}
		}

		function cleanTitleText(raw: string): string {
			if (!raw) return "";
			let text = raw.split("\n")[0].trim();
			text = text.replace(/^(?:the recipe title is|this recipe is|the dish is|recipe title|title|recipe|dish|name):\s*/i, "");
			text = text.replace(/[*#`"'{}]/g, "").trim();
			text = text.replace(/\s*(?:recipe card|hellofresh|homechef).*$/i, "");
			return text.trim();
		}

		// Run Front and Back Card Vision OCR in Parallel (Promise.all) for sub-3s response!
		const frontTask = (async () => {
			if (!frontImageData) return;
			const frontPrompt = "Analyze the front of this recipe card image. What is the dish title (e.g. Cheese Smashed Burgers, Tilapia with Scallion Rice)? Extract Recipe Title, Prep Time, Cook Time, Servings, and Ingredients List. Return valid JSON with keys: title, prep_time, cook_time, servings, ingredients.";
			const frontText = await runVisionOCR(frontImageData, frontPrompt);
			if (frontText) {
				console.log("[FRONT OCR RESULT]:", frontText);
				const jsonMatch = frontText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.title) extractedInfo.title = cleanTitleText(parsed.title);
						if (parsed.prep_time) extractedInfo.prep_time = parsed.prep_time.trim();
						if (parsed.cook_time) extractedInfo.cook_time = parsed.cook_time.trim();
						if (parsed.servings) extractedInfo.servings = parsed.servings.trim();
						if (parsed.ingredients) extractedInfo.ingredients = parsed.ingredients.trim();
					} catch (e) {}
				}

				if (!extractedInfo.title) {
					const titleMatch = frontText.match(/(?:title|recipe|dish|name):\s*["']?([^"'\n\r}]+)/i);
					if (titleMatch) {
						extractedInfo.title = cleanTitleText(titleMatch[1]);
					} else {
						const cleanLines = frontText.split("\n").map(cleanTitleText).filter(l => l.length > 3);
						if (cleanLines.length > 0) extractedInfo.title = cleanLines[0];
					}
				}
			}
		})();

		const backTask = (async () => {
			if (!backImageData) return;
			const backPrompt = "Analyze the back of this recipe card image. Extract exact Pantry Ingredient Quantities (e.g. 10 oz Ground Beef, 2 Yukon Gold Potatoes, 1 tbsp Old Bay Seasoning) and Step-by-Step Cooking Instructions (numbered 1., 2., 3., 4., 5., 6.). Return valid JSON with keys: ingredients, instructions.";
			const backText = await runVisionOCR(backImageData, backPrompt);
			if (backText) {
				console.log("[BACK OCR RESULT]:", backText);
				const jsonMatch = backText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.instructions) extractedInfo.instructions = parsed.instructions.trim();
						if (parsed.ingredients && parsed.ingredients.length > 10) {
							extractedInfo.ingredients = parsed.ingredients.trim();
						}
					} catch (e) {}
				}
				if (!extractedInfo.instructions && backText.length > 20) {
					extractedInfo.instructions = backText.trim();
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
