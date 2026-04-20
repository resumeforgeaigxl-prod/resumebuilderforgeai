import React from 'react';
import { ResumeData } from '@/types/resume';
import { ATSTemplateRenderer } from '@/components/templates/ATSTemplateRenderer';

/**
 * Server-side high-fidelity resume renderer.
 * Converts the React-based template into a static HTML string with full CSS injection.
 */
export function renderResumeToHtml(data: ResumeData, templateId: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { renderToStaticMarkup } = require('react-dom/server');
    
    const content = renderToStaticMarkup(
        <ATSTemplateRenderer data={data} templateId={templateId} mode="print" />
    );

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }
        .font-inter { font-family: 'Inter', sans-serif; }
    </style>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        inter: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body>
    ${content}
</body>
</html>
    `.trim();
}
