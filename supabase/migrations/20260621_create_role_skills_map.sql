-- Migration to create role_skills_map table and seed all 22 tech roles and skills
CREATE TABLE IF NOT EXISTS public.role_skills_map (
    role_name TEXT PRIMARY KEY,
    categories JSONB NOT NULL,
    all_skills TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.role_skills_map ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON public.role_skills_map
FOR SELECT
TO authenticated
USING (true);

-- Seed values for the 22 roles
INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Frontend Developer',
    '{
        "Core Languages": ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript"],
        "Frameworks/Libraries": ["React.js", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte/SvelteKit", "Solid.js"],
        "Styling": ["Tailwind CSS", "Bootstrap", "SASS/SCSS", "CSS Modules", "Styled Components", "Material UI", "Chakra UI", "shadcn/ui"],
        "State Management": ["Redux", "Zustand", "Recoil", "Context API", "Jotai", "MobX"],
        "Build Tools / Bundlers": ["Vite", "Webpack", "Parcel", "esbuild", "Turbopack"],
        "Testing": ["Jest", "React Testing Library", "Cypress", "Playwright", "Vitest"],
        "Other Must-Haves": ["Responsive design", "Web accessibility (a11y/WCAG)", "Browser DevTools", "Cross-browser compatibility", "Performance optimization", "Git/GitHub", "REST API consumption", "GraphQL client (Apollo/urql)", "Animation libraries: Framer Motion, GSAP", "PWA basics", "SEO fundamentals for frontend", "Design tool familiarity: Figma"]
    }'::jsonb,
    ARRAY['html5', 'css3', 'javascript', 'typescript', 'react.js', 'react', 'next.js', 'vue.js', 'nuxt.js', 'angular', 'svelte', 'sveltekit', 'solid.js', 'tailwind css', 'tailwind', 'bootstrap', 'sass', 'scss', 'css modules', 'styled components', 'material ui', 'chakra ui', 'shadcn/ui', 'redux', 'zustand', 'recoil', 'context api', 'jotai', 'mobx', 'vite', 'webpack', 'parcel', 'esbuild', 'turbopack', 'jest', 'react testing library', 'cypress', 'playwright', 'vitest', 'responsive design', 'web accessibility', 'a11y', 'wcag', 'browser devtools', 'cross-browser compatibility', 'performance optimization', 'git', 'github', 'rest api', 'graphql', 'framer motion', 'gsap', 'pwa', 'seo', 'figma']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Backend Developer',
    '{
        "Languages": ["Node.js", "Python", "Java", "Go", "PHP", "Ruby", "C#", "Rust"],
        "Frameworks": ["Express.js", "NestJS", "Fastify", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET Core"],
        "Databases": ["SQL: PostgreSQL", "MySQL", "SQLite", "MS SQL Server", "NoSQL: MongoDB", "Redis", "Cassandra", "DynamoDB", "Firebase Firestore", "ORMs: Prisma", "Sequelize", "TypeORM", "SQLAlchemy", "Hibernate", "Drizzle"],
        "API Design": ["REST API design", "GraphQL (Apollo Server)", "gRPC", "WebSockets", "Socket.io", "API documentation (Swagger/OpenAPI, Postman)"],
        "Authentication & Security": ["JWT", "OAuth2.0", "Session management", "bcrypt/argon2 hashing", "Rate limiting", "CORS", "input validation/sanitization", "SQL injection & XSS prevention"],
        "Architecture": ["MVC", "Microservices", "Monolith", "Event-driven architecture", "Message queues (RabbitMQ, Kafka, SQS)", "Caching strategies (Redis, CDN caching)"],
        "Other Must-Haves": ["Git/GitHub/GitLab", "Docker basics", "Linux/CLI fundamentals", "Logging & monitoring (Winston, Pino, Sentry)", "Testing: Jest, Mocha, PyTest, JUnit", "Environment management", "Background jobs/cron (BullMQ, Celery)"]
    }'::jsonb,
    ARRAY['node.js', 'node', 'python', 'java', 'go', 'php', 'ruby', 'c#', 'rust', 'express.js', 'express', 'nestjs', 'fastify', 'django', 'flask', 'fastapi', 'spring boot', 'laravel', 'ruby on rails', 'asp.net core', 'sql', 'postgresql', 'postgres', 'mysql', 'sqlite', 'ms sql server', 'nosql', 'mongodb', 'mongo', 'redis', 'cassandra', 'dynamodb', 'firebase firestore', 'prisma', 'sequelize', 'typeorm', 'sqlalchemy', 'hibernate', 'drizzle', 'rest api', 'graphql', 'grpc', 'websockets', 'socket.io', 'swagger', 'openapi', 'postman', 'jwt', 'oauth2.0', 'session management', 'bcrypt', 'argon2', 'rate limiting', 'cors', 'mvc', 'microservices', 'monolith', 'event-driven architecture', 'rabbitmq', 'kafka', 'sqs', 'docker', 'linux', 'cli', 'winston', 'pino', 'sentry', 'mocha', 'pytest', 'junit', 'jest', 'bullmq', 'celery']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Full-Stack Developer',
    '{
        "Frontend Skills": ["HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", "React.js", "Next.js", "Vue.js", "Tailwind CSS", "Redux", "Zustand", "Vite", "Webpack", "Testing (Jest/Cypress)", "Responsive design"],
        "Backend Skills": ["Node.js", "Python", "Go", "Express.js", "NestJS", "FastAPI", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "Drizzle", "REST API design", "GraphQL", "JWT", "OAuth2.0"],
        "Full-Stack Integration": ["Server-Side Rendering (SSR)", "Static Site Generation (SSG)", "Incremental Static Regeneration (ISR)", "API integration end-to-end", "Database design & schema modeling", "Deployment pipelines (Vercel, Netlify, Railway, Render)", "BaaS platforms (Supabase, Firebase)", "Authentication flow (NextAuth, Clerk, Auth0, Supabase Auth)", "File/image upload & storage (S3, Cloudinary)", "Payment gateway integration (Stripe, Razorpay)", "Monorepo tools (Turborepo, Nx)", "End-to-end testing", "Basic DevOps", "Performance optimization"]
    }'::jsonb,
    ARRAY['html5', 'css3', 'javascript', 'typescript', 'react.js', 'react', 'next.js', 'vue.js', 'tailwind css', 'redux', 'zustand', 'vite', 'webpack', 'jest', 'cypress', 'responsive design', 'node.js', 'python', 'go', 'express.js', 'nestjs', 'fastapi', 'postgresql', 'mysql', 'mongodb', 'redis', 'prisma', 'drizzle', 'rest api', 'graphql', 'jwt', 'oauth2.0', 'ssr', 'ssg', 'isr', 'api integration', 'database design', 'schema modeling', 'vercel', 'netlify', 'railway', 'render', 'supabase', 'firebase', 'nextauth', 'clerk', 'auth0', 'supabase auth', 's3', 'cloudinary', 'stripe', 'razorpay', 'turborepo', 'nx', 'devops', 'performance optimization']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Mobile App Developer',
    '{
        "Native": ["Android: Kotlin, Java, Jetpack Compose, Android Studio, Android SDK", "iOS: Swift, SwiftUI, Objective-C, Xcode"],
        "Cross-Platform": ["React Native", "Flutter (Dart)", "Ionic", "Capacitor", "Expo", ".NET MAUI", "KMM (Kotlin Multiplatform)"],
        "Core Concepts": ["Mobile UI/UX patterns", "navigation (React Navigation, Flutter Navigator)", "State management (Redux/MobX, Provider/Bloc/Riverpod)", "Local storage (SQLite, Realm, AsyncStorage, Hive)", "Push notifications (Firebase Cloud Messaging, APNs)", "App performance profiling", "memory management", "Offline-first architecture", "background tasks", "Biometric auth", "deep linking", "camera/sensor API integration", "App Store & Play Store deployment", "app signing", "versioning", "CI/CD for mobile: Fastlane, Codemagic, Bitrise", "Testing: Espresso, XCTest, Detox"]
    }'::jsonb,
    ARRAY['android', 'kotlin', 'java', 'jetpack compose', 'android studio', 'android sdk', 'ios', 'swift', 'swiftui', 'objective-c', 'xcode', 'react native', 'flutter', 'dart', 'ionic', 'capacitor', 'expo', '.net maui', 'kmm', 'kotlin multiplatform', 'mobile ui', 'react navigation', 'flutter navigator', 'redux', 'mobx', 'provider', 'bloc', 'riverpod', 'sqlite', 'realm', 'asyncstorage', 'hive', 'push notifications', 'firebase cloud messaging', 'apns', 'performance profiling', 'memory management', 'offline-first', 'background tasks', 'biometric auth', 'deep linking', 'camera', 'sensor', 'app store', 'play store', 'app signing', 'fastlane', 'codemagic', 'bitrise', 'espresso', 'xctest', 'detox']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'DevOps Engineer',
    '{
        "Core Skills": ["Linux administration", "Bash/Shell scripting", "networking fundamentals (DNS, TCP/IP, HTTP/S)"],
        "Containers & Orchestration": ["Docker", "Docker Compose", "Kubernetes (K8s)", "Helm", "OpenShift"],
        "CI/CD": ["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "ArgoCD", "Travis CI"],
        "Cloud Platforms": ["AWS (EC2, S3, Lambda, RDS, VPC, IAM, CloudFront, ECS/EKS)", "GCP (Compute Engine, Cloud Run, GKE, Cloud Storage)", "Azure (VMs, AKS, Blob Storage)"],
        "Infrastructure as Code (IaC)": ["Terraform", "Pulumi", "AWS CloudFormation", "Ansible", "Chef", "Puppet"],
        "Monitoring & Logging": ["Prometheus", "Grafana", "ELK Stack (Elasticsearch, Logstash, Kibana)", "Datadog", "New Relic"],
        "Other Must-Haves": ["Git/version control mastery", "Nginx/Apache configuration", "reverse proxies", "load balancers", "Secrets management (Vault, AWS Secrets Manager)", "Security basics (firewalls, SSL/TLS certs, VPNs)", "Cost optimization on cloud", "Serverless architecture knowledge", "Site Reliability Engineering (SRE) principles", "incident response"]
    }'::jsonb,
    ARRAY['linux', 'bash', 'shell', 'dns', 'tcp/ip', 'http', 'https', 'docker', 'docker compose', 'kubernetes', 'k8s', 'helm', 'openshift', 'github actions', 'gitlab ci', 'jenkins', 'circleci', 'argocd', 'travis ci', 'aws', 'ec2', 's3', 'lambda', 'rds', 'vpc', 'iam', 'cloudfront', 'ecs', 'eks', 'gcp', 'cloud run', 'gke', 'azure', 'aks', 'terraform', 'pulumi', 'cloudformation', 'ansible', 'chef', 'puppet', 'prometheus', 'grafana', 'elk stack', 'elasticsearch', 'logstash', 'kibana', 'datadog', 'new relic', 'git', 'nginx', 'apache', 'reverse proxy', 'load balancer', 'vault', 'secrets manager', 'firewall', 'ssl', 'tls', 'vpn', 'serverless', 'sre', 'incident response']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Data Scientist',
    '{
        "Languages": ["Python", "R", "SQL"],
        "Core Libraries": ["NumPy", "Pandas", "Matplotlib", "Seaborn", "Plotly", "SciPy"],
        "Machine Learning": ["Scikit-learn", "XGBoost", "LightGBM", "CatBoost", "Statistics fundamentals (hypothesis testing, regression, distributions)"],
        "Deep Learning": ["TensorFlow", "PyTorch", "Keras"],
        "Data Processing": ["Data cleaning & wrangling", "feature engineering", "ETL pipelines", "SQL querying & optimization", "data visualization principles"],
        "Tools": ["Jupyter Notebooks", "Google Colab", "Excel (advanced)", "BI tools: Tableau, Power BI, Looker, Metabase"],
        "Other Must-Haves": ["A/B testing", "experiment design", "Big data tools: Apache Spark, Hadoop", "Version control for ML (DVC, MLflow)", "Cloud ML platforms: AWS SageMaker, GCP Vertex AI", "Communication/storytelling with data", "business domain knowledge"]
    }'::jsonb,
    ARRAY['python', 'r', 'sql', 'numpy', 'pandas', 'matplotlib', 'seaborn', 'plotly', 'scipy', 'scikit-learn', 'xgboost', 'lightgbm', 'catboost', 'statistics', 'hypothesis testing', 'regression', 'distributions', 'tensorflow', 'pytorch', 'keras', 'data cleaning', 'feature engineering', 'etl', 'data visualization', 'jupyter notebooks', 'jupyter', 'google colab', 'excel', 'tableau', 'power bi', 'looker', 'metabase', 'a/b testing', 'experiment design', 'spark', 'hadoop', 'dvc', 'mlflow', 'sagemaker', 'vertex ai', 'storytelling', 'domain knowledge']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Machine Learning Engineer',
    '{
        "Foundations": ["Strong Python", "linear algebra", "calculus", "probability & statistics"],
        "ML/DL Frameworks": ["PyTorch", "TensorFlow", "JAX", "Hugging Face Transformers", "Keras"],
        "Model Development": ["Supervised/unsupervised learning", "classification", "regression", "clustering", "Neural networks (CNN, RNN, LSTM, Transformers, GANs)", "NLP: tokenization, embeddings, BERT/GPT-family, spaCy, NLTK", "Computer Vision: OpenCV, image classification, object detection (YOLO)"],
        "MLOps": ["Model versioning (MLflow, DVC)", "model serving (TorchServe, TF Serving, BentoML)", "Feature stores", "model monitoring & drift detection", "Docker/Kubernetes for ML deployment", "CI/CD for ML pipelines (Kubeflow, Airflow)"],
        "LLM/AI Engineering": ["Prompt engineering", "RAG (Retrieval-Augmented Generation)", "vector databases (Pinecone, Weaviate, Chroma, pgvector)", "Fine-tuning (LoRA, QLoRA, PEFT)", "embeddings", "LangChain", "LlamaIndex", "LLM APIs: OpenAI, Anthropic, OpenRouter, Cohere", "Agent frameworks", "MCP (Model Context Protocol)"],
        "Other Must-Haves": ["GPU computing (CUDA)", "distributed training", "Cloud ML services", "model evaluation metrics", "ethical AI/bias awareness"]
    }'::jsonb,
    ARRAY['python', 'linear algebra', 'calculus', 'probability', 'statistics', 'pytorch', 'tensorflow', 'jax', 'hugging face', 'transformers', 'keras', 'supervised learning', 'unsupervised learning', 'classification', 'regression', 'clustering', 'neural networks', 'cnn', 'rnn', 'lstm', 'gans', 'nlp', 'embeddings', 'bert', 'gpt', 'spacy', 'nltk', 'computer vision', 'opencv', 'yolo', 'mlflow', 'dvc', 'torchserve', 'bentoml', 'feature store', 'drift detection', 'docker', 'kubernetes', 'mlops', 'kubeflow', 'airflow', 'prompt engineering', 'rag', 'vector database', 'pinecone', 'weaviate', 'chroma', 'pgvector', 'qdrant', 'fine-tuning', 'lora', 'qlora', 'peft', 'langchain', 'llamaindex', 'openai', 'anthropic', 'openrouter', 'cohere', 'agents', 'mcp', 'gpu', 'cuda', 'distributed training', 'ethical ai', 'bias awareness']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Data Engineer',
    '{
        "Languages": ["Python", "SQL", "Scala", "Java"],
        "Data Pipeline Tools": ["Apache Airflow", "Apache NiFi", "Luigi", "Dagster", "Prefect"],
        "Big Data Processing": ["Apache Spark", "Apache Kafka", "Apache Flink", "Hadoop (HDFS, MapReduce)"],
        "Databases & Warehousing": ["PostgreSQL", "MySQL", "Snowflake", "BigQuery", "Redshift", "Databricks", "Data lakes (S3, Azure Data Lake)", "Delta Lake", "Apache Iceberg"],
        "ETL/ELT": ["dbt (data build tool)", "Fivetran", "Stitch", "custom pipeline building"],
        "Other Must-Haves": ["Data modeling (star/snowflake schema)", "data warehousing concepts", "Cloud platforms (AWS/GCP/Azure data services)", "Containerization (Docker)", "workflow orchestration", "Data governance & quality", "data security/compliance (GDPR)", "Version control", "CI/CD for data pipelines"]
    }'::jsonb,
    ARRAY['python', 'sql', 'scala', 'java', 'airflow', 'nifi', 'luigi', 'dagster', 'prefect', 'spark', 'kafka', 'flink', 'hadoop', 'hdfs', 'mapreduce', 'postgresql', 'mysql', 'snowflake', 'bigquery', 'redshift', 'databricks', 'data lake', 's3', 'delta lake', 'iceberg', 'dbt', 'fivetran', 'stitch', 'etl', 'elt', 'data modeling', 'data warehousing', 'aws', 'gcp', 'azure', 'docker', 'orchestration', 'data governance', 'gdpr', 'git', 'ci/cd']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Cloud Engineer / Cloud Architect',
    '{
        "Platforms": ["AWS", "Azure", "Google Cloud Platform (GCP)"],
        "AWS Specific": ["EC2", "S3", "Lambda", "RDS", "DynamoDB", "VPC", "IAM", "Route 53", "CloudFront", "ECS", "EKS", "API Gateway", "CloudWatch"],
        "Azure Specific": ["Azure VMs", "Azure Functions", "Azure SQL", "AKS", "Blob Storage", "Azure AD"],
        "GCP Specific": ["Compute Engine", "Cloud Functions", "Cloud Run", "GKE", "BigQuery", "Cloud Storage"],
        "Core Skills": ["Networking (VPCs, subnets, security groups)", "Identity & Access Management", "Infrastructure as Code: Terraform, CloudFormation, Pulumi", "Cost management & optimization", "cloud security best practices", "Disaster recovery & backup strategies", "multi-region architecture", "Serverless architecture", "containerization & orchestration (Docker/K8s)"]
    }'::jsonb,
    ARRAY['aws', 'azure', 'gcp', 'ec2', 's3', 'lambda', 'rds', 'dynamodb', 'vpc', 'iam', 'route 53', 'cloudfront', 'ecs', 'eks', 'api gateway', 'cloudwatch', 'azure vms', 'azure functions', 'azure sql', 'aks', 'blob storage', 'azure ad', 'compute engine', 'cloud functions', 'cloud run', 'gke', 'bigquery', 'cloud storage', 'networking', 'subnets', 'security groups', 'iac', 'terraform', 'cloudformation', 'pulumi', 'cost management', 'cloud security', 'disaster recovery', 'backup', 'multi-region', 'serverless', 'docker', 'kubernetes', 'k8s']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Cybersecurity Engineer / Security Analyst',
    '{
        "Core Areas": ["Network security", "application security", "cloud security", "Penetration testing", "vulnerability assessment"],
        "Tools": ["Wireshark", "Nmap", "Burp Suite", "Metasploit", "Nessus", "OWASP ZAP", "SIEM: Splunk, QRadar, ELK Stack"],
        "Concepts": ["OWASP Top 10", "encryption (symmetric/asymmetric)", "PKI", "SSL/TLS", "Firewalls", "IDS/IPS", "VPNs", "Zero Trust architecture", "Threat modeling", "risk assessment", "incident response & forensics", "Identity & Access Management (IAM)", "Multi-factor authentication (MFA)"],
        "Compliance & Governance": ["GDPR", "HIPAA", "SOC 2", "ISO 27001"],
        "Other Must-Haves": ["Scripting (Python/Bash) for automation", "Linux proficiency", "Ethical hacking certs knowledge", "Secure coding practices", "DevSecOps integration", "Cloud security tools (AWS GuardDuty, Azure Security Center)"]
    }'::jsonb,
    ARRAY['network security', 'application security', 'cloud security', 'penetration testing', 'vulnerability assessment', 'wireshark', 'nmap', 'burp suite', 'metasploit', 'nessus', 'owasp zap', 'siem', 'splunk', 'qradar', 'elk stack', 'owasp', 'encryption', 'pki', 'ssl', 'tls', 'firewall', 'ids', 'ips', 'vpn', 'zero trust', 'threat modeling', 'risk assessment', 'incident response', 'forensics', 'iam', 'mfa', 'gdpr', 'hipaa', 'soc 2', 'iso 27001', 'python', 'bash', 'linux', 'ethical hacking', 'ceh', 'oscp', 'secure coding', 'devsecops', 'guardduty', 'security center']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'QA Engineer / Test Automation Engineer',
    '{
        "Manual Testing": ["Test case design", "exploratory testing", "bug reporting (JIRA, Bugzilla)", "Test plans", "regression testing", "UAT"],
        "Automation Tools": ["Selenium", "Cypress", "Playwright", "Appium (mobile)", "TestCafe", "Postman/Newman (API)", "RestAssured", "SoapUI"],
        "Frameworks/Languages": ["Java/TestNG", "Python/PyTest", "JavaScript/Jest+Cypress", "BDD: Cucumber, SpecFlow, Behave"],
        "Performance Testing": ["JMeter", "k6", "Gatling", "LoadRunner"],
        "Other Must-Haves": ["CI/CD integration of test suites", "Git version control", "API testing fundamentals", "database testing (SQL queries)", "Cross-browser/cross-device testing", "accessibility testing", "Test management tools (TestRail, Zephyr)", "Basic understanding of SDLC/Agile/Scrum"]
    }'::jsonb,
    ARRAY['manual testing', 'test case', 'exploratory testing', 'jira', 'bugzilla', 'test plan', 'regression testing', 'uat', 'selenium', 'cypress', 'playwright', 'appium', 'testcafe', 'postman', 'newman', 'restassured', 'soapui', 'java', 'testng', 'python', 'pytest', 'javascript', 'jest', 'bdd', 'cucumber', 'specflow', 'behave', 'jmeter', 'k6', 'gatling', 'loadrunner', 'ci/cd', 'git', 'api testing', 'database testing', 'cross-browser', 'accessibility', 'testrail', 'zephyr', 'sdlc', 'agile', 'scrum']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'UI/UX Designer',
    '{
        "Design Tools": ["Figma", "Adobe XD", "Sketch", "Adobe Photoshop", "Adobe Illustrator", "Prototyping: Figma prototyping, InVision, Framer"],
        "Core Skills": ["User research", "persona creation", "user journey mapping", "Wireframing", "mockups", "high-fidelity prototypes", "Design systems & component libraries", "design tokens", "Typography", "color theory", "layout & grid systems", "Usability testing", "A/B testing for design", "Information architecture", "interaction design"],
        "Handoff & Collaboration": ["Design-to-dev handoff (Figma Dev Mode, Zeplin)", "Basic HTML/CSS understanding"],
        "Other Must-Haves": ["Accessibility (WCAG standards)", "responsive/adaptive design principles", "Motion design basics (micro-interactions)", "design critique skills", "Portfolio building", "case study writing"]
    }'::jsonb,
    ARRAY['figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator', 'prototyping', 'invision', 'framer', 'user research', 'personas', 'user journey', 'wireframing', 'mockups', 'high-fidelity', 'design system', 'design tokens', 'typography', 'color theory', 'layout', 'grids', 'usability testing', 'a/b testing', 'information architecture', 'interaction design', 'handoff', 'zeplin', 'html', 'css', 'accessibility', 'wcag', 'responsive design', 'motion design', 'micro-interactions', 'portfolio', 'case study']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Product Manager',
    '{
        "Core Skills": ["Product strategy & roadmapping", "market research", "competitive analysis", "User story writing", "requirement gathering (PRDs/BRDs)", "Prioritization frameworks (RICE, MoSCoW, Kano)", "Agile/Scrum methodology", "Kanban"],
        "Tools": ["JIRA", "Trello", "Asana", "Notion", "Linear", "Productboard", "Analytics: Google Analytics, Mixpanel, Amplitude, Hotjar", "Wireframing basics (Figma)"],
        "Other Must-Haves": ["Stakeholder management", "cross-functional team leadership", "Data-driven decision making", "A/B testing interpretation", "Go-to-market strategy", "pricing strategy basics", "Basic technical literacy (APIs, databases)", "Communication & presentation skills", "customer empathy"]
    }'::jsonb,
    ARRAY['product strategy', 'roadmapping', 'market research', 'competitive analysis', 'user stories', 'prds', 'brds', 'prioritization', 'rice', 'moscow', 'kano', 'agile', 'scrum', 'kanban', 'jira', 'trello', 'asana', 'notion', 'linear', 'productboard', 'google analytics', 'mixpanel', 'amplitude', 'hotjar', 'figma', 'stakeholder management', 'leadership', 'data-driven', 'a/b testing', 'go-to-market', 'pricing', 'apis', 'databases', 'communication', 'customer empathy']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Software Architect / System Design Specialist',
    '{
        "Core Skills": ["System design fundamentals (scalability, availability, consistency)", "Design patterns (Singleton, Factory, Observer)", "SOLID principles", "Microservices vs monolith trade-offs", "domain-driven design (DDD)"],
        "Architecture Concepts": ["Load balancing", "caching strategies", "database sharding/replication", "CAP theorem", "eventual consistency", "distributed systems basics", "API gateway patterns", "event-driven architecture", "CQRS", "Saga pattern", "Message queues (Kafka, RabbitMQ)", "service mesh (Istio)"],
        "Other Must-Haves": ["Cloud architecture (multi-cloud, hybrid)", "security architecture", "performance & scalability planning", "Documentation skills (architecture diagrams, ADRs)", "Tools: Draw.io, Lucidchart, C4 model diagrams", "Strong communication for cross-team alignment"]
    }'::jsonb,
    ARRAY['system design', 'scalability', 'availability', 'consistency', 'design patterns', 'solid', 'microservices', 'monolith', 'ddd', 'domain-driven design', 'load balancing', 'caching', 'sharding', 'replication', 'cap theorem', 'eventual consistency', 'distributed systems', 'api gateway', 'event-driven', 'cqrs', 'saga', 'kafka', 'rabbitmq', 'service mesh', 'istio', 'cloud architecture', 'security architecture', 'performance planning', 'adr', 'draw.io', 'lucidchart', 'c4 model', 'communication']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Blockchain Developer',
    '{
        "Languages": ["Solidity", "Rust (Solana)", "Vyper", "Go (Hyperledger)"],
        "Platforms": ["Ethereum", "Solana", "Polygon", "Binance Smart Chain", "Hyperledger Fabric"],
        "Tools/Frameworks": ["Hardhat", "Truffle", "Foundry", "Remix IDE", "Web3.js", "Ethers.js", "Smart contract security/auditing (Slither, MythX)"],
        "Core Concepts": ["Smart contracts", "gas optimization", "consensus mechanisms (PoW, PoS)", "Token standards (ERC-20, ERC-721, ERC-1155)", "DeFi protocols", "Wallet integration (MetaMask)", "decentralized storage (IPFS)"],
        "Other Must-Haves": ["Cryptography basics", "security best practices", "DApp frontend integration", "Layer 2 solutions"]
    }'::jsonb,
    ARRAY['solidity', 'rust', 'solana', 'vyper', 'go', 'hyperledger', 'ethereum', 'polygon', 'binance smart chain', 'hyperledger fabric', 'hardhat', 'truffle', 'foundry', 'remix', 'web3.js', 'ethers.js', 'slither', 'mythx', 'smart contracts', 'gas optimization', 'consensus', 'pow', 'pos', 'erc-20', 'erc-721', 'erc-1155', 'defi', 'metamask', 'ipfs', 'cryptography', 'security', 'dapp', 'layer 2']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Game Developer',
    '{
        "Engines": ["Unity (C#)", "Unreal Engine (C++/Blueprints)", "Godot (GDScript)"],
        "Languages": ["C++", "C#", "Lua", "GDScript"],
        "Core Skills": ["Game physics", "animation systems", "AI for games (pathfinding, behavior trees)", "3D math (vectors, matrices, quaternions)", "shader programming (HLSL/GLSL)", "Multiplayer networking (Photon, Mirror)", "game optimization/profiling"],
        "Other Must-Haves": ["Level design basics", "sound integration", "version control for assets (Git LFS, Perforce)", "Asset pipeline knowledge", "monetization integration (ads/IAP)", "Platform-specific deployment (Steam, app stores, consoles)"]
    }'::jsonb,
    ARRAY['unity', 'c#', 'unreal engine', 'unreal', 'c++', 'blueprints', 'godot', 'gdscript', 'lua', 'game physics', 'animation', 'pathfinding', 'behavior trees', '3d math', 'vectors', 'matrices', 'quaternions', 'shaders', 'hlsl', 'glsl', 'multiplayer', 'photon', 'mirror', 'optimization', 'profiling', 'level design', 'sound', 'git lfs', 'perforce', 'asset pipeline', 'monetization', 'ads', 'iap', 'steam', 'app store', 'play store', 'console']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Embedded Systems Engineer / IoT Developer',
    '{
        "Languages": ["C", "C++", "Embedded Python (MicroPython)", "Rust"],
        "Hardware Platforms": ["Arduino", "Raspberry Pi", "ESP32/ESP8266", "STM32", "ARM Cortex"],
        "Core Skills": ["Microcontroller programming", "RTOS (FreeRTOS)", "firmware development", "protocols: UART, SPI, I2C, MQTT, BLE, LoRa, Zigbee", "PCB basics (schematics)", "sensor integration"],
        "Other Must-Haves": ["Power management", "debugging (oscilloscopes, logic analyzers)", "IoT cloud platforms (AWS IoT, Azure IoT Hub)", "OTA updates", "Version control", "basic networking"]
    }'::jsonb,
    ARRAY['c', 'c++', 'python', 'micropython', 'rust', 'arduino', 'raspberry pi', 'esp32', 'esp8266', 'stm32', 'arm cortex', 'microcontroller', 'rtos', 'freertos', 'firmware', 'uart', 'spi', 'i2c', 'mqtt', 'ble', 'lora', 'zigbee', 'pcb', 'schematics', 'sensors', 'power management', 'debugging', 'oscilloscope', 'logic analyzer', 'aws iot', 'azure iot', 'ota', 'git', 'networking']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Site Reliability Engineer (SRE)',
    '{
        "Core Skills": ["Linux, scripting, CI/CD, cloud", "Service Level Objectives/Indicators (SLO/SLI)", "error budgets", "Incident management & postmortems", "on-call practices", "Chaos engineering (Gremlin, Chaos Monkey)"],
        "Tools": ["Prometheus", "Grafana", "PagerDuty", "Opsgenie", "Kubernetes expertise", "Terraform", "observability (OpenTelemetry)"],
        "Other Must-Haves": ["Capacity planning", "performance tuning", "automation-first mindset", "Strong coding skills (Go/Python) for tooling"]
    }'::jsonb,
    ARRAY['linux', 'scripting', 'ci/cd', 'cloud', 'slo', 'sli', 'error budget', 'incident management', 'postmortem', 'on-call', 'chaos engineering', 'gremlin', 'chaos monkey', 'prometheus', 'grafana', 'pagerduty', 'opsgenie', 'kubernetes', 'k8s', 'terraform', 'observability', 'opentelemetry', 'capacity planning', 'performance tuning', 'automation', 'go', 'python']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Technical Writer / Developer Advocate',
    '{
        "Core Skills": ["Technical documentation writing", "API documentation (Swagger/OpenAPI)", "Markdown", "static site generators (Docusaurus, MkDocs, GitBook)", "Tutorial/blog writing", "sample code creation"],
        "Other Must-Haves": ["Basic coding ability", "Git/GitHub", "Public speaking", "community engagement", "content strategy", "SEO basics for docs", "video content creation"]
    }'::jsonb,
    ARRAY['technical documentation', 'technical writing', 'api documentation', 'swagger', 'openapi', 'markdown', 'docusaurus', 'mkdocs', 'gitbook', 'tutorials', 'blogs', 'sample code', 'coding', 'git', 'github', 'public speaking', 'devrel', 'community', 'content strategy', 'seo', 'video creation']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'AI/Prompt Engineer',
    '{
        "Core Skills": ["Prompt design & iteration", "system prompt design", "few-shot prompting", "LLM behavior (temperature, tokens, context)", "RAG architecture", "vector databases", "embeddings"],
        "Tools": ["LangChain", "LlamaIndex", "OpenAI/Anthropic/OpenRouter APIs", "Vector DBs: Pinecone, Weaviate, Chroma, pgvector, Qdrant"],
        "Other Must-Haves": ["Basic Python for orchestration", "evaluation frameworks", "AI agent design", "MCP (Model Context Protocol) servers/tools", "Cost/latency optimization", "guardrails & safety design"]
    }'::jsonb,
    ARRAY['prompt design', 'prompt engineering', 'system prompt', 'few-shot', 'llm', 'rag', 'vector database', 'embeddings', 'langchain', 'llamaindex', 'openai', 'anthropic', 'openrouter', 'pinecone', 'weaviate', 'chroma', 'pgvector', 'qdrant', 'python', 'evaluation', 'agent design', 'mcp', 'cost optimization', 'latency optimization', 'guardrails', 'safety design']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Database Administrator (DBA)',
    '{
        "Core Skills": ["SQL mastery", "database design & normalization", "Backup & recovery strategies", "replication", "sharding", "Performance tuning", "indexing strategies", "query optimization"],
        "Database Systems": ["PostgreSQL", "MySQL", "Oracle", "MS SQL Server", "MongoDB"],
        "Other Must-Haves": ["High availability setups", "disaster recovery planning", "Security (access control, encryption)", "Monitoring tools", "cloud-managed DB services (RDS, Cloud SQL)", "Scripting for automation (Python/Bash)"]
    }'::jsonb,
    ARRAY['sql', 'database design', 'normalization', 'backup', 'recovery', 'replication', 'sharding', 'performance tuning', 'indexing', 'query optimization', 'postgresql', 'mysql', 'oracle', 'ms sql server', 'mongodb', 'high availability', 'disaster recovery', 'security', 'access control', 'encryption', 'monitoring', 'rds', 'cloud sql', 'python', 'bash', 'scripting']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;

INSERT INTO public.role_skills_map (role_name, categories, all_skills) VALUES
(
    'Engineering Manager / Tech Lead',
    '{
        "Core Skills": ["People management", "1:1s", "performance reviews", "hiring/interviewing", "Sprint planning", "technical roadmap ownership", "code review leadership", "Conflict resolution", "mentoring/coaching"],
        "Technical Skills": ["Strong system design knowledge", "architecture decision-making", "Ability to code-review across the stack", "technical debt management"],
        "Other Must-Haves": ["Stakeholder communication", "budget/resource planning", "Agile/Scrum mastery", "cross-team collaboration", "Tools: JIRA, Linear, Confluence, Notion"]
    }'::jsonb,
    ARRAY['people management', '1:1s', 'performance reviews', 'hiring', 'interviewing', 'sprint planning', 'roadmap', 'code review', 'conflict resolution', 'mentoring', 'coaching', 'system design', 'architecture', 'tech lead', 'technical debt', 'communication', 'budgeting', 'agile', 'scrum', 'collaboration', 'jira', 'linear', 'confluence', 'notion']
) ON CONFLICT (role_name) DO UPDATE SET categories = EXCLUDED.categories, all_skills = EXCLUDED.all_skills;
