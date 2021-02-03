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
import { XDepthSprite} from '../sprite/XDepthSprite';
import { XType } from '../type/XType';
import { World, Body, Engine } from 'matter-js';
import * as Matter from 'matter-js';
import { XRect } from '../geom/XRect';
import { XPoint } from '../geom/XPoint';
import { G } from '../app/G';
import { XState } from '../state/XState';
import { PausableListener} from '../events/PausableListener';
import { XTextSprite } from '../sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';

//------------------------------------------------------------------------------------------
export class XGameObject extends PIXI.Sprite {
	public m_selfObjects:Map<XGameObject, number>;	
	public m_worldObjects:Map<XGameObject, number>;
	public m_childObjects:Map<XGameObject, number>;
	public m_selfSprites:Map<PIXI.DisplayObject, number>;
	public m_childSprites:Map<PIXI.DisplayObject, number>;
	public m_worldSprites:Map<PIXI.DisplayObject, number>;	
	public m_animatedSprites:Map<string, PIXI.AnimatedSprite>;
	public m_textSprites:Map<string, XTextSprite>;
	public m_sprites:Map<string, PIXI.Sprite>;
	public m_signals:Map<XSignal, number>;
	public m_bitmapFonts:Map<string, number>;
	public m_XTaskSubManager:XTaskSubManager;
	public m_killSignal:XSignal;
	public m_parent:XGameObject;
	public m_XApp:XApp;
	public world:XWorld;
	public m_layer:number;
	public m_depth:number;
	public m_propagateDepthFlag:boolean;
	public m_isDead:boolean;
	public m_cleanedUp:boolean;
	public m_delayed:number;
	public m_masterScaleRatio:number;
	public m_flipX:number;
	public m_flipY:number;
	public m_masterFlipX:number;
	public m_masterFlipY:number;
	public m_cx:XRect;
	public m_namedCX:Map<string, XRect>;
	public m_pos:XPoint;
	public m_vel:XPoint;
	public m_propagateCount:number;

	public m_attachedMatterBody:Body;
	public m_attachedDebugSprite:PIXI.Sprite;
	public m_matterDX:number;
	public m_matterDY:number;
	public m_matterRotate:boolean;

	public m_mousePoint:XPoint;
	public m_touchPoint:XPoint;

	public static g_XApp:XApp;

	public m_stageEvents:Map<any, string>;
	public m_stageEventsX:Map<any, __PausableListener>;
	public m_pausableEvents:Map<any, PausableListener>;

	public m_poolClass:any;

	public m_paramIndex:number;

//------------------------------------------------------------------------------------------	
	constructor () {
		super ();

		this.m_worldObjects = new Map<XGameObject, number> ();
		this.m_childObjects = new Map<XGameObject, number> ();
		this.m_selfObjects = new Map<XGameObject, number> ();
		this.m_selfSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_childSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_worldSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_animatedSprites = new Map<string, PIXI.AnimatedSprite> ();
		this.m_textSprites  = new Map<string, XTextSprite> ();
		this.m_sprites = new Map<string, PIXI.Sprite> ();	
		this.m_signals = new Map<XSignal, number> ();
		this.m_bitmapFonts = new Map<string, number> ();
		this.m_XTaskSubManager = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager ());
		this.m_parent = null;
		this.m_XApp = XGameObject.g_XApp;
		this.m_killSignal = this.createXSignal ();
		this.m_cx = new XRect ();
		this.m_pos = new XPoint ();
		this.m_vel = new XPoint ();
		this.m_mousePoint = new XPoint ();
	}
	
