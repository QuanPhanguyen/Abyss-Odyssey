import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/pinned.scss"
import { resolveRelative} from "../util/path"
// import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import OverflowListFactory from "./OverflowList"

interface PinnedOptions {
  hideWhenEmpty: boolean
}

const defaultOptions: PinnedOptions = {
  hideWhenEmpty: true,
}

export default ((opts?: Partial<PinnedOptions>) => {
  const options: PinnedOptions = { ...defaultOptions, ...opts }
  const { OverflowList, overflowListAfterDOMLoaded } = OverflowListFactory()

  const Pinned: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const pinnedFiles = allFiles.filter((file) => file.frontmatter?.pinned)
    if (options.hideWhenEmpty && pinnedFiles.length == 0) {
      return null
    }
    // TODO: To make this language dependent, use the below instead.
    // i18n(cfg.locale).components.pinned.title
    return (
      <div class={classNames(displayClass, "pinned")}>
        <h3>Pinned</h3> 
        <OverflowList>
          {(
            pinnedFiles.map((f) => (
              <li>
                <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                  {f.frontmatter?.motd}
                </a>
              </li>
            ))
          )}
        </OverflowList>
      </div>
    )
  }

  Pinned.css = style
  Pinned.afterDOMLoaded = overflowListAfterDOMLoaded

  return Pinned
}) satisfies QuartzComponentConstructor