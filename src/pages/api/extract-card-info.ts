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
						max_tokens: 1024,
					});
				} catch (err1) {
					console.error("[VISION MSG ERR]", err1);
					// 2. Try direct prompt format
					try {
						aiResponse = await ai.run("@cf/meta/llama-3.2-11b-vision-instruct", {
							prompt: promptText,
							image: byteArray,
							max_tokens: 1024,
						});
					} catch (err2) {
						console.error("[VISION PROMPT ERR]", err2);
						try {
							aiResponse = await ai.run("@cf/unum/uform-gen2-qwen-500m", {
								prompt: promptText,
								image: byteArray,
							});
						} catch (err3) {
							console.error("[UFORM ERR]", err3);
						}
					}
				}

				return aiResponse?.response || (typeof aiResponse === "string" ? aiResponse : "");
			} catch (e) {
				console.error("[RUN VISION OCR ERR]", e);
				return null;
			}
		}

		// 1. Process Front Card Image (Title, Prep/Cook Time, Servings, Ingredients)
		if (frontImageData) {
			const frontPrompt = "What is the main recipe title written on this recipe card (e.g. Cheese Smashed Burgers, Tilapia with Scallion Rice)? Extract the exact Recipe Title, Prep Time, Cook Time, Servings, and Ingredients. Return valid JSON with keys: title, prep_time, cook_time, servings, ingredients.";
			const frontText = await runVisionOCR(frontImageData, frontPrompt);
			if (frontText) {
				console.log("[FRONT OCR TEXT]:", frontText);
				
				// Try JSON extraction first
				const jsonMatch = frontText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.title) extractedInfo.title = parsed.title.trim();
						if (parsed.prep_time) extractedInfo.prep_time = parsed.prep_time.trim();
						if (parsed.cook_time) extractedInfo.cook_time = parsed.cook_time.trim();
						if (parsed.servings) extractedInfo.servings = parsed.servings.trim();
						if (parsed.ingredients) extractedInfo.ingredients = parsed.ingredients.trim();
					} catch (e) {}
				}

				// Fallback title regex extraction if JSON parse didn't get title
				if (!extractedInfo.title) {
					const titleMatch = frontText.match(/(?:title|recipe|dish|name):\s*["']?([^"'\n\r}]+)/i);
					if (titleMatch) {
						extractedInfo.title = titleMatch[1].replace(/["'{}]/g, "").trim();
					} else {
						// Clean line extraction
						const cleanLines = frontText.split("\n").map(l => l.replace(/[*#`"'{}]/g, "").trim()).filter(l => l.length > 3 && !/here is|json|recipe card|ingredients|prep|cook/i.test(l));
						if (cleanLines.length > 0) {
							extractedInfo.title = cleanLines[0];
						}
					}
				}
			}
		}

		// 2. Process Back Card Image (Step-by-Step Instructions)
		if (backImageData) {
			const backPrompt = "Analyze the back of this recipe card. Extract all Step-by-Step Cooking Instructions (numbered 1., 2., 3., 4., 5., 6.). Return valid JSON with key: instructions.";
			const backText = await runVisionOCR(backImageData, backPrompt);
			if (backText) {
				console.log("[BACK OCR TEXT]:", backText);
				const jsonMatch = backText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.instructions) extractedInfo.instructions = parsed.instructions.trim();
						if (parsed.title && !extractedInfo.title) extractedInfo.title = parsed.title.trim();
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
