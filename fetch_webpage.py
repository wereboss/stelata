#!/usr/bin/env python3
import sys
import urllib.request
from html.parser import HTMLParser

class TextHTMLParser(HTMLParser):
    """
    A simple HTML parser to extract text content and preserve basic spacing.
    """
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.ignore_tags = {'script', 'style', 'head', 'title', 'meta', 'link'}
        self.current_tag_stack = []

    def handle_starttag(self, tag, attrs):
        self.current_tag_stack.append(tag)
        # Add newlines for block elements to keep the text readable
        if tag in {'p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'header', 'footer'}:
            self.text_parts.append('\n')

    def handle_endtag(self, tag):
        if self.current_tag_stack:
            self.current_tag_stack.pop()
        if tag in {'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'header', 'footer'}:
            self.text_parts.append('\n')

    def handle_data(self, data):
        # Ignore data if we are inside style, script, head, etc.
        if not any(tag in self.ignore_tags for tag in self.current_tag_stack):
            clean_data = data.strip()
            if clean_data:
                # Add spacing if the last character isn't already a space/newline
                if self.text_parts and not self.text_parts[-1].endswith(('\n', ' ')):
                    self.text_parts.append(' ')
                self.text_parts.append(clean_data)

    def get_text(self):
        raw_text = ''.join(self.text_parts)
        # Clean up excess consecutive blank lines
        lines = [line.strip() for line in raw_text.splitlines()]
        cleaned_lines = []
        for line in lines:
            if line:
                cleaned_lines.append(line)
            elif not cleaned_lines or cleaned_lines[-1] != "":
                cleaned_lines.append("")
        return '\n'.join(cleaned_lines).strip()

def fetch_webpage_text(url):
    """
    Fetches the web page at the given URL and returns its text content.
    """
    # Make sure url starts with http/https schema
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    # Define headers to mimic a browser, preventing HTTP 403 Forbidden errors
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            # Check content type if possible, default to utf-8 decode
            charset = response.headers.get_content_charset() or 'utf-8'
            html_bytes = response.read()
            html_content = html_bytes.decode(charset, errors='replace')
            
        parser = TextHTMLParser()
        parser.feed(html_content)
        return parser.get_text()
        
    except urllib.error.URLError as e:
        return f"Network Error: Could not retrieve page. Details: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

if __name__ == '__main__':
    # Get the URL from the command line arguments or prompt the user
    if len(sys.argv) > 1:
        target_url = sys.argv[1]
    else:
        target_url = input("Enter the URL to fetch (e.g. example.com): ").strip()

    if not target_url:
        print("Error: No URL provided.")
        sys.exit(1)

    print(f"Fetching text from: {target_url}...\n")
    page_text = fetch_webpage_text(target_url)
    
    print("-" * 40)
    print(page_text)
    print("-" * 40)
