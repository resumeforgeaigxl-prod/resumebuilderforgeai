const fs = require('fs');

function replaceFile(path, replacer) {
    if (!fs.existsSync(path)) {
        console.log(`Not found: ${path}`);
        return;
    }
    const content = fs.readFileSync(path, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(path, newContent);
        console.log(`Updated ${path}`);
    }
}

// 1. catch (e: any)
const catchRegex = /catch\s*\(\s*e\s*:\s*any\s*\)\s*\{/g;
const catchReplacer = "catch (error: unknown) { const e = error as Error;"

function fixAllCatchFiles(files) {
    files.forEach(f => {
        replaceFile(f, c => c.replace(catchRegex, catchReplacer));
    });
}
fixAllCatchFiles([
    'app/api/admin/coupons/[id]/toggle/route.ts',
    'app/api/admin/coupons/create/route.ts',
    'app/api/admin/coupons/route.ts',
    'app/api/admin/logs/route.ts',
    'app/api/admin/mock-tests/route.ts',
    'app/api/admin/portfolios/[id]/toggle/route.ts',
    'app/api/admin/portfolios/route.ts',
    'app/api/admin/resumes/[id]/route.ts',
    'app/api/admin/resumes/route.ts',
    'app/api/admin/subscriptions/[id]/extend/route.ts',
    'app/api/admin/subscriptions/route.ts',
    'app/api/admin/users/[id]/delete/route.ts',
    'app/api/admin/users/[id]/upgrade/route.ts',
    'app/api/resume/[id]/versions/route.ts'
]);

// 2. Logs map
replaceFile('app/api/admin/logs/route.ts', c => c.replace('logs.map((l: any)', 'logs.map((l: { id: string; action: string; target_id: string; metadata: unknown; created_at: string; users?: { email: string } })'));

// 3. Mock-Tests map
replaceFile('app/api/admin/mock-tests/route.ts', c => c.replace('tests.map((t: any)', 'tests.map((t: { id: string; company_name: string; job_title: string; total_questions: number; created_at: string; users?: { email: string } })'));

// 4. Portfolios map
replaceFile('app/api/admin/portfolios/route.ts', c => c.replace('portfolios.map((r: any)', 'portfolios.map((r: { id: string; username: string; theme: string; is_public: boolean; created_at: string; users?: { email: string } })'));

// 5. Resumes map
replaceFile('app/api/admin/resumes/route.ts', c => c.replace('resumes.map((r: any)', 'resumes.map((r: { id: string; created_at: string; users?: { email: string }; resume_analysis?: { keyword_score: number; impact_score: number }[] })'));

// 6. Subscriptions map
replaceFile('app/api/admin/subscriptions/route.ts', c => c.replace('subscriptions.map((s: any)', 'subscriptions.map((s: { id: string; plan: string; status: string; expires_at: string; created_at: string; users?: { email: string }; coupons?: { code: string } })'));

// 7. app/admin/logs/page.tsx
replaceFile('app/admin/logs/page.tsx', c => c.replace('metadata: any;', 'metadata: Record<string, unknown> | null;'));

// 8. app/admin/page.tsx
replaceFile('app/admin/page.tsx', c => c.replace(/const monthStart = startOfMonth\(new Date\(\)\);.*\n/g, ''));

// 9. app/api/admin/users/[id]/delete/route.ts
replaceFile('app/api/admin/users/[id]/delete/route.ts', c => c.replace('const { data, error: userError }', 'const { error: userError }'));

// 10. app/api/auth/[provider]/callback/route.ts
replaceFile('app/api/auth/[provider]/callback/route.ts', c => c.replace(/import crypto from 'crypto';.*\n/g, ''));

// 11. app/api/coupon/redeem/route.ts
replaceFile('app/api/coupon/redeem/route.ts', c => c.replace(/const now = new Date\(\);.*\n/g, ''));

// 12. app/api/portfolio/[username]/track/route.ts
replaceFile('app/api/portfolio/[username]/track/route.ts', c => c.replace(/const ip = request\.headers\.get\('x-forwarded-for'\) \|\| 'unknown';.*\n/g, ''));

// 13. app/api/portfolio/generate/route.ts
replaceFile('app/api/portfolio/generate/route.ts', c => c.replace('let jobTitle = params.job_title;', 'const jobTitle = params.job_title;'));

// 14. app/api/resume/analyze/route.ts
replaceFile('app/api/resume/analyze/route.ts', c => c.replace('data.map((item: any)', 'data.map((item: Record<string, unknown>)').replace('item.impact_score: any', 'item.impact_score: number'));

// 15. app/mock-test/[id]/page.tsx
replaceFile('app/mock-test/[id]/page.tsx', c => c.replace(/const \[couponApplied, setCouponApplied\] = useState\(false\);.*\n/g, ''));

// 16. app/portfolio/page.tsx
replaceFile('app/portfolio/page.tsx', c => c.replace(/,\s*Edit2/g, ''));

// 17. components/builder/HealthScore.tsx
replaceFile('components/builder/HealthScore.tsx', c => c.replace('{ analysis: any }', '{ analysis: Record<string, any> | null }'));

// 18. components/builder/JdMatcher.tsx
replaceFile('components/builder/JdMatcher.tsx', c => c.replace('analysis?: any', 'analysis?: Record<string, any>'));

// 19. components/builder/VersionHistory.tsx
replaceFile('components/builder/VersionHistory.tsx', c => c.replace('<any[]>', '<Record<string, any>[]>').replace('selected: any', 'selected: Record<string, any>'));

// 20. components/portfolio/themes/DeveloperTheme.tsx
replaceFile('components/portfolio/themes/DeveloperTheme.tsx', c => c.replace(/,\s*Terminal/g, '').replace(/>\s*\/\/\s*Header\s*</g, '>{/* Header */}<').replace(/>\s*\/\/\s*Projects Section\s*</g, '>{/* Projects Section */}<'));

// Remove next/font/google from Themes
replaceFile('components/portfolio/themes/CorporateTheme.tsx', c => c.replace(/import \{ Inter \} from 'next\/font\/google';/g, '').replace(/const inter = Inter\(\{ subsets: \['latin'\] \}\);/g, '').replace(/className=\{`max-w-4xl \$\{inter\.className\}`\}/g, 'className={`max-w-4xl inter-font`}').replace(/className=\{inter\.className\}/g, 'className={`inter-font`}'));
replaceFile('components/portfolio/themes/DeveloperTheme.tsx', c => c.replace(/import \{ Fira_Code \} from 'next\/font\/google';/g, '').replace(/const firaCode = Fira_Code\(\{ subsets: \['latin'\] \}\);/g, '').replace(/className=\{`min-h-screen text-slate-300 \$\{firaCode\.className\}`\}/g, 'className={`min-h-screen text-slate-300 fira-code-font`}').replace(/className=\{firaCode\.className\}/g, 'className={`fira-code-font`}'));

console.log('Done!');
