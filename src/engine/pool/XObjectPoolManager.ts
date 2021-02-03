//------------------------------------------------------------------------------------------
    import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------	
	export class XObjectPoolManager {
		public m_freeObjects:Array<Array<any>>;
		public m_numFreeObjects:number;
		private m_inuseObjects:Map<any, number>; 
		private m_newObject:any /* Function */;
		private m_cloneObject:any /* Function */;
		private m_overflow:number;
		private m_cleanup:any /* Function */;
		private m_numberOfBorrowedObjects:number;
		private m_sectionSize:number;
		private m_otherSize:number;
		private m_section:number;
		private m_otherSection:number;
		private m_sectionIndex:number;
		
//------------------------------------------------------------------------------------------
		constructor (
			__newObject:any /* Function */,
			__cloneObject:any /* Function */,
			__numObjects:number,
			__overflow:number,
			__cleanup:any /* Function */ = null
		) {
				
			this.m_freeObjects = new Array<Array<any>> ();
			this.m_inuseObjects = new Map<any, number> ();
			this.m_newObject = __newObject;
			this.m_cloneObject = __cloneObject;
			this.m_overflow = __overflow;
			this.m_cleanup = __cleanup;
			
			this.m_freeObjects.push (new Array<any> ());
			this.m_freeObjects.push (new Array<any> ());
			
			this.m_sectionSize = 0;
			this.m_otherSize = 0;
			
			this.m_section = 0;
			this.m_otherSection = 1;
			
			this.m_sectionIndex = 0;
			
			this.m_numFreeObjects = 0;
			this.m_numberOfBorrowedObjects = 0;
			
			this.addMoreObjects (__numObjects);
		}

//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.returnAllObjects ();
			
			if (this.m_cleanup == null) {
				return;
			}
			
			var i:number;
			
			for (i = 0; i < this.m_sectionSize; i++) {
				this.m_cleanup (this.m_freeObjects[this.m_section][i]);
			}
			
			for (i = 0; i < this.m_otherSize; i++) {
				this.m_cleanup (this.m_freeObjects[this.m_otherSection][i]);
			}
		}
		
//------------------------------------------------------------------------------------------
		public addMoreObjects (__numObjects:number):void {
			var i:number;
			
			for (i = 0; i < __numObjects; i++) {
				this.m_freeObjects[0].push (null);
				this.m_freeObjects[1].push (null);
			}
			
			for (i = 0; i < __numObjects; i++) {
				this.m_freeObjects[this.m_section][this.m_sectionSize + i] = this.m_newObject ();
			}
			
			this.m_sectionSize += __numObjects;
			
			this.m_numFreeObjects += __numObjects;
		}

//------------------------------------------------------------------------------------------
		public get freeObjects ():Array<any> {
			return this.m_freeObjects[this.m_section];
		}

		public set freeObjects (__val:Array<any>) {			
		}
		
//------------------------------------------------------------------------------------------
		public totalNumberOfObjects ():number {
			return this.m_sectionSize + this.m_otherSize + this.m_numberOfBorrowedObjects;	
		}
		
//------------------------------------------------------------------------------------------
		public numberOfBorrowedObjects ():number {
			return this.m_numberOfBorrowedObjects;
		}	
		
//------------------------------------------------------------------------------------------
		public isObject (__object:any):boolean {
			return this.m_inuseObjects.has (__object);
		}	

//------------------------------------------------------------------------------------------
		public getObjects ():Map<any, number> {
			return this.m_inuseObjects;
		}

//------------------------------------------------------------------------------------------
		public cloneObject (__src:any):any {
			var __dst:any = this.borrowObject ();
			
			return this.m_cloneObject (__src, __dst);
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
				this.m_freeObjects[this.m_otherSection][this.m_otherSize++] = __object;
				this.m_numFreeObjects++;
				
				this.m_inuseObjects.delete (__object);
				
				this.m_numberOfBorrowedObjects--;
			}
		}

//------------------------------------------------------------------------------------------
		public returnObjectTo (__pool:XObjectPoolManager, __object:any):void {
			if (this.m_inuseObjects.has (__object)) {
				__pool.m_freeObjects[this.m_otherSection][this.m_otherSize++] = __object;
				__pool.m_numFreeObjects++;
				
				this.m_inuseObjects.delete (__object);
				
				this.m_numberOfBorrowedObjects--;
			}
		}
		
//------------------------------------------------------------------------------------------
		public borrowObject ():any {
			if (this.m_numFreeObjects == 0) {
				this.addMoreObjects (this.m_overflow);
			}
			
			if (this.m_sectionIndex == this.m_sectionSize) {
				this.m_sectionSize = this.m_otherSize;
				this.m_otherSection = this.m_section;
				this.m_section = (this.m_section + 1) & 1;
				this.m_sectionIndex = 0;
				this.m_otherSize = 0;
			}
			
			var __object:any = this.m_freeObjects[this.m_section][this.m_sectionIndex++];
			this.m_numFreeObjects--;
				
			this.m_inuseObjects.set (__object, 0);
			
			this.m_numberOfBorrowedObjects++;
			
			return __object;
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
