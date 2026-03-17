-- Migration: Company Priority and Tiering System

-- 1. Update target_companies to include priority_score
ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;

-- 2. Update/Insert Company List with Tiers and Priority
-- Tiers: 
-- 1: Top Product (High: 100)
-- 2: Indian Startups (Medium-High: 80)
-- 3: Service Companies (Medium: 50)
-- 4: Global MNCs (Medium-High: 80)

TRUNCATE target_companies; -- Clean start for the new system

INSERT INTO target_companies (name, tier, priority_score) VALUES
-- Tier 1: Top Product
('Google', 1, 100), ('Microsoft', 1, 100), ('Amazon', 1, 100), ('Meta', 1, 100), ('Apple', 1, 100), 
('Netflix', 1, 100), ('Adobe', 1, 100), ('Oracle', 1, 100), ('Salesforce', 1, 100), ('Uber', 1, 100),
('Stripe', 1, 100), ('Atlassian', 1, 100), ('OpenAI', 1, 100), ('Databricks', 1, 100), ('Snowflake', 1, 100),

-- Tier 2: Indian Startups
('Flipkart', 2, 80), ('Razorpay', 2, 80), ('CRED', 2, 80), ('Swiggy', 2, 80), ('Zomato', 2, 80), 
('Meesho', 2, 80), ('Groww', 2, 80), ('PhonePe', 2, 80), ('Freshworks', 2, 80), ('Postman', 2, 80), 
('BrowserStack', 2, 80), ('Zoho', 2, 80), ('Dream11', 2, 80), ('Ola', 2, 80), ('Hike', 2, 80),

-- Tier 3: Service Companies
('TCS', 3, 50), ('Infosys', 3, 50), ('Wipro', 3, 50), ('Cognizant', 3, 50), ('HCL', 3, 50), 
('Accenture', 3, 50), ('Capgemini', 3, 50), ('Tech Mahindra', 3, 50), ('LTI', 3, 50), ('Mindtree', 3, 50),

-- Tier 4: Global MNCs
('IBM', 4, 80), ('Deloitte', 4, 80), ('KPMG', 4, 80), ('PWC', 4, 80), ('EY', 4, 80), 
('Walmart', 4, 80), ('Target', 4, 80), ('Goldman Sachs', 4, 80), ('JP Morgan', 4, 80), ('Morgan Stanley', 4, 80)
ON CONFLICT (name) DO UPDATE SET tier = EXCLUDED.tier, priority_score = EXCLUDED.priority_score;

-- 3. Update jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;

-- 4. Function to assign priority to jobs based on company name
CREATE OR REPLACE FUNCTION get_company_priority(company_name TEXT)
RETURNS TABLE (job_tier INTEGER, job_priority_score INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT tier, priority_score 
    FROM target_companies 
    WHERE LOWER(name) = LOWER(company_name)
    LIMIT 1;
    
    -- Default fallback if not found
    IF NOT FOUND THEN
        job_tier := 0;
        job_priority_score := 10;
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;
