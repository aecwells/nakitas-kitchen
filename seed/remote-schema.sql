-- Create ec_recipes table if not exists
CREATE TABLE IF NOT EXISTS ec_recipes (
	id TEXT PRIMARY KEY,
	slug TEXT,
	status TEXT DEFAULT 'published',
	author_id TEXT,
	primary_byline_id TEXT,
	created_at TEXT DEFAULT (datetime('now')),
	updated_at TEXT DEFAULT (datetime('now')),
	published_at TEXT DEFAULT (datetime('now')),
	scheduled_at TEXT,
	deleted_at TEXT,
	version INTEGER DEFAULT 1,
	live_revision_id TEXT,
	draft_revision_id TEXT,
	locale TEXT DEFAULT 'en',
	translation_group TEXT,
	title TEXT NOT NULL,
	featured_image TEXT,
	prep_time TEXT,
	cook_time TEXT,
	servings TEXT,
	ingredients TEXT,
	allergens TEXT,
	content json,
	excerpt TEXT,
	cottage_license_notice TEXT
);

-- Create ec_products table if not exists
CREATE TABLE IF NOT EXISTS ec_products (
	id TEXT PRIMARY KEY,
	slug TEXT,
	status TEXT DEFAULT 'published',
	author_id TEXT,
	primary_byline_id TEXT,
	created_at TEXT DEFAULT (datetime('now')),
	updated_at TEXT DEFAULT (datetime('now')),
	published_at TEXT DEFAULT (datetime('now')),
	scheduled_at TEXT,
	deleted_at TEXT,
	version INTEGER DEFAULT 1,
	live_revision_id TEXT,
	draft_revision_id TEXT,
	locale TEXT DEFAULT 'en',
	translation_group TEXT,
	title TEXT NOT NULL,
	price TEXT NOT NULL,
	featured_image TEXT,
	description TEXT,
	net_weight TEXT,
	cottage_license_number TEXT,
	matched_recipe_slug TEXT,
	explicit_ingredients TEXT,
	allergens TEXT,
	in_stock INTEGER DEFAULT 1,
	stripe_price_id TEXT
);

-- Insert sample recipes
INSERT OR REPLACE INTO ec_recipes (id, slug, status, title, prep_time, cook_time, servings, ingredients, allergens, cottage_license_notice, excerpt, featured_image, content, published_at) VALUES 
(
	'rec-1',
	'artisan-sourdough-boule',
	'published',
	'Artisan Country Sourdough Boule',
	'30 mins + 24hr ferment',
	'45 mins',
	'1 loaf (approx 750g)',
	'• 400g Organic Unbleached Bread Flour
• 100g Whole Grain Rye Flour
• 375g Filtered Water (75% hydration)
• 100g Active Sourdough Starter
• 10g Fine Sea Salt',
	'Contains: Wheat (Gluten).',
	'Baked in a Cottage Food Operation (License #CFO-LA-2026-9481).',
	'A crispy, blistered crust with an open, airy crumb and subtle tang crafted over 36 hours of cold fermentation.',
	'{"id":"media-1","src":"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=1200&h=800&fit=crop","alt":"Freshly baked sourdough loaf with golden blistered crust"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. Autolyse & Levain Building","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Mix the bread flour, rye flour, and water until no dry spots remain. Rest for 45 minutes to autolyse. Fold in active levain and salt gently.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Bulk Fermentation & Folds","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Perform 4 stretch-and-folds spaced 30 minutes apart over 2.5 hours. Allow the dough to rise in a warm spot until expanded by 50%.","_key":"k7"}],"_key":"k6"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"3. Shaping & Dutch Oven Bake","_key":"k9"}],"_key":"k8"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Pre-shape into a round, rest 20 mins, then shape tightly into a banneton basket. Cold retard in the fridge overnight. Bake at 450°F (230°C) covered in a preheated Dutch oven for 20 mins with steam, then uncovered for 25 mins until mahogany golden.","_key":"k11"}],"_key":"k10"}]',
	datetime('now')
),
(
	'rec-2',
	'cardamom-cinnamon-knots',
	'published',
	'Swedish Cardamom Cinnamon Knots',
	'40 mins',
	'22 mins',
	'8 individual knots',
	'• 500g Organic All-Purpose Flour
• 250g Whole Milk (Warm)
• 80g Grass-Fed European Butter (Softened)
• 70g Organic Cane Sugar
• 1 Egg (Free-Range)
• 2 tsp Crushed Green Cardamom Seeds
• 1.5 tsp Active Dry Yeast
• 1 tsp Sea Salt
• Filling: Butter, Brown Sugar, Ground Cinnamon, Cardamom',
	'Contains: Wheat, Whole Milk, Butter (Milk), Eggs.',
	'Baked in a Cottage Food Operation (License #CFO-LA-2026-9481).',
	'Soft enriched brioche dough laced with freshly crushed green cardamom pods and organic Ceylon cinnamon.',
	'{"id":"media-2","src":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop","alt":"Golden Swedish cardamom knots dusted with pearl sugar"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. Dough Kneading & First Rise","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Whisk warm milk, yeast, and sugar. Knead with flour, cardamom, and egg for 8 minutes until smooth. Gradually incorporate softened butter until shiny and elastic. Let rise 1.5 hours.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Filling & Knot Shaping","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Roll into a 12x18 inch rectangle. Spread spiced butter filling evenly. Fold into thirds like a letter, cut strips, twist, and tie into traditional Swedish knots.","_key":"k7"}],"_key":"k6"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"3. Baking & Vanilla Glaze","_key":"k9"}],"_key":"k8"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Proof for 45 minutes, egg wash, and sprinkle with Swedish pearl sugar. Bake at 375°F (190°C) for 20-22 minutes until deep amber golden.","_key":"k11"}],"_key":"k10"}]',
	datetime('now')
),
(
	'rec-3',
	'meyer-lemon-shortbread',
	'published',
	'Meyer Lemon Thyme Shortbread',
	'15 mins + 1hr chill',
	'18 mins',
	'12 thick cookies',
	'• 250g Organic Pastry Flour
• 175g Cultured Irish Butter (Cold & Cubed)
• 70g Powdered Cane Sugar
• Zest of 2 Fresh Meyer Lemons
• 1 tsp Chopped Fresh Lemon Thyme
• 1/2 tsp Vanilla Bean Paste
• Flaky Sea Salt for topping',
	'Contains: Wheat, Butter (Milk).',
	'Baked in a Cottage Food Operation (License #CFO-LA-2026-9481).',
	'Melt-in-your-mouth tender shortbread cookies infusing fresh Meyer lemon zest and subtle garden thyme.',
	'{"id":"media-3","src":"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&h=800&fit=crop","alt":"Lemon shortbread cookies arranged neatly on parchment paper"}',
	'[{"_type":"block","style":"h2","children":[{"_type":"span","text":"1. Creaming & Dough Preparation","_key":"k1"}],"_key":"k0"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Rub lemon zest and thyme into powdered sugar until fragrant. Beat with cold butter and vanilla until pale. Fold in flour gently until a cohesive dough forms.","_key":"k3"}],"_key":"k2"},{"_type":"block","style":"h2","children":[{"_type":"span","text":"2. Chilling & Slow Bake","_key":"k5"}],"_key":"k4"},{"_type":"block","style":"normal","children":[{"_type":"span","text":"Shape into a log, wrap in parchment, and chill for 1 hour until firm. Slice into 1/2-inch thick rounds. Bake at 325°F (160°C) for 18 minutes until barely golden on the edges.","_key":"k7"}],"_key":"k6"}]',
	datetime('now')
);

