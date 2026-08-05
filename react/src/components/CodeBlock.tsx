import { Highlight, themes, type Language } from "prism-react-renderer";

interface CodeBlockProps {
  code: string;
  language?: Language;
  /** 같은 섹션 안에 여러 예제가 있을 때 구분용 소제목 */
  title?: string;
}

export default function CodeBlock({ code, language = "tsx", title }: CodeBlockProps) {
  return (
    <div className="code-block-wrapper">
      {title && <p className="code-title">{title}</p>}
      <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`code-block ${className}`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
