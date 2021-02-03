//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy';
import { XSprite } from '../sprite/XSprite';
import { XWorld } from '../sprite/XWorld';
import { XGameObject} from '../gameobject/XGameObject';
import { XTask } from "../task/XTask";
import { XSignal } from '../signals/XSignal';
import { XApp } from '../app/XApp';
import { XType } from '../type/XType';

//------------------------------------------------------------------------------------------
export class XButton extends XGameObject {
	public m_sprite:PIXI.Container;
	public m_mouseDownSignal:XSignal;
	public m_mouseUpSignal:XSignal;
	public m_mouseOutSignal:XSignal;

	public static NORMAL_STATE:number = 0;
	public static OVER_STATE:number = 1;
	public static DOWN_STATE:number = 2;
	public static SELECTED_STATE:number = 3;
	public static DISABLED_STATE:number = 4;
				
	public m_label:number;
	public m_currState:number;
	public m_disabledFlag:boolean;
    public m_keyboardDownListener:number;

//------------------------------------------------------------------------------------------
	public constructor () {
		super ();
	}

//------------------------------------------------------------------------------------------
    public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
        super.setup (__world, __layer, __depth);

        return this;
    }

//------------------------------------------------------------------------------------------
    public afterSetup (__params:Array<any> = null):XGameObject {
        super.afterSetup (__params);

		this.getParams (__params);

        this.m_mouseDownSignal = this.createXSignal ();	
        this.m_mouseOutSignal = this.createXSignal ();
        this.m_mouseUpSignal = this.createXSignal ();
        
        this.createSprites ();
        
        this.m_sprite.interactive = true;
        this.m_sprite.interactiveChildren = true;
        
        this.m_disabledFlag = false;
        
        this.setupListeners ();
        
        this.gotoState (this.getNormalState ());
        
        this.m_currState = this.getNormalState ();
    
        this.createHighlightTask ();	

        return this;
    }

//------------------------------------------------------------------------------------------
    public cleanup ():void {
        super.cleanup ();

        this.cleanupListeners ();
    }

//------------------------------------------------------------------------------------------
	public setupListeners ():void {		
	    this.addTask ([
			() => {
				this.addPausableEventListener ("pointerover", this.m_sprite, this.onMouseOver.bind (this));
				this.addPausableEventListener ("pointerdown", this.m_sprite, this.onMouseDown.bind (this));
				this.addPausableEventListener ("pointermove", this.m_sprite, this.onMouseMove.bind (this));
				this.addPausableEventListener ("pointerup", this.m_sprite, this.onMouseUp.bind (this));
				this.addPausableEventListener ("pointerout", this.m_sprite, this.onMouseOut.bind (this));
				this.addPausableEventListener ("pointerupoutside", this.m_sprite, this.onMouseOut.bind (this));
			},
				
			XTask.RETN,
		]);
	}
		
//------------------------------------------------------------------------------------------
	public cleanupListeners ():void {
       this.m_mouseDownSignal.removeAllListeners ();
       this.m_mouseUpSignal.removeAllListeners ();
       this.m_mouseOutSignal.removeAllListeners ();
	}

//------------------------------------------------------------------------------------------
	public getParams (__params:Array<any> = null):void {
	}
	
//------------------------------------------------------------------------------------------
	public createHighlightTask ():void {
	}
		
//------------------------------------------------------------------------------------------
	public addMouseUpEventListener (__listener:any):void {
		this.m_sprite.on ("pointerup", __listener);
	}

//------------------------------------------------------------------------------------------
	public __onMouseOver ():void {	
		if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (XButton.OVER_STATE);
			
		this.m_currState = XButton.OVER_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public  __onMouseDown ():void {	
		if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (XButton.DOWN_STATE);	
			
		this.m_currState = XButton.DOWN_STATE;
			
		this.fireMouseDownSignal ();
	}

//------------------------------------------------------------------------------------------
	public __onMouseUp ():void {
		if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();
			
		this.fireMouseUpSignal ();			
	}
		
//------------------------------------------------------------------------------------------
	public __onMouseMove ():void {
	}
		
//------------------------------------------------------------------------------------------
	public __onMouseOut ():void {
	    if (this.m_disabledFlag) {
			return;
		}
			
		this.gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();
			
		this.fireMouseOutSignal ();
	}
		
//------------------------------------------------------------------------------------------
	public onMouseOver (e:PIXI.InteractionData):void {
		this.__onMouseOver ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionData):void {
		this.__onMouseDown ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseUp (e:PIXI.InteractionData):void {
		this.__onMouseUp ();
	}			

//------------------------------------------------------------------------------------------
	public onMouseMove (e:PIXI.InteractionData):void {	
		this.__onMouseMove ();
	}			
		
//------------------------------------------------------------------------------------------	
	public onMouseOut (e:PIXI.InteractionData):void {
		this.__onMouseOut ();
	}			

//------------------------------------------------------------------------------------------
	public setNormalState ():void {
		this.gotoState (this.getNormalState ());
			
		this.m_currState = this.getNormalState ();		
	}

//------------------------------------------------------------------------------------------
	public getNormalState ():number {
		return XButton.NORMAL_STATE;
	}
		
//------------------------------------------------------------------------------------------
	public isDisabled ():boolean {
		return this.m_disabledFlag;
	}
			
//------------------------------------------------------------------------------------------
	public setDisabled (__disabled:boolean):void {
		if (__disabled) {
			this.gotoState (XButton.DISABLED_STATE);
							
			this.m_disabledFlag = true;
		} else {
			this.setNormalState ();
				
			this.m_disabledFlag = false;
		}
	}
		
//------------------------------------------------------------------------------------------
// create sprites
//------------------------------------------------------------------------------------------
	public createSprites ():void {
	}

//------------------------------------------------------------------------------------------
	public gotoState (__label:number):void {
		this.m_label = __label;
	}
		
//------------------------------------------------------------------------------------------
	public addMouseDownListener (__listener:any):number {
		return this.m_mouseDownSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public fireMouseDownSignal ():void {
		this.m_mouseDownSignal.fireSignal ();
	}
						
//------------------------------------------------------------------------------------------
	public addMouseUpListener (__listener:any):number {
		return this.m_mouseUpSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeMouseUpListener (__id:number):void {
		this.m_mouseUpSignal.removeListener (__id);
	}

//------------------------------------------------------------------------------------------
	public fireMouseUpSignal ():void {
		this.m_mouseUpSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addMouseOutListener (__listener:any):number {
		return this.m_mouseOutSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public fireMouseOutSignal ():void {
		this.m_mouseOutSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------	
}
	
