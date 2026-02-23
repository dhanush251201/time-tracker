import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  markdown: string;
}

export const MarkdownPreview = ({ markdown }: MarkdownPreviewProps): JSX.Element => {
  return (
    <div className="space-y-4 text-neutral-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          h1: ({ node, className, ...props }) => (
            <h1
              className={['mb-3 text-xl font-semibold text-white', className].filter(Boolean).join(' ')}
              {...props}
            />
          ),
          h2: ({ node, className, ...props }) => (
            <h2
              className={['mb-3 text-lg font-semibold text-white', className].filter(Boolean).join(' ')}
              {...props}
            />
          ),
          h3: ({ node, className, ...props }) => (
            <h3
              className={['mb-3 text-base font-semibold text-white', className].filter(Boolean).join(' ')}
              {...props}
            />
          ),
          p: ({ node, className, ...props }) => (
            <p
              className={['mb-3 text-sm leading-relaxed text-neutral-200', className].filter(Boolean).join(' ')}
              {...props}
            />
          ),
          ul: ({ node, className, ...props }) => (
            <ul
              className={[
                'mb-3 list-disc space-y-1 pl-5 text-sm text-neutral-200 marker:text-neutral-500',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...props}
            />
          ),
          ol: ({ node, className, ...props }) => (
            <ol
              className={[
                'mb-3 list-decimal space-y-1 pl-5 text-sm text-neutral-200 marker:text-neutral-500',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...props}
            />
          ),
          li: ({ node, className, ...props }) => (
            <li className={['text-sm', className].filter(Boolean).join(' ')} {...props} />
          ),
          blockquote: ({ node, className, ...props }) => (
            <blockquote
              className={[
                'mb-4 border-l-4 border-neutral-700 pl-4 text-sm italic text-neutral-300',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...props}
            />
          ),
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className={[
                    'rounded bg-neutral-800 px-1.5 py-0.5 text-xs font-mono text-neutral-100',
                    className,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={['block text-xs font-mono text-neutral-100', className].filter(Boolean).join(' ')}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, className, ...props }) => (
            <pre
              className={[
                'mb-4 overflow-x-auto rounded-lg border border-neutral-700 bg-neutral-950/60 p-4 text-sm text-neutral-100 shadow-inner',
                className,
              ]
                .filter(Boolean)
                .join(' ')}
              {...(props as ComponentPropsWithoutRef<'pre'>)}
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
