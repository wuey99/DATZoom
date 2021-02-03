//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../app/XApp';
import { XGameObject} from '../gameobject/XGameObject';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class PausableListener {
    public m_eventName:string;
    public m_displayObject:PIXI.DisplayObject;
	public m_listener:any;
	public boundListener:any;

	//------------------------------------------------------------------------------------------
	constructor (__eventName:string, __displayObject:PIXI.DisplayObject, __listener:any) {
        this.m_eventName = __eventName;
        this.m_displayObject = __displayObject;
		this.m_listener = __listener;

		this.m_displayObject.on (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		this.m_displayObject.off (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	private __listener (e:PIXI.InteractionEvent):void {
		if (!XGameObject.getXApp ().isPaused ()) {
			this.m_listener (e);
		}
	}

//------------------------------------------------------------------------------------------
}