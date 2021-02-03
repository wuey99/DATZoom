//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XPoint } from './XPoint';

//------------------------------------------------------------------------------------------
	export class XRect extends PIXI.Rectangle {
		
//------------------------------------------------------------------------------------------
		constructor (__x:number = 0, __y:number = 0, __width:number = 0, __height:number = 0) {
			super (__x, __y, __width, __height);
		}	

//------------------------------------------------------------------------------------------
		public setRect (__x:number, __y:number, __width:number, __height:number):void {
			this.x = __x;
			this.y = __y;
			this.width = __width;
			this.height = __height;
		}
		
//------------------------------------------------------------------------------------------
		public cloneX ():XRect {
			var __rect:PIXI.Rectangle = this.clone ();
			
			return new XRect (__rect.x, __rect.y, __rect.width, __rect.height);
		}

//------------------------------------------------------------------------------------------
		public copy2 (__rect:XRect):void {
			__rect.x = this.x;
			__rect.y = this.y;
			__rect.width = this.width;
			__rect.height = this.height;
		}

//------------------------------------------------------------------------------------------
        public intersects (__rect:XRect):boolean {
            if (this.right < __rect.left) {
                return false;
            }

            if (this.bottom < __rect.top) {
                return false;
            }

            if (this.left > __rect.right) {
                return false;
            }

            if (this.top > __rect.bottom) {
                return false;
            }
            
            return true;
        }

//------------------------------------------------------------------------------------------
        public offsetPoint (__point:XPoint):void {
            this.x += __point.x;
            this.y += __point.y;
        }

//------------------------------------------------------------------------------------------
		public getRectangle ():PIXI.Rectangle {
			return this as PIXI.Rectangle;
		}
		
//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }
