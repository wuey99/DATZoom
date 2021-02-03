//------------------------------------------------------------------------------------------
import * as PIXI from 'pixi.js-legacy'
import { XApp } from '../../engine/app/XApp';
import { XSprite } from '../../engine/sprite/XSprite';
import { XSpriteLayer } from '../../engine/sprite/XSpriteLayer';
import { XSignal } from '../../engine/signals/XSignal';
import { XSignalManager } from '../../engine/signals/XSignalManager';
import { world } from '../app';
import { XTask } from '../../engine/task/XTask';
import { XTaskManager} from '../../engine/task/XTaskManager';
import { XTaskSubManager} from '../../engine/task/XTaskSubManager';
import { XWorld} from '../../engine/sprite/XWorld';
import { XGameObject} from '../../engine/gameobject/XGameObject';
import { XState } from '../../engine/state/XState';
import { GUID } from '../../engine/utils/GUID';
import { XSimpleXMLNode } from '../../engine/xml/XSimpleXMLNode';
import * as SFS2X from "sfs2x-api";
import { SFSManager } from '../../engine/sfs/SFSManager';
import { XSpriteButton } from '../../engine/ui/XSpriteButton';
import { XTextButton } from '../../engine/ui/XTextButton';
import { XTextSpriteButton } from '../../engine/ui/XTextSpriteButton';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { TextInput } from 'pixi-textinput-v5';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { XMLBox } from '../../engine/ui/XMLBox';
import { MessagingManager } from '../sfs/MessagingManager';
import { Resource } from '../../engine/resource/Resource';
import { UserList } from '../components/UserList';
import { XTextBox } from '../../engine/ui/XTextBox';

//------------------------------------------------------------------------------------------
export class AudioTest extends DATState {
	public script:XTask;

	public m_currentAudio:string;
	public m_statusMessage:XTextGameObject;
	public m_userListLayout:UserList;
	public m_audioListLayout:VBox;

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

		this.m_currentAudio = "";

		this.createStatusMessage ();

		this.setStatusMessage ("Audio Test");
		this.verticalPercent (this.m_statusMessage, 0.10);

		this.setupUI ();

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public setupUI ():void {
		var __mainLayout:HBox = this.addGameObjectAsChild (HBox, this.getLayer (), this.getDepth (), false) as HBox;
		__mainLayout.afterSetup ([1500, 750, XJustify.START, 0x40e0e0]);
		__mainLayout.spacing = 32;

		//------------------------------------------------------------------------------------------
		// user list
		//------------------------------------------------------------------------------------------
		this.setupUserList (__mainLayout);

		//------------------------------------------------------------------------------------------
		// audio list
		//------------------------------------------------------------------------------------------
		this.setupAudioList (__mainLayout);

		//------------------------------------------------------------------------------------------
		this.horizontalPercent (__mainLayout, 0.50);
		this.verticalPercent (__mainLayout, 0.50);

		//------------------------------------------------------------------------------------------
		var __playButton:XTextSpriteButton = this.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__playButton.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"PLAY",
			"Nunito",
			25,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			false,
			"center", "center"
		]);

		this.horizontalPercent (__playButton, 0.25);
		this.verticalPercent (__playButton, 0.95);

		__playButton.addMouseUpListener (() => {
			var __user:SFS2X.SFSuser;

			var i:number = 0;

			for (__user of ConnectionManager.instance ().getSFSUserManager ().getUserList ()) {
				if (!__user.name.startsWith ("moderator:")) {
					var __characterName:string = (this.m_audioListLayout.getItems ()[i] as XTextSprite).text;

					console.log (": user: ", __user.id, __user.name, __characterName);

					MessagingManager.instance ().fireTriggerSignal (
						__user.id, "PLAY-SOUND",
						{
							name: __characterName
						}
					);

					i++;
				}
			}
		});

		//------------------------------------------------------------------------------------------
		var __stopSound:XTextSpriteButton = this.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__stopSound.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"STOP",
			"Nunito",
			25,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			0x000000,
			false,
			"center", "center"
		]);

		this.horizontalPercent (__stopSound, 0.75);
		this.verticalPercent (__stopSound, 0.95);

		__stopSound.addMouseUpListener (() => {
			var __user:SFS2X.SFSuser;

			var i:number = 0;

			for (__user of ConnectionManager.instance ().getSFSUserManager ().getUserList ()) {
				if (!__user.name.startsWith ("moderator:")) {
					var __characterName:string = (this.m_audioListLayout.getItems ()[i] as XTextSprite).text;

					console.log (": user: ", __user.id, __user.name, __characterName);

					MessagingManager.instance ().fireTriggerSignal (
						__user.id, "STOP-SOUND",
						{
							name: __characterName
						}
					);

					i++;
				}
			}
		});
	}

