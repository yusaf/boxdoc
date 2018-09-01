# boxdoc
A wrapper for the jsPDF library making client-side PDF generation even easier

## About
- boxdoc was made to eliminate the need for constant tracking of coordinates for more regularly and easily performed tasks.
- Sorry, the source has little to no comments. It is on the to do list (might never happen)
- I have not tested the code and it is definitely not production ready

## Basic concept
- Boxes can be added and inserted.
- When adding a box, you can give the box settings such as width and height. These boxes are nested and margins are relative to parent boxes.
- When inserting a box, like adding a box, you can give the box settings. However, an inserted box is added above/below/beside and shares the same parent as an existing box.

## Getting started
### BD.pdf( settings ) - Creating the pdf object
##### Using the default jsPDF settings
```
var pdf = new BD.pdf();
```
##### Adjusting jsPDF settings
The jsPDF array is used as arguments when creating the jsPDF object.
```
var pdf = new BD.pdf({
	jsPDF:[orientation, unit, format]
});
```

###  .addPage() - Adding a page
jsPDF by default adds a page. For uniformity, boxdoc deletes this when creating the jsPDF object.
```
var page = pdf.addPage();
```
FYI - the `.addPage()` method returns a new box (settings can not be adjusted) which fits the page size.
### .jsPDF() - accessing the jsPDF object
This method returns the jsPDF object.

### .addBox( settings )
```
var box = page.addBox()
```

#### Settings
- float - default `"left"`
Options available
-- `"left"`, `"center"`, `"right"`, `"middle"`
-- `["top", "left"]`, `["top", "center"]`, `["top", "right"]`
-- `["center", "left"]`, `["center", "center"]`, `["center", "right"]`
-- `["bottom", "left"]`, `["bottom", "center"]`, `["bottom", "right"]`

- width - default `"100%"`
Width can either be an integer or relative to the parents width using %. You can also do basic math such as "100% - 50".

- height - default `"100%"`
Height can either be an integer or relative to the parents width using %. You can also do basic math such as "100% - 50".

- margin
-- `{ top:int, right:int, bottom:int, left:int}` - missing properties are defaulted to 0
-- `["top/right/bottom/left"]`,  `["top/bottom", "right/left"]`, `["top", "right", "bottom", "left"]`
-- int - all positions will be set to this integer.

- padding
-- if used multiple times, padding is added and not replaced
-- `{ top:int, right:int, bottom:int, left:int}` - missing properties are defaulted to 0
-- `["top/right/bottom/left"]`,  `["top/bottom", "right/left"]`, `["top", "right", "bottom", "left"]`
-- int - all positions will be set to this integer.

- fill
-- `[r,g,b]`
-- `{r:int, g:int, b:int}`
-- `"#hex"`
- paddingFill
-- `[r,g,b]`
-- `{r:int, g:int, b:int}`
-- `"#hex"`
- border
-- `[width, color]`
-- width adds on to padding
-- color can be rgb or hex

### .text( settings )
