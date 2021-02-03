//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';
	
//------------------------------------------------------------------------------------------
	export class XTextSprite extends XSprite {
		public m_bitmapText:PIXI.BitmapText;
		public m_width:number;
		public m_height:number;
		public m_horizontalAlignment:string;
		public m_verticalAlignment:string;

//------------------------------------------------------------------------------------------
		public constructor (
			__width:number=32,
			__height:number=32,
			__text:string="",
			__fontName:string="Aller",
            __fontSize:number=12,
			__color:number=0x000000,
            __bold:boolean=false,
			__horzAlign:string="left",
			__vertAlign:string="top"
		) {
			super ();
			
			this.setup ();
			
			this.m_width = __width;
			this.m_height = __height;
			this.m_horizontalAlignment = __horzAlign;
			this.m_verticalAlignment = __vertAlign;

			this.m_bitmapText = new PIXI.BitmapText (
                __text,
                {
                    fontName: __fontName,
                    fontSize: __fontSize,
                    tint: __color,
                    align: __horzAlign,
                    maxWidth: __width
                }
            );		
				
			this.addChild (this.m_bitmapText); this.format ();	
		}

//------------------------------------------------------------------------------------------
		public setup ():void {
			super.setup ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			super.cleanup ();
		}
		
//------------------------------------------------------------------------------------------
		public getBitmapText ():PIXI.BitmapText {
			return this.m_bitmapText;
		}
		
//------------------------------------------------------------------------------------------
		public get width ():number {
			return this.m_bitmapText.width;
		}

//------------------------------------------------------------------------------------------
		public get height ():number {
			return this.m_bitmapText.height;
		}

//------------------------------------------------------------------------------------------
		public format ():void {
			this.m_bitmapText.dirty = true;
			
			if (this.m_width > 0) switch (this.m_horizontalAlignment) {
				case "center":
					this.m_bitmapText.x = (this.m_width - this.m_bitmapText.width) / 2;
					break;
				case "right":
					this.m_bitmapText.x = (this.m_width - this.m_bitmapText.width);
					break;
				default:
					this.m_bitmapText.x = 0;
					break;
			}

			if (this.m_height > 0) switch (this.m_verticalAlignment) {
				case "center":
					this.m_bitmapText.y = (this.m_height - this.m_bitmapText.height) / 2;
					break;
				case "bottom":
					this.m_bitmapText.y = (this.m_height - this.m_bitmapText.height);
					break;
				default:
					this.m_bitmapText.y = 0;
					break;
			}
		}

//------------------------------------------------------------------------------------------
		public get bitmapText ():PIXI.BitmapText {
			return this.m_bitmapText;
		}

//------------------------------------------------------------------------------------------
		public get text ():string {
			return this.m_bitmapText.text;
		}
		
		public set text (__text:string) {
			this.m_bitmapText.text = __text; this.format ();
		}

//------------------------------------------------------------------------------------------
		public get color ():number {
			return this.m_bitmapText.tint;
		}
		
		public set color (__color:number) {
			this.m_bitmapText.tint = __color;		
		}
		
//------------------------------------------------------------------------------------------
		public get bold ():boolean {
			return true;
		}
		
		public set bold (__val:boolean) {	
			this.format ();		
		}
			
//------------------------------------------------------------------------------------------
		public get font ():string {
			return this.m_bitmapText.fontName;
		}
		
		public set font (__val:string) {
			this.m_bitmapText.fontName = __val; this.format ();		
		}
		
//------------------------------------------------------------------------------------------
		public get size ():number {
			return this.m_bitmapText.fontSize;
		}
		
		public set size (__val:number) {
			this.m_bitmapText.fontSize = __val; this.format ();	
		}

//------------------------------------------------------------------------------------------
		public get align ():string {
			return this.m_bitmapText.align;
		}
		
		public set align (__val:string) {
			this.m_bitmapText.align = __val; this.format ();		
		}
		
//------------------------------------------------------------------------------------------
		public get textWidth ():number {
			return this.m_bitmapText.maxWidth;
		}
		
		public set textWidth (__val:number) {
            this.m_bitmapText.maxWidth = __val; this.format ();	
		}
		
//------------------------------------------------------------------------------------------
        public get textHeight ():number {
            return this.m_bitmapText.height;
        }

        public set textHeight (__val:number) {
			this.format ();	
        }

//------------------------------------------------------------------------------------------
		public get letterSpacing ():number {
			return this.m_bitmapText.letterSpacing;
		}
		
		public set letterSpacing (__val:number) {
			this.m_bitmapText.letterSpacing = __val; this.format ();		
		}

//------------------------------------------------------------------------------------------
		public get selectable ():boolean {
			return true;
		}
		
		public set selectable (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get multiline ():boolean {
			return true;
		}
		
		public set multiline (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get wordWrap ():boolean {
			return true;
		}
		
		public set wordWrap (__val:boolean) {		
		}

//------------------------------------------------------------------------------------------
		public get italic ():boolean {
			return true;
		}
		
		public set italic (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------	
		public get kerning ():boolean {
			return true;
		}
		
		public set kerning (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
		public get underline ():boolean {
			return true;
		}
		
		public set underline (__val:boolean) {		
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }