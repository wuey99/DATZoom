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
import { ConnectionManager } from '../sfs/ConnectionManager';
import { XType } from '../../engine/type/XType';
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';

//------------------------------------------------------------------------------------------
export class Login extends DATState {
	public script:XTask;
	public m_nameTextInput:TextInput;
	public m_loginButton:XTextSpriteButton;

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

		console.log (": guid: ", GUID.create ());

		this.script = this.addEmptyTask ();

        var __connectionManager:ConnectionManager = this.world.addGameObject (ConnectionManager, 0, 0.0) as ConnectionManager;
		__connectionManager.afterSetup ([]);
			
		this.createStatusMessage ();

		this.Connect_Script ();

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
	}

//------------------------------------------------------------------------------------------
	public getActualWidth ():number {
		return G.SCREEN_WIDTH;
	}

//------------------------------------------------------------------------------------------
	public getActualHeight ():number {
		return G.SCREEN_HEIGHT;
	}

	//------------------------------------------------------------------------------------------
	public Connect_Script ():void {
		this.setStatusMessage ("Connecting to Server...");

		ConnectionManager.instance ().Connect_Script (() => {

		});

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
							__task.ifTrue (ConnectionManager.instance ().isConnected ());
						}, XTask.BNE, "loop",

						() => {
							if (window.location.hash == "#moderator") {
								this.setStatusMessage ("Login as Moderator");
							} else {
								this.setStatusMessage ("Login as Player");
							}

							this.setupUI ();
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
	public setupUI ():void {
		var __ypercent:number = 0.50;

		var __hbox:HBox = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
		__hbox.afterSetup ([1000, 100, XJustify.SPACE_BETWEEN, -1]);

		var __vbox:VBox = __hbox.addGameObjectAsChild (VBox, 0, 0.0, false) as VBox;
		__vbox.afterSetup ([250, 60, XJustify.CENTER, -1]);

		var __roomLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Enter your name:",
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

		var __textInput:TextInput = this.m_nameTextInput = new TextInput (
			{
				input: {fontSize: '25px'}, 
				box: {fill: 0xc0c0c0},
			}
		);
		__vboxTextInput.addItem (__textInput);
		__vboxTextInput.addSortableChild (__textInput, 0, 0.0, false);

		__hbox.addItem (__vboxTextInput);
		__hbox.addSortableChild (__vboxTextInput, 0, 0.0, false);

		var __loginButton:XTextSpriteButton = this.m_loginButton = __hbox.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__loginButton.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"LOG IN",
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
		__hbox.addItem (__loginButton);

		this.horizontalPercent (__hbox, 0.50);
		this.verticalPercent (__hbox, __ypercent);

		__loginButton.addMouseUpListener (() => {
			var __userName:string = (__textInput as any).text;
			
			console.log (": login: ", __userName);

			this.LoginToZone_Script (__userName);

			__hbox.nukeLater ();
		});
	}

	//------------------------------------------------------------------------------------------
	public LoginToZone_Script (__userName:string):void {
		this.setStatusMessage ("Logging into Zone...");

		var __role:string = "";

		switch (window.location.hash) {
			case "#moderator":
				__role = "moderator";
				break;
			default:
				__role = "player";
				break;
		}

		ConnectionManager.instance ().LoginToZone_Script (__role, __userName, (e:SFS2X.SFSEvent) => {
			console.log (": login error: ", e);
		});

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
							__task.ifTrue (ConnectionManager.instance ().isLoggedIntoZone ());
						}, XTask.BNE, "loop",

						() => {
							this.LoggedIn_Script ();
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
	public LoggedIn_Script ():void {
		this.setStatusMessage ("Logged in!");

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.WAIT1000, 1 * 1000,

					() => {
						console.log (": logged in: ", window.location);

						switch (window.location.hash) {
							case "#moderator":
								this.getGameInstance ().gotoState ("CreateRoom2");
								break;
							default:
								this.getGameInstance ().gotoState ("JoinRoom");
								break;
						}
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
}