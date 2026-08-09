-- Insert / Replace exact scanned HelloFresh Homestyle Chicken & Biscuit Pot Pie recipe into ec_recipes with distinct step blocks
INSERT OR REPLACE INTO ec_recipes (
	id, slug, status, title, recipe_source, equipment, cooking_method, prep_time, cook_time, servings, ingredients, allergens, cottage_license_notice, excerpt, featured_image, card_scan_image, content, published_at
) VALUES (
	'rec-hf-potpie',
	'homestyle-chicken-biscuit-pot-pie',
	'published',
	'Homestyle Chicken & Biscuit Pot Pie',
	'HelloFresh',
	'Indoor Oven & Stovetop Skillet (preferably ovenproof)',
	'Stovetop Pan-Sear & Oven Biscuit Bake (425°F)',
	'15 mins',
	'50-65 mins',
	'2-4 servings (750 Calories / 35g Protein per serving)',
	'• 10 oz Diced Skinless Dark Meat Chicken
• 1 package Buttermilk Biscuits
• 2 Carrots (Trimmed, peeled & diced)
• 2 Ribs Celery (Finely diced)
• 1/2 Yellow Onion (Diced)
• 2 Cloves Garlic (Peeled & minced)
• 1 tbsp Dried Thyme
• 2 tbsp Flour
• 4 oz Cream Cheese
• 2 packets Chicken Stock Concentrates
• 3 tbsp Butter (Softened/Melted)
• Kosher Salt, Black Pepper & Cooking Oil',
	'Contains: Wheat, Milk.',
	'Scanned from 2-Sided HelloFresh Recipe Card (Front & Back).',
	'Creamy, savory goodness with dark meat chicken, carrots, and celery, topped with golden-brown buttermilk biscuits.',
	'{"id":"hf-front","src":"/uploads/hellofresh-potpie-front.jpg","alt":"Homestyle Chicken & Biscuit Pot Pie Front Card Photo"}',
	'{"id":"hf-back","src":"/uploads/hellofresh-potpie-back.jpg","alt":"Homestyle Chicken & Biscuit Pot Pie Back Card Photo"}',
	'1. Prep Ingredients
Adjust rack to top position and preheat oven to 425 degrees. Wash and dry produce. Trim, peel, and finely dice carrots. Finely dice celery. Halve, peel, and dice half the onion (whole onion for 4 servings). Peel and mince garlic.

2. Cook Chicken
Open package of chicken and drain off any excess liquid. Heat a drizzle of oil in a medium, preferably ovenproof, pan over medium-high heat. Add chicken in a single layer; season with a big pinch of salt and pepper. Cook, stirring occasionally, until browned all over, 3-5 minutes (it will finish cooking in Step 5). Transfer chicken to a plate.

3. Cook Veggies
Heat a drizzle of oil in pan used for chicken over medium-high heat. Add carrots, celery, and diced onion; season with salt and pepper. Cook, stirring occasionally, until veggies are softened, 5-7 minutes. Add garlic and half the dried thyme (all for 4 servings); cook until fragrant, 30 seconds.

4. Make Filling
Add 2 TBSP butter (4 TBSP for 4 servings) to pan with veggies. Once melted, stir in flour; cook for 1 minute. Add 1 1/4 cups water (1 3/4 cups for 4), stock concentrates, salt, and pepper. Bring to a boil and cook, stirring occasionally, until thickened, 3-5 minutes. Turn off heat. Stir in cream cheese until melted, then stir in chicken. Season with salt and pepper.

5. Add Biscuits & Bake
Place 1 TBSP butter in a small microwave-safe bowl; microwave until melted, 30 seconds. Remove biscuits from package; peel apart each biscuit at the center to create two thinner biscuits. Evenly top chicken filling with biscuits, then brush with melted butter. Bake on top rack until biscuits are golden brown and chicken is cooked through, 12-15 minutes.

6. Serve
Let pot pie cool at least 5 minutes before serving. Divide between shallow bowls or plates and serve.',
	datetime('now')
);
