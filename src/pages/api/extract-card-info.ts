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

				// 1. Try Messages format for Llama 3.2 11B Vision
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
						max_tokens: 512,
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

		// 1. Process Front Card Image (Dedicated Title + Details)
		if (frontImageData) {
			// Direct dedicated title extraction prompt
			const titlePrompt = "What is the exact main dish title printed on this recipe card (e.g. Cheese Smashed Burgers, Tilapia with Scallion Rice)? Respond with ONLY the dish name title.";
			const titleText = await runVisionOCR(frontImageData, titlePrompt);
			if (titleText) {
				console.log("[FRONT RAW TITLE OCR]:", titleText);
				const cleaned = cleanTitleText(titleText);
				if (cleaned.length > 2) {
					extractedInfo.title = cleaned;
				}
			}

			// Full details prompt (prep time, cook time, servings, ingredients)
			const frontPrompt = "Extract Prep Time, Cook Time, Servings, and Ingredients from this recipe card front photo. Return valid JSON with keys: title, prep_time, cook_time, servings, ingredients.";
			const frontText = await runVisionOCR(frontImageData, frontPrompt);
			if (frontText) {
				console.log("[FRONT DETAILS OCR]:", frontText);
				const jsonMatch = frontText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.title && !extractedInfo.title) extractedInfo.title = cleanTitleText(parsed.title);
						if (parsed.prep_time) extractedInfo.prep_time = parsed.prep_time.trim();
						if (parsed.cook_time) extractedInfo.cook_time = parsed.cook_time.trim();
						if (parsed.servings) extractedInfo.servings = parsed.servings.trim();
						if (parsed.ingredients) extractedInfo.ingredients = parsed.ingredients.trim();
					} catch (e) {}
				}
			}
		}

		// 2. Process Back Card Image (Step-by-Step Instructions)
		if (backImageData) {
			const backPrompt = "Extract all Step-by-Step Cooking Instructions (numbered 1., 2., 3., 4., 5., 6.) from the back of this recipe card. Return valid JSON with key: instructions.";
			const backText = await runVisionOCR(backImageData, backPrompt);
			if (backText) {
				console.log("[BACK OCR TEXT]:", backText);
				const jsonMatch = backText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.instructions) extractedInfo.instructions = parsed.instructions.trim();
						if (parsed.title && !extractedInfo.title) extractedInfo.title = cleanTitleText(parsed.title);
					} catch (e) {}
				}
				if (!extractedInfo.instructions && backText.length > 20) {
					extractedInfo.instructions = backText.trim();
				}
			}
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
