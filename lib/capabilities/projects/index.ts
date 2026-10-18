import { generateProject } from '@/lib/projectforge-ai';
import { createClient } from '@/lib/supabase/server';

export interface ProjectBlueprintParams {
  idea: string;
}

export interface ProjectBlueprintResult {
  success: boolean;
  tool: string;
  projectName: string;
  techStack: string[];
  folderStructure: string;
  filesCount: number;
  files: Array<{ path: string; code: string }>;
  explanation: string;
}

/**
 * Generates full-stack portfolio project architecture, folder structure, starter code files,
 * and key milestones to showcase on a resume or GitHub.
 */
export async function generateProjectBlueprint(
  params: ProjectBlueprintParams,
  userId: string
): Promise<ProjectBlueprintResult> {
  const projectData = await generateProject(params.idea);
  return {
    success: true,
    tool: 'generate_project_blueprint',
    projectName: projectData.project_name || params.idea,
    techStack: projectData.tech_stack || ['Next.js', 'TypeScript', 'Tailwind CSS'],
    folderStructure: projectData.folder_structure || '',
    filesCount: (projectData.files || []).length,
    files: (projectData.files || []).slice(0, 4),
    explanation:
      projectData.explanation ||
      'Production-grade portfolio project specification designed for candidate resume proof-of-work.',
  };
}

/**
 * Retrieves past generated portfolio projects for a given user.
 */
export async function getUserProjects(userId: string): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getUserProjects] Error:', error.message);
    return [];
  }
  return data || [];
}
