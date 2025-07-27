import Markdown from "markdown-to-jsx";

const markdownOptions = {
  forceBlock: true,
  overrides: {
    h1: {
      props: {
        className: "text-lg font-light mb-2 mt-4"
      }
    },
    h2: {
      props: {
        className: "text-base font-light mb-1 mt-3"
      }
    },
    h3: {
      props: {
        className: "text-sm font-light mt-2"
      }
    },
    ul: {
      props: {
        className: "pl-5 mb-2"
      }
    },
    li: {
      component: ({ children, ...props }: any) => (
        <li className="flex items-start hover:opacity-80 transition-opacity" {...props}>
          <span className="text-muted-foreground font-medium mr-2.5">—</span>
          <span className="text-muted-foreground">{children}</span>
        </li>
      )
    },
    p: {
      props: {
        className: "mb-4"
      }
    },
    br: {
      component: () => <br />
    }
  }
};

export default function TextViewer({ text }: { text: string }) {
  if (!text) return null;
  return <Markdown options={markdownOptions}>{text}</Markdown>;
}