import { parseReply, type InlinePart } from "@/shared/chat";

// Shows the assistant's reply as text, never as HTML: paragraphs, lists, bold, and links.

function Inline({ parts }: { parts: InlinePart[] }) {
  return parts.map((part, index) => {
    if (part.kind === "bold") return <strong key={index}>{part.text}</strong>;
    if (part.kind === "link") {
      const external = part.href.startsWith("http");
      return (
        <a
          key={index}
          href={part.href}
          className="break-all text-orange underline underline-offset-2 hover:text-paper"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {part.text}
        </a>
      );
    }
    return <span key={index}>{part.text}</span>;
  });
}

export function ChatReply({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {parseReply(text).map((block, index) =>
        block.kind === "list" ? (
          <ul key={index} className="flex list-disc flex-col gap-1 pl-5">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Inline parts={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                <Inline parts={line} />
              </span>
            ))}
          </p>
        )
      )}
    </div>
  );
}
