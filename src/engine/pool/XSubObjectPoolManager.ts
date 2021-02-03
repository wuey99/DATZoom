//------------------------------------------------------------------------------------------
    import { XType } from '../type/XType'; 
    import { XObjectPoolManager } from './XObjectPoolManager';
    
//------------------------------------------------------------------------------------------	
	export class XSubObjectPoolManager {
		private m_manager:XObjectPoolManager;
		private m_inuseObjects:Map<any, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__manager:XObjectPoolManager) {
			this.m_manager = __manager;
			
			this.m_inuseObjects = new Map<any, number> ();
		}
		
//------------------------------------------------------------------------------------------
		public isObject (__object:any):boolean {
			return this.m_manager.isObject (__object);
		}	

//------------------------------------------------------------------------------------------
		public getObjects ():Map<any, number> {
			return this.m_manager.getObjects ();
		}

//------------------------------------------------------------------------------------------
		public returnAllObjects ():void {
			XType.forEach (this.m_inuseObjects, 
				(__object:any) => {
					this.returnObject (__object);
				}
			);
		}		
		
//------------------------------------------------------------------------------------------
		public returnObject (__object:any):void {
			if (this.m_inuseObjects.has (__object)) {
				this.m_manager.returnObject (__object);
				
				this.m_inuseObjects.delete (__object);
			}
		}

//------------------------------------------------------------------------------------------
		public borrowObject ():any {
			var __object:any = this.m_manager.borrowObject ();
				
			this.m_inuseObjects.set (__object, 0);
			
			return __object;
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
