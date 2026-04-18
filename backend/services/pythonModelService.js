const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ML_DIR = path.join(__dirname, '..', 'ml');

function getPythonCandidates() {
  if (process.env.PYTHON_EXECUTABLE) {
    return [{ command: process.env.PYTHON_EXECUTABLE, baseArgs: [] }];
  }

  if (process.platform === 'win32') {
    return [
      { command: 'py', baseArgs: ['-3'] },
      { command: 'python', baseArgs: [] },
      { command: 'python3', baseArgs: [] },
    ];
  }

  return [
    { command: 'python3', baseArgs: [] },
    { command: 'python', baseArgs: [] },
  ];
}

function runScript(scriptName, payload = {}) {
  const scriptPath = path.join(ML_DIR, scriptName);

  if (!fs.existsSync(scriptPath)) {
    return Promise.reject(new Error(`Python script not found: ${scriptName}`));
  }

  const candidates = getPythonCandidates();

  const attempt = (index) => {
    if (index >= candidates.length) {
      return Promise.reject(new Error('Python runtime not found. Install Python 3 and required ML packages, or set PYTHON_EXECUTABLE in backend/.env'));
    }

    const candidate = candidates[index];

    return new Promise((resolve, reject) => {
      const child = spawn(candidate.command, [...candidate.baseArgs, scriptPath], {
        cwd: ML_DIR,
        env: process.env,
      });

      let stdout = '';
      let stderr = '';
      let handled = false;

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        if (handled) return;
        handled = true;
        reject(error);
      });

      child.on('close', (code) => {
        if (handled) return;
        handled = true;

        if (code === 0) {
          try {
            const parsed = JSON.parse(stdout.trim() || '{}');
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Could not parse Python response. ${error.message}. Output: ${stdout || stderr}`));
          }
          return;
        }

        reject(new Error(stderr.trim() || `Python script exited with code ${code}`));
      });

      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    }).catch((error) => {
      const message = String(error.message || '');
      const notFound = message.includes('not found') || message.includes('ENOENT') || message.includes('is not recognized');
      if (notFound) {
        return attempt(index + 1);
      }
      throw error;
    });
  };

  return attempt(0);
}

function getModelMetadata() {
  const metadataPath = path.join(ML_DIR, 'model_artifacts', 'model_metadata.json');
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

module.exports = {
  runScript,
  getModelMetadata,
};
