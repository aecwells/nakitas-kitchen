-- Clear existing fields for col_recipes and col_products if any
DELETE FROM _emdash_fields WHERE collection_id IN ('col_recipes', 'col_products');

-- Insert fields for recipes collection
INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, sort_order, searchable, translatable) VALUES
('fld_rec_title', 'col_recipes', 'title', 'Title', 'string', 'TEXT', 1, 0, 1, 1),
('fld_rec_image', 'col_recipes', 'featured_image', 'Featured Image', 'image', 'TEXT', 0, 1, 0, 1),
('fld_rec_preptime', 'col_recipes', 'prep_time', 'Prep Time', 'string', 'TEXT', 0, 2, 0, 1),
('fld_rec_cooktime', 'col_recipes', 'cook_time', 'Cook Time', 'string', 'TEXT', 0, 3, 0, 1),
('fld_rec_servings', 'col_recipes', 'servings', 'Yield / Servings', 'string', 'TEXT', 0, 4, 0, 1),
('fld_rec_ingredients', 'col_recipes', 'ingredients', 'Ingredients List', 'text', 'TEXT', 1, 5, 1, 1),
('fld_rec_allergens', 'col_recipes', 'allergens', 'Allergen Disclosures', 'string', 'TEXT', 0, 6, 0, 1),
('fld_rec_content', 'col_recipes', 'content', 'Baking Notes & Instructions', 'portableText', 'JSON', 0, 7, 1, 1),
('fld_rec_excerpt', 'col_recipes', 'excerpt', 'Summary Excerpt', 'text', 'TEXT', 0, 8, 1, 1),
('fld_rec_notice', 'col_recipes', 'cottage_license_notice', 'Cottage Food Notice', 'string', 'TEXT', 0, 9, 0, 1);

-- Insert fields for products collection
INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, sort_order, searchable, translatable) VALUES
('fld_prod_title', 'col_products', 'title', 'Product Name', 'string', 'TEXT', 1, 0, 1, 1),
('fld_prod_price', 'col_products', 'price', 'Price ($)', 'string', 'TEXT', 1, 1, 0, 1),
('fld_prod_image', 'col_products', 'featured_image', 'Product Image', 'image', 'TEXT', 0, 2, 0, 1),
('fld_prod_desc', 'col_products', 'description', 'Description', 'text', 'TEXT', 0, 3, 1, 1),
('fld_prod_weight', 'col_products', 'net_weight', 'Net Weight / Portion', 'string', 'TEXT', 0, 4, 0, 1),
('fld_prod_license', 'col_products', 'cottage_license_number', 'Cottage License Number', 'string', 'TEXT', 0, 5, 0, 1),
('fld_prod_recipe', 'col_products', 'matched_recipe_slug', 'Matching Recipe Slug', 'string', 'TEXT', 0, 6, 0, 1),
('fld_prod_ingred', 'col_products', 'explicit_ingredients', 'Fallback / Custom Ingredients List', 'text', 'TEXT', 0, 7, 0, 1),
('fld_prod_allergens', 'col_products', 'allergens', 'Allergen Disclosures', 'string', 'TEXT', 0, 8, 0, 1),
('fld_prod_stock', 'col_products', 'in_stock', 'Available for Pre-Order', 'boolean', 'INTEGER', 0, 9, 0, 1),
('fld_prod_stripe', 'col_products', 'stripe_price_id', 'Stripe Price ID', 'string', 'TEXT', 0, 10, 0, 1);
