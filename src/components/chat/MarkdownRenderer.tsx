import ReactMarkdown, { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'hsl(0 0% 8%)',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const components: Components = {
    code(props) {
      const { children, className: codeClassName, ...rest } = props;
      const match = /language-(\w+)/.exec(codeClassName || '');
      const code = String(children).replace(/\n$/, '');
      
      // Check if this is a code block (has language class or contains newlines)
      const isCodeBlock = match || code.includes('\n');
      
      if (isCodeBlock && match) {
        return <CodeBlock language={match[1]} code={code} />;
      }
      
      return (
        <code 
          className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" 
          {...rest}
        >
          {children}
        </code>
      );
    },
    p({ children }) {
      return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>;
    },
    strong({ children }) {
      return <strong className="font-semibold text-foreground">{children}</strong>;
    },
    a({ href, children }) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
