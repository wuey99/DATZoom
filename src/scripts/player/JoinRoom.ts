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
import { XTextSprite } from '../../engine/sprite/XTextSprite';
import { XTextGameObject } from '../../engine/ui/XTextGameObject';
import { TextInput } from 'pixi-textinput-v5';
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { DATState } from '../scene/DATState';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';

//------------------------------------------------------------------------------------------
export class JoinRoom extends DATState {
	public m_roomTextInput:TextInput;
	public m_joinRoomButton:XTextSpriteButton;
	public script:XTask;
	public m_mainUI:HBox;

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
	
		this.script = this.addEmptyTask ();

		console.log (": --------------------->: ", MessagingManager.instance ().getModeratorID ());

		this.createStatusMessage ();

		this.setupUI ();

		this.Idle_Script ();

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_messagingSubManager.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public setupUI ():void {
		this.setStatusMessage ("Please enter Room ID");

		var __ypercent:number = 0.50;

		var __hbox:HBox = this.m_mainUI = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
		__hbox.afterSetup ([1000, 100, XJustify.SPACE_BETWEEN, -1]);

		var __vbox:VBox = __hbox.addGameObjectAsChild (VBox, 0, 0.0, false) as VBox;
		__vbox.afterSetup ([250, 60, XJustify.CENTER, -1]);

		var __roomLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Enter room ID:",
			"Nunito",
			25,
			0x000000,
			true,
			"center", "center"
		);

		__vbox.addItem (__roomLabel);
		__vbox.addSortableChild (__roomLabel, 0, 0.0, false);
		
		__hbox.addItem (__vbox);
		__hbox.addSortableChild (__vbox, 0, 0.0, false);

		var __vboxTextInput:VBox = __hbox.addGameObjectAsChild (VBox, 0, 0.0, false) as VBox;
		__vboxTextInput.afterSetup ([250, 60, XJustify.CENTER, -1]);

		var __textInput:any = this.m_roomTextInput = new TextInput (
			{
				input: {fontSize: '25px'}, 
				box: {fill: 0xc0c0c0},
			}
		);
		__vboxTextInput.addItem (__textInput);
		__vboxTextInput.addSortableChild (__textInput, 0, 0.0, false);

		__hbox.addItem (__vboxTextInput);
		__hbox.addSortableChild (__vboxTextInput, 0, 0.0, false);

		var __joinButton:XTextSpriteButton = this.m_joinRoomButton = __hbox.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__joinButton.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"JOIN",
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
		__hbox.addItem (__joinButton);

		this.horizontalPercent (__hbox, 0.50);
		this.verticalPercent (__hbox, __ypercent)

		__joinButton.addMouseUpListener (() => {
			console.log (": roomID: ", __textInput.text);

			this.Join_Script (__textInput.text);
		});
	}

	//------------------------------------------------------------------------------------------
	public Idle_Script ():void {
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

	//------------------------------------------------------------------------------------------
	public Join_Script (__roomID:string):void {
		var __joinedFlag:boolean = false;

		this.setStatusMessage ("Joining room...");

		this.m_mainUI.hide ();

		ConnectionManager.instance ().JoinRoom_Script (__roomID);

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (ConnectionManager.instance ().isJoinedRoom ());
						}, XTask.BNE, "loop",

						() => {
							this.Joined_Script ();
						},

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

	//------------------------------------------------------------------------------------------
	public Joined_Script ():void {
		this.setStatusMessage ("Successfully joined room!");

		//------------------------------------------------------------------------------------------
		var __waitMessage = this.addGameObjectAsChild (XTextGameObject, 0, 0.0) as XTextGameObject;
		__waitMessage.afterSetup ([
			-1,
			64,
			"Waiting for others to join...",
			"Nunito",
			30,
			0x000000,
			true,
			"center", "center"
		]);

		this.horizontalPercent (__waitMessage, 0.50);
		this.verticalPercent (__waitMessage, 0.50);

		this.setupSceneChangeListener ();

		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

					XTask.RETN,
				]);	
			},
				
			//------------------------------------------------------------------------------------------
			// animation
			//------------------------------------------------------------------------------------------	
			XTask.LABEL, "loop",
                XTask.WAIT, 0x0100,
					
				XTask.GOTO, "loop",
				
			XTask.RETN,
				
			//------------------------------------------------------------------------------------------			
		]);
			
	//------------------------------------------------------------------------------------------
	}

//------------------------------------------------------------------------------------------
}