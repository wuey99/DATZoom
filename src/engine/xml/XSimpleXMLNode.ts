//------------------------------------------------------------------------------------------
import { XType } from '../type/XType';
import * as Parser from 'fast-xml-parser';
var he = require('he');

//------------------------------------------------------------------------------------------
export class XSimpleXMLNode {
	private m_tag: string;
	private m_attribsMap: Map<string, any>;
	private m_text: string;
	private m_children: Array<XSimpleXMLNode>;
	private m_parent: XSimpleXMLNode;

	//------------------------------------------------------------------------------------------
	public constructor(__xmlString: string = null) {
		this.m_attribsMap = new Map<string, any>();
		this.m_children = new Array<XSimpleXMLNode>();
		this.m_parent = null;

		if (__xmlString != null) {
			this.setupWithXMLString(__xmlString);
		}
	}

	//------------------------------------------------------------------------------------------
	public setupWithParams(__tag: string, __text: string, __attribs: Array<any>): void {
		this.m_tag = __tag;
		this.m_text = __text;

		var i: number = 0;

		while (i < __attribs.length) {
			this.m_attribsMap.set(__attribs[i + 0], __attribs[i + 1]);

			i += 2;
		}
	}

	//------------------------------------------------------------------------------------------	
	public setupWithXMLString(__xmlString: string): void {
		var options = {
			attributeNamePrefix: "", // "@_",
			attrNodeName: "@", //default is 'false'
			textNodeName: "#text",
			ignoreAttributes: false,
			ignoreNameSpace: false,
			allowBooleanAttributes: false,
			parseNodeValue: true,
			parseAttributeValue: true,
			trimValues: true,
			cdataTagName: "__cdata", //default is 'false'
			cdataPositionChar: "\\c",
			parseTrueNumberOnly: false,
			arrayMode: false, //"strict"
			attrValueProcessor: (val:any /*, attrName */) => he.decode(val, { isAttributeValue: true }),//default is a=>a
			tagValueProcessor: (val:any /*, tagName */) => he.decode(val), //default is a=>a
			stopNodes: ["parse-me-as-string"]
		};

		var __jsonXML: any = Parser.parse(unescape(__xmlString), options);

		console.log (": jsonXML: ", __jsonXML);

		var __elementName: string;

		for (__elementName in __jsonXML) {
			this.setupWithJSON(__elementName, __jsonXML[__elementName]);
		}
	}

	//------------------------------------------------------------------------------------------
	public setupWithJSON(__elementName: string, __jsonXML: any): void {
		this.m_tag = __elementName;
		this.m_text = "";

		console.log(": setupWithJSON: ", __elementName, __jsonXML, this.notObject(__jsonXML));

		this.m_attribsMap = new Map<string, any>();

		if (this.notObject(__jsonXML)) {
			this.m_text = "" + __jsonXML;

			this.m_children = new Array<XSimpleXMLNode>();
		} else {
			if (Array.isArray(__jsonXML)) {
				this.m_children = this.getArrayChildren(__elementName, __jsonXML);
			} else {
				this.m_text = __jsonXML["#text"] != undefined ? "" + __jsonXML["#text"] : "";

				if (__jsonXML["@"] != undefined) {
					var __attribs: any = __jsonXML["@"];
					var __attribName: string;
					for (__attribName in __attribs) {
						this.m_attribsMap.set(__attribName, __attribs[__attribName]);
					}
				}

				this.m_children = this.getJSONChildren(__jsonXML);
			}
		}
	}

	//------------------------------------------------------------------------------------------
	public getArrayChildren(__elementName: string, __jsonArray: Array<any>): Array<XSimpleXMLNode> {
		var __children: Array<XSimpleXMLNode> = new Array<XSimpleXMLNode>();

		var __xmlNode: XSimpleXMLNode;

		var __jsonXML: any;

		console.log(": getArrayChildren: ", __jsonArray);

		for (__jsonXML of __jsonArray) {
			console.log(": ", __elementName, __jsonXML, typeof __jsonXML);

			__xmlNode = new XSimpleXMLNode();

			if (this.notObject(__jsonXML)) {
				__xmlNode.setupWithJSON(__elementName, __jsonXML);
			} else {
				__xmlNode.setupWithJSON(__elementName, __jsonXML);
			}

			__children.push(__xmlNode);
		}

		return __children;
	}

