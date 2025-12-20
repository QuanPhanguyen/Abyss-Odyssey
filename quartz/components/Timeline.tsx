import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/timeline.scss"
// import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"

interface TimelineOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: TimelineOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<TimelineOptions>) => {
  const options: TimelineOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const Timeline: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    if (options.hideWhenEmpty) {
      return null
    }
    // TODO: To make this language dependent, use the below instead.
    // i18n(cfg.locale).components.pinned.title
    return (
      <div class={classNames(displayClass, "pinned")}>
        <h3>Pinned</h3> 
        <OverflowList>
          {}
        </OverflowList>
      </div>
    )
  }

  Timeline.css = style
  Timeline.afterDOMLoaded = overflowListAfterDOMLoaded

  return Timeline
}) satisfies QuartzComponentConstructor