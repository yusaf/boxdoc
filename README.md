# boxdoc
A wrapper for the jsPDF library making client-side PDF generation even easier

## about
- boxdoc was made to eliminate the need for constant tracking of coordinates for more regularly and easily performed tasks.
- Sorry, the source has little to no comments. It is on the to do list (might never happen)

## how it works
- boxes can be added and inserted.
- when adding a box, you can give settings such as width and height. These boxes are nested and margins are relative to parent boxes.
- when inserting a box like adding a box you can add settings. However, an inserted box is added above/below or beside and shares the same parent as an existing box.
