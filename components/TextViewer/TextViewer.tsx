import Markdown from "markdown-to-jsx";

export default function TextViewer({ text }: { text: string }) {
  return <Markdown>{text}</Markdown>;
}