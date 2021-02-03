//------------------------------------------------------------------------------------------
    import { XTask } from './XTask';
    import { XTaskManager} from './XTaskManager';
    import { XObjectPoolManager } from '../pool/XObjectPoolManager';
    
//------------------------------------------------------------------------------------------	
	export class XTaskSubManager {
		public m_manager:XTaskManager;
		
		private m_XTasks:Map<XTask, number>; 
		
//------------------------------------------------------------------------------------------
		constructor (__manager:XTaskManager) {
			this.m_manager = __manager;
			
			this.m_XTasks = new Map<XTask, number> (); 
		}

//------------------------------------------------------------------------------------------
		public setup ():void {
		}	
		
//------------------------------------------------------------------------------------------
		public cleanup ():void {
			this.removeAllTasks ();
		}

//------------------------------------------------------------------------------------------
		public getManager ():XTaskManager {
			return this.m_manager;
		}
				
//------------------------------------------------------------------------------------------
		public setManager (__manager:XTaskManager):void {
			this.m_manager = __manager;
		}
		
//------------------------------------------------------------------------------------------
		public addTask (
			__taskList:Array<any> ,
			__findLabelsFlag:boolean = true
			):XTask {
				
			var __task:XTask = this.m_manager.addTask (__taskList, __findLabelsFlag);
			
			if (!(this.m_XTasks.has (__task))) {
				this.m_XTasks.set (__task, 0);
			}
			
			return __task;
		}
		
//------------------------------------------------------------------------------------------
		public addXTask (__task:XTask):XTask {
			var __task:XTask = this.m_manager.addXTask (__task);
			
			if (!this.m_XTasks.has (__task)) {
				this.m_XTasks.set (__task, 0);
			}
			
			return __task;			
		}
		
//------------------------------------------------------------------------------------------
		public changeTask (
			__oldTask:XTask,
			__taskList:Array<any>,
			__findLabelsFlag:boolean = true
			):XTask {
				
			if (!(__oldTask == null)) {
				this.removeTask (__oldTask);
			}
					
			return this.addTask (__taskList, __findLabelsFlag);
		}

//------------------------------------------------------------------------------------------
		public changeXTask (
			__oldTask:XTask,
			__newTask:XTask
			):XTask {
				
			if (!(__oldTask == null)) {
				this.removeTask (__oldTask);
			}
					
			return this.addXTask (__newTask);
		}
		
//------------------------------------------------------------------------------------------
		public isTask (__task:XTask):boolean {
			return this.m_XTasks.has (__task);
		}		

//------------------------------------------------------------------------------------------
		public removeTask (__task:XTask):void {	
			if (this.m_XTasks.has (__task)) {
				this.m_XTasks.delete (__task);
					
				this.m_manager.removeTask (__task);
			}
		}

//------------------------------------------------------------------------------------------
		public removeAllTasks ():void {	
            var __task:XTask;

            for (__task of this.m_XTasks.keys ()) {
				this.removeTask (__task);
			}
		}

//------------------------------------------------------------------------------------------
		public addEmptyTask ():XTask {
			return this.addTask (this.getEmptyTaskX ());
		}
			
//------------------------------------------------------------------------------------------
		public getEmptyTaskX ():Array<any> {
			return [
				XTask.LABEL, "loop",
					XTask.WAIT, 0x0100,
					
					XTask.GOTO, "loop",
				
				XTask.RETN,
			];
		}	
		
//------------------------------------------------------------------------------------------
		public gotoLogic (__logic:any):void {
			this.removeAllTasks ();
			
			__logic ();
		}
		
//------------------------------------------------------------------------------------------
	}
	
//------------------------------------------------------------------------------------------
// }
