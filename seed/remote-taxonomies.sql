-- Update taxonomy definitions collections
UPDATE _emdash_taxonomy_defs 
SET collections = '["posts","recipes","products"]' 
WHERE name IN ('category', 'tag');

-- Insert new taxonomy definitions for difficulty and dietary
INSERT OR IGNORE INTO _emdash_taxonomy_defs (id, name, label, label_singular, hierarchical, collections, locale, translation_group) VALUES
('taxdef_difficulty', 'difficulty', 'Baking Difficulty', 'Difficulty', 0, '["recipes"]', 'en', 'taxdef_difficulty'),
('taxdef_dietary', 'dietary', 'Dietary & Lifestyle', 'Dietary', 0, '["recipes","products"]', 'en', 'taxdef_dietary');

-- Insert food & baking categories into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('cat_breads', 'category', 'breads', 'Breads & Sourdough', 'en', 'cat_breads'),
('cat_pastries', 'category', 'pastries', 'Pastries & Sweets', 'en', 'cat_pastries'),
('cat_cookies', 'category', 'cookies', 'Cookies & Biscuits', 'en', 'cat_cookies'),
('cat_pantry', 'category', 'pantry', 'Pantry & Spreads', 'en', 'cat_pantry');

-- Insert difficulty terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('diff_easy', 'difficulty', 'easy', 'Beginner Friendly', 'en', 'diff_easy'),
('diff_medium', 'difficulty', 'medium', 'Intermediate', 'en', 'diff_medium'),
('diff_advanced', 'difficulty', 'advanced', 'Advanced / Artisanal', 'en', 'diff_advanced');

-- Insert dietary terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('diet_organic', 'dietary', 'organic', '100% Organic Flours', 'en', 'diet_organic'),
('diet_dairyfree', 'dietary', 'dairy-free', 'Dairy-Free', 'en', 'diet_dairyfree'),
('diet_vegan', 'dietary', 'vegan', 'Vegan / Plant-Based', 'en', 'diet_vegan'),
('diet_nutfree', 'dietary', 'nut-free', 'Nut-Free', 'en', 'diet_nutfree');

-- Insert tag terms into taxonomies table
INSERT OR REPLACE INTO taxonomies (id, name, slug, label, locale, translation_group) VALUES
('tag_sourdough', 'tag', 'sourdough', 'Wild Yeast Sourdough', 'en', 'tag_sourdough'),
('tag_coldferment', 'tag', 'cold-ferment', 'Cold Fermented (24h+)', 'en', 'tag_coldferment'),
('tag_cottage', 'tag', 'cottage-bakery', 'Cottage Bakery Feature', 'en', 'tag_cottage'),
('tag_preorder', 'tag', 'preorder', 'Weekly Pre-Order', 'en', 'tag_preorder');

-- Link sample recipes to difficulty, dietary, and categories in content_taxonomies
INSERT OR REPLACE INTO content_taxonomies (collection, entry_id, taxonomy_id, status) VALUES
('recipes', 'rec-1', 'cat_breads', 'published'),
('recipes', 'rec-1', 'diff_advanced', 'published'),
('recipes', 'rec-1', 'diet_organic', 'published'),
('recipes', 'rec-1', 'tag_sourdough', 'published'),
('recipes', 'rec-1', 'tag_coldferment', 'published'),

('recipes', 'rec-2', 'cat_pastries', 'published'),
('recipes', 'rec-2', 'diff_medium', 'published'),
('recipes', 'rec-2', 'diet_organic', 'published'),
('recipes', 'rec-2', 'tag_cottage', 'published'),
('recipes', 'rec-2', 'tag_preorder', 'published'),

('recipes', 'rec-3', 'cat_cookies', 'published'),
('recipes', 'rec-3', 'diff_easy', 'published'),
('recipes', 'rec-3', 'diet_organic', 'published'),
('recipes', 'rec-3', 'tag_cottage', 'published'),

('products', 'prod-1', 'cat_breads', 'published'),
('products', 'prod-1', 'diet_organic', 'published'),
('products', 'prod-1', 'tag_sourdough', 'published'),

('products', 'prod-2', 'cat_pastries', 'published'),
('products', 'prod-2', 'diet_organic', 'published'),
('products', 'prod-2', 'tag_preorder', 'published'),

('products', 'prod-3', 'cat_cookies', 'published'),
('products', 'prod-3', 'diet_organic', 'published');
