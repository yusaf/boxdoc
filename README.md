
# boxdoc
!!!! a wrapper for [jsPDF](https://github.com/MrRio/jsPDF) !!!!
Not complete. Methods will be added and methods may (unlikely) change.
## About
The aim of boxdoc is to easily create PDF documents. This is done with the ability of creating boxes. 
Boxes can be nested or inserted around an exisiting box.
Boxes have 3 borders.
- The outermost border is where the margins lie.
- The middle is the main border of the box and is affected by the given width and height.
- The innermost border is where text is added. This is reduced when padding or a border is added.

Currently boxes can be given a solid border, fill, padding, margin and paddingFill (fills the inner area).
Text can also be added to boxes.

## Demos
- [Demo 1](https://jsfiddle.net/q3gxsy7e/3/)
- [Demo 2](https://jsfiddle.net/q3gxsy7e/30/)
- [Demo 3](https://jsfiddle.net/wpy8nx20/3/)
- [Demo 4 (real world example)](https://jsfiddle.net/wpy8nx20/15/)

More demos to follow. And API demos available below.
## API

### new BD.pdf( settings )

#### creating the PDF object
When the pdf object is created it is empty and a page needs to be added.
```
var pdf = new BD.pdf();
```

#### settings
```
var pdf = new BD.pdf({
	// The array is used as arguments when creating the jsPDF object
	jsPDF:[orientation, unit, format]
});
```

### .jsPDF()
Returns the jsPDF object
```
var jsPDF = pdf.jsPDF();
```

### .addPage()

#### adding a page
[Demo](https://jsfiddle.net/fuekp50d/5/)
```
var page = pdf.addPage();
```

### .addbox( settings );

#### adding a box
The `.addBox()` method only creates a box object. It must be committed before it appears on the pdf.
```
var box = page.addBox();
```

#### .commit() OR { commit: true }
Commit should be the last method run for creating the box. Methods called after may not run.
```
var box = page.addBox().commit()
```
OR
```
var box = page.addBox({
	commit:true
})
```

#### .border( width, color ) OR { border: [ width, color ] }
Border does not add onto the width of the box, instead takes away from the inner width.
[Demo](https://jsfiddle.net/fuekp50d/9/)
```
var box = page.addBox({
	border:[1, "#f00"],
	commit:true
})
```

#### .fill( color ) OR { fill: color }
[Demo](https://jsfiddle.net/fuekp50d/11/)
```
var box = page.addBox({
	fill:"#ff0",
	border:[1, "#f00"],
	commit:true
})
```

#### .paddingFill( color ) OR { paddingFill: color }
[Demo](https://jsfiddle.net/fuekp50d/11/)
```
var box = page.addBox({
	paddingFill:"#ff0",
	border:[1, "#f00"],
	commit:true
})
```
[Demo](https://jsfiddle.net/fuekp50d/14/)
```
var box = page.addBox({
	padding:5,
	paddingFill:"#ff0",
	border:[1, "#f00"],
	commit:true
})
```

#### .padding( padding ) OR { padding: padding }
Padding does not add onto the width of the box, instead takes away from the inner width.
```
var padding = 5; // {top:5,right:5,bottom:5,left:5}
var padding = [5]; // {top:5,right:5,bottom:5,left:5}
var padding = [5,10]; // {top:5,right:10,bottom:5,left:10}
var padding = [5,10,15,20]; // {top:5,right:10,bottom:15,left:20}
var padding = {top:5} // {top:5,right:0,bottom:0,left:0}
var box = page.addBox({
	padding:padding,
	commit:true
})
```
[Demo](https://jsfiddle.net/fuekp50d/17/)
```
var box = page.addBox({
	padding:[5,10,15,20],
	paddingFill:"#ff0",
	commit:true
})
```
#### .margin( margin ) OR { margin: margin }
```
var margin = 5; // {top:5,right:5,bottom:5,left:5}
var margin = [5]; // {top:5,right:5,bottom:5,left:5}
var margin = [5,10]; // {top:5,right:10,bottom:5,left:10}
var margin = [5,10,15,20]; // {top:5,right:10,bottom:15,left:20}
var margin = {top:5} // {top:5,right:0,bottom:0,left:0}
var box = page.addBox({
	margin:margin,
	commit:true
})
```
[Demo](https://jsfiddle.net/fuekp50d/28/)
```
var box = page.addBox({
	margin:[5,10,15,20],
	border:[1, "#000"],
	commit:true
})
```

#### .width ( width ) OR { width : width } / .height( height ) OR { height: height } 
When the width / height setting uses %, the calculated width is relative to the inner width / height of the parent box.
```
var width = 100; //exact width, not a %
var width = "100%";
var width = "100% - 20";
var width = "100%/3 - 10*3";
var box = page.addBox({
	width:width,
	commit:true
})
```

[Demo](https://jsfiddle.net/fuekp50d/26/)
```
var box = page.addBox({
  margin: {
	top: 5,
    left: 5
  },
  width: "100%/3 - 10",
  height: "100%/3 - 10",
  border: [1, "#000"],
  commit: true
})
```
#### { float: float } 
```
var float = "left"; // "center", "right", "top", "bottom", "middle"
var float = ["top", "left"];
var box = page.addBox({
	float: float,
	commit:true
})
```
[Demo](https://jsfiddle.net/fuekp50d/30/)
```
var box = page.addBox({
  width: 100,
  height: 100,
  float:"middle",
  border: [1, "#000"],
  commit: true
})
```

### .insertBox( settings, position )
Settings are the same for addBox. Width and height are still relative to the parent box.
#### position
```
var position = "right"; // "above", "below", "left"
var position ["above", "left" ]; // "left", "center", "right"
var position ["below", "left" ]; // "left", "center", "right"
var position ["right", "bottom" ]; // "bottom", "top", "center"
var position ["left", "bottom" ]; // "bottom", "top", "center"
var insertedBox = box.insertBox ( settings, position );
```
[Demo](https://jsfiddle.net/fuekp50d/38/)
```
var boxSetting = {
  width: "100%/3 - (5/3)*2",
  margin: {
    right: 5
  },
  border: [1, "#000"],
  commit: true
};

var box = page.addBox(boxSetting);

for (var i = 0; i < 2; i++) {
  box = box.insertBox(boxSetting, "right")
}
```

### .text( settings )

#### .commit()
Commits all text that will fit into the box
```
var text = box.text({settings}).commit();
```

#### .content( text ) OR { content: text }
[Demo](https://jsfiddle.net/fuekp50d/46/)
```
var text = box.text({
  content: "Test text"
}).commit()
```
#### .style( style ) OR { style: style }
[Demo](https://jsfiddle.net/fuekp50d/48/)
```
var text = box.text({
  style: {
    align: "center",
    color: "#f00"
  },
  content: "Test text"
}).commit()
```
#### styles
```
{
  font: "helvetica",
  size: 12,
  style: "normal", // "bold"
  color: {
    r: 0,
    g: 0,
    b: 0
  }, // "#hex"
  align: "left" // "center", "right", "justify"
  maxLines:1, //default is disabled
  mustFit:false, //must fit groups will not be added to the box if the text does not fit
  maxWidth:"100%" // the width that the text must remain within
}
```
#### unique styles
[Demo](https://jsfiddle.net/fuekp50d/51/)
```
var text = box.text({
  styles: {
    style1: {
      color: "#f00"
    },
    style2: {
      size: 20
    },
    b: {
      style: "bold"
    }
  },
  content: "This is some ranomd text to test the text function. The following is [style1]style1[/style1] and the next is [style2]style2[/style2]. Styles can be nested like the following text [style1][style2]style 1 and 2[/style2][/style1]."
}).commit()
```

#### .fits()
returns a boolean of true or false depending on whether text will fit within the box.

#### .switchBox( box )
If text was committed to the previous box only the remaining text that was not added is switched to the new box. If the text was not committed to the previous box all text will be switched to the new box.
