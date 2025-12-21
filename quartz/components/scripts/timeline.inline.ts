
import { Timeline, DataItem, TimelineOptions } from "vis-timeline/standalone";
import { DataSet } from 'vis-data';
import { env } from "../../../version.json"
import { pathToRoot } from "../../util/path";

const options: TimelineOptions = {
    width: '100%',
    minHeight: 400,
    max: 700,
    align: "center",
    margin: 10,
    showMajorLabels: false,
    showWeekScale: false,
    showCurrentTime: false,
}
const reTimeFrame: RegExp = /^\[(\d+)~(\d+)\]/;
const reTimeItem: RegExp = /^\[(\d+)\]/;

function getPathFromEnv() {
    var pathRoot: string = ""
    if (env == "prd") {
        pathRoot = "Aebis-Odyssey/"
    }
    return pathRoot
}

function obsidianLinkToHref(link: string) {
    var sanitizedHref: string = link
    if (link.includes("|")) {
        // Ignore obsidian link renaming syntax.
        sanitizedHref = link.split("|")[0]
    }
    // Remove spaces to get a valid URL path.
    if (sanitizedHref.startsWith(" ")) {
        sanitizedHref = sanitizedHref.slice(1)
    }
    sanitizedHref = sanitizedHref.replaceAll(" ","-")
    // Remove obsidian link parentheses.
    sanitizedHref = sanitizedHref.replaceAll("[", "")
    sanitizedHref = sanitizedHref.replaceAll("]", "")

    // Normalize path to root
    const currentPath: string = window.location.pathname;
    const numPathBackToRoot: number = (currentPath.match(/\//g)||[]).length
    var prefix: string = "./"
    if (numPathBackToRoot > 0) {
        prefix = "../".repeat(numPathBackToRoot)
    }
    return prefix + getPathFromEnv() + sanitizedHref
}

function getDataItemFromLine(id: number, line: string, background: boolean) {
    var start: string = ""
    var end: string = ""
    var color: string = ""
    
    // @ [67~187] #purple Birth of a Nation
    // Above is split into 4 components
    // ["@", "[67~187]", "#purple", "Birth of a Nation"]
    // ------------------------------------------------
    // attributes[0]: Delimeter between BG area vs. Item.
    // attributes[1]: Timeframe or Yr
    // attributes[2]: Color
    // attributes[3]: Content
    var [delimiter, timeframe, color, ...contentArr] = line.split(" ")
    var attributes = [delimiter, timeframe, color, contentArr.join(" ")].filter(Boolean)
    if (background) {
        const matchDetails = reTimeFrame.exec(attributes[1])
        if (matchDetails) {
            start = matchDetails[1]
            end = matchDetails[2]
        }
    }
    else {
        const matchTimeFrame = reTimeItem.exec(attributes[1])
        if (matchTimeFrame) {
            start = matchTimeFrame[1]
        }
    }
    color = `${attributes[2].replace("#", "")}`
    // Handle content hrefs.
    var content: string = attributes[3]
    if (attributes[3].includes("[[")) {
        var [contentString, ...contentLinkArr] = attributes[3].split("|")
        var contentAttr = [contentLinkArr.join("|")].filter(Boolean)
        var contentHref = obsidianLinkToHref(contentAttr[0])
        content = `<a href=${contentHref}>${contentString}</a>`
    }
    // Create the final object.
    var dataItem: DataItem
    if (background) {
        dataItem = {
            id: id,
            start: start,
            end: end,
            content: content,
            className: "vis-background",
            selectable: false,
            type: "background",
        }
    } else {
        dataItem = {
            id: id,
            start: start,
            content: content,
            className: color,
        }
    }
    return dataItem
}

function getParamFromLine(line: string) {
    return JSON.parse(line.split("#PARAM:")[1])
}

function isTimeRange(line: string) {
    return line.startsWith("@")
}

function isParam(line: string) {
    return line.startsWith("#PARAM:")
}

function parseItems(element: HTMLElement) {
    var itemsArray: DataItem[] = []
    var backgroundItemsArray: DataItem[] = []
    var lines: string[] = element.textContent.split("\n")
    var id: number = 0
    for (var line of lines) {
        if (line.replaceAll(" ", "").length == 0) {
            continue
        }
        if (isParam(line)) {continue}
        var dataItem: DataItem = getDataItemFromLine(id, line, isTimeRange(line))
        if (isTimeRange(line)) {
            backgroundItemsArray.push(dataItem)
        }
        else {
            itemsArray.push(dataItem)
        }
        id++
    }
    // Background Array is drawn first so it stays behind all items.
    return new DataSet<DataItem>(backgroundItemsArray.concat(itemsArray));
}

function parseParams(element: HTMLElement) {
    var params: {[id: string] : string} = {}
    var lines: string[] = element.textContent.split("\n")
    for (var line of lines) {
        if (line.replaceAll(" ", "").length == 0) {
            continue
        }
        if (isParam(line)) {
            var param = getParamFromLine(line)
            params = param
            break
        }
    }
    return params
}

async function renderTimeline() {
    var timelineContainers = document.getElementsByClassName("chronos-timeline-container");

    // Display the completed timeline. We need to do a level of indirection,
    // class-name: vis-timeline -> getElementById to support multiple timelines on the same page.
    for (var container of timelineContainers) {
        var containerHTMLElement = document.getElementById(container.id)
        if (containerHTMLElement) {
            var items = parseItems(containerHTMLElement)
            var additionalParams = parseParams(containerHTMLElement)
            // Don't display any actual text.
            container.textContent = ""
            var timeline: Timeline = await new Timeline(containerHTMLElement, items, options)
            // Zoom in so users see an acceptable view.
            timeline.zoomIn(0.8)
            // We can also specify a window range to start the timeline at.
            if ("windowRange" in additionalParams) {
                if (Array.isArray(additionalParams["windowRange"])) {
                    timeline.setWindow(additionalParams["windowRange"][0], additionalParams["windowRange"][1])
                }
            }
        }
    }
}

document.addEventListener("nav", async () => {
    await renderTimeline()
})
