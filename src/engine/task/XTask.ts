//------------------------------------------------------------------------------------------
    import { XApp } from '../app/XApp';
    import { XNumber } from './XNumber';
    import { XType } from '../type/XType';
    import { XTaskManager } from './XTaskManager';
    import { XTaskSubManager } from './XTaskSubManager';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';

	//------------------------------------------------------------------------------------------
	// XTask provides a mechanism to control the execution of functions.
	// Functions can be queued up in an Array and executed at a later time.
	//
	// example of use:
	//
	// var taskList:Array= [
	//	__moveUp,
	//  __moveDn,
	// ];
	//
	// xxx.getXTaskManager ().addTask (taskList);
	//
	// function __moveUp ():void;
	// function __moveDn ():void;
	//
	// The execution of the queued functions can be manipulated several ways
	// via the use of a rudimentary Scripting system.
	//
	// DELAYED EXECUTION:
	// 	XTask.WAIT, <ticks>
	//
	// var taskList:Array = [
	//  __moveUp,
	//  XTask.WAIT, 0x0400,
	//  __moveDn,
	// ];
	//
	// LOOPING:
	// XTask.LOOP, <count>
	//	<function>
	// XTask.NEXT
	// 
	// CALL/RETURN
	// 	XTask.CALL, <label>
	//  XTask.LABEL, "label"
	//  XTASK.RETN
	//
	// GOTO:
	//  XTask.GOTO, <label>
	//
	// some possible uses/applications of XTask:
	// 
	// 1) sequencing animation
	// 2) synchronizing the execution of code
	// 3) efficiently organizing operations that have to be executed in a particular order
	//------------------------------------------------------------------------------------------
	export class XTask {
		private m_taskList:Array<any>;
		private m_taskIndex:number;
		private m_labels:Map<string, number>;
		private m_ticks:number;
		private m_stack:Array<number>;
		private m_loop:Array<number>; 
		private m_stackPtr:number;
		private m_parent:any;
		private m_flags:number;
		private m_subTask:XTask;
		private m_time:number;
		private m_WAIT1000:boolean;
		public m_isDead:boolean;
		public tag:string;
		public m_id:number;
		public self:XTask;
		public m_pool:XObjectPoolManager;
		
		public static g_id:number = 0;
		
		private m_manager:XTaskManager;
		
		public static g_XApp:XApp;
		public m_XApp:XApp;
		
// all op-codes
		public static readonly CALL:number = 0;
		public static readonly CALL_EQ:number = 1;
		public static readonly CALL_NE:number = 2;
		public static readonly RETN:number = 3;
		public static readonly LOOP:number = 4;
		public static readonly NEXT:number = 5;
		public static readonly WAIT:number = 6;
		public static readonly LABEL:number = 7;
		public static readonly GOTO:number = 8;
		public static readonly BEQ:number = 9;
		public static readonly BNE:number = 10;
		public static readonly FLAGS:number = 11;
		public static readonly EXEC:number = 12;
		public static readonly EXEC_EQ:number = 13;
		public static readonly EXEC_NE:number = 14;
		public static readonly FUNC:number = 15;
		public static readonly WAIT1000:number = 16; 
		public static readonly UNTIL:number = 17;
		public static readonly POP:number = 18;
		public static readonly WAITX:number = 19;
		
		public static readonly XTask_OPCODES:number = 20;
		
		public static readonly _FLAGS_EQ:number = 1;
		
        private m_XTaskSubManager:XTaskSubManager;
        
    	//------------------------------------------------------------------------------------------
		constructor () {
			this.self = this;
			
			this.m_XTaskSubManager = this.createXTaskSubManager ();
			
			this.m_stack = new Array<number> (); 
			this.m_loop = new Array<number> ();
			this.m_labels = new Map<string, number> ();
			
			for (var i:number = 0; i < 8; i++) {
				this.m_stack.push (0);
				this.m_loop.push (0);
			}
			
			this.m_isDead = true;
		}
		
		//------------------------------------------------------------------------------------------
		public setup (__taskList:Array<any>, __findLabelsFlag:boolean = true):void {
			this.__reset (__taskList, __findLabelsFlag);
			
			this.m_id = ++XTask.g_id;
		}
		
		//------------------------------------------------------------------------------------------
		private __reset (__taskList:Array<any>, __findLabelsFlag:boolean = true):void {
			this.m_taskList = __taskList;
			this.m_taskIndex = 0;
			XType.removeAllKeys (this.m_labels);
			for (var i:number = 0; i < 8; i++) {
				this.m_stack[i] = 0;
				this.m_loop[i] = 0;
			}
			this.m_stackPtr = 0;
			this.m_ticks = 0x0100 + 0x0080;
			this.m_flags = ~XTask._FLAGS_EQ;
			this.m_subTask = null;
			this.m_isDead = false;
			this.m_parent = null;
			this.m_WAIT1000 = false;
			this.tag = "";
			
			// locate forward referenced labels.  this is usually done by default, but
			// __findLabelsFlag can be set to false if it's known ahead of time that
			// there aren't any forward referenced labels
			if (__findLabelsFlag) {
				this.__findLabels ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		public createXTaskSubManager ():XTaskSubManager {
			return new XTaskSubManager (null);
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
		public setPool (__pool:XObjectPoolManager):void {
			this.m_pool = __pool;
		}
		
		//------------------------------------------------------------------------------------------
		public getPool ():XObjectPoolManager {
			return this.m_pool;
		}
        
		//------------------------------------------------------------------------------------------
		public getManager ():XTaskManager {
			return this.m_manager;
		}
		
		//------------------------------------------------------------------------------------------
		public setManager (__manager:XTaskManager):void {
			this.m_manager = __manager;
			
			this.m_XTaskSubManager.setManager (__manager);
		}
		
		//------------------------------------------------------------------------------------------
		public static setXApp (__XApp:XApp):void {
			XTask.g_XApp = __XApp;
		}
		
		//------------------------------------------------------------------------------------------
		public getXApp ():XApp {
			return XTask.g_XApp;
		}
		
		//------------------------------------------------------------------------------------------
		public kill ():void {
			this.removeAllTasks ();
			
			this.m_isDead = true;
		}	
		
		//------------------------------------------------------------------------------------------
		// execute the XTask, usually called by the XTaskManager.
        //------------------------------------------------------------------------------------------
        private __retn ():boolean {
            if (this.m_stackPtr < 0) {
                if (this.m_parent != null && this.m_parent != this.m_manager) {
                    this.m_parent.removeTask (this.self);
                }
                else
                {
                    this.m_manager.removeTask (this.self);
                }
                
                return true;
            }		
            else
            {
                return false;
            }
        }

		public run ():void {
			// done execution?
			if (this.m_isDead) {
				return;
			}

			if (this.__retn ()) {
				return;
			}
			
			// suspended?
			this.m_ticks -= 0x0100;
			
			if (this.m_ticks > 0x0080) {
				return;
			}
			
			// evaluate instructions
			var __cont:boolean = true;
			
			while (__cont && !this.m_isDead) {
				__cont = this.__evalInstructions ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		// locate all labels in an XTask
		//------------------------------------------------------------------------------------------
		private __findLabels ():void {
			var i:number;
			var x:number;
			
			i = 0;
			
			while (i < this.m_taskList.length) {
				var value:any = this.m_taskList[i++];
				
				if (XType.isFunction (value)) {
				}
				else
				{
					x = value as number;
					
					switch (x) {
						case XTask.LABEL:
							var __label:string = this.m_taskList[i++] as string;
								
							if (!(this.m_labels.has (__label))) {
								this.m_labels.set (__label, i);
							}
							else
							{
								throw (XType.createError ("duplicate label: " + __label));
							}
							
							break;	
						
						case XTask.CALL:
							i++;
							
							break;
						
						case XTask.CALL_EQ:
							i++;
							
							break;
						
						case XTask.CALL_NE:
							i++;
							
							break;
						
						case XTask.RETN:
							break;
						
						case XTask.LOOP:
							i++;
							
							break;
						
						case XTask.NEXT:
							break;
						
						case XTask.UNTIL:
							i++;
							
							break;
						
						case XTask.WAIT:
							i++;
							
							break;
						
						case XTask.WAIT1000:
							i++;
							
							break;
						
						case XTask.GOTO:
							i++;
							
							break;
						
						case XTask.BEQ:
							i++;
							
							break;
						
						case XTask.BNE:
							i++;
							
							break;
						
						case XTask.FLAGS:
							i++;
							
							break;
						
						case XTask.EXEC:
							i++;
							
							break;
						
						case XTask.EXEC_EQ:
							i++;
							
							break;
						
						case XTask.EXEC_NE:
							i++;
							
							break;
						
						case XTask.FUNC:
							i++;
							
							break;
						
						case XTask.POP:
							i++;
							
							break;
						
						case XTask.WAITX:
							i++;
							
							break;
						
						default:
							i = this.findMoreLabels (x, i);
							
							break;
					}
				}
			}
		}

		//------------------------------------------------------------------------------------------
		// sub-classes of XTask override this to implement more op-codes
		//
		// find more labels 
		//------------------------------------------------------------------------------------------
		public findMoreLabels (x:number, i:number):number {
			return i;
		}
		
		//------------------------------------------------------------------------------------------		
		// evaluate instructions
		//------------------------------------------------------------------------------------------	
		private __evalInstructions ():boolean {
			
			var value:any = this.m_taskList[this.m_taskIndex++];
			
			//------------------------------------------------------------------------------------------
			if (XType.isFunction (value)) {
				value ();
				
				return true;
			}
			
			//------------------------------------------------------------------------------------------
			switch (value as number) {
				//------------------------------------------------------------------------------------------
				
				//------------------------------------------------------------------------------------------
				case XTask.LABEL:
				//------------------------------------------------------------------------------------------
					var __label:string = this.m_taskList[this.m_taskIndex++] as string;
					
					if (!(this.m_labels.has (__label))) {
						this.m_labels.set (__label, this.m_taskIndex);
					}
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.WAIT:
				//------------------------------------------------------------------------------------------
					var __ticks:number = this.__evalNumber () * this.getXApp ().getFrameRateScale ();
					
					this.m_ticks += __ticks;
					
					if (this.m_ticks > 0x0080) {
						return false;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.WAITX:
				//------------------------------------------------------------------------------------------
					var __ticksX:number = this.__evalNumber ();
					
					this.m_ticks += __ticksX;
					
					if (this.m_ticks > 0x0080) {
						return false;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.WAIT1000:
				//------------------------------------------------------------------------------------------
					if (!this.m_WAIT1000) {
						this.m_time = this.m_XTaskSubManager.getManager ().getXApp ().getTime ();
						
						this.m_ticks += 0x0100;
						this.m_taskIndex--;
						
						this.m_WAIT1000 = true;
					}
					else
					{
						var __time:number = this.__evalNumber ();
						
						if (this.m_XTaskSubManager.getManager ().getXApp ().getTime () < this.m_time + __time) {
							this.m_ticks += 0x0100;
							this.m_taskIndex -= 2;
						}
						else
						{
							this.m_WAIT1000 = false;
							
							return true;
						}		
					}
					
					return false;
                    
                    break;

				//------------------------------------------------------------------------------------------					
				case XTask.LOOP:
				//------------------------------------------------------------------------------------------
					var __loopCount:number = this.__evalNumber ();
					
					this.m_loop[this.m_stackPtr] = __loopCount;
					this.m_stack[this.m_stackPtr++] = this.m_taskIndex;
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.NEXT:
				//------------------------------------------------------------------------------------------
					//		trace (": ", m_loop[m_stackPtr-1]);
					
					this.m_loop[this.m_stackPtr-1]--;
					
					if (this.m_loop[this.m_stackPtr-1] > 0) {	
						this.m_taskIndex = this.m_stack[this.m_stackPtr-1];
					}
					else
					{
						this.m_stackPtr--;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.UNTIL:
				//------------------------------------------------------------------------------------------
					var __funcUntil:any = this.m_taskList[this.m_taskIndex++] /* as Function */;
					
					__funcUntil (this.self);
					
					if ((this.m_flags & XTask._FLAGS_EQ) == 0) {	
						this.m_taskIndex = this.m_stack[this.m_stackPtr-1];
					}
					else
					{
						this.m_stackPtr--;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.GOTO:
				//------------------------------------------------------------------------------------------
					var __gotoLabel:string = this.m_taskList[this.m_taskIndex] as string;
					
					if (!(this.m_labels.has (__gotoLabel))) {
						throw (XType.createError ("goto: unable to find label: " + __gotoLabel));
					}
					
					this.m_taskIndex = this.m_labels.get(__gotoLabel);
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.CALL:
				//------------------------------------------------------------------------------------------
					this.callLabel ();
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.CALL_EQ:
				//------------------------------------------------------------------------------------------
					if ((this.m_flags & XTask._FLAGS_EQ) != 0) {
						this.callLabel ();
					} else {
						this.m_taskIndex++;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.CALL_NE:
				//------------------------------------------------------------------------------------------
					if ((this.m_flags & XTask._FLAGS_EQ) == 0) {
						this.callLabel ();
					} else {
						this.m_taskIndex++;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.RETN:
				//------------------------------------------------------------------------------------------					
                    this.m_stackPtr--;
					
					if (this.m_stackPtr < 0) {
						return false;
					}
					
					this.m_taskIndex = this.m_stack[this.m_stackPtr];
					
					break;
				
				//------------------------------------------------------------------------------------------					
				case XTask.POP:
				//------------------------------------------------------------------------------------------					
                    this.m_stackPtr--;

					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.BEQ:
				//------------------------------------------------------------------------------------------	
					var __beqLabel:string = this.m_taskList[this.m_taskIndex++] as string;
					
					if (!(this.m_labels.has (__beqLabel))) {
						throw (XType.createError ("goto: unable to find label: " + __beqLabel));
					}
					
					if ((this.m_flags & XTask._FLAGS_EQ) != 0) {
						this.m_taskIndex = this.m_labels.get(__beqLabel);
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.BNE:
				//------------------------------------------------------------------------------------------
					var __bneLabel:string = this.m_taskList[this.m_taskIndex++] as string;
					
					if (!(this.m_labels.has (__bneLabel))) {
						throw (XType.createError ("goto: unable to find label: " + __bneLabel));
					}
					
					if ((this.m_flags & XTask._FLAGS_EQ) == 0) {
						this.m_taskIndex = this.m_labels.get (__bneLabel);
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.FLAGS:
				//------------------------------------------------------------------------------------------
					var __funcFlags:any = this.m_taskList[this.m_taskIndex++]; /* as Function */
					
					__funcFlags (this.self);
					
					break;
				
				//------------------------------------------------------------------------------------------
				case XTask.FUNC:
				//------------------------------------------------------------------------------------------
					var __funcTask:any = this.m_taskList[this.m_taskIndex++]; /* as Function */
					
					__funcTask (this.self);
					
					break;
				
				//------------------------------------------------------------------------------------------
				// launch a sub-task and wait for it to finish before proceeding
				//------------------------------------------------------------------------------------------
				case XTask.EXEC:
					if (!this.execTask ()) {
						return false;
					}
						
					break;
				
				//------------------------------------------------------------------------------------------
				// launch a sub-task and wait for it to finish before proceeding
				//------------------------------------------------------------------------------------------
				case XTask.EXEC_EQ:
					if ((this.m_flags & XTask._FLAGS_EQ) != 0) {
						if (!this.execTask ()) {
							return false;
						}
					} else {
						this.m_subTask = null;
						
						this.m_taskIndex++;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				// launch a sub-task and wait for it to finish before proceeding
				//------------------------------------------------------------------------------------------
				case XTask.EXEC_NE:
					if ((this.m_flags & XTask._FLAGS_EQ) == 0) {
						if (!this.execTask ()) {
							return false;
						}
					} else {
						this.m_subTask = null;
						
						this.m_taskIndex++;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				// more op-codes
				//------------------------------------------------------------------------------------------
				default:
					if (!this.evalMoreInstructions (value as number)) {
						return false;
					}
					
					break;
				
				//------------------------------------------------------------------------------------------
				// end switch
				//------------------------------------------------------------------------------------------
			}
			
			//------------------------------------------------------------------------------------------
			// end evalInstructions
			//------------------------------------------------------------------------------------------
			return true;
		}
		
		
		//------------------------------------------------------------------------------------------
		// sub-classes of XTask override this to implement more op-codes
		//
		// evaluate more op-codes	
		//------------------------------------------------------------------------------------------
		public evalMoreInstructions (value:number):boolean {
			return true;
		}
		
		//------------------------------------------------------------------------------------------
		public setFlagsBool (__bool:boolean):void {
			if (__bool) {
				this.setFlagsEQ ();
			}
			else
			{
				this.setFlagsNE ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		public ifTrue (__bool:boolean):void {
			if (__bool) {
				this.setFlagsEQ ();
			}
			else
			{
				this.setFlagsNE ();
			}
		}
		
		//------------------------------------------------------------------------------------------
		public setFlagsEQ ():void {
			this.m_flags |= XTask._FLAGS_EQ;
		}
		
		//------------------------------------------------------------------------------------------
		public setFlagsNE ():void {
			this.m_flags &= ~XTask._FLAGS_EQ;
		}
		
		//------------------------------------------------------------------------------------------
		private __evalNumber ():number {
			var value:any = this.m_taskList[this.m_taskIndex++];
			
			if (typeof value == "number") {
				return value as number;
			}
			
			if (value instanceof XNumber) {
				var __number:XNumber = value as XNumber;
				
				return __number.value;
			}
			
			return 0;
		}

		//------------------------------------------------------------------------------------------
		public callLabel ():void {
			var __callLabel:string = this.m_taskList[this.m_taskIndex++] as string;
			
			this.m_stack[this.m_stackPtr++] = this.m_taskIndex;
			
			if (!(this.m_labels.has (__callLabel))) {
				throw (XType.createError ("call: unable to find label: " + __callLabel));
			}
			
			this.m_taskIndex = this.m_labels.get (__callLabel);			
		}
		
		//------------------------------------------------------------------------------------------
		public execTask ():boolean {
			if (this.m_subTask == null) {
				// get new XTask Array run it immediately
				this.m_subTask = this.addTask ((this.m_taskList[this.m_taskIndex] as Array<any>), true);
				this.m_subTask.tag = this.tag;
				this.m_subTask.setManager (this.m_manager);
				this.m_subTask.setParent (this.self);
				this.m_subTask.run ();
				this.m_taskIndex--;
			}
				
			// if the sub-task is still active, wait another tick and check again
			else if (this.m_XTaskSubManager.isTask (this.m_subTask)) {
				this.m_ticks += 0x0100;
				this.m_taskIndex--;
				return false;
			}
				// move along
			else
			{
				this.m_subTask = null;
				this.m_taskIndex++;
			}
			
			return true;
		}
								  
		//------------------------------------------------------------------------------------------
		public gotoTask (__taskList:Array<any>, __findLabelsFlag:boolean = false):void {
			this.kill ();
			
			this.__reset (__taskList, __findLabelsFlag);
			
			this.setManager (this.m_manager);
		}
		
		//------------------------------------------------------------------------------------------
		public addTask (
			__taskList:Array<any>,
			__findLabelsFlag:boolean = true
		):XTask {
			
			return this.m_XTaskSubManager.addTask (__taskList, __findLabelsFlag);
		}
		
		//------------------------------------------------------------------------------------------
		public changeTask (
			__task:XTask,
			__taskList:Array<any>,
			__findLabelsFlag:boolean = true
		):XTask {
			
			return this.m_XTaskSubManager.changeTask (__task, __taskList, __findLabelsFlag);
		}
		
		//------------------------------------------------------------------------------------------
		public isTask (__task:XTask):boolean {
			return this.m_XTaskSubManager.isTask (__task);
		}		
		
		//------------------------------------------------------------------------------------------
		public removeTask (__task:XTask):void {
			this.m_XTaskSubManager.removeTask (__task);	
		}
		
		//------------------------------------------------------------------------------------------
		public removeAllTasks ():void {
			this.m_XTaskSubManager.removeAllTasks ();
		}
		
		//------------------------------------------------------------------------------------------
		public addEmptyTask ():XTask {
			return this.m_XTaskSubManager.addEmptyTask ();
		}

		//------------------------------------------------------------------------------------------
		public getEmptyTaskX ():Array<any> {
			return this.m_XTaskSubManager.getEmptyTaskX ();
		}	
		
		//------------------------------------------------------------------------------------------
		public gotoLogic (__logic:any):void {
			this.m_XTaskSubManager.gotoLogic (__logic);
		}
		
		//------------------------------------------------------------------------------------------
		// end class		
		//------------------------------------------------------------------------------------------
    }