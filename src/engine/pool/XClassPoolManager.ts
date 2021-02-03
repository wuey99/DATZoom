//------------------------------------------------------------------------------------------
    import { XType } from '../type/XType'; 
    import { XObjectPoolManager } from './XObjectPoolManager';

//------------------------------------------------------------------------------------------	
	export class XClassPoolManager {
		private m_pools:Map<any, XObjectPoolManager>;
		
//------------------------------------------------------------------------------------------
		constructor () {
			this.m_pools = new Map<any, XObjectPoolManager> ();
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
		}

//------------------------------------------------------------------------------------------
		public setupPool (
			__class:any,
			__numObjects:number,
			__overflow:number
		):XObjectPoolManager {
			
			return new XObjectPoolManager (
				():any => {
					return XType.createInstance (__class);
				},
				
				(__src:any, __dst:any):any => {
					return null;
				},
				
				__numObjects, __overflow,
				
				(x:any):void => {

				}
			);
		}

//------------------------------------------------------------------------------------------
		public preAllocate (__class:any, __numObjects:number):void {
			var __pool:XObjectPoolManager;
			
			if (!this.m_pools.has (__class)) {
				__pool = this.setupPool (__class, 16, 16);
				
				this.m_pools.set (__class, __pool);
			}	
			
			__pool = this.m_pools.get (__class);
			
			var i:number;
			
			for (i = 0; i < __numObjects; i++) {
				__pool.borrowObject ();
			}
			
			this.returnAllObjects (__class);
		}
		
//------------------------------------------------------------------------------------------
		public returnAllObjects (__class:any = null):void {
			var __pool:XObjectPoolManager;
			
			if (__class != null) {
				if (this.m_pools.has (__class)) {
					__pool = this.m_pools.get (__class);
					
					__pool.returnAllObjects ();
				}
            } else {
				XType.forEach (this.m_pools, 
					(x:any):void => {
						__pool = this.m_pools.get (__class);
						
						__pool.returnAllObjects ();
					}
				);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public returnObject (__class:any, __object:any):void {
			var __pool:XObjectPoolManager;
			
			if (this.m_pools.has (__class)) {
				__pool = this.m_pools.get (__class);
				
				__pool.returnObject (__object);
			}
		}

//------------------------------------------------------------------------------------------
		public borrowObject (__class:any):any {
			var __pool:XObjectPoolManager;
			
			if (!this.m_pools.has (__class)) {
				__pool = this.setupPool (__class, 16, 16);
				
				this.m_pools.set (__class, __pool);
			}
			else
			{
				__pool = this.m_pools.get (__class);
			}
			
			return __pool.borrowObject ();
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
