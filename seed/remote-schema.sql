-- Add missing columns to ec_recipes if not existing
ALTER TABLE ec_recipes ADD COLUMN recipe_source TEXT;
ALTER TABLE ec_recipes ADD COLUMN equipment TEXT;
ALTER TABLE ec_recipes ADD COLUMN cooking_method TEXT;
ALTER TABLE ec_recipes ADD COLUMN card_scan_image TEXT;

-- Insert sample outdoor barbecue and meal-kit scanned recipes
INSERT OR REPLACE INTO ec_recipes (id, slug, status, title, recipe_source, equipment, cooking_method, prep_time, cook_time, servings, ingredients, allergens, cottage_license_notice, excerpt, featured_image, content, published_at) VALUES 
(
	'rec-4',
	'rotisserie-smoked-herb-chicken',
	'published',
	'Rotisserie Smoked Herb Butter Whole Chicken',
	'Homemade Original',
	'Kamado Joe Classic III w/ Joetisserie',
	'Rotisserie & Lump Charcoal + Applewood',
	'25 mins + 4hr brine',
	'1 hr 15 mins',
	'4 servings',
	'• 1 Whole Free-Range Chicken (4-5 lbs)
• 4 tbsp Unsalted Butter (Softened)
• 2 tbsp Fresh Rosemary & Thyme (Minced)
• 4 Cloves Garlic (Crushed)
• 1 Lemon (Halved)
• 1.5 tbsp Coarse Kosher Salt & Fresh Cracked Black Pepper
• Applewood Chunks for Smoke',
	'Contains: Dairy (Butter). Gluten-Free.',
	'Outdoor Barbecue Specialty.',
	'Juicy whole roasted chicken spun over lump charcoal and applewood on the Kamado Joe Joetisserie attachment.',
	'{"id":"media-4","src":"https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&h=800&fit=crop","alt":"Rotisserie smoked chicken on grill"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. Dry Brine & Herb Butter Prep","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Salt the bird generously inside and out 4 hours ahead. Combine softened butter, rosemary, thyme, and garlic. Loosen chicken skin and rub herb butter directly under the breast skin.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Setting Up the Kamado Joe Classic III","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Set up Kamado Joe for indirect cooking with the Joetisserie attachment at 350°F (175°C). Add 2 chunks of seasoned Applewood to the lump charcoal.","_key":"k7"}],"_key":"k6"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"3. Rotisserie Roast & Serve","_key":"k9"}],"_key":"k8"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Truss chicken tightly, secure on Joetisserie spit, and spin for ~1 hour 15 mins until internal thigh temp hits 165°F. Rest 15 mins before carving.","_key":"k11"}],"_key":"k10"}]',
	datetime('now')
),
(
	'rec-5',
	'dojoe-woodfired-pizza',
	'published',
	'DoJoe Wood-Fired Margherita Pizza',
	'Homemade Original',
	'Kamado Joe Classic III w/ DoJoe Attachment',
	'High-Heat Ceramic Wood-Fired Bake (700°F)',
	'20 mins',
	'6 mins',
	'2 individual pizzas',
	'• 300g 72-Hour Sourdough Pizza Dough
• 1/2 cup San Marzano Tomato Sauce
• 150g Fresh Buffalo Mozzarella (Torn)
• Fresh Basil Leaves & Extra Virgin Olive Oil
• Sea Salt & Grated Pecorino Romano',
	'Contains: Wheat, Milk.',
	'Outdoor Pizza Specialty.',
	'Blistered 700°F Neapolitan style pizza baked using the Kamado Joe DoJoe ceramic pizza oven wedge.',
	'{"id":"media-5","src":"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=800&fit=crop","alt":"Wood fired margherita pizza"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. DoJoe Setup","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Install DoJoe wedge on Kamado Joe Classic III. Heat to 650-700°F with lump charcoal. Ensure pizza stone is thoroughly preheated for crisp leopard spotting.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Launch & Bake","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Stretch dough on semolina dusted wooden peel. Top lightly with sauce, fresh mozzarella, and olive oil. Launch onto stone and bake 5-6 mins, rotating halfway. Finish with fresh basil.","_key":"k7"}],"_key":"k6"}]',
	datetime('now')
),
(
	'rec-6',
	'homechef-parmesan-crusted-chicken',
	'published',
	'HomeChef Garlic-Parmesan Crusted Chicken & Roasted Potatoes',
	'HomeChef',
	'Indoor Oven / Stovetop Skillet',
	'Pan-Seared & Oven Roasted',
	'15 mins',
	'30 mins',
	'2 servings',
	'• 2 Boneless Chicken Breasts
• 1/4 cup Panko Breadcrumbs & 3 tbsp Parmesan
• 1 tbsp Garlic Aioli
• 12 oz Yukon Gold Potatoes (Wedged)
• 6 oz Green Beans
• Olive Oil, Salt, Pepper',
	'Contains: Milk, Wheat, Egg.',
	'Scanned from HomeChef Meal Card.',
	'Crispy panko parmesan crust topped chicken breast served with roasted lemon green beans and crispy potatoes.',
	'{"id":"media-6","src":"https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1200&h=800&fit=crop","alt":"Parmesan chicken cutlets"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. Roast Potatoes & Prep Chicken","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Toss potato wedges with olive oil, salt, and pepper. Roast at 400°F for 20 mins. Pat chicken dry and brush top with garlic aioli, then press firmly into panko-parmesan mixture.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Bake Chicken & Green Beans","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Place chicken on baking sheet alongside green beans. Bake 15-18 mins until chicken reaches 165°F internal temperature.","_key":"k7"}],"_key":"k6"}]',
	datetime('now')
);
