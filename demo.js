import { GraphObject } from "gojs";
import { mdcDiagram } from "./demomdc";

export var go;
export var myWholeModel;
export var myLoading;
export var myDiagram;
//export var mdcDiagram;
export var searchNodesArray = [];

export function GoJsDraw(data) {
  var domainName = window.location.hostname;
  console.log(domainName);
  go = require("gojs");
  // go.licenseKey = "2bf843e4b76658c511d35a25403f7efb0fab2d3bcf804df7590417a3ec0a3d12229dbd2b51d38dc1d2ab49f9086dc6d18e906979c74c516be535d3de13e783ffbb3673b212584786a25324c7caad2ea9ab2c73fbc5e522a28f7f89f3bbfad18c5abda3d248985eba3b6805305676b04ea8f8dc";
  //go.licenseKey = "2bf843e4b76658c511d35a25403f7efb0fab2d3bcf804df7590417a3ec0a3d12229dbd2b51d38cc1d2ab49f81974908dd9c53e7c944f033bb231868e47b6d5ffb63372b315581789f70122c68bea2ca1ac2871fa91e123f6d87e8cf4e2fdc6c955baf7804e9a0ebf2e780664057cab4de4a9da7ffe55c51d3e389df7aae8ab48fa6872d6cab704dfeb5e73dbadfda60b2676178d6afc6eb0183741d0c153eb35e560";

  if (domainName.toLowerCase().includes("casemix360.solutions.iqvia.com")) {
    go.Diagram.licenseKey = "2bf843e4b76658c511d35a25403e7efb0fab2d3bcf804df7590417a3ec0a3d12229dbd2b51d38cc1d2ab49f81974908dd9c53e7c944f033bb231868e47b6d5ffb63372b315581789f70122c68bea2da9af2d71f791e620a2d87e8cf6e2acc6cb55ebf7d44e9a0aeb2e2d04630676ab4be2f8da7ffe50994f3e3f9da4a9eaab4cfb697280ceec0781eb5977d8baeaa60c247405cf3ca82ca61b6411d9cc43e92be460eca88839";
  }
  else {
    go.Diagram.licenseKey = "73f14fe5b00537c702d90776423d6af919a475609b8417a30b0446f6ef083f1c249cee7101d6d8c6d1fc1efb4f7fc7cbcdc3617ac24c556be76583de47e284a9b73275bb15084788f4032ec5c9f82ef2ab7c79a596b77ea58a2d8ca7ecadc2cc0efae3d21d9a08bb7b280723467dae49b7e4d964fa03";
  }


  var $ = go.GraphObject.make;

  function OffsetLink() {
    go.Link.call(this);
  }
  go.Diagram.inherit(OffsetLink, go.Link);
  OffsetLink.prototype.computeMidOrthoPosition = function (fromX, fromY, toX, toY, vertical) {
    if (vertical) return toY - 15;
    return go.Link.prototype.computeMidOrthoPosition.call(this, fromX, fromY, toX, toY, vertical);
  };

  go.Shape.defineFigureGenerator("TipOutline", function (sh, w, h) {
    var alen = 10;  // horizontal length of pointer
    var t = h / 8;  // breadth (height) of pointer
    var geo = new go.Geometry()
      .add(new go.PathFigure(0, 0, true, true)  // filled and shadowed
        .add(new go.PathSegment(go.PathSegment.Line, w - alen, 0))
        .add(new go.PathSegment(go.PathSegment.Line, w - alen, h / 2 - t))
        .add(new go.PathSegment(go.PathSegment.Line, w, h / 2))
        .add(new go.PathSegment(go.PathSegment.Line, w - alen, h / 2 + t))
        .add(new go.PathSegment(go.PathSegment.Line, w - alen, h))
        .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
    geo.spot2 = new go.Spot(1, 1, -alen, 0);  // content should not overlap right side
    return geo;
  });
  if (myDiagram != undefined)
    myDiagram.div = null;
  myDiagram =
    $(go.Diagram, "myDiagramDiv",
      {
        contentAlignment: go.Spot.TopLeft,
        initialDocumentSpot: go.Spot.TopLeft,
        initialViewportSpot: go.Spot.TopLeft,
        "padding": new go.Margin(5, 5, 5, 100),
        "scrollMargin": 100,
        "toolManager.toolTipDuration": 100000000000,
        layout: $(go.Layout,
          { isInitial: false, isOngoing: false }),  // never invalidates
        // Define the template for Nodes, used by virtualization.
        nodeTemplate:
          $(go.Node, "Auto",
            { visible: true, movable: false, deletable: false, locationSpot: go.Spot.Center, alignment: go.Spot.Center, },
            { resizable: false },
            { isShadowed: true },
            {
              selectionAdornmentTemplate:
                $(go.Adornment, "Spot",
                  $(go.Panel, "Auto",
                    // this Adornment has a rectangular blue Shape around the selected node
                    $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 3, strokeDashArray: [4, 2] })
                    , $(go.Placeholder)
                  )

                )  // end Adornment
            },

            $(go.Panel, "Horizontal",
              {
                visible: true, alignment: go.Spot.Center, defaultAlignment: go.Spot.Center
                // width:  new go.Binding("width", "width") ,
                // height: 80  
              },
              $(go.Shape,
                { name: "SHAPE", visible: true, alignment: go.Spot.Center },
                new go.Binding("cursor", "cursor"),
                new go.Binding("geometryString", "fig"),
                new go.Binding("figure", "fig"),
                new go.Binding("width", "width"),
                new go.Binding("height", "height"),
                new go.Binding("fill", "color"),
                new go.Binding("stroke", "isHighlighted", function (h) { return h ? "#0d0033" : "black"; }).ofObject(),
                //new go.Binding("strokeWidth", "isHighlighted", function(h) { return h ? 2 : 0 }).ofObject(),
                new go.Binding("strokeDashArray", "isHighlighted", function (h) { return h ? [4, 2] : [0, 0]; }).ofObject())
            ),
            // { isLayoutPositioned: true },  // optimization
            // new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), 
            new go.Binding("position", "bounds", function (b) { return b.position; })
              .makeTwoWay(function (p, d) { return new go.Rect(p.x, p.y, d.bounds.width, d.bounds.height); }),
            // in cooperation with the load function, below
            // $(go.Shape, "Rectangle",
            // new go.Binding("fill", "color")),
            //$(go.Shape, "Rectangle", { fill: "lightgreen" }),
            /*
           $(go.Shape,
          
            new go.Binding("figure", "fig" ),
            new go.Binding("fill", "color"),),
            */
            {
              click: function (e, obj) {
                showMessage(obj.part.data.text, obj.part.data.groupCode, obj.part.data.yellowbox, obj.part.data.groupCodeValue);
                //alert('hellow');
                // var node = myDiagram.findNodeForKey(obj.part.data.key);
              }
            },
            {
              mouseOver: function (e, obj) { doMouseOver(e, obj) }
            },
            $(go.TextBlock,
              { margin: 2, font: "normal 8pt arial", stretch: go.GraphObject.Fill, maxSize: new go.Size(140, NaN), textAlign: "center", alignment: go.Spot.Center },
              new go.Binding("cursor", "cursor"),
              new go.Binding("text", "text")),
            {
              toolTip:
                // myToolTip
                $(go.Adornment, "Spot",
                  new go.Binding("visible", "tooltip", function (t, obj) { return (t.length >= 0 && obj.data.leafnode) }),
                  { isShadowed: true },
                  $(go.Placeholder),
                  $(go.Panel, "Auto",
                    { alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopRight, minSize: new go.Size(140, NaN) },
                    $(go.Shape, "TipOutline",
                      { fill: "white", stroke: "gray", strokeWidth: 0.5, shadowVisible: true }),
                    $(go.Panel, "Table",
                      $(go.RowColumnDefinition, { row: 0, background: "#F2F1EC" }),
                      $(go.TextBlock,
                        { row: 0, margin: 10, stretch: go.GraphObject.Horizontal, font: "12pt Calibri", textAlign: "left", minSize: new go.Size(140, NaN) },
                        new go.Binding("text", "rownumber")),
                      $(go.TextBlock,
                        { row: 1, margin: 10, alignment: go.Spot.Left, font: "12pt Calibri", textAlign: "left", minSize: new go.Size(140, NaN), visible: false },
                        new go.Binding("text", "tooltip"),
                        new go.Binding("visible", "tooltip", function (t) { return !!t; })
                      )
                    )
                  )
                )
            }
          ),
        // Define the template for Links
        linkTemplate:
          // $(go.Link,
          //   {
          //     isLayoutPositioned: true,
          //     curve: go.Link.AvoidsNodes,
          //     routing: go.Link.Orthogonal,
          //     reshapable: true,
          //     resegmentable: true,
          //     relinkableFrom: true,
          //     relinkableTo: true,
          //     // fromPortId: "fromPort",
          //     //toPortId: "toPort",
          //     //linkFromPortIdProperty: "fromPort",
          //     //linkToPortIdProperty: "toPort",
          //     corner: 10,
          //     deletable: false,
          //     movable: false,
          //     name: "LINK"
          //   },
          //   // new go.Binding("routing", "routing"),  
          //   // get the link spots from the link data
          //   new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
          //   new go.Binding("toSpot", "toSpot", go.Spot.parse),
          //   //new go.Binding("linkFromPortIdProperty", "fromPort", go.Spot.parse),
          //   //new go.Binding("linkToPortIdProperty", "toPort", go.Spot.parse),            
          //   $(go.Shape),  //,{ stroke : "#2cdebc", strokeWidth: 2}
          //   $(go.Shape, { toArrow: "Standard" })
          // ),
          $(OffsetLink,
            { routing: go.Link.Orthogonal, corner: 10 },
            // { fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top },
            new go.Binding("fromSpot", "fromSpot", go.Spot.parse),
            new go.Binding("toSpot", "toSpot", go.Spot.parse),
            $(go.Shape),
            $(go.Shape, { toArrow: "OpenTriangle" })
          ),
        "animationManager.isEnabled": false
      });
  // This model includes all of the data
  myWholeModel =
    $(go.GraphLinksModel);  // must match the model used by the Diagram, below
  // Do not set myDiagram.model = myWholeModel -- that would create a zillion Nodes and Links!
  // In the future Diagram may have built-in support for virtualization.
  // For now, we have to implement virtualization ourselves by having the Diagram's model
  // be different than the "real" model.
  myDiagram.model =   // this only holds nodes that should be in the viewport
    $(go.GraphLinksModel);  // must match the model, above
  // for now, we have to implement virtualization ourselves
  myDiagram.isVirtualized = true;
  myDiagram.isTreeExpanded = true;
  //myDiagram.grid.visible = true;
  myDiagram.addDiagramListener("ViewportBoundsChanged", onViewportChanged);
  myDiagram.addModelChangedListener(onModelChanged);
  myDiagram.model.makeUniqueKeyFunction = virtualUniqueKey;  // ensure uniqueness in myWholeModel
  myDiagram.commandHandler.selectAll = function () { };  // make Select All command a no-op
  // This is a status message
  myLoading =
    $(go.Part,  // this has to set the location or position explicitly
      { location: new go.Point(0, 0) },
      $(go.TextBlock, "loading...",
        { stroke: "red", font: "20pt sans-serif" }
      )
    );
  // temporarily add the status indicator
  myDiagram.add(myLoading);
  // Allow the myLoading indicator to be shown now,
  // but allow objects added in load to also be considered part of the initial Diagram.
  // If you are not going to add temporary initial Parts, don't call delayInitialization.
  myDiagram.delayInitialization(load(data));
  //added for layout completed 

  myDiagram.addDiagramListener("LayoutCompleted", function () {
    //console.log("LayoutCompleted was called");
    //alert('completed');
    var button = document.getElementById("btnSearch");
    //alert(button);
    if (button != null)
      button.click();
  });
  //myDiagram.model= data;

  //image 

  //   myDiagram.makeImage({
  // scale: 1,type: "image/jpeg"
  // });
}   //draw ends 

