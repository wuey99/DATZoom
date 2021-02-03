//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'

//------------------------------------------------------------------------------------------
	export class XPoint extends PIXI.Point {
		
//------------------------------------------------------------------------------------------
		constructor (__x:number = 0, __y:number = 0) {
			super (__x, __y);
		}

//------------------------------------------------------------------------------------------
		public setPoint (__x:number, __y:number):void {
			this.x = __x;
			this.y = __y;
		}
		
//------------------------------------------------------------------------------------------
		public cloneX ():XPoint {
			var __point:PIXI.Point = this.clone ();
			
			return new XPoint (__point.x, __point.y);
		}
	
//------------------------------------------------------------------------------------------
		public copy2 (__point:XPoint):void {
			__point.x = this.x;
			__point.y = this.y;
		}
			
//------------------------------------------------------------------------------------------
		public getPoint ():PIXI.Point {
			return this as PIXI.Point;
		}
		
//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }