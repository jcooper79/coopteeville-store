ALTER TABLE orders ADD COLUMN carrier TEXT;
ALTER TABLE orders ADD COLUMN tracking_url TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_printful ON orders (printful_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