function layoutcompleted() {

  // alert('completed');
}

function showMessage(str, groupcode, yellowbox, groupCodeVal) {
  if (!yellowbox) {
    document.getElementById("inputEventsMsg").textContent = groupcode;
    document.getElementById("infoBoxHolder").textContent = groupCodeVal;
    // console.log(groupCodeVal);
    var btn = document.getElementById("mdBtn");
    if (btn != null) {
      btn.click();
    }
  }
}

// the Search functionality highlights all of the nodes that have at least one data property match a RegExp
export function searchDiagram(regel) {  // called by search button click  
  var input = document.getElementById("mySearch");
  //alert(input.value.trim().toUpperCase());
  var pt = myDiagram.position;
  var n = null;
  if (!input) return;
  input.focus();
  searchNodesArray = [];
  myDiagram.startTransaction("highlight search");
  if (regel == "close") {
    myDiagram.clearHighlighteds();
    myDiagram.clearSelection();
  }
  var xpos = 0;
  var ypos = 0;
  if (input.value) {
    var multipleSelectData = [];
    var ndata = myWholeModel.nodeDataArray;

    if (regel != undefined && regel.length > 0) {
      // var regex1 = new RegExp(input.value, "i");
      // var alpha1 = myDiagram.findNodesByExample({regel : regex1});
    }
    else {
      var regex = new RegExp(input.value, "i");
      multipleSelectData = myDiagram.findNodesByExample({ text: regex });
      //console.log(multipleSelectData.count);
    }

    for (var i = 0; i < ndata.length; i++) {
      n = ndata[i];
      if (regel != undefined && regel.length > 0 && regel != "close") {
        if (n.text.trim().toUpperCase().includes(input.value.trim().toUpperCase()) && n.regel == regel) {
          n.isSelected = true;
          searchNodesArray.push(n);
        }
      }
      else {

        if (n.text.trim().toUpperCase().includes(input.value.trim().toUpperCase())) {
          n.isSelected = true;
          searchNodesArray.push(n);
        }
      }

    }
    if (searchNodesArray.length > 0) {
      var arrow = document.getElementById("arrows");
      arrow.style.display = "block";
      var searchresult = document.getElementById("searchresult");
      searchresult.style.display = "inline";
      var searchresultCaption = document.getElementById("searchresultCaption");
      searchresultCaption.style.display = "inline";
      //searchresult.textContent="Result:" +  searchNodesArray.length;
      searchresult.textContent = searchNodesArray.length;
      var btnview = document.getElementById("btnview");
      var searchCounter = document.getElementById("counter");
      searchCounter.style.display = "inline";
      btnview.style.display = "block";
      if (regel != undefined && regel.length > 0 && regel != "close") {
        n = searchNodesArray[0];
        xpos = n.bounds.x;
        ypos = n.bounds.y;
        myDiagram.position = new go.Point(Math.floor(xpos), Math.floor(ypos));
        myDiagram.select(myDiagram.findNodeForKey(n.key));
      }
      else
        //myDiagram.selectCollection(multipleSelectData);
        myDiagram.highlightCollection(multipleSelectData);
    }
  }
  else {  // empty string only clears highlighteds collection
    myDiagram.clearHighlighteds();
    myDiagram.clearSelection();
  }
  myDiagram.commitTransaction("highlight search");
}

