import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execFileAsync = promisify(execFile);

export async function extractTextFromPdf(fileBuffer: Buffer, fileName: string): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `resume-${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`);
    
    const projectRoot = process.cwd();
    const isWin = process.platform === 'win32';
    const binaryName = isWin ? 'pdf-parser-win.exe' : 'pdf-parser-linux';
    const binaryPath = path.join(projectRoot, 'bin', binaryName);

    console.log(`[PDF Service Go] Extracting text from ${fileName}...`);

    try {
        // 1. Write buffer to temp file
        await fs.writeFile(tempFilePath, fileBuffer);

        // 2. Ensure executable permissions on Linux/macOS
        if (!isWin) {
            try {
                await fs.chmod(binaryPath, 0o755);
            } catch (chmodErr) {
                console.warn('[PDF Service Go] chmod failed (might already be executable):', chmodErr);
            }
        }

        // 3. Execute Go binary
        const { stdout } = await execFileAsync(binaryPath, [tempFilePath]);
        return stdout || '';

    } catch (err) {
        console.error('[PDF Service Go] Fatal Error:', err);
        throw err;
    } finally {
        // 4. Cleanup temp file
        try {
            await fs.unlink(tempFilePath);
        } catch (cleanupErr) {
            console.error('[PDF Service Go] Cleanup failed:', cleanupErr);
        }
    }
}