//------------------------------------------------------------------------------------------
	public setup (__world:XWorld, __layer:number, __depth:number):XGameObject {
		this.m_masterScaleX = this.m_masterScaleY = 1.0;
		this.m_masterFlipX = this.m_masterFlipY = 1.0;
		this.m_masterX = this.m_masterY = 0;
		this.m_masterRotation = 0;
		this.m_masterVisible = true;
		this.m_masterDepth = 0;
		this.m_masterAlpha = 1.0;
		this.m_masterScaleRatio = 1.0;
		
		this.m_flipX = 1.0;
		this.m_flipY = 1.0;
		
		this.m_delayed = 1;
		
		this.world = __world;
		this.m_layer = __layer;
		this.m_depth = __depth;
		this.m_propagateDepthFlag = false;
		
		this.m_isDead = false;
		this.m_cleanedUp = false;
		
		this.m_poolClass = null;

		/*
		this.m_worldObjects = new Map<XGameObject, number> ();
		this.m_childObjects = new Map<XGameObject, number> ();
		this.m_selfObjects = new Map<XGameObject, number> ();
		this.m_selfSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_childSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_worldSprites = new Map<PIXI.DisplayObject, number> ();
		this.m_animatedSprites = new Map<string, PIXI.AnimatedSprite> ();
		this.m_sprites = new Map<string, PIXI.Sprite> ();	
		this.m_signals = new Map<XSignal, number> ();
		this.m_bitmapFonts = new Map<string, number> ();
		this.m_XTaskSubManager = new XTaskSubManager (XGameObject.getXApp ().getXTaskManager ());
		this.m_parent = null;
		this.m_XApp = XGameObject.g_XApp;
		this.m_killSignal = this.createXSignal ();
		this.m_mousePoint = new XPoint ();
		this.m_cx = new XRect ();
		this.m_pos = new XPoint ();
		this.m_vel = new XPoint ();
		*/

		this.alpha = 1.0;
		this.scale.x = this.scale.y = 1.0;
		this.pivot.x = this.pivot.y = 1.0;

		this.m_attachedMatterBody = null;
		this.m_matterDX = 0;
		this.m_matterDY = 0;
		this.m_matterRotate = true;

		this.m_stageEvents = new Map<any, string> ();
		this.m_stageEventsX = new Map<any, __PausableListener> ();
		this.m_pausableEvents = new Map<any, PausableListener> ();

		this.m_cx.x = 0;
		this.m_cx.y = 0;
		this.m_cx.width = 0;
		this.m_cx.height = 0;

		this.m_namedCX = new Map<string, XRect> ()
		
		this.m_propagateCount = -1;

		this.m_paramIndex = 0;
	
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public afterSetup (__params:Array<any> = null):XGameObject {	
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup():void {
		this.removeAllTasks ();
		this.removeAllSelfObjects ();
		this.removeAllWorldObjects ();
		this.removeAllChildObjects ();
		this.removeAllSelfSprites ();
		this.removeAllChildSprites ();
		this.removeAllWorldSprites ();
		this.removeAllXSignals ();
		this.removeAllAnimatedSprites ();
		this.removeAllXTextSprites ();
		this.removeAllSprites ();
		this.removeAllStageEvents ();
		this.removeAllStageEventsX ();
		this.removeAllPausableEvents ();
		this.removeAllBitmapFonts ();

		if (this.getParentObject () != null) { 
			this.getParentObject ().removeSelfObject0 (this);
			this.getParentObject ().removeWorldObject0 (this);
			this.getParentObject ().removeChildObject0 (this);
		}
			
		this.detachMatterBody ();

		this.fireKillSignal();
		
		if (this.m_poolClass != null) {
			this.world.getXLogicObjectPoolManager ().returnObject (this.m_poolClass, this);
		}

		this.m_isDead = true;
		this.m_cleanedUp = true;
	}
	
//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (delayed)
//------------------------------------------------------------------------------------------
	public killLater ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}

//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (now)
//------------------------------------------------------------------------------------------
	public kill ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}
		
//------------------------------------------------------------------------------------------
// kill this object and remove it from the World (now)
//------------------------------------------------------------------------------------------
	public nukeLater ():void {
		this.nuke ();
	}

//------------------------------------------------------------------------------------------
	public nuke ():void {
		this.m_isDead = true;
		
		if (this.world != null) {
			this.world.killLater (this);
		}
	}
	
//------------------------------------------------------------------------------------------
	public addKillListener (__listener:any ):number {
		return this.m_killSignal.addListener (__listener);
	}
		
//------------------------------------------------------------------------------------------
	public fireKillSignal ():void {
		this.m_killSignal.fireSignal ();
	}