//------------------------------------------------------------------------------------------
	public setupUserList (__mainLayout:HBox):void {
		var __userListLayout:UserList = this.m_userListLayout = __mainLayout.addGameObjectAsChild (UserList, this.getLayer (), this.getDepth (), false) as UserList;
		__userListLayout.afterSetup ([
			1500 * 0.50, 1000, XJustify.START, -1,
			ConnectionManager.instance ().getSFSUserManager ().getUserList (),
			"Nunito",
			30,
			0x000000,
			"left",
			0.0,
			32
		]);
		__mainLayout.addItem (__userListLayout);
		__mainLayout.horizontalPercent (__userListLayout, 0.0);
	}

//------------------------------------------------------------------------------------------
	public setupAudioList (__mainLayout:HBox):void {
		var __audioListLayout:VBox = this.m_audioListLayout = __mainLayout.addGameObjectAsChild (VBox, this.getLayer (), this.getDepth (), false) as VBox;
		__audioListLayout.afterSetup ([1500 * 0.35, 1000, XJustify.START, -1]);
		__audioListLayout.spacing = 32;
		__mainLayout.addItem (__audioListLayout);

		var __resourceMap:Map<string, Resource> = this.m_XApp.getXProjectManager ().getResourceManagerByName ("TestAudio").getResourceMap ();

		var __audioListLayoutParams:any = {
			spacing: 0,
			height: 0
		}

		XType.forEach (__resourceMap,
			(__audio:string) => {
				var __audioLabel:__DraggableXTextBox = __audioListLayout.addGameObjectAsChild (
					__DraggableXTextBox, this.getLayer (), this.getDepth (), false
				) as __DraggableXTextBox;

				__audioLabel.afterSetup ([
					300, 30, 0xff8080,
					-1,
					-1,
					__audio,
					"Nunito",
					25,
					0x000000,
					true,
					"center", "center"
				]);

				__audioListLayout.addItem (__audioLabel);

				__audioListLayout.horizontalPercent (__audioLabel, 0.50);

				this.__audioLabelDragHandler (__audio, __audioListLayoutParams, __audioListLayout, __audioLabel);
			}
		);

		var __items:Array<PIXI.Sprite | TextInput> = __audioListLayout.getItems ();
		var __item:PIXI.Sprite | TextInput = __items[__items.length - 1];
		__audioListLayoutParams.spacing = __items[1].y - __items[0].y;
		__audioListLayoutParams.height = __item.y;

		// __mainLayout.horizontalPercent (__audioListLayout, 1.0);
	}

//------------------------------------------------------------------------------------------
	public __audioLabelDragHandler (__audio:string, __audioListLayoutParams:any, __audioListLayout:VBox, __audioLabel:__DraggableXTextBox):void {
		var __mouseDownPos:PIXI.Point = new PIXI.Point ();
		var __basePos:PIXI.Point = new PIXI.Point ();
		var __itemIndex:number = __audioListLayout.getIndexByItem (__audioLabel);

		__audioLabel.addMouseDownListener ((__gameObject:__DraggableXTextBox, e:PIXI.InteractionEvent) => {
			console.log (": ", __audio, __audioListLayout.getIndexByItem (__audioLabel));	

			__itemIndex = __audioListLayout.getIndexByItem (__audioLabel);

			e.data.getLocalPosition (__audioListLayout, __mouseDownPos, e.data.global);

			__basePos.x = __audioLabel.x;
			__basePos.y = __audioLabel.y;
		});

		__audioLabel.addMouseMoveListener ((__gameObject:__DraggableXTextBox, e:PIXI.InteractionEvent) => {
			__itemIndex = __audioListLayout.getIndexByItem (__audioLabel);
			
			var __point:PIXI.Point = new PIXI.Point ();

			e.data.getLocalPosition (__audioListLayout, __point, e.data.global);

			var __dx:number = (__point.x - __mouseDownPos.x);
			var __dy:number = (__point.y - __mouseDownPos.y);

			var __y:number = __basePos.y + __dy;
			__y = Math.max (0, __y);
			__y = Math.min (__audioListLayoutParams.height, __y);
			__y = Math.floor ((__y + __audioListLayoutParams.spacing / 2) / __audioListLayoutParams.spacing) * __audioListLayoutParams.spacing;
			__audioLabel.y = __y;

			var __items:Array<PIXI.Sprite | TextInput> = __audioListLayout.getItems ();

			var __moveItemBackward = (__targetIndex:number) => {
				var i:number;

				for (i = __itemIndex - 1; i >= __targetIndex; i--) {
					__items[i].y += __audioListLayoutParams.spacing;

					__items[i + 1] = __items[i];
				}

				__items[__targetIndex] = __audioLabel;

				__itemIndex = __targetIndex;
			}
			
			var __moveItemForward = (__targetIndex:number) => {
				var i:number;
				
				for (i = __itemIndex + 1; i <= __targetIndex; i++) {
					__items[i].y -= __audioListLayoutParams.spacing;

					__items[i - 1] = __items[i];
				}

				__items[__targetIndex] = __audioLabel;

				__itemIndex = __targetIndex;
			}

			var __item:PIXI.Sprite | TextInput;
			var i:number;

			for (i = 0; i < __items.length; i++) {
				__item = __items[i];

				if (__item != __audioLabel) {
					if (__item.y == __audioLabel.y) {
						console.log (": ", (__item as __DraggableXTextBox).text, __itemIndex, i);

						if (__itemIndex > i) {
							__moveItemBackward (i); break;
						}

						if (__itemIndex < i) {
							__moveItemForward (i); break;
						}
					}
				}
			}
		});
	}

