import { Octokit } from 'octokit';
import { timingSafeEqual } from 'node:crypto';

function passwordMatches(supplied, expected) {
  if (typeof supplied !== 'string' || typeof expected !== 'string') return false;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not set in environment variables.' });
  }

  const editorPassword = process.env.EDITOR_PASSWORD;
  if (!editorPassword) {
    return res.status(503).json({ error: 'Editor authentication is not configured.' });
  }
  if (!passwordMatches(req.headers['x-editor-password'], editorPassword)) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || !req.body.personal) {
    return res.status(400).json({ error: 'Invalid portfolio data.' });
  }

  const owner = 'atendra11maurya';
  const repo = 'wai_wai_chowmein';
  const path = 'src/config/portfolioData.json';

  try {
    const octokit = new Octokit({ auth: token });
    
    let fileSha;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      fileSha = data.sha;
    } catch (e) {
      if (e.status !== 404) {
        throw e;
      }
    }

    const portfolioData = JSON.parse(JSON.stringify(req.body));
    delete portfolioData.personal.adminPassword;
    const serializedData = JSON.stringify(portfolioData, null, 2);
    if (Buffer.byteLength(serializedData, 'utf8') > 3 * 1024 * 1024) {
      return res.status(413).json({ error: 'Portfolio data is too large to publish.' });
    }
    const content = Buffer.from(serializedData).toString('base64');

    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: 'Update portfolio data via inline editor (Vercel API)',
      content,
      sha: fileSha,
      committer: {
        name: 'Vercel Inline Editor',
        email: 'noreply@vercel.app'
      },
      author: {
        name: 'Vercel Inline Editor',
        email: 'noreply@vercel.app'
      }
    });

    res.status(200).json({ success: true, message: 'Successfully pushed to GitHub.' });
  } catch (error) {
    console.error('GitHub push error:', error);
    res.status(500).json({ error: error.message });
  }
}
