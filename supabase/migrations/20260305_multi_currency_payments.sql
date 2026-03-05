-- Add multi-currency support to payments, orders, and invoices
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS country_code TEXT;

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS country_code TEXT;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Update existing records to reflect gateway/currency
UPDATE orders
SET
    currency = 'INR',
    payment_gateway = 'razorpay'
WHERE
    currency IS NULL;

UPDATE payments
SET
    currency = 'INR',
    payment_gateway = 'razorpay'
WHERE
    currency IS NULL;

UPDATE invoices SET currency = 'INR' WHERE currency IS NULL;