export function searchDiagramExtended(increment) {    // called by search up and down button click
  var input = document.getElementById("mySearch");
  var pt = myDiagram.position;
  var n = null;
  myDiagram.startTransaction("highlight search");
  var xpos = 0;
  var ypos = 0;
  if (input.value) {
    if (searchNodesArray.length > 0) {
      for (var i = increment; i <= searchNodesArray.length; i++) {
        n = searchNodesArray[i];
        n.isSelected = true;
        xpos = n.bounds.x;
        ypos = n.bounds.y;
        myDiagram.position = new go.Point(Math.floor(xpos), Math.floor(ypos));
        myDiagram.select(myDiagram.findNodeForKey(n.key));
        break;
      }
    }
  }
  else {  // empty string only clears highlighteds collection
    myDiagram.clearHighlighteds();
  }
  myDiagram.commitTransaction("highlight search");
}

export function searchDiagrambyValue(searchvalue, regel) {  // called by search button click
  //console.log(regel);
  myDiagram.startTransaction("highlight search");
  var n = null;
  var xpos = 0;
  var ypos = 0;
  if (searchvalue) {
    var ndata = myWholeModel.nodeDataArray;
    for (var i = 0; i < ndata.length; i++) {
      n = ndata[i];
      if (n.text.includes(searchvalue) && n.regel == regel) {
        //alert(searchvalue + regel);
        n.isSelected = true;
        xpos = n.bounds.x;
        ypos = n.bounds.y;
        myDiagram.position = new go.Point(Math.floor(xpos), Math.floor(ypos));
        myDiagram.select(myDiagram.findNodeForKey(n.key));
        break;
      }
    }
  }
  else {  // empty string only clears highlighteds collection
    myDiagram.clearHighlighteds();
  }
  myDiagram.commitTransaction("highlight search");
}

