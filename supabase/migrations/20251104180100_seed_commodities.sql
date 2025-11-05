-- Seed initial commodity data
-- Insert commodities only if they don't already exist

INSERT INTO public.commodities (id, name, unit, price, pricechange, history)
VALUES 
    (
        'tomatoes',
        'Tomatoes',
        'bucket',
        7.50,
        0.25,
        '[
            {"date": "Dec 29", "price": 7.10},
            {"date": "Dec 30", "price": 7.20},
            {"date": "Dec 31", "price": 7.00},
            {"date": "Jan 1", "price": 7.30},
            {"date": "Jan 2", "price": 7.25},
            {"date": "Jan 3", "price": 7.25},
            {"date": "Jan 4", "price": 7.50}
        ]'::jsonb
    ),
    (
        'onions',
        'Onions',
        '10kg pocket',
        12.00,
        -0.50,
        '[
            {"date": "Dec 29", "price": 11.80},
            {"date": "Dec 30", "price": 12.10},
            {"date": "Dec 31", "price": 12.30},
            {"date": "Jan 1", "price": 12.50},
            {"date": "Jan 2", "price": 12.60},
            {"date": "Jan 3", "price": 12.50},
            {"date": "Jan 4", "price": 12.00}
        ]'::jsonb
    ),
    (
        'maize-meal',
        'Maize Meal',
        '10kg bag',
        8.00,
        0.00,
        '[
            {"date": "Dec 29", "price": 8.00},
            {"date": "Dec 30", "price": 7.90},
            {"date": "Dec 31", "price": 8.00},
            {"date": "Jan 1", "price": 8.10},
            {"date": "Jan 2", "price": 8.00},
            {"date": "Jan 3", "price": 8.00},
            {"date": "Jan 4", "price": 8.00}
        ]'::jsonb
    ),
    (
        'apples',
        'Apples',
        'kg',
        3.00,
        0.20,
        '[
            {"date": "Dec 29", "price": 2.80},
            {"date": "Dec 30", "price": 2.85},
            {"date": "Dec 31", "price": 2.90},
            {"date": "Jan 1", "price": 2.95},
            {"date": "Jan 2", "price": 3.00},
            {"date": "Jan 3", "price": 2.95},
            {"date": "Jan 4", "price": 3.00}
        ]'::jsonb
    ),
    (
        'bananas',
        'Bananas',
        'bunch',
        2.50,
        -0.20,
        '[
            {"date": "Dec 29", "price": 2.70},
            {"date": "Dec 30", "price": 2.60},
            {"date": "Dec 31", "price": 2.65},
            {"date": "Jan 1", "price": 2.70},
            {"date": "Jan 2", "price": 2.65},
            {"date": "Jan 3", "price": 2.50},
            {"date": "Jan 4", "price": 2.50}
        ]'::jsonb
    ),
    (
        'butternut-squash',
        'Butternut Squash',
        'kg',
        1.50,
        -0.10,
        '[
            {"date": "Dec 29", "price": 1.60},
            {"date": "Dec 30", "price": 1.55},
            {"date": "Dec 31", "price": 1.50},
            {"date": "Jan 1", "price": 1.55},
            {"date": "Jan 2", "price": 1.50},
            {"date": "Jan 3", "price": 1.50},
            {"date": "Jan 4", "price": 1.50}
        ]'::jsonb
    ),
    (
        'cabbage',
        'Cabbage',
        'head',
        1.20,
        -0.10,
        '[
            {"date": "Dec 29", "price": 1.30},
            {"date": "Dec 30", "price": 1.25},
            {"date": "Dec 31", "price": 1.20},
            {"date": "Jan 1", "price": 1.25},
            {"date": "Jan 2", "price": 1.20},
            {"date": "Jan 3", "price": 1.20},
            {"date": "Jan 4", "price": 1.20}
        ]'::jsonb
    ),
    (
        'cooking-oil',
        'Cooking Oil',
        'liter',
        4.50,
        0.00,
        '[
            {"date": "Dec 29", "price": 4.50},
            {"date": "Dec 30", "price": 4.50},
            {"date": "Dec 31", "price": 4.50},
            {"date": "Jan 1", "price": 4.50},
            {"date": "Jan 2", "price": 4.50},
            {"date": "Jan 3", "price": 4.50},
            {"date": "Jan 4", "price": 4.50}
        ]'::jsonb
    ),
    (
        'groundnuts',
        'Groundnuts',
        'kg',
        2.00,
        0.00,
        '[
            {"date": "Dec 29", "price": 2.00},
            {"date": "Dec 30", "price": 2.00},
            {"date": "Dec 31", "price": 2.00},
            {"date": "Jan 1", "price": 2.00},
            {"date": "Jan 2", "price": 2.00},
            {"date": "Jan 3", "price": 2.00},
            {"date": "Jan 4", "price": 2.00}
        ]'::jsonb
    ),
    (
        'leafy-greens',
        'Leafy Greens (Rape)',
        'bunch',
        0.80,
        0.05,
        '[
            {"date": "Dec 29", "price": 0.75},
            {"date": "Dec 30", "price": 0.78},
            {"date": "Dec 31", "price": 0.80},
            {"date": "Jan 1", "price": 0.82},
            {"date": "Jan 2", "price": 0.80},
            {"date": "Jan 3", "price": 0.80},
            {"date": "Jan 4", "price": 0.80}
        ]'::jsonb
    ),
    (
        'sweet-potatoes',
        'Sweet Potatoes',
        'kg',
        1.80,
        0.10,
        '[
            {"date": "Dec 29", "price": 1.70},
            {"date": "Dec 30", "price": 1.75},
            {"date": "Dec 31", "price": 1.80},
            {"date": "Jan 1", "price": 1.85},
            {"date": "Jan 2", "price": 1.80},
            {"date": "Jan 3", "price": 1.80},
            {"date": "Jan 4", "price": 1.80}
        ]'::jsonb
    ),
    (
        'beans',
        'Beans',
        'kg',
        2.20,
        -0.15,
        '[
            {"date": "Dec 29", "price": 2.35},
            {"date": "Dec 30", "price": 2.30},
            {"date": "Dec 31", "price": 2.25},
            {"date": "Jan 1", "price": 2.20},
            {"date": "Jan 2", "price": 2.20},
            {"date": "Jan 3", "price": 2.20},
            {"date": "Jan 4", "price": 2.20}
        ]'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    unit = EXCLUDED.unit,
    price = EXCLUDED.price,
    pricechange = EXCLUDED.pricechange,
    history = EXCLUDED.history,
    updated_at = NOW();
