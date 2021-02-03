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
import { XBulletCollisionList } from './XBulletCollisionList';
	
//------------------------------------------------------------------------------------------
	export class XBulletCollisionManager {
		private xxx:XWorld;
		private m_collisionLists:Map<XBulletCollisionList, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__xxx:XWorld) {
			this.xxx = __xxx;
			
			this.m_collisionLists = new Map<XBulletCollisionList, number> ()
		}
		
//------------------------------------------------------------------------------------------
		public setup ():void {
		}
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.removeAllCollisionLists ();
		}
		
//------------------------------------------------------------------------------------------
		public clearCollisions ():void {
			XType.forEach (this.m_collisionLists, 
				function (x:XBulletCollisionList):void {
					var __collisionList:XBulletCollisionList = x;
					
					__collisionList.clear ();
				}
			);
		}
	
//------------------------------------------------------------------------------------------
		public addCollisionList ():XBulletCollisionList {
			var __collisionList:XBulletCollisionList = new XBulletCollisionList ();
			
			__collisionList.setup (this.xxx);
			
			this.m_collisionLists.set (__collisionList, 0);
			
			return __collisionList;
		}

//------------------------------------------------------------------------------------------
		public removeCollisionList (__collisionList:XBulletCollisionList):void {
			__collisionList.cleanup ();
			
			this.m_collisionLists.delete (__collisionList);
		}
		
//------------------------------------------------------------------------------------------
		public removeAllCollisionLists ():void {
			XType.forEach (this.m_collisionLists, 
				(x:XBulletCollisionList):void => {
					var __collisionList:XBulletCollisionList = x;
					
					__collisionList.cleanup ();
					
					this.m_collisionLists.delete (x);
				}
			);			
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