-- Insert sample storefront products
INSERT OR REPLACE INTO ec_products (id, slug, status, title, price, net_weight, description, cottage_license_number, matched_recipe_slug, allergens, in_stock, stripe_price_id, featured_image, published_at) VALUES 
(
	'prod-1',
	'artisan-sourdough-loaf',
	'published',
	'Country Sourdough Loaf',
	'12.00',
	'24 oz (680g)',
	'Naturally leavened 36-hour cold fermented bread baked in a stone oven. Crisp crust with an airy, tender interior.',
	'CFO-LA-2026-9481',
	'artisan-sourdough-boule',
	'Contains: Wheat (Gluten).',
	1,
	'price_1SourdoughBouleDemo',
	'{"id":"media-1","src":"https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=1200&h=800&fit=crop","alt":"Fresh sourdough loaf"}',
	datetime('now')
),
(
	'prod-2',
	'cardamom-cinnamon-knots-4pack',
	'published',
	'Cardamom Cinnamon Knots (4-Pack)',
	'16.00',
	'16 oz (450g)',
	'Four buttery brioche knots infused with organic cardamom and Ceylon cinnamon. Finished with Swedish pearl sugar.',
	'CFO-LA-2026-9481',
	'cardamom-cinnamon-knots',
	'Contains: Wheat, Whole Milk, Butter (Milk), Eggs.',
	1,
	'price_1CardamomKnotsDemo',
	'{"id":"media-2","src":"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop","alt":"Cardamom knots 4 pack"}',
	datetime('now')
),
(
	'prod-3',
	'meyer-lemon-shortbread-box',
	'published',
	'Meyer Lemon Shortbread Box (8-Pack)',
	'14.00',
	'12 oz (340g)',
	'Tender, buttery shortbread cookies scented with organic Meyer lemon zest and fresh thyme. Packed in an eco-friendly bakery box.',
	'CFO-LA-2026-9481',
	'meyer-lemon-shortbread',
	'Contains: Wheat, Butter (Milk).',
	1,
	'price_1ShortbreadBoxDemo',
	'{"id":"media-3","src":"https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1200&h=800&fit=crop","alt":"Meyer Lemon Shortbread box"}',
	datetime('now')
);