//------------------------------------------------------------------------------------------
	public createStatusMessage ():void {
		this.m_statusMessage = this.addGameObjectAsChild (XTextGameObject, 0, 0.0) as XTextGameObject;
		this.m_statusMessage.afterSetup ([
			-1,
			30,
			"",
			"Nunito",
			30,
			0x000000,
			true,
			"center", "center"
		]);

		this.horizontalPercent (this.m_statusMessage, 0.50);
		this.verticalPercent (this.m_statusMessage, 0.0);
	}

//------------------------------------------------------------------------------------------
}

//------------------------------------------------------------------------------------------
export class __DraggableXTextBox extends XTextBox {
	public m_mouseDownFlag:boolean;
	public m_mouseDownX:number;
	public m_mouseDownY:number;

	public m_mouseDownSignal:XSignal;
	public m_mouseUpSignal:XSignal;
	public m_mouseMoveSignal:XSignal;

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

		this.getDraggableArea ().interactive = true;
		this.getDraggableArea ().interactiveChildren = true;

		this.m_mouseDownSignal = this.createXSignal ();
		this.m_mouseUpSignal = this.createXSignal ();
		this.m_mouseMoveSignal = this.createXSignal ();
		
		this.setupListeners ();

		this.m_mouseDownFlag = false;

		return this;
	}
	
//------------------------------------------------------------------------------------------
	public cleanup ():void {
        super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getDraggableArea ():PIXI.Graphics {
		return this.m_box.m_fill;
	}

//------------------------------------------------------------------------------------------
	public setupListeners ():void {		
		this.addTask ([
			() => {
				this.addPausableEventListener ("pointerdown", this.getDraggableArea (), this.onMouseDown.bind (this));
				this.addPausableEventListener ("pointermove", this.getDraggableArea (), this.onMouseMove.bind (this));
				this.addPausableEventListener ("pointerup", this.getDraggableArea (), this.onMouseUp.bind (this));
				// this.addPausableEventListener ("pointerout", this.getDraggableArea (), this.onMouseOut.bind (this));
				// this.addPausableEventListener ("pointerupoutside", this.getDraggableArea (), this.onMouseOut.bind (this));
				this.addPausableEventListener ("pointerup", this.m_XApp.stage, this.onMouseUp.bind (this));
			},
				
			XTask.RETN,
		]);
	}

//------------------------------------------------------------------------------------------
	public onMouseDown (e:PIXI.InteractionEvent):void {
		this.m_mouseDownSignal.fireSignal (this, e);

		this.m_mouseDownFlag = true;
	}			

//------------------------------------------------------------------------------------------
	public onMouseUp (e:PIXI.InteractionEvent):void {
		this.m_mouseUpSignal.fireSignal (this, e);

		this.m_mouseDownFlag = false;
	}			

//------------------------------------------------------------------------------------------
	public onMouseOut (e:PIXI.InteractionEvent):void {
		this.m_mouseDownFlag = false;
	}	

//------------------------------------------------------------------------------------------
	public onMouseMove (e:PIXI.InteractionEvent):void {
		if (this.m_mouseDownFlag) {
			this.m_mouseMoveSignal.fireSignal (this, e);
		}
	}			

//------------------------------------------------------------------------------------------
	public addMouseDownListener (__listener:any):number {
		return this.m_mouseDownSignal.addListener (__listener);
	}
				
//------------------------------------------------------------------------------------------
	public addMouseUpListener (__listener:any):number {
		return this.m_mouseUpSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
	public addMouseMoveListener (__listener:any):number {
		return this.m_mouseMoveSignal.addListener (__listener);
	}

//------------------------------------------------------------------------------------------
}