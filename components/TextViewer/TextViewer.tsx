import Markdown from "markdown-to-jsx";

export default function TextViewer({ text }: { text: string }) {
  if (!text) return null;
  return <Markdown>{text}</Markdown>;
}