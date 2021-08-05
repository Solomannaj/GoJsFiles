import React, { Component } from 'react';
import { getNodesJSON } from '../services/viewerservice'
import { node, link } from '../models/viewermodel'
import * as go from 'gojs';
import { GoJsDraw, myDiagram, searchNodesArray, searchDiagramExtended, searchDiagram } from '../assets/js/demo';
import Loader from 'react-loader-spinner';
import { NavBar } from '../components/Menu';
export class Viewer extends Component {

    nodeIgnoreText: string = "Not allowed";
    model: go.Model;
    nodeDataArray: any = [];
    linkDataArray: any = [];
    data: go.GraphLinksModel;
    filter_data: any = [];
    item: any;
    nodearr: node[] = [];
    linkarr: link[] = [];
    groupcode: any;
    subcode: any;
    groupcodeArray: any = [];
    priceArray: any = [];
    hearing: string = "false";
    mdc: string = "";
    view: string = "";
    folder: string = "";
    year: string = "";
    selected: any;
    isOn = false;
    increment: any = 0;
    searchvalue: string = '';
    menuList: any[];
    btnViewText: string = "";
    state: any;
    myDiagramHeight: number;
    public regel: string;
    public search: string;

    constructor(props: any) {
        super(props);
        this.state = { loading: true };
    }

    componentDidMount() {
        getNodesJSON('logik_auto_visual_inter', 'v9_juni2021', '2021', 'MDC', '02', 'SimpleView', 'CasemixDRG_auto', 'v9_maj2021').then(res => {
            console.log('json data nodeDataArray');
            console.log(res.shapeData);
            console.log('json data linkDataArray');
            console.log(res.linkData);
            this.nodeDataArray = JSON.parse(res.shapeData);
            this.linkDataArray = JSON.parse(res.linkData);
            this.nodeDataArray.forEach(element => {
                var nodeText = "";
                var cursorType = "default";
                if (element.text.length > 100) {
                    nodeText = element.text.substring(0, 100) + "...";
                }
                else {
                    nodeText = element.text;
                }
                if (element.text.trim().startsWith("-")) {
                    nodeText = nodeText.trim().substr(1);
                    nodeText = nodeText + ' ' + this.nodeIgnoreText;
                }
                if (element.leafnode == true) {
                    var firstSpaceIndex = nodeText.indexOf(' ');
                    var firstWord = nodeText.substring(0, firstSpaceIndex + 1) + '\n';
                    var restWords = nodeText.substring(firstSpaceIndex + 1);
                    nodeText = firstWord + restWords;
                }
                if (element.yellowbox == false) { cursorType = "pointer"; }
                let n = {
                    key: element.key, text: nodeText, bounds: new go.Rect(element.xloc, element.yloc, 160, 100),
                    color: element.color, fig: element.fig, width: element.width, height: element.height, groupCode: element.groupCode,
                    regel: element.rownumber, tooltip: element.tooltip, yellowbox: element.yellowbox, leafnode: element.leafnode,
                    rownumber: "Regel:" + element.rownumber, cursor: cursorType, groupCodeValue: element.text,
                    loc: new go.Point(element.xloc, element.yloc), groupCodeText: element.groupCodeText
                };
                this.nodearr.push(n);
            });
            this.linkDataArray.forEach(element => {
                let l = { from: element.from, to: element.to, routing: go.Link.Orthogonal, fromSpot: element.fromSpot, toSpot: element.toSpot };
                this.linkarr.push(l);
            });

            this.data = new go.GraphLinksModel(this.nodearr, this.linkarr);
            if (this.mdc == "") {
                if (myDiagram != undefined) myDiagram.div = null;
                GoJsDraw(this.data);
            }
            else {
                if (myDiagram != undefined) myDiagram.div = null;
                GoJsDraw(this.data);
            }
            this.setState({ loading: false });
        })
    }

    showModalDialog() {
        var groupcode = document.getElementById("inputEventsMsg").textContent;
        var strData = document.getElementById("infoBoxHolder").textContent;


        alert(groupcode + ' ---- ' + strData);
    }