// if width or height are below 50, they are set to 50
export function generateImages(width, height, divHeight) {
  // sanitize input
  width = parseInt(width);
  height = parseInt(height);
  if (isNaN(width)) width = 100;
  if (isNaN(height)) height = 100;
  // Give a minimum size of 50x50
  width = Math.max(width, 50);
  height = Math.max(height, 50);


  var imgDiv = document.getElementById('myImages');
  imgDiv.innerHTML = ''; // clear out the old images, if any
  var db = myDiagram.documentBounds.copy();
  var boundswidth = db.width;
  var boundsheight = db.height;
  var imgWidth = width;
  var imgHeight = height;


  var div = myDiagram.div;
  div.style.height = boundsheight + "px";
  myDiagram.requestUpdate();

  var p = db.position.copy();

  var img = myDiagram.makeSvg({
    scale: 1
  });
  // Append the new HTMLImageElement to the #myImages div
  imgDiv.appendChild(img);
  imgDiv.appendChild(document.createElement('br'));

  var h = window.innerHeight;

  div.style.height = divHeight;//h - 250 + "px";//"750px";
  myDiagram.requestUpdate();

  //Print
  let printContentBody, popupWin;

  printContentBody = document.getElementById('myImages').innerHTML;
  popupWin = window.open('', '_blank');
  popupWin.document.open();
  popupWin.document.write(`
      <html>
        <head>
          <title>Visual DRG</title>
          <style>          
          </style>      
          <div style="border: 1px solid black;padding-left:10px;">    
                       
          </div>
        </head>
        <body onload="window.print();window.close()"> 
          <div style="border: 1px solid black;padding-left:10px">             
            ${printContentBody}
          </div>
        </body>
      </html>`
  );
  popupWin.document.close();

}

