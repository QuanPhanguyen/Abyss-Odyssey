---
title: "Timeline"
tags:
  - feature/transformer
---

Quartz supports a limited subset of the chronos timeline functionality, which implements the vis-timeline library in Obsidian.


## Syntax

To add a Timeline, create a chronos code block.
````
```chronos
#PARAM:{"windowRange": [400,550]}

@ [0~66] #purple Event Range 1
- [0] #green Event In Event Range  
```
````

## Features

Supports setting parameters in a JSON string anywhere in the code block. To specify a set of parameters to use for the timeline, append the `#PARAM:` block before a JSON-compatible string. The following entries are supported.
- `windowRange`: An array of two dates, indicating where the timeline should initially focus on. You must be as granular with windowRange as your included dates or the timeline will not focus properly.

Supports events and event ranges. This is the same as chronos, where prepending a line with `@` signifies an event range and `-` indicates a single event.

## Limitations

You must specify the following components in order, with one space in between.
```
@ [<start_yr>~<end_yr>] #<color> <content> | <obsidian_link>
- [<yr>] #<color> <content> | <obsidian_link>
```
`obsidian_link` is optional as it is considered part of the content. All other components are required. Scripts currently rely on the ordering of events.