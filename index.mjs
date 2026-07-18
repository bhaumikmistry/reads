/**
 * Reads all issues with label "kind: read" and builds api.json
 * Triggered on issue open, close, or manual dispatch.
 */

const REPO_OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'bhaumikmistry'
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'reads'
const TOKEN = process.env.GITHUB_TOKEN

if (!TOKEN) { console.error('Missing GITHUB_TOKEN'); process.exit(1) }

async function ghFetch(endpoint) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' }
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  return res.json()
}

async function getAllIssues() {
  let page = 1
  let all = []
  while (true) {
    const issues = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100&page=${page}`)
    if (issues.length === 0) break
    all = all.concat(issues)
    page++
  }
  return all
}

async function main() {
  console.log('Fetching all issues...')
  const issues = await getAllIssues()
  console.log(`Found ${issues.length} issues`)

  const reads = issues
    .filter(i => !i.pull_request)
    .map(issue => {
      const url = (issue.body || '').trim().split('\n')[0].trim()
      const isValidUrl = url.startsWith('http://') || url.startsWith('https://')

      return {
        id: issue.number,
        title: issue.title,
        url: isValidUrl ? url : '',
        state: issue.state === 'open' ? 'to-read' : 'read',
        createdAt: issue.created_at,
        closedAt: issue.closed_at || null,
        labels: issue.labels.map(l => typeof l === 'string' ? l : l.name),
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const { writeFileSync } = await import('fs')
  writeFileSync('api.json', JSON.stringify(reads, null, 2) + '\n')
  console.log(`Written api.json with ${reads.length} entries`)
  console.log(`  To-read: ${reads.filter(r => r.state === 'to-read').length}`)
  console.log(`  Read: ${reads.filter(r => r.state === 'read').length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
