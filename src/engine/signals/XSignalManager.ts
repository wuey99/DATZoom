//------------------------------------------------------------------------------------------
import { XApp } from '../app/XApp';
import { XSignal } from './XSignal';

//------------------------------------------------------------------------------------------	
	export class XSignalManager {
		// private m_XApp:XApp;
		
		private m_XSignals:Map<XSignal, number>;
		
//------------------------------------------------------------------------------------------
		constructor (__XApp:XApp) {
			// this.m_XApp = __XApp;
			
			this.m_XSignals = new Map<XSignal, number> ();
		}

//------------------------------------------------------------------------------------------
		public isXSignal (__signal:XSignal):boolean {
			return this.m_XSignals.has (__signal);
		}	

//------------------------------------------------------------------------------------------
		public getXSignals ():Map<XSignal, number> {
			return this.m_XSignals;
		}

//------------------------------------------------------------------------------------------
		public removeAllXSignals ():void {
            var __signal:XSignal;

			for (__signal of this.m_XSignals.keys ()) {
				this.removeXSignal (__signal);
			}
		}		
		
//------------------------------------------------------------------------------------------
		public removeXSignal (__signal:XSignal):void {
			if (this.m_XSignals.has (__signal)) {
				__signal.removeAllListeners ();
				
				this.m_XSignals.delete (__signal);
			}
		}

//------------------------------------------------------------------------------------------
		public createXSignal ():XSignal {
			var __signal:XSignal = new XSignal ();
			
			__signal.setParent (this);
			
			this.m_XSignals.set (__signal, 0);
			
			return __signal;	
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
