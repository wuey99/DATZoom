//------------------------------------------------------------------------------------------
	export class XSignal {
		private m_listeners:Map<number, any>;
		private m_parent:any
		private m_id:number;
		
//------------------------------------------------------------------------------------------
		constructor () {
			this.m_listeners = new Map<number, any> ();
			this.m_id = 0;
		}

//------------------------------------------------------------------------------------------
		public getParent ():any {
			return this.m_parent;
		}
		
//------------------------------------------------------------------------------------------
		public setParent (__parent:any):void {
			this.m_parent = __parent;
		}
		
//------------------------------------------------------------------------------------------
		public addListener (__listener:any):number {
			this.m_listeners.set (++this.m_id, __listener);
			
			return this.m_id;
		}

//------------------------------------------------------------------------------------------
		public fireSignal (...args:any):void {
            var __listener:any;
            var __id:number;

			switch (args.length) {
				case 0:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener ();
                    }
                    
                    break;
				case 1:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0]);
					}
        
                    break;
				case 2:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1]);
					}
        
                    break;
				case 3:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1], args[2]);
					}
        
                    break;
				case 4:
					for (__id of this.m_listeners.keys ()) {
						__listener = this.m_listeners.get (__id);
		
						__listener (args[0], args[1], args[2], args[3]);
                    }
                    
                    break;
			}
		}
		
//------------------------------------------------------------------------------------------
		public removeListener (__id:number):void {
			if (this.m_listeners.has (__id)) {
				this.m_listeners.delete (__id);
			}
		}

//------------------------------------------------------------------------------------------
		public removeAllListeners ():void {
            var __id:number;

			for (__id of this.m_listeners.keys ()) {
				this.m_listeners.delete (__id);
			}
		}
				
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }