//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../app/XApp';
import { XSprite } from '../sprite/XSprite';
import { XSpriteLayer } from '../sprite/XSpriteLayer';
import { XSignal } from '../signals/XSignal';
import { XSignalManager } from '../signals/XSignalManager';
import { world } from '../../scripts/app';
import { XTask } from '../task/XTask';
import { XTaskManager} from '../task/XTaskManager';
import { XTaskSubManager} from '../task/XTaskSubManager';
import { XWorld} from '../sprite/XWorld';
import { XType } from '../type/XType';
import { XGameObject} from '../gameobject/XGameObject';
import { XState } from './XState';
import { XSoundManager } from '../sound/XSoundManager';
import { XSoundSubManager } from '../sound/XSoundSubManager';

//------------------------------------------------------------------------------------------
export class XGameInstance {
    public m_states:Map<string, any>;
    public m_gameStateObject:XState;

    public world:XWorld;

    public static g_XApp:XApp;

	public m_triggerSignal:XSignal;
	public m_triggerXSignal:XSignal;
	public m_pingSignal:XSignal;

//------------------------------------------------------------------------------------------	
	constructor () {
        this.m_states = new Map<string, any> ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld):void {
		this.world = __world;

		this.m_triggerSignal = new XSignal ();
		this.m_triggerXSignal = new XSignal ();
		this.m_pingSignal = new XSignal ();
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.m_triggerSignal.removeAllListeners ();
		this.m_triggerXSignal.removeAllListeners ();
		this.m_pingSignal.removeAllListeners ();
	}
    
	//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XGameInstance.g_XApp = __XApp;
	}
		
	//------------------------------------------------------------------------------------------
	public getXApp ():XApp {
		return XGameInstance.g_XApp;
	}
            
	//------------------------------------------------------------------------------------------
	public registerState (__name:string, __class:any):void {
		if (!this.m_states.has (__name)) {
			this.m_states.set (__name, __class);
		}
	}
		
	//------------------------------------------------------------------------------------------
	public unregisterState (__name:string):void {
		if (this.m_states.has (__name)) {
			this.m_states.delete (__name);
		}
	}
		
	//------------------------------------------------------------------------------------------
	public getGameStateObject ():XState {
		return this.m_gameStateObject;
	} 

	//------------------------------------------------------------------------------------------
	public gotoState (__name:string, __params:Array<any> = null, __layer:number = 0, __depth:number = 0.0):XGameObject {
		if (this.m_states.has (__name)) {
			var __class:any = this.m_states.get (__name);
				
			if (this.m_gameStateObject != null) {
				this.m_gameStateObject.nuke ();

				this.m_gameStateObject = null;
			}
				
			this.getXApp ().getXTaskManager ().addTask ([
				XTask.WAIT, 0x0100,
					
				() => {
					this.m_gameStateObject = this.world.addGameObject (__class, __layer, __depth) as XState;
                    this.m_gameStateObject.afterSetup (__params);

					this.m_gameStateObject.setGameInstance (this);

					this.m_gameStateObject.addKillListener (() => {
						this.m_gameStateObject = null;
                    });
				},
					
				XTask.RETN,
			]);
				
			return this.m_gameStateObject;
		}
			
		return null;
    }
		
	//------------------------------------------------------------------------------------------
	public fireTriggerSignal (__trigger:number):void {
		this.m_triggerSignal.fireSignal (__trigger);
	}
		
	//------------------------------------------------------------------------------------------
	public addTriggerListener (__listener:any):number {
		return this.m_triggerSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeTriggerListener (__id:number):void {
		this.m_triggerSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public fireTriggerXSignal (__trigger:String):void {
		this.m_triggerXSignal.fireSignal (__trigger);
	}
		
	//------------------------------------------------------------------------------------------
	public addTriggerXListener (__listener:any):number {
		return this.m_triggerXSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removeTriggerXListener (__id:number):void {
		this.m_triggerXSignal.removeListener (__id);
	}
		
	//------------------------------------------------------------------------------------------
	public addPingListener (__listener:any):number {
		return this.m_pingSignal.addListener (__listener);
	}
		
	//------------------------------------------------------------------------------------------
	public removePingListener (__id:number):void {
		this.m_pingSignal.removeListener (__id);
	}

	//------------------------------------------------------------------------------------------
	public firePingSignal (
		__id:number,
		__type:String,
		__logicObject:XGameObject,
		__listener:any
	):void {
		this.m_pingSignal.fireSignal (__id, __type, __logicObject, __listener);
	}

//------------------------------------------------------------------------------------------
}