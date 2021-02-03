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
import { XGameInstance } from './XGameInstance';
import { G } from '../app/G';

//------------------------------------------------------------------------------------------
export class XState extends XGameObject {
    public m_gameInstance:XGameInstance;
	public m_resizeListenerID:number;

//------------------------------------------------------------------------------------------	
	constructor () {
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

		this.m_resizeListenerID = this.m_XApp.addWindowResizeListener (this.resize.bind (this));
		this.resize ();

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
		super.cleanup ();

		this.m_XApp.removeWindowResizeListener (this.m_resizeListenerID);

		this.world.getMusicSoundManager ().removeAllSounds ();
		this.world.getSFXSoundManager ().removeAllSounds ();
	}

//------------------------------------------------------------------------------------------
	public resize ():void {
		this.m_XApp.getRenderer ().resize (this.m_XApp.getWindowWidth (), this.m_XApp.getWindowHeight ());

		//------------------------------------------------------------------------------------------
		// scale the entire stage
		//------------------------------------------------------------------------------------------		
		this.m_XApp.getStage ().scale.x = 1.0;
		this.m_XApp.getStage ().scale.y = 1.0;

		var i:number;

		for (i=0; i<XWorld.MAX_LAYERS; i++) {
			var __x:number = 0;
			var __y:number = 0;

			var __screenWidth:number = this.m_XApp.getScreenWidth ();
			var __screenHeight:number = this.m_XApp.getScreenHeight ();

			var __scaleX:number = this.m_XApp.getCanvasWidth () / __screenWidth;
			var __scaleY:number = this.m_XApp.getCanvasHeight () / __screenHeight;

			var __scaleRatio:number = Math.max (__scaleX, __scaleY);
				
			__x = (this.m_XApp.getCanvasWidth () - __screenWidth * __scaleRatio) / 2;
			__y = (this.m_XApp.getCanvasHeight () - __screenHeight * __scaleRatio) / 2;

			this.scaleLayer (i, __x, __scaleRatio, __y, __scaleRatio);
		}
	}

//------------------------------------------------------------------------------------------
	public scaleLayer (__layerNum:number, __x:number, __scaleX:number, __y:number, __scaleY:number):void {
		var __layer:XSpriteLayer = this.world.getLayer (__layerNum);

		__layer.x = __x;
		__layer.y = __y;
		__layer.scale.x = __scaleX * G.scaleRatio;
		__layer.scale.y = __scaleY * G.scaleRatio;
	}

//------------------------------------------------------------------------------------------
    public getGameInstance ():XGameInstance {
		return this.m_gameInstance;
	}
		
//------------------------------------------------------------------------------------------
	public setGameInstance (__gameInstance:XGameInstance):XGameObject {
		this.m_gameInstance = __gameInstance;
			
		return this;
    }
        
//------------------------------------------------------------------------------------------
}