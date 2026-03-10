export interface LanguageCard {
    name: string;
    slug: string;
    description: string;
    topicCount: number;
}

export interface TopicSeed {
    title: string;
    slug: string;
    order_index: number;
}

interface LanguageSeed {
    name: string;
    slug: string;
    description: string;
    topics: string[];
}

function toSlug(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const CAREERFORGE_LANGUAGE_SEEDS: LanguageSeed[] = [
    {
        name: 'Java',
        slug: 'java',
        description: 'Powering enterprise applications and Android apps.',
        topics: [
            'Java Overview',
            'Java Installation',
            'Java Syntax',
            'Java Variables',
            'Java Data Types',
            'Java Operators',
            'Java Conditions',
            'Java Loops',
            'Java Methods',
            'Java Arrays',
            'Java OOP',
            'Java Classes',
            'Java Inheritance',
            'Java Polymorphism',
            'Java Interfaces',
            'Java Threads',
            'Java Collections',
            'Java File Handling',
            'Java JDBC',
        ],
    },
    {
        name: 'Python',
        slug: 'python',
        description: 'The language of data science, AI, and automation.',
        topics: [
            'Python Overview',
            'Python Installation',
            'Python Syntax',
            'Python Variables',
            'Python Data Types',
            'Python Operators',
            'Python Conditions',
            'Python Loops',
            'Python Functions',
            'Python Lists',
            'Python Tuples',
            'Python Dictionaries',
            'Python OOP',
            'Python Modules',
            'Python File Handling',
            'Python Exception Handling',
        ],
    },
    {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'The engine of the modern web and beyond.',
        topics: [
            'JavaScript Overview',
            'JavaScript Setup',
            'JavaScript Syntax',
            'JavaScript Variables',
            'JavaScript Data Types',
            'JavaScript Operators',
            'JavaScript Conditions',
            'JavaScript Loops',
            'JavaScript Functions',
            'JavaScript Arrays',
            'JavaScript Objects',
            'JavaScript DOM Manipulation',
            'JavaScript ES6 Features',
            'JavaScript Async Programming',
            'JavaScript Fetch API',
            'JavaScript Error Handling',
        ],
    },
    {
        name: 'C',
        slug: 'c',
        description: 'The foundation of modern computing and systems.',
        topics: [
            'C Overview',
            'C Installation',
            'C Syntax',
            'C Variables',
            'C Data Types',
            'C Operators',
            'C Conditions',
            'C Loops',
            'C Functions',
            'C Arrays',
            'C Strings',
            'C Pointers',
            'C Structures',
            'C File Handling',
            'C Memory Management',
        ],
    },
    {
        name: 'C++',
        slug: 'c-plus-plus',
        description: 'High-performance applications and game development.',
        topics: [
            'C++ Overview',
            'C++ Installation',
            'C++ Syntax',
            'C++ Variables',
            'C++ Data Types',
            'C++ Operators',
            'C++ Conditions',
            'C++ Loops',
            'C++ Functions',
            'C++ Arrays',
            'C++ OOP',
            'C++ Classes',
            'C++ Inheritance',
            'C++ Polymorphism',
            'C++ STL',
            'C++ File Handling',
        ],
    },
    {
        name: 'React',
        slug: 'react',
        description: 'Building modern, interactive user interfaces.',
        topics: [
            'React Overview',
            'React Installation',
            'React JSX',
            'React Components',
            'React Props',
            'React State',
            'React Events',
            'React Hooks',
            'React Forms',
            'React Lists and Keys',
            'React Conditional Rendering',
            'React Context API',
            'React Router',
            'React API Integration',
            'React Performance Optimization',
        ],
    },
    {
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Fast, scalable network applications.',
        topics: [
            'Node.js Overview',
            'Node.js Installation',
            'Node.js Modules',
            'Node.js NPM',
            'Node.js File System',
            'Node.js Events',
            'Node.js HTTP Server',
            'Node.js Express Basics',
            'Node.js Middleware',
            'Node.js Routing',
            'Node.js REST APIs',
            'Node.js Authentication',
            'Node.js Database Integration',
            'Node.js Error Handling',
            'Node.js Deployment',
        ],
    },
    {
        name: 'SQL',
        slug: 'sql',
        description: 'The language for managing structured data.',
        topics: [
            'SQL Overview',
            'SQL Installation',
            'SQL Syntax',
            'SQL SELECT',
            'SQL WHERE Clause',
            'SQL ORDER BY',
            'SQL GROUP BY',
            'SQL JOINS',
            'SQL INSERT',
            'SQL UPDATE',
            'SQL DELETE',
            'SQL Constraints',
            'SQL Indexes',
            'SQL Views',
            'SQL Stored Procedures',
            'SQL Transactions',
        ],
    },
];

export function getCareerForgeLanguageCards(): LanguageCard[] {
    return CAREERFORGE_LANGUAGE_SEEDS.map((language) => ({
        name: language.name,
        slug: language.slug,
        description: language.description,
        topicCount: language.topics.length,
    }));
}

export function getCareerForgeTopicsByLanguage(languageSlug: string): TopicSeed[] {
    const language = CAREERFORGE_LANGUAGE_SEEDS.find((item) => item.slug === languageSlug);
    if (!language) {
        return [];
    }

    return language.topics.map((title, index) => ({
        title,
        slug: toSlug(title),
        order_index: index + 1,
    }));
}

export function getCareerForgeLanguageSeedRows(): Array<{
    name: string;
    slug: string;
    description: string;
}> {
    return CAREERFORGE_LANGUAGE_SEEDS.map((language) => ({
        name: language.name,
        slug: language.slug,
        description: language.description,
    }));
}

export function getCareerForgeTopicSeedRows(): Array<{
    languageSlug: string;
    title: string;
    slug: string;
    order_index: number;
}> {
    return CAREERFORGE_LANGUAGE_SEEDS.flatMap((language) =>
        language.topics.map((title, index) => ({
            languageSlug: language.slug,
            title,
            slug: toSlug(title),
            order_index: index + 1,
        }))
    );
}