	//------------------------------------------------------------------------------------------
	public getJSONChildren(__jsonXML: any): Array<XSimpleXMLNode> {
		var __children: Array<XSimpleXMLNode> = new Array<XSimpleXMLNode>();

		var __elementName: string;

		for (__elementName in __jsonXML) {
			console.log(": getJSONChildren: ", __elementName, __jsonXML[__elementName], Array.isArray(__jsonXML[__elementName]));

			if (__elementName != "#text" && __elementName != "@") {
				if (Array.isArray(__jsonXML[__elementName])) {
					__children = __children.concat(this.getArrayChildren(__elementName, __jsonXML[__elementName]));
				} else {
					var __xmlNode: XSimpleXMLNode = new XSimpleXMLNode();
					__xmlNode.setupWithJSON(__elementName, __jsonXML[__elementName]);
					__children.push(__xmlNode);
				}
			}
		}

		return __children;
	}

	//------------------------------------------------------------------------------------------
	public notObject(__value: any): boolean {
		return typeof __value == "string" || typeof __value == "number" || typeof __value == "boolean";
	}
	
	//------------------------------------------------------------------------------------------
	public cleanup(): void {
	}

	//------------------------------------------------------------------------------------------
	public addChildWithParams(__tag: string, __text: string, __attribs: Array<any>): XSimpleXMLNode {
		var __xmlNode: XSimpleXMLNode = new XSimpleXMLNode();
		__xmlNode.setupWithParams(__tag, __text, __attribs);

		__xmlNode.setParent(this);

		this.m_children.push(__xmlNode);

		return __xmlNode;
	}

	//------------------------------------------------------------------------------------------
	public addChildWithXMLString(__xmlString: string): XSimpleXMLNode {
		var __xmlNode: XSimpleXMLNode = new XSimpleXMLNode();
		__xmlNode.setupWithXMLString(__xmlString);

		__xmlNode.setParent(this);

		this.m_children.push(__xmlNode);

		return __xmlNode;
	}

	//------------------------------------------------------------------------------------------
	public addChildWithXMLNode(__xmlNode: XSimpleXMLNode): XSimpleXMLNode {
		__xmlNode.setParent(this);

		this.m_children.push(__xmlNode);

		return __xmlNode;
	}

	//------------------------------------------------------------------------------------------
	public removeChild(__xmlNode: XSimpleXMLNode): void {
	}

	//------------------------------------------------------------------------------------------
	public getChildren(): Array<any> {
		return this.m_children;
	}

	//------------------------------------------------------------------------------------------
	public get tag(): string {
		return this.m_tag;
	}

	public set tag(__val: string) {
		this.m_tag = __val;
	}

	//------------------------------------------------------------------------------------------
	public addAttribute(__name: string, __val: any): void {
		this.m_attribsMap.set(__name, __val);
	}

	//-----------------------------------------------------------------------------------------
	public hasAttribute(__name: string): boolean {
		return this.m_attribsMap.has(__name);
	}

	//-----------------------------------------------------------------------------------------
	public attributes(): Map<string, any> {
		return this.m_attribsMap;
	}

	//-----------------------------------------------------------------------------------------
	public attribute(__name: string): any {
		return this.m_attribsMap.get(__name);
	}

	//-----------------------------------------------------------------------------------------
	public getAttribute(__name: string): any {
		return this.m_attribsMap.get(__name);
	}

	//-----------------------------------------------------------------------------------------
	public getAttributeFloat(__name: string): number {
		return XType.parseFloat(this.m_attribsMap.get(__name));
	}

	//-----------------------------------------------------------------------------------------
	public getAttributeInt(__name: string): number {
		return XType.parseInt(this.m_attribsMap.get(__name));
	}

	//-----------------------------------------------------------------------------------------
	public getAttributeString(__name: string): string {
		return "" + this.m_attribsMap.get(__name);
	}

	//-----------------------------------------------------------------------------------------
	public getAttributeBoolean(__name: string): boolean {
		var __boolean: string = this.getAttributeString(__name);

		if (__boolean == "true" || __boolean == "1") {
			return true;
		} else {
			return false;
		}
	}

	//------------------------------------------------------------------------------------------
	public getText(): string {
		return this.m_text;
	}

