const obsidian = require('obsidian');
const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

class CodeExecutorPlugin extends obsidian.Plugin {
    async onload() {

        this.addCommand({
            id: 'run-code',
            name: 'Run Code',
            callback: () => this.runCode()
        });

        this.addCommand({
            id: 'stop-running',
            name: 'Stop Running',
            callback: () => this.stopRunning()
        });

        this.addCommand({
            id: 'run-script',
            name: 'Run Script',
            callback: () => this.runScript()
        });

        await this.setupObsidianServer();
        await this.executeStartup();
    }

    async setupObsidianServer() {
        try {
            const PORT = 3300;
            const CODE_FILE = path.join(this.app.vault.adapter.basePath, 'code.js');

			const server = http.createServer(async (req, res) => {
			    if (req.method === 'POST' && req.url === '/run') {
			        let body = '';
			        
			        // Collect data chunks
			        req.on('data', chunk => {
			            body += chunk.toString();
			        });
			
			        // Process the complete request body
			        req.on('end', async () => {
			            try {
			                const code = JSON.parse(body).code;
			                
			                // Wrap the code in an async function and await its execution
			                const asyncFunction = new Function(`return (async () => { ${code} })();`);
			                const result = await asyncFunction();
			                
			                res.writeHead(200, { 'Content-Type': 'application/json' });
			                res.end(JSON.stringify(result));
			            } catch (error) {
			                res.writeHead(500, { 'Content-Type': 'text/plain' });
			                res.end(error.toString());
			            }
			        });
			    } else {
			        res.writeHead(404, { 'Content-Type': 'text/plain' });
			        res.end('Not Found');
			    }
			});

            // Store server instance in the plugin for cleanup
            this.server = server;

            server.listen(PORT, () => {
                console.log(`Obsidian server running on port ${PORT}`);
            });
        } catch (error) {
            console.error('Failed to set up Obsidian server:', error);
            new obsidian.Notice('Failed to set up Obsidian server', 5000);
        }
    }

	async loadScriptContent(scriptType) {
	    try {
	        // 1. Read the file
	        const scriptFile = await this.app.vault.adapter.read(
	            'Modules/code executor command line script.md'
	        );
	        
	        // 2. Convert line endings and split into lines
	        const lines = scriptFile.replace(/\r\n/g, '\n').split('\n');
	        
	        // 3. Find the section we want
	        let scriptLines = [];
	        let inCorrectSection = false;
	        let inCodeBlock = false;
	        
	        for (const line of lines) {
	            // Check for section header
	            if (line.startsWith('## ')) {
	                inCorrectSection = line === `## ${scriptType}`;
	                continue;
	            }
	            
	            if (!inCorrectSection) continue;
	            
	            // Check for code block markers
	            if (line.trim() === '```powershell') {
	                inCodeBlock = true;
	                continue;
	            }
	            if (line.trim() === '```') {
	                break;
	            }
	            
	            // Collect script lines
	            if (inCodeBlock) {
	                scriptLines.push(line);
	            }
	        }
	        
	        if (scriptLines.length === 0) {
	            throw new Error(`No script content found for "${scriptType}"`);
	        }
	        
	        return scriptLines.join('\n');
	        
	    } catch (error) {
	        console.error('Failed to load script:', error);
	        new obsidian.Notice(`Failed to load script: ${error.message}`);
	        return null;
	    }
	}

    async replaceVariables(script) {
        let activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            // throw new Error('No active file');
			activeFile = "";
        }

        const vaultPath = this.app.vault.adapter.basePath;
        const filePath = activeFile.path;
        const absoluteFilePath = `${vaultPath}/${filePath}`;

        return script
            .replace(/{{vault_path}}/g, vaultPath)
            .replace(/{{file_path:absolute}}/g, absoluteFilePath);
    }

    async executeProcessScript(scriptType, environmentVariables = {}) {

		try{
		    await this.app.commands.executeCommandById('editor:save-file');
		}catch(e){
		    console.warn('Failed to save file:', e);
		}

        try {
            const script = await this.loadScriptContent(scriptType);
            if (!script) {
                throw new Error(`Failed to load ${scriptType} script`);
            }

            const processedScript = await this.replaceVariables(script);
            
			const progressNotice = new obsidian.Notice(`${scriptType}...`, 0);
            
            // Set environment variables for the PowerShell process
            const envVars = {
                'PYTHONIOENCODING': 'utf-8',
                ...environmentVariables
            };

            return new Promise((resolve, reject) => {
                exec(processedScript, { 
                    shell: 'powershell.exe',
                    env: { ...process.env, ...envVars }
                }, (error, stdout, stderr) => {
                	progressNotice.hide();
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve({ stdout, stderr });
                });
            });
        } catch (error) {
            new obsidian.Notice(`Error: ${error.message}`, 10000);
            console.error(`Error in ${scriptType}:`, error);
			return { stdout: '', stderr: error.message };
        }
    }

    async executeStartup() {
        try {
            const { stdout, stderr } = await this.executeProcessScript('Startup');
            
            if (stdout) console.log('Startup output:', stdout);
            if (stderr) console.error('Startup error:', stderr);
        } catch (error) {
            console.error('Failed to execute startup script:', error);
        }
    }

    async runCode() {
		const { stdout, stderr } = await this.executeProcessScript('Run Code', {
			'SCRIPT_MODE': 'False'
		});
		
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile || activeFile.path !== 'Logs/run code log.md') {
			if (stdout) new obsidian.Notice(`${stdout}`);
			if (stderr) new obsidian.Notice(`Error`, 10000);
		}

		if (stdout || stderr) {
		    let logContent = '```powershell\n';
		    if (stdout) logContent += stdout.trim() + '\n';
		    logContent += '```\n\n';
		    logContent += '```powershell\n';
		    if (stderr) logContent += 'Error: ' + stderr.trim() + '\n';
		    logContent += '```';
	    
		    await this.app.vault.adapter.write('Logs/run code log.md', logContent);
		}

		if (stderr) console.error(stderr);
	}

    async stopRunning() {
		const { stdout, stderr } = await this.executeProcessScript('Stop Running');
		
		if (stdout) new obsidian.Notice(`${stdout}`);
		if (stderr) new obsidian.Notice(`Error: ${stderr}`, 10000);
    }

    async runScript() {
		const { stdout, stderr } = await this.executeProcessScript('Run Script', {
			'SCRIPT_MODE': 'True'
		});
		
		if (stdout) new obsidian.Notice(`${stdout}`);
		if (stderr) new obsidian.Notice(`Error: ${stderr}`, 10000);


		if (stdout || stderr) {
		    let logContent = '```powershell\n';
		    if (stdout) logContent += stdout.trim() + '\n';
		    logContent += '```\n\n';
		    logContent += '```powershell\n';
		    if (stderr) logContent += 'Error: ' + stderr.trim() + '\n';
		    logContent += '```';
	    
		    await this.app.vault.adapter.write('Logs/script code log.md', logContent);
		}

		if (stderr) console.error(stderr);
    }
}

module.exports = CodeExecutorPlugin;