function load(data) {
  myWholeModel.nodeDataArray = data.nodeDataArray;
  myWholeModel.linkDataArray = data.linkDataArray;
  // can't depend on regular bounds computation that depends on all Nodes existing
  myDiagram.fixedBounds = computeDocumentBounds(myWholeModel);
  // remove the status indicator
  myDiagram.remove(myLoading);
}

// The following functions implement virtualization of the Diagram
// Assume data.bounds is a Rect of the area occupied by the Node in document coordinates.
// It's not good enough to ensure keys are unique in the limited model that is myDiagram.model --
// need to ensure uniqueness in myWholeModel.
function virtualUniqueKey(model, data) {
  myWholeModel.makeNodeDataKeyUnique(data);
  return myWholeModel.getKeyForNodeData(data);
}

// The normal mechanism for determining the size of the document depends on all of the
// Nodes and Links existing, so we need to use a function that depends only on the model data.
function computeDocumentBounds(model) {
  var b = new go.Rect();
  var ndata = model.nodeDataArray;
  for (var i = 0; i < ndata.length; i++) {
    var d = ndata[i];
    if (!d.bounds) continue;
    if (b.isEmpty()) b.set(d.bounds); else b.unionRect(d.bounds);
  }
  return b;
}

// As the user scrolls or zooms, make sure the Parts (Nodes and Links) exist in the viewport.
function onViewportChanged(e) {
  var input = document.getElementById("mySearch");
  if (input != undefined && input != null && input.value) {
    searchDiagram(undefined);
  }

  var diagram = e.diagram;
  // make sure there are Nodes for each node data that is in the viewport
  // or that is connected to such a Node
  var viewb = diagram.viewportBounds;  // the new viewportBounds
  var model = diagram.model;
  var oldskips = diagram.skipsUndoManager;
  diagram.skipsUndoManager = true;
  var b = new go.Rect();
  var ndata = myWholeModel.nodeDataArray;
  for (var i = 0; i < ndata.length; i++) {
    var n = ndata[i];
    if (!n.bounds) continue;
    if (n.bounds.intersectsRect(viewb)) {
      addNodeAndGroups(diagram, myWholeModel, n);
    }
    if (model instanceof go.TreeModel) {
      // make sure links to all parent nodes appear
      var parentkey = myWholeModel.getParentKeyForNodeData(n);
      var parent = myWholeModel.findNodeDataForKey(parentkey);
      if (parent !== null) {
        if (n.bounds.intersectsRect(viewb)) {  // N is inside viewport
          // so that link to parent appears
          addNodeAndGroups(diagram, myWholeModel, parent);
          var node = diagram.findNodeForData(n);
          if (node !== null) {
            var link = node.findTreeParentLink();
            if (link !== null) {
              // do this now to avoid delayed routing outside of transaction
              link.updateRoute();
            }
          }
        }
        else {  // N is outside of viewport
          // see if there's a parent that is in the viewport,
          // or if the link might cross over the viewport
          b.set(n.bounds);
          b.unionRect(parent.bounds);
          if (b.intersectsRect(viewb)) {
            // add N so that link to parent appears
            addNodeAndGroups(diagram, myWholeModel, n);
            var child = diagram.findNodeForData(n);
            if (child !== null) {
              var link = child.findTreeParentLink();
              if (link !== null) {
                // do this now to avoid delayed routing outside of transaction
                link.updateRoute();
              }
            }
          }
        }
      }
    }
  }
  if (model instanceof go.GraphLinksModel) {
    var ldata = myWholeModel.linkDataArray;
    for (var i = 0; i < ldata.length; i++) {
      var l = ldata[i];
      var fromkey = myWholeModel.getFromKeyForLinkData(l);
      if (fromkey === undefined) continue;
      var from = myWholeModel.findNodeDataForKey(fromkey);
      if (from === null || !from.bounds) continue;
      var tokey = myWholeModel.getToKeyForLinkData(l);
      if (tokey === undefined) continue;
      var to = myWholeModel.findNodeDataForKey(tokey);
      if (to === null || !to.bounds) continue;
      b.set(from.bounds);
      b.unionRect(to.bounds);
      if (b.intersectsRect(viewb)) {
        // also make sure both connected nodes are present,
        // so that link routing is authentic
        addNodeAndGroups(diagram, myWholeModel, from);
        addNodeAndGroups(diagram, myWholeModel, to);
        model.addLinkData(l);
        var link = diagram.findLinkForData(l);
        if (link !== null) {
          // do this now to avoid delayed routing outside of transaction
          link.updateRoute();
        }
      }
    }
  }
  diagram.skipsUndoManager = oldskips;
  if (myRemoveTimer === null) {
    // only remove offscreen nodes after a delay
    myRemoveTimer = setTimeout(function () { removeOffscreen(diagram); }, 3000);
  }

}

