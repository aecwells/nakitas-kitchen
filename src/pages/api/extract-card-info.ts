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

				let aiResponse: any = null;
				try {
					aiResponse = await ai.run("@cf/meta/llama-3.2-11b-vision-instruct", {
						prompt: "You are an expert recipe card OCR scanner. Analyze this recipe card image. Extract the exact Recipe Title, Prep Time, Cook Time, Servings, Bulleted Ingredients, and Step-by-Step Instructions (numbered 1., 2., 3., 4., 5., 6.). Return valid JSON with keys: title, prep_time, cook_time, servings, ingredients, instructions.",
						image: [...bytes],
						max_tokens: 1024,
					});
				} catch (err1) {
					console.error("[LLAMA VISION ERROR]", err1);
					try {
						aiResponse = await ai.run("@cf/unum/uform-gen2-qwen-500m", {
							prompt: "Extract recipe title, ingredients, and instructions from this card.",
							image: [...bytes],
						});
					} catch (err2) {
						console.error("[UFORM VISION ERROR]", err2);
					}
				}

				const rawText = aiResponse?.response || (typeof aiResponse === "string" ? aiResponse : "");
				console.log("[WORKERS AI RAW OCR TEXT]:", rawText);

				const jsonMatch = rawText.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const parsed = JSON.parse(jsonMatch[0]);
						if (parsed.title) extractedInfo.title = parsed.title.trim();
						if (parsed.prep_time) extractedInfo.prep_time = parsed.prep_time.trim();
						if (parsed.cook_time) extractedInfo.cook_time = parsed.cook_time.trim();
						if (parsed.servings) extractedInfo.servings = parsed.servings.trim();
						if (parsed.ingredients) extractedInfo.ingredients = parsed.ingredients.trim();
						if (parsed.instructions) extractedInfo.instructions = parsed.instructions.trim();
					} catch (e) {
						// ignore
					}
				}

				// Regex extraction fallback if JSON parsing didn't find title
				if (!extractedInfo.title) {
					const titleMatch = rawText.match(/(?:title|recipe|dish):\s*([^\n]+)/i);
					if (titleMatch) {
						extractedInfo.title = titleMatch[1].replace(/["']/g, "").trim();
					}
				}
			} catch (aiErr) {
				console.error("[WORKERS AI EXTRACTION ERROR]", aiErr);
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
