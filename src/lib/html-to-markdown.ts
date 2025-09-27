// Utility to convert HTML to Markdown for copying chat responses

export function htmlToMarkdown(html: string): string {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Convert common HTML elements to Markdown
  let markdown = tempDiv.innerHTML
  
  // Convert headings
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
  
  // Convert strong/bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  
  // Convert emphasis/italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  
  // Convert unordered lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return items.map((item: string) => {
      const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '$1')
      return `- ${text.trim()}`
    }).join('\n') + '\n'
  })
  
  // Convert ordered lists
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return items.map((item: string, index: number) => {
      const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '$1')
      return `${index + 1}. ${text.trim()}`
    }).join('\n') + '\n'
  })
  
  // Convert list items (standalone)
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
  
  // Convert code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
  markdown = markdown.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n')
  
  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n')
  
  // Convert horizontal rules
  markdown = markdown.replace(/<hr\s*\/?>/gi, '---\n')
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // Clean up extra whitespace and newlines
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .replace(/[ \t]+$/gm, '') // Remove trailing spaces
    .trim()
  
  return markdown
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