//------------------------------------------------------------------------------------------
	public addStageEventListener (__eventName:string, __listener:any):any {
		this.m_XApp.getStage ().on (__eventName, __listener);

		this.m_stageEvents.set (__listener, __eventName);

		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removeStageEventListener (__listener:any):any {
		var __eventName:string = this.m_stageEvents.get (__listener);

		this.m_XApp.getStage ().off (__eventName, __listener);

		this.m_stageEvents.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllStageEvents ():void {
		XType.forEach (this.m_stageEvents,
			(__listener:any) => {
				this.removeStageEventListener (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public addStageEventListenerX (__eventName:string, __listener:any):any {
		var __pausableListener:__PausableListener = new __PausableListener (__eventName, __listener);

		this.m_stageEventsX.set (__listener, __pausableListener);
		
		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removeStageEventListenerX (__listener:any):any {
		var __pausableListener:__PausableListener = this.m_stageEventsX.get (__listener);
		__pausableListener.cleanup ();

		this.m_stageEventsX.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllStageEventsX ():void {
		XType.forEach (this.m_stageEventsX,
			(__listener:any) => {
				this.removeStageEventListenerX (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public addPausableEventListener (__eventName:string, __displayObject:PIXI.DisplayObject, __listener:any):any {
		var __pausableListener:PausableListener = new PausableListener (__eventName, __displayObject, __listener);

		this.m_pausableEvents.set (__listener, __pausableListener);
		
		return __listener;
	}

//------------------------------------------------------------------------------------------
	public removePausableEventListener (__listener:any):any {
		var __pausableListener:PausableListener = this.m_pausableEvents.get (__listener);
		__pausableListener.cleanup ();

		this.m_pausableEvents.delete (__listener);
	}

//------------------------------------------------------------------------------------------
	public removeAllPausableEvents ():void {
		XType.forEach (this.m_pausableEvents,
			(__listener:any) => {
				this.removePausableEventListener (__listener);				
			}
		);
	}

//------------------------------------------------------------------------------------------
	public static setXApp (__XApp:XApp):void {
		XGameObject.g_XApp = __XApp;
	}

//------------------------------------------------------------------------------------------
    public static getXApp ():XApp {
        return XGameObject.g_XApp;
    }

//------------------------------------------------------------------------------------------
	public getGameStateObject ():XState {
		return G.appX.getGameStateObject ();
	}

//------------------------------------------------------------------------------------------
    public getMousePos ():XPoint {
		var __point:XPoint = this.m_XApp.getMousePos ();

        this.m_mousePoint.x = __point.x;
        this.m_mousePoint.y = __point.y;
		
		this.globalToLocal (this, this.m_mousePoint);

        return this.m_mousePoint;
	}

    //------------------------------------------------------------------------------------------
    public getTouchPos ():XPoint {
		var __point:XPoint = this.m_XApp.getTouchPos ();

        this.m_touchPoint.x = __point.x;
        this.m_touchPoint.y = __point.y;
		
		this.globalToLocal (this, this.m_touchPoint);

        return this.m_touchPoint;
	}
	
//------------------------------------------------------------------------------------------
	public getVerticalPercent (__percent:number):number {
		return this.getActualHeight () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercent (__displayObject:PIXI.Sprite | TextInput, __percent:number):XGameObject {
		var __y:number = (this.getActualHeight () - (__displayObject.height - __displayObject.pivot.y)) * __percent;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public verticalPercentCentered (__displayObject:PIXI.Sprite | TextInput, __percent:number):XGameObject {
		var __y:number = this.getActualHeight () * __percent;
			
		__displayObject.y = __y;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public getHorizontalPercent (__percent:number):number {
		return this.getActualWidth () * __percent;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercent (__displayObject:PIXI.Sprite | TextInput, __percent:number):XGameObject {
		var __x:number = (this.getActualWidth () - (__displayObject.width - __displayObject.pivot.x)) * __percent;
			
		__displayObject.x = __x;
			
		return this;
	}
		
//------------------------------------------------------------------------------------------
	public horizontalPercentCentered (__displayObject:PIXI.Sprite | TextInput, __percent:number):XGameObject {
		var __x:number = this.getActualWidth () * __percent;
			
		__displayObject.x = __x;
			
		return this;
	}

//------------------------------------------------------------------------------------------
	public setCollisions ():void {
	}

//------------------------------------------------------------------------------------------
	public getPos ():XPoint {
		this.m_pos.x = this.x;
		this.m_pos.y = this.y;

		return this.m_pos;
	}

//------------------------------------------------------------------------------------------
	public setCX (
		__x1:number,
		__x2:number,
		__y1:number,
		__y2:number
		):void {
			
		this.m_cx.x = __x1;
		this.m_cx.y = __y1;
		this.m_cx.width = __x2 - __x1 + 1;
		this.m_cx.height = __y2 - __y1 + 1;
	}

//------------------------------------------------------------------------------------------
	public getCX ():XRect {
		return this.m_cx;
	}

//------------------------------------------------------------------------------------------
	public setNamedCX (
		__name:string,
		__x1:number,
		__x2:number,
		__y1:number,
		__y2:number
		):void {
			
		this.m_namedCX.set (__name, new XRect (__x1, __y1, __x2 - __x1 + 1, __y2 - __y1 + 1));
	}

//------------------------------------------------------------------------------------------
	public getNamedCX (__name:string):XRect {
		return this.m_namedCX.get (__name).cloneX ();
	}

//------------------------------------------------------------------------------------------
	public setPivot (__dx:number, __dy:number):void {
	}

//------------------------------------------------------------------------------------------
	public isWorldGameObject (__gameObject:XGameObject):boolean {
		return this.m_worldObjects.has (__gameObject);
	}
	
//------------------------------------------------------------------------------------------
	public createAnimatedSprite (__name:string):PIXI.AnimatedSprite {	
		var sheet:PIXI.Spritesheet = world.getResourceByName (__name);

		var __animatedSprite:PIXI.AnimatedSprite = new PIXI.AnimatedSprite (sheet.animations["root"]);
		__animatedSprite.visible = false;
		this.m_animatedSprites.set (__name, __animatedSprite);
			
		return __animatedSprite;
	}

//------------------------------------------------------------------------------------------
	public removeAllAnimatedSprites ():void {
		var __name:string;

		for (__name of this.m_animatedSprites.keys ()) {
			var __animatedSprite:PIXI.AnimatedSprite = this.m_animatedSprites.get (__name);

			__animatedSprite.destroy ();
		}

		this.m_animatedSprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public createSprite (__name:string):PIXI.Sprite {
		var __texture:PIXI.Texture = world.getResourceByName (__name);
		var __sprite:PIXI.Sprite = PIXI.Sprite.from (__texture);

		this.m_sprites.set (__name, __sprite);

		return __sprite;
	}

//------------------------------------------------------------------------------------------
	public removeAllSprites ():void {
		var __name:string;

		for (__name of this.m_sprites.keys ()) {
			var __sprite:PIXI.Sprite = this.m_sprites.get (__name);

			__sprite.destroy ();
		}

		this.m_sprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public createXTextSprite (
		__width:number=32,
		__height:number=32,
		__text:string="",
		__fontName:string="Aller",
		__fontSize:number=12,
		__color:number=0x000000,
		__bold:boolean=false,
		__horzAlign:string="left",
		__vertAlign:string="top"
	):XTextSprite {

		var __textSprite:XTextSprite = new XTextSprite (
			__width,
			__height,
			__text,
			__fontName,
			__fontSize,
			__color,
			__bold,
			__horzAlign,
			__vertAlign
		);

		return __textSprite;
	}

	//------------------------------------------------------------------------------------------
	public removeAllXTextSprites ():void {
		var __name:string;

		for (__name of this.m_textSprites.keys ()) {
			var __textSprite:XTextSprite = this.m_textSprites.get (__name);
			__textSprite.cleanup ();
		}

		this.m_textSprites.clear ();
	}

//------------------------------------------------------------------------------------------
	public addGameObjectToSelf (__class:any):XGameObject {
		var __gameObject:XGameObject = XType.createInstance (__class) as XGameObject;
		__gameObject.setup (this.world, this.getLayer(), this.getDepth());
		
		__gameObject.setParent (this);
		
		this.addChild (__gameObject);
		
		this.m_selfObjects.set (__gameObject, 0);
		
		return __gameObject;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addGameObject (__class, __layer, __depth);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public addPooledGameObjectToWorld (__class:any, __layer:number = 0, __depth:number = 0.0):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledGameObject (__class, __layer, __depth);
			
			this.m_worldObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public addGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addChildObject (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}
	
//------------------------------------------------------------------------------------------
	public addPooledGameObjectAsChild (__class:any, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):XGameObject {
		if (this.world != null) {
			var __gameObject = this.world.addPooledChildObject (__class, __layer, __depth, __visible);
			__gameObject.setParentObject (this);

			this.m_childObjects.set (__gameObject, 0);
			
			return __gameObject;
		}
		
		return null;
	}

//------------------------------------------------------------------------------------------
	public getParentObject ():XGameObject {
		return this.m_parent;
	}
	
//------------------------------------------------------------------------------------------
	public setParentObject (__parent:XGameObject):void {
		this.m_parent = __parent;
	}
	
	//------------------------------------------------------------------------------------------
	public setPoolClass (__class:any):void {
		this.m_poolClass = __class;
	}

//------------------------------------------------------------------------------------------
	public globalToLocal (__gameObject:XGameObject, __point:XPoint, __depth:number = 0):XPoint {
        var __tabs:Array<String> = ["...", "......", ".........", "............", "...............", "...................."];

		console.log (": XGameObject: globalToLocal: ", __tabs[__depth], __point.x, __point.y, __gameObject, __gameObject.x, __gameObject.y);
		
		__point.x -= __gameObject.x;
		__point.y -= __gameObject.y;

		if (__gameObject.getParentObject () != null) {
		 	return __gameObject.globalToLocal (__gameObject.getParentObject (), __point, __depth + 1);
		}

		return __point;
	}

//------------------------------------------------------------------------------------------
	public translateAlias (__path:string):string {
		return this.m_XApp.getXProjectManager ().translateAlias (__path);
	}

//------------------------------------------------------------------------------------------
//
// SELF
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeSelfObject (__gameObject:XGameObject):void {
		if (this.m_selfObjects.has (__gameObject)) {
			this.m_selfObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.removeChild (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeSelfObject0 (__gameObject:XGameObject):void {
		if (this.m_selfObjects.has (__gameObject)) {
			this.m_selfObjects.delete (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllSelfObjects ():void {
        var __gameObject:XGameObject;

		for (__gameObject of this.m_selfObjects.keys ()) {
            this.removeSelfObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// WORLD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeWorldObject (__gameObject:XGameObject):void {
		if (this.m_worldObjects.has (__gameObject)) {
			this.m_worldObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.world.removeGameObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeWorldObject0 (__gameObject:XGameObject):void {
		if (this.m_worldObjects.has (__gameObject)) {
			this.m_worldObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllWorldObjects ():void {
        var __gameObject:XGameObject;

		for (__gameObject of this.m_worldObjects.keys ()) {
			this.removeWorldObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// CHILD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public removeChildObject (__gameObject:XGameObject):void {
		if (this.m_childObjects.has (__gameObject)) {
			this.m_childObjects.delete (__gameObject);
				
			if (!__gameObject.cleanedUp) {
				__gameObject.cleanup ();
			}
			
			this.world.removeGameObject (__gameObject);
		}
	}
	
//------------------------------------------------------------------------------------------
// remove GameObject from the World but don't kill it
//------------------------------------------------------------------------------------------	
	public removeChildObject0 (__gameObject:XGameObject):void {
		if (this.m_childObjects.has (__gameObject)) {
			this.m_childObjects.delete (__gameObject);
				
			this.world.removeGameObject (__gameObject);
		}
	}
		
//------------------------------------------------------------------------------------------
	public removeAllChildObjects ():void {
        var __gameObject:XGameObject;

		for (__gameObject of this.m_childObjects.keys ()) {
			this.removeChildObject (__gameObject);
		}
	}
			
//------------------------------------------------------------------------------------------
//
// SELF
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public addSpriteToSelf (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number):PIXI.DisplayObject {
		this.m_selfSprites.set (__sprite__, 0);	

		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;
		
		this.addChild (__sprite__);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public removeAllSelfSprites ():void {
        var __sprite:PIXI.DisplayObject;

		for (__sprite of this.m_selfSprites.keys ()) {
            this.m_selfSprites.delete (__sprite);

            this.removeChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// CHILD
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public addSpriteAsChild (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = false):PIXI.DisplayObject {
		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;
		
		this.addSortableChild (__sprite__, __layer, __depth, __visible);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChild (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = false):void {
	    this.m_childSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public removeChildSprite (__sprite:PIXI.DisplayObject):void {
		if (this.m_childSprites.has (__sprite)) {
			this.m_childSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllChildSprites ():void {
        var __sprite:PIXI.DisplayObject;
    
		for (__sprite of this.m_childSprites.keys ()) {
			this.removeChildSprite (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// World
//
//------------------------------------------------------------------------------------------
	
//------------------------------------------------------------------------------------------
	public addSpriteToWorld (__sprite__:PIXI.DisplayObject, __dx:number, __dy:number, __layer:number, __depth:number, __visible:boolean = true):PIXI.DisplayObject {
		__sprite__.pivot.x = -__dx;
		__sprite__.pivot.y = -__dy;

		this.addSortableChildToWorld (__sprite__, __layer, __depth, __visible);	
		
		return __sprite__;
	}
	
//------------------------------------------------------------------------------------------
	public addSortableChildToWorld (__sprite:PIXI.DisplayObject, __layer:number = 0, __depth:number = 0.0, __visible:boolean = true):void {
		this.m_worldSprites.set (__sprite, 0);
		
		this.world.addSortableChild (__sprite, __layer, __depth, __visible);
	}
	
//------------------------------------------------------------------------------------------
	public removeWorldSprite (__sprite:PIXI.DisplayObject):void {
		if (this.m_worldSprites.has (__sprite)) {
			this.m_worldSprites.delete (__sprite);
			
			this.world.removeSortableChild (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
	public removeAllWorldSprites ():void {
        var __sprite:PIXI.DisplayObject;

		for (__sprite of this.m_worldSprites.keys ()) {
			this.removeWorldSprite (__sprite);
		}
	}
	
//------------------------------------------------------------------------------------------
//
// BITMAP
//
//------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------
	public createBitmapFont (__name:string, __style:any, __options:any):void {
        PIXI.BitmapFont.from (__name, __style, __options);

		this.m_bitmapFonts.set (__name, 0);
	}

//------------------------------------------------------------------------------------------
	public getBitmapFontChars ():Array<any> {
		return PIXI.BitmapFont.ASCII.concat (["á", "é", "í", "ó", "ú", "ü", "ñ", "¿", "¡"]);
	}
	
//------------------------------------------------------------------------------------------
	public removeBitmapFont (__name:string):void {
		if (this.m_bitmapFonts.has (__name)) {
			PIXI.BitmapFont.uninstall (__name);

			this.m_bitmapFonts.delete (__name);
		}
	}

//------------------------------------------------------------------------------------------
	public removeAllBitmapFonts ():void {
        var __name:string;

		for (__name of this.m_bitmapFonts.keys ()) {
			this.removeBitmapFont (__name);
		}
	}

//------------------------------------------------------------------------------------------
	public createXSignal ():XSignal {
		var __signal:XSignal = XGameObject.getXApp ().getXSignalManager ().createXSignal ();
		
		if (!(this.m_signals.has (__signal))) {
			this.m_signals.set (__signal, 0);
		}
			
		__signal.setParent (this);
			
		return __signal;
	}

//------------------------------------------------------------------------------------------
	public removeXSignal (__signal:XSignal):any {	
		if (this.m_signals.has (__signal)) {
			this.m_signals.delete (__signal);
					
			XGameObject.getXApp ().getXSignalManager ().removeXSignal (__signal);
		}
	}

//------------------------------------------------------------------------------------------
	public removeAllXSignals ():void {
        var __signal:XSignal;

		for (__signal of this.m_signals.keys ()) {
			this.removeXSignal (__signal);
		}
	}
				
//------------------------------------------------------------------------------------------
	public getXTaskManager ():XTaskManager {
		return XGameObject.getXApp ().getXTaskManager ();
	}

//------------------------------------------------------------------------------------------
	public addTask (
		__taskList:Array<any>,
		__findLabelsFlag:boolean = true
		):XTask {

		var __task:XTask = this.m_XTaskSubManager.addTask (__taskList, __findLabelsFlag);
			
		__task.setParent (this);
			
		return __task;
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
	public setDepth (__depth:number):XGameObject {
		this.m_depth = __depth;
		
		return this;
	}		
	
//------------------------------------------------------------------------------------------
    public getDepth ():number {
        return this.m_depth;
    }

//------------------------------------------------------------------------------------------
	public setPropagateDepthFlag (__flag:boolean):XGameObject {
		this.m_propagateDepthFlag = __flag;
		
		return this;
	}	
		
//------------------------------------------------------------------------------------------
	public setLayer (__layer:number):XGameObject {
		this.m_layer = __layer;
		
		return this;
	}
	
//------------------------------------------------------------------------------------------
	public getLayer ():number {
		return this.m_layer;
	}

//------------------------------------------------------------------------------------------
	public getWidth ():number {
		return this.width;
	}
	
//------------------------------------------------------------------------------------------
	public getHeight ():number {
		return this.height;
	}
	
//------------------------------------------------------------------------------------------
	public getActualWidth ():number {
		return this.width;
	}
	
//------------------------------------------------------------------------------------------
	public getActualHeight ():number {
		return this.height;
	}

//------------------------------------------------------------------------------------------
	public get propagateCount ():number {
		return this.m_propagateCount;
	}

//------------------------------------------------------------------------------------------
	public set propagateCount (__count:number) {
		this.m_propagateCount = __count;
	}

//------------------------------------------------------------------------------------------
	public isReady ():boolean {
		return this.m_delayed == 0;
	}
	
//------------------------------------------------------------------------------------------
    public updateCollisions ():void {
		this.setCollisions ();

        var __gameObject:XGameObject;

		for (__gameObject of this.m_childObjects.keys ()) {
			__gameObject.updateCollisions ();
		}
	}
	
//------------------------------------------------------------------------------------------
	public update ():void {
			if (this.m_delayed > 0) {
				this.m_delayed--;
				
				return;
			}
	
//------------------------------------------------------------------------------------------
			var __x:number;
			var __y:number;
			var __rotation:number;

			if (this.m_attachedMatterBody != null) {
				this.x = this.m_attachedMatterBody.position.x;
				this.y = this.m_attachedMatterBody.position.y;
				if (this.m_matterRotate) {
					this.m_masterRotation = this.angle = this.m_attachedMatterBody.angle * 180 / Math.PI; // this.setMasterRotation (this.angle = this.m_attachedMatterBody.angle * 180 / Math.PI);
				}
			}
			
			__x = this.m_masterX; // this.getMasterX ();
			__y = this.m_masterY; // this.getMasterY ();
			__rotation = this.m_masterRotation; // this.getMasterRotation ();

			var __visible:boolean = this.m_masterVisible; // this.getMasterVisible ();
			var __scaleX:number = this.m_masterScaleX * this.m_masterScaleRatio; // this.getMasterScaleX () * this.m_masterScaleRatio;
			var __scaleY:number = this.m_masterScaleY * this.m_masterScaleRatio; // this.getMasterScaleY () * this.m_masterScaleRatio;
			var __flipX:number = this.m_masterFlipX; // this.getMasterFlipX ();
			var __flipY:number = this.m_masterFlipY; // this.getMasterFlipY ();
			var __depth:number = this.m_masterDepth; // this.getMasterDepth ();
			var __alpha:number = this.m_masterAlpha; // this.getMasterAlpha ();

//------------------------------------------------------------------------------------------
			if (this.m_propagateCount >= 0) {
				if (this.m_propagateCount == 0) {
					return;
				}

				this.m_propagateCount--;
			}

//------------------------------------------------------------------------------------------
// update child objects that live in the World
//------------------------------------------------------------------------------------------	
			var __depthSprite:XDepthSprite = this.parent as XDepthSprite;
			__depthSprite.setDepth (this.getDepth ());
			
			var __gameObject:XGameObject;

			for (__gameObject of this.m_childObjects.keys ()) {	
				if (__gameObject != null && !__gameObject.isDead) {	
					var __parent:PIXI.DisplayObject = __gameObject.parent;

					__parent.x = __x / G.scaleRatio;
					__parent.y = __y / G.scaleRatio;
					__parent.angle = __rotation;
					__parent.visible = __visible;
					__parent.scale.x = __scaleX * __flipX / G.scaleRatio;
					__parent.scale.y = __scaleY * __flipY / G.scaleRatio;
					__parent.alpha = __alpha;

					// propagate rotation, scale, visibility, alpha
					__gameObject.m_masterX = __gameObject.x * __scaleX + __x; // __gameObject.setMasterX (__gameObject.x * __scaleX + __x);
					__gameObject.m_masterY = __gameObject.y * __scaleY + __y; // __gameObject.setMasterY (__gameObject.y * __scaleY + __y);
					__gameObject.m_masterRotation = (__gameObject.angle + __rotation) % 360; //__gameObject.setMasterRotation (__gameObject.angle + __rotation);
					__gameObject.m_masterScaleX = __gameObject.scale.x * __scaleX; //__gameObject.setMasterScaleX (__gameObject.scale.x * __scaleX);
					__gameObject.m_masterScaleY = __gameObject.scale.y * __scaleY; //__gameObject.setMasterScaleY (__gameObject.scale.y * __scaleY);
					__gameObject.m_masterFlipX = __gameObject.m_flipX * __flipX; //__gameObject.setMasterFlipX (__gameObject.getFlipX () * __flipX);
					__gameObject.m_masterFlipY = __gameObject.m_flipY * __flipY; //__gameObject.setMasterFlipY (__gameObject.getFlipY () * __flipY);
					__gameObject.m_masterVisible = __gameObject.visible && __visible; // __gameObject.setMasterVisible (__gameObject.visible && __visible);
					__gameObject.m_masterDepth = __gameObject.m_depth; // __gameObject.setMasterDepth (__gameObject.getDepth ());
					__gameObject.m_masterAlpha = __gameObject.alpha * __alpha; //__gameObject.setMasterAlpha (__gameObject.alpha * __alpha);
					
                    __gameObject.update ();
                }
			}
		
//------------------------------------------------------------------------------------------
			var __sprite:PIXI.DisplayObject;
			
//------------------------------------------------------------------------------------------			
// update self sprites that live in the World
//------------------------------------------------------------------------------------------
			for (__sprite of this.m_selfSprites.keys ()) {
				if (__sprite != null) {
					__sprite.scale.x = __flipX / G.scaleRatio;
					__sprite.scale.y = __flipY / G.scaleRatio;
                }
			}
	
//------------------------------------------------------------------------------------------			
// update child sprites that live in the World
//------------------------------------------------------------------------------------------	
			for (__sprite of this.m_childSprites.keys ()) {
				if (this.m_propagateDepthFlag) {
					__depthSprite =  __sprite.parent as XDepthSprite;
					__depthSprite.setDepth (this.getDepth());			
				}
					
				if (__sprite != null) {
					var __parent:PIXI.DisplayObject = __sprite.parent;

					__parent.x = __x / G.scaleRatio;
					__parent.y = __y / G.scaleRatio;
					__parent.angle = __rotation;
					__parent.visible = __sprite.visible && __visible;
					__parent.scale.x = __scaleX * __flipX / G.scaleRatio;
					__parent.scale.y = __scaleY * __flipY / G.scaleRatio;
					__parent.alpha = __alpha;
				}
			}
	}
	
//------------------------------------------------------------------------------------------
    public createMatterBody ():void {
    }

//------------------------------------------------------------------------------------------
	public attachMatterBodyCircle (__body:Body, __radius:number, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;

		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);
		__graphics.drawCircle (0, 0, __radius);
		__graphics.endFill ();
		*/

		this.attachMatterBodyDebug (__body, __graphics, __debug);

		return this;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyRectangle (__body:Body, __rect:XRect, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;
		
		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);
		__graphics.drawRect (-__rect.width/2, -__rect.height/2, __rect.width, __rect.height);
		__graphics.endFill ();
		*/

		this.attachMatterBodyDebug (__body, __graphics, __debug);

		return this;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyVertices (__body:Body, __vertices:Array<any>, __debug:boolean = true):XGameObject {
		var __graphics:PIXI.Graphics = null;

		/*
		var __graphics:PIXI.Graphics = new PIXI.Graphics ();
		__graphics.beginFill (0xff00ff);

        __graphics.drawPolygon (
            this.convertVerticesToPoints (__vertices)
		);

		__graphics.endFill ();

		__graphics.alpha = 0.33;
		*/

		this.convertVerticesToPoints (__vertices);
		
		 this.attachMatterBodyDebug (__body, __graphics, __debug);

		 return this;
	}

//------------------------------------------------------------------------------------------
	public convertVerticesToPoints (__vertices:Array<any>):Array<PIXI.Point> {
		var __points:Array<PIXI.Point> = new Array<PIXI.Point> ();

		var __vector = Matter.Vertices.centre (__vertices);

		this.m_matterDX = __vector.x;
		this.m_matterDY = __vector.y;
		
		this.setPivot (__vector.x, __vector.y);

		var __vertex:any;

		for (__vertex of __vertices) {
			__points.push (new PIXI.Point (__vertex.x - __vector.x, __vertex.y - __vector.y));
		}

		return __points;
	}

//------------------------------------------------------------------------------------------
	public getMatterDX ():number {
		return this.m_matterDX;
	}

//------------------------------------------------------------------------------------------
	public getMatterDY ():number {
		return this.m_matterDY;
	}

//------------------------------------------------------------------------------------------
	public setMatterRotate (__value:boolean):void {
		this.m_matterRotate = __value;
	}

//------------------------------------------------------------------------------------------
	public attachMatterBodyDebug (__body:Body, __graphics:PIXI.Graphics, __debug:boolean = false):XGameObject {
		this.m_attachedDebugSprite = new PIXI.Sprite ();
		__debug = false; if (__debug) {
			// this.m_attachedDebugSprite.addChild (__graphics);
		}
		this.addSortableChild (this.m_attachedDebugSprite, this.getLayer (), this.getDepth ());

		this.attachMatterBody (__body);

		return this;
	}

//------------------------------------------------------------------------------------------
    public attachMatterBody (__body:Body):XGameObject {
		this.m_attachedMatterBody = __body;

		Matter.World.add (this.world.getMatterEngine ().world, __body);

		return this;
    }

//------------------------------------------------------------------------------------------
    public detachMatterBody ():void {
		if (this.m_attachedMatterBody != null) {
			Matter.World.remove (this.world.getMatterEngine ().world, this.m_attachedMatterBody);

			this.m_attachedMatterBody = null;
		}
    }

//------------------------------------------------------------------------------------------
	public getMatterBody ():Matter.Body {
		return this.m_attachedMatterBody;
	}
	
//------------------------------------------------------------------------------------------
	public show ():void {
		this.visible = true;
	}
		
//------------------------------------------------------------------------------------------
	public hide ():void {
		this.visible = false;
	}		

//------------------------------------------------------------------------------------------
	public get isDead ():boolean {
		return this.m_isDead;
	}
		
	public set isDead (__val:boolean) {
		this.m_isDead = __val;
	}
		
//------------------------------------------------------------------------------------------
	public get cleanedUp ():boolean {
		return this.m_cleanedUp;
	}
		
	public set_cleanedUp (__val:boolean) {
		this.m_cleanedUp = __val;			
	}
	
//------------------------------------------------------------------------------------------	
		public m_masterVisible:boolean;
		public m_masterDepth:number;
		public m_masterScaleX:number;
		public m_masterScaleY:number;
		public m_masterRotation:number;
		public m_masterAlpha:number;
		public m_masterX:number;
		public m_masterY:number;
	
//------------------------------------------------------------------------------------------	
		public get vel ():XPoint {
			return this.m_vel;
		}

//------------------------------------------------------------------------------------------
		public setScale (__scale:number):void {
			this.scale.x = this.scale.y = __scale;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterX (__value:number):void {
			this.m_masterX = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterX ():number {
			return this.m_masterX;
		}

//------------------------------------------------------------------------------------------		
		public setMasterY (__value:number):void {
			this.m_masterY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterY ():number {
			return this.m_masterY;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterAlpha (__alpha:number):void {
			this.m_masterAlpha = __alpha;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterAlpha ():number {
			return this.m_masterAlpha;
		}
			
//------------------------------------------------------------------------------------------		
		public setMasterVisible (__visible:boolean):void {
			this.m_masterVisible = __visible;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterVisible ():boolean {
			return this.m_masterVisible;
		}
					
//------------------------------------------------------------------------------------------		
		public setMasterRotation (__rotation:number):void {
			this.m_masterRotation = __rotation % 360;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterRotation ():number {
			return this.m_masterRotation;
		}

//------------------------------------------------------------------------------------------		
		public setMasterScaleX (__scale:number):void {
			this.m_masterScaleX = __scale;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterScaleX ():number {
			return this.m_masterScaleX;
		}

//------------------------------------------------------------------------------------------		
		public setMasterScaleY (__scale:number):void {
			this.m_masterScaleY = __scale;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterScaleY ():number {
			return this.m_masterScaleY;
		}

//------------------------------------------------------------------------------------------		
		public setMasterFlipX(__value:number):void {
			this.m_masterFlipX = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterFlipX ():number {
			return this.m_masterFlipX;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterFlipY(__value:number):void {
			this.m_masterFlipY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterFlipY ():number {
			return this.m_masterFlipY;
		}
		
//------------------------------------------------------------------------------------------
		public getFlipX ():number {
			return this.m_flipX;
		}
		
		public setFlipX (__value:number):void {
			this.m_flipX = __value;
		}
		
//------------------------------------------------------------------------------------------
		public getFlipY ():number {
			return this.m_flipY;
		}
		
		public setFlipY (__value:number):void {
			this.m_flipY = __value;
		}
		
//------------------------------------------------------------------------------------------		
		public setMasterDepth (__depth:number):void {
			this.m_masterDepth = __depth;
		}
		
//------------------------------------------------------------------------------------------		
		public getMasterDepth ():number {
			return this.m_masterDepth;
		}
		
//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
class __PausableListener {
	public m_eventName:string;
	public m_listener:any;
	public boundListener:any;

	//------------------------------------------------------------------------------------------
	constructor (__eventName:string, __listener:any) {
		this.m_eventName = __eventName;
		this.m_listener = __listener;

		XGameObject.getXApp ().getStage ().on (__eventName, this.boundListener = this.__listener.bind (this));
	}

	//------------------------------------------------------------------------------------------
	public cleanup ():void {
		XGameObject.getXApp ().getStage ().off (this.m_eventName, this.boundListener);
	}

	//------------------------------------------------------------------------------------------
	private __listener (e:PIXI.InteractionEvent):void {
		if (!XGameObject.getXApp ().isPaused ()) {
			this.m_listener (e);
		}
	}

//------------------------------------------------------------------------------------------
}