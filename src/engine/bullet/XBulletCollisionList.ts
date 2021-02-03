//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XPoint } from '../geom/XPoint';
import { XRect } from '../geom/XRect';
import { XWorld} from '../sprite/XWorld';
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XSubObjectPoolManager } from '../pool/XSubObjectPoolManager';

//------------------------------------------------------------------------------------------
	export class XBulletCollisionList {
		private world:XWorld;
		private m_rects:Array<Map<XGameObject, XRect>>; 
		private m_XSubRectPoolManager:XSubObjectPoolManager;
		
//------------------------------------------------------------------------------------------
		constructor () {
			this.world = null;
		}
		
//------------------------------------------------------------------------------------------
		public setup (__world:XWorld):void {
			this.world = __world;		

			this.m_rects = new Array<Map<XGameObject, XRect>> (); 
			
			var i:number;
			
			for (i = 0; i < this.world.getMaxLayers (); i++) {
				this.m_rects[i] = new Map<XGameObject, XRect> ();
			}
			
			this.m_XSubRectPoolManager = new XSubObjectPoolManager (this.world.getXRectPoolManager ());
			
			this.clear ();
		}
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.clear ();
		}

//------------------------------------------------------------------------------------------		
		public clear ():void {
			var i:number;

			for (i = 0; i < this.world.getMaxLayers (); i++) {
				XType.removeAllKeys (this.m_rects[i]);
			}
			
			this.m_XSubRectPoolManager.returnAllObjects ();
		}
	
//------------------------------------------------------------------------------------------
		public addCollision (
			__layer:number,
			__logicObject:XGameObject,
			__srcPoint:XPoint, __srcRect:XRect
			):void {

			var __rect:XRect = this.m_XSubRectPoolManager.borrowObject () as XRect;
			__srcRect.copy2 (__rect); __rect.offsetPoint (__srcPoint);
			this.m_rects[__layer].set (__logicObject, __rect);
		}

//------------------------------------------------------------------------------------------
		public findCollision (
			__layer:number,
			__srcPoint:XPoint,
			__srcRect:XRect
		):XGameObject {
			
			var __logicObject:XGameObject = null;
			
			var __rect:XRect = this.m_XSubRectPoolManager.borrowObject () as XRect;
			__srcRect.copy2 (__rect); __rect.offsetPoint (__srcPoint);
			
			XType.forEach (this.m_rects[__layer], 
				(x:XGameObject) => {
					var __dstRect:XRect =  this.m_rects[__layer].get (x);
					
					if (__dstRect.intersects (__rect)) {
						__logicObject = x;
					}
				}
			);	
			
			this.m_XSubRectPoolManager.returnObject (__rect);
	
			return __logicObject;
		}
		
//------------------------------------------------------------------------------------------
		public findCollisions (
			__layer:number,
			__srcPoint:XPoint,
			__srcRect:XRect
			):Array<XGameObject>  {
	
			var __logicObjects:Array<XGameObject> = new Array<XGameObject> (); 

			var __rect:XRect = this.m_XSubRectPoolManager.borrowObject () as XRect;
			__srcRect.copy2 (__rect); __rect.offsetPoint (__srcPoint);

			XType.forEach (this.m_rects[__layer], 
				(x:XGameObject) => {
					var __dstRect:XRect = this.m_rects[__layer].get (x);
					
					if (__dstRect.intersects (__rect)) {
						__logicObjects.push (x);
					}
				}
			);	
			
			this.m_XSubRectPoolManager.returnObject (__rect);
			
			return __logicObjects;
		}

//------------------------------------------------------------------------------------------
		public getRect (__layer:number, __logicObject:XGameObject):XRect {
			return this.m_rects[__layer].get (__logicObject);
		}
		
//------------------------------------------------------------------------------------------
		public getRects (__layer:number):Map<XGameObject, XRect> {
			return this.m_rects[__layer];
		}

//------------------------------------------------------------------------------------------
		public getList (__layer:number):Map<XGameObject, XRect>{
			return this.m_rects[__layer];
		}
		
//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
// }