	//------------------------------------------------------------------------------------------
	public getTextTrim(): string {
		return XType.trim(this.m_text);
	}

	//------------------------------------------------------------------------------------------
	public __tab(__indent: number): string {
		var i: number;
		var tabs: string = "";

		for (i = 0; i < __indent; i++) {
			tabs += "\t";
		}

		return tabs;
	}

	//------------------------------------------------------------------------------------------
	public toXMLString(__indent: number = 0): string {
		var i: number;

		var __string: string = "";

		__string += this.__tab(__indent) + "<" + this.m_tag;

		XType.forEach(this.m_attribsMap,
			(x: any) => {
				var __key: string = x as string;
				__string += " " + __key + "=" + "\"" + this.m_attribsMap.get(__key) + "\"";
			}
		);

		if (this.m_text != "" || this.m_children.length != 0) {
			__string += ">\n";

			if (this.m_text != "") {
				__string += this.__tab(__indent + 1) + this.m_text + "\n";
			}

			if (this.m_children.length != 0) {
				for (i = 0; i < this.m_children.length; i++) {
					__string += this.m_children[i].toXMLString(__indent + 1);
				}
			}

			__string += this.__tab(__indent) + "</" + this.m_tag + ">\n";
		} else {
			__string += "/>\n";
		}

		return __string;
	}

	//------------------------------------------------------------------------------------------
	public toXMLStringEscaped(__indent: number = 0): string {
		var i: number;

		var __string: string = "";

		__string += this.__tab(__indent) + "\"<" + this.m_tag;

		XType.forEach(this.m_attribsMap,
			(x: any) => {
				var __key: string = x as string;
				__string += " " + __key + "=" + "\\\"" + this.m_attribsMap.get(__key) + "\\\"";
			}
		);

		if (this.m_text != "" || this.m_children.length != 0) {
			__string += ">\" +\n";

			if (this.m_text != "") {
				__string += this.__tab(__indent + 1) + this.m_text + "\n";
			}

			if (this.m_children.length != 0) {
				for (i = 0; i < this.m_children.length; i++) {
					__string += this.m_children[i].toXMLStringEscaped(__indent + 1);
				}
			}

			__string += this.__tab(__indent) + "\"</" + this.m_tag + ">\" +\n";
		} else {
			__string += "/>\" +\n";
		}

		return __string;
	}

	//------------------------------------------------------------------------------------------
	public toXMLStringBlob(__indent: number = 0): string {
		var i: number;

		var __string: string = "";

		__string += "<" + this.m_tag;

		XType.forEach(this.m_attribsMap,
			(x: any) => {
				var __key: string = x as string;
				__string += " " + __key + "=" + "\\\"" + this.m_attribsMap.get(__key) + "\\\"";
			}
		);

		if (this.m_text != "" || this.m_children.length != 0) {
			__string += ">";

			if (this.m_text != "") {
				__string += this.m_text;
			}

			if (this.m_children.length != 0) {
				for (i = 0; i < this.m_children.length; i++) {
					__string += this.m_children[i].toXMLStringBlob(__indent + 1);
				}
			}

			__string += "</" + this.m_tag + ">";
		} else {
			__string += "/>";
		}

		return __string;
	}

	//------------------------------------------------------------------------------------------
	public parent(): XSimpleXMLNode {
		return this.m_parent;
	}

	//------------------------------------------------------------------------------------------
	public setParent(__parent: XSimpleXMLNode): void {
		this.m_parent = __parent;
	}

	//------------------------------------------------------------------------------------------
	public localName(): string {
		return this.m_tag;
	}

	//------------------------------------------------------------------------------------------
	public insertChildAfter(__dst: XSimpleXMLNode, __src: XSimpleXMLNode): void {
	}

	//------------------------------------------------------------------------------------------
	public appendChild(__src: XSimpleXMLNode): void {
	}

	//------------------------------------------------------------------------------------------
	public child(__tag: string): Array<XSimpleXMLNode> {
		if (__tag == "*") {
			return this.m_children;
		}

		var __list: Array<XSimpleXMLNode> = new Array<XSimpleXMLNode>();

		var i: number;

		for (i = 0; i < this.m_children.length; i++) {
			if (this.m_children[i].tag == __tag) {
				__list.push(this.m_children[i]);
			}
		}

		return __list;
	}

	//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
// }