    render() {

        //this.myDiagramHeight = window.innerHeight + 17800;
        //use the above line for getting the full diagram
        this.myDiagramHeight = window.innerHeight - 322;

        return (
            <div>
                <NavBar>
                </NavBar>
                <div style={{ marginTop: 100 }}>

                    <div className="" style={{ display: 'block' }}>
                        <div style={{ display: this.state.loading ? 'normal' : 'none', marginLeft: 750, marginTop: 300 }}>
                            <Loader type="Circles" color="#00BFFF" height={80} width={80} />
                        </div>
                        <div className="row mt-2 mb-3" style={{ display: this.state.loading ? 'none' : 'block', marginLeft: 50, marginTop: 500 }}>
                            <div id="searchinput" style={{ display: 'block' }}>
                                <table id="searchtable">
                                    <tbody>

                                        <tr>
                                            <td>
                                                <input type="text" id="mySearch" className="form-control mb-2" />
                                            </td>
                                            <td>

                                                <button id="btnSearch" onClick={() => this.searchMyDiagram(this)} className="btn btn-primary mb-2">Search</button>

                                            </td>
                                            <td>
                                                <div className="col-auto">
                                                    <div className="form-check mb-2">
                                                        <span id="searchresultCaption" style={{ display: 'none' }} className="form-check-label">Result: </span>
                                                        <label id="searchresult" style={{ display: 'none' }} className="form-check-label" > </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="col-auto ml-4">
                                                    <button id="btnview" style={{ display: 'none' }} type="button" className="btn btn-primary mb-2" data-toggle="modal"
                                                        data-target="#exampleModal">
                                                        Viewtable </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="col-auto" id="arrows" style={{ display: 'none' }}>
                                                    <button id="btnDown" type="button" className="fas fa-chevron-down" onClick={() => this.SearchDiagramDown(this)}></button>
                                                    <button id="btnUp" type="button" className="fas fa-chevron-up" onClick={this.SearchDiagramDown}></button>
                                                    <button id="btnClose" type="button" className="fas fa-times drg-icon-search" onClick={this.SearchDiagramDown}></button>

                                                </div>
                                                <label id="counter" className="form-check-label"> </label>
                                            </td>
                                        </tr>

                                    </tbody>

                                </table>
                            </div>
                        </div>
                        <button id="mdBtn" onClick={this.showModalDialog} style={{ display: "none" }}>Show dialog</button>

                        <div id="myDiagramDiv" style={{ height: this.myDiagramHeight, backgroundColor: 'white', position: 'relative', WebkitTapHighlightColor: 'rgba(255, 255, 255, 0)', cursor: 'auto' }} ></div>


                        <div id="inputEventsMsg" style={{ display: "none" }}></div>
                        <div id="infoBoxHolder" style={{ display: "none" }}></div>

                        <div id="toolTipDIV" className="popover" data-toggle="popover" title="hi" data-content="gojs"></div>
                    </div>
                    <div id="myImages"></div>

                </div>
            </div>


        );


    }

    searchMyDiagram(elm) {
        console.log("debugg");
        elm.increment = 0;
        document.getElementById("counter").textContent = "";
        document.getElementById("counter").style.display = "none";
        //var t = document.getElementById("mySearch");
        searchDiagram(elm.regel);

        if (elm.increment > searchNodesArray.length) elm.increment = 1;
        var inc = ++elm.increment;
        if (inc > searchNodesArray.length) inc = 1;
        document.getElementById("counter").textContent = (inc).toString() + " of " + searchNodesArray.length.toString();
        if (inc == searchNodesArray.length) { searchDiagramExtended(searchNodesArray.length - 1) }
        else { searchDiagramExtended(inc - 1); }
        document.getElementById("counter").style.display = "inline";
    }

    SearchDiagramDown(elm) {
        if (elm.increment > searchNodesArray.length) elm.increment = 1;
        var inc = ++elm.increment;
        if (inc > searchNodesArray.length) inc = 1;
        document.getElementById("counter").textContent = (inc).toString() + " of " + searchNodesArray.length.toString();
        if (inc == searchNodesArray.length) { searchDiagramExtended(searchNodesArray.length - 1) }
        else { searchDiagramExtended(inc - 1); }
        document.getElementById("counter").style.display = "inline";
    }

}