function addNodeAndGroups(diagram, wholeModel, data) {
  var model = diagram.model;
  model.addNodeData(data);
  var n = diagram.findNodeForData(data);
  if (n !== null) n.ensureBounds();
  var groupkey = wholeModel.getGroupKeyForNodeData(data);
  while (groupkey !== undefined) {
    var gd = wholeModel.findNodeDataForKey(groupkey);
    if (gd !== null) {  // is there a containing group data?
      model.addNodeData(gd);  // make sure it's added to the diagram
      var g = diagram.findNodeForData(gd);
      if (g !== null) g.ensureBounds();
    }
    // walk up chain of containing group data
    groupkey = wholeModel.getGroupKeyForNodeData(gd);
  }
}

function isPartOrGroupSelected(part) {
  if (!part) return false;
  if (part.isSelected) return true;
  return isPartOrGroupSelected(part.containingGroup);
}

// occasionally remove Parts that are offscreen from the Diagram
var myRemoveTimer = null;

function removeOffscreen(diagram) {
  myRemoveTimer = null;
  var viewb = diagram.viewportBounds;
  var model = diagram.model;
  var remove = [];  // collect for later removal
  var removeLinks = new go.Set();  // links connected to a node data to remove
  var it = diagram.nodes;
  while (it.next()) {
    var n = it.value;
    var d = n.data;
    if (d === null) continue;
    if (!n.actualBounds.intersectsRect(viewb) && !isPartOrGroupSelected(n)) {
      // even if the node is out of the viewport, keep it if it is selected or
      // if any link connecting with the node is still in the viewport
      if (!n.linksConnected.any(function (l) { return l.actualBounds.intersectsRect(viewb); })) {
        remove.push(d);
        if (model instanceof go.GraphLinksModel) {
          removeLinks.addAll(n.linksConnected);
        }
      }
    }
  }
  if (remove.length > 0) {
    var oldskips = diagram.skipsUndoManager;
    diagram.skipsUndoManager = true;
    model.removeNodeDataCollection(remove);
    if (model instanceof go.GraphLinksModel) {
      removeLinks.each(function (l) { if (!isPartOrGroupSelected(l)) model.removeLinkData(l.data); });
    }
    diagram.skipsUndoManager = oldskips;
  }

}

