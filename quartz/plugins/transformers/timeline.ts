import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast";
import { visit } from "unist-util-visit";
import { Code } from "mdast-util-to-hast/lib/handlers/code";

interface Options {
}

export const VisTimeline: QuartzTransformerPlugin<Partial<Options>> = (opts) => {
  return {
    name: "VisTimeline",
    markdownPlugins() {
      return [[
        () => {
          return async (tree: Root, _) => {
            var timelineIdx: number = 0
            visit(tree, "code", (node: Code) => {
              if (node.lang === 'chronos') {
                node.data = {
                  hProperties: {
                    "id": `timeline-container-${timelineIdx}`,
                    className: ["chronos-timeline-container"],
                  }
                }
              }
              timelineIdx++;
            })
          }
        },
        opts
      ]]
    },
    externalResources() {
      return {
        css: [{ content: "https://unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" }],
        js: [
          {
            src: "https://unpkg.com/vis-timeline@latest/standalone/umd/vis-timeline-graph2d.min.js",
            loadTime: "afterDOMReady",
            contentType: "external",
          },
        ],
      }
    }
  }
}
