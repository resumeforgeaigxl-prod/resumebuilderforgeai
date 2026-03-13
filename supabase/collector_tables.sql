-- Tables for JobForgeCollector Target System

-- 1. Target Companies
CREATE TABLE IF NOT EXISTS target_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    tier INTEGER NOT NULL, -- 1: Global Tech, 2: Product, 3: Indian Startups
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Target Roles
CREATE TABLE IF NOT EXISTS target_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_internship BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Seed Target Companies
INSERT INTO target_companies (name, tier) VALUES
('Google', 1), ('Microsoft', 1), ('Amazon', 1), ('Meta', 1), ('Apple', 1), 
('Netflix', 1), ('Adobe', 1), ('Oracle', 1), ('Salesforce', 1), ('PayPal', 1), ('Uber', 1),
('Atlassian', 2), ('ServiceNow', 2), ('VMware', 2), ('Cisco', 2), ('Stripe', 2), 
('Databricks', 2), ('Snowflake', 2), ('Shopify', 2), ('Elastic', 2), ('Twilio', 2),
('Flipkart', 3), ('Razorpay', 3), ('CRED', 3), ('Swiggy', 3), ('Zomato', 3), 
('Meesho', 3), ('Groww', 3), ('PhonePe', 3), ('Freshworks', 3), ('Postman', 3), 
('BrowserStack', 3), ('Zoho', 3)
ON CONFLICT (name) DO NOTHING;

-- 4. Seed Target Roles
INSERT INTO target_roles (name, is_internship) VALUES
('Software Engineer', false), ('Backend Developer', false), ('Frontend Developer', false), 
('Full Stack Developer', false), ('DevOps Engineer', false), ('Cloud Engineer', false), 
('Data Engineer', false), ('Data Analyst', false), ('Machine Learning Engineer', false), 
('AI Engineer', false), ('Security Engineer', false), ('Mobile Developer', false), 
('QA Engineer', false), ('Site Reliability Engineer', false), ('Platform Engineer', false),
('Software Engineer Intern', true), ('Backend Intern', true), ('Frontend Intern', true), 
('Full Stack Intern', true), ('DevOps Intern', true), ('Data Analyst Intern', true), 
('ML Intern', true)
ON CONFLICT (name) DO NOTHING;