function onModelChanged(e) {  // handle insertions and removals
  if (e.model.skipsUndoManager) return;
  if (e.change === go.ChangedEvent.Insert) {
    if (e.propertyName === "nodeDataArray") {
      myWholeModel.addNodeData(e.newValue);
    } else if (e.propertyName === "linkDataArray") {
      myWholeModel.addLinkData(e.newValue);
    }
  } else if (e.change === go.ChangedEvent.Remove && e.propertyName === "nodeDataArray") {
    if (e.propertyName === "nodeDataArray") {
      myWholeModel.removeNodeData(e.oldValue);
    } else if (e.propertyName === "linkDataArray") {
      myWholeModel.removeLinkData(e.oldValue);
    }
  }
}
// end of virtualized Diagram

// Called when the mouse is over the diagram's background
function doMouseOver(e, obj) {
  var doc = e.documentPoint;
  var vp = e.viewPoint;
  // showToolTip(obj, myDiagram, doc, vp);
  // alert(obj.data.leafnode);
  if (obj.data.leafnode) {
    if (document.getElementById("infoBoxKey") != undefined)
      document.getElementById("infoBoxKey").textContent = obj.data.key;
    var button = document.getElementById("btnTooltip");
    if (button != null) {
      button.click();
      var toolTipDIV = document.getElementById('toolTipDIV');
      if (toolTipDIV != undefined) {
        toolTipDIV.textContent = "";
      }
    }
  }
}

// Called with a Node (or null) that the mouse is over or near
function showToolTip(obj, diagram, doc, vp) {
  if (obj !== null) {
    var node = obj.part;
    updateInfoBox(vp, node.data);
  }
  else {
    document.getElementById("infoBoxHolder").innerHTML = "";
  }
}

function updateInfoBox(mousePt, data) {
  var box = document.getElementById("infoBoxHolder");
  if (box != undefined) {
    box.innerHTML = data.text;
    box.style.left = mousePt.x + 180 + "px";
    box.style.top = mousePt.y + "px";
  }
}

function showToolTipNew(obj, diagram, tool) {
  //var docloc = diagram.transformDocToView(obj.part.location);
  var toolTipDIV = document.getElementById('toolTipDIV');
  // document.getElementById('toolTipParagraph').textContent = "Regel: " + obj.data.regel ;

  if (toolTipDIV != undefined) {
    toolTipDIV.textContent = "";
    var pt = diagram.lastInput.viewPoint;
    toolTipDIV.style.left = (pt.x + 80) + "px";
    toolTipDIV.style.top = (pt.y + 150) + "px";
    // document.getElementById('toolTipParagraph2').textContent = obj.data.tooltip ;
    toolTipDIV.style.display = "block";
  }
}

function hideToolTipNew(diagram, tool) {
  var toolTipDIV = document.getElementById('toolTipDIV');
  toolTipDIV.style.display = "none";
}




