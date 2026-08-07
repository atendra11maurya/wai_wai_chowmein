import { Octokit } from 'octokit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN is not set in environment variables.' });
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

    const content = Buffer.from(JSON.stringify(req.body, null, 2)).toString('base64');

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
