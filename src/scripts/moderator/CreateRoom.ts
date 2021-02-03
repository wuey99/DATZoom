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
import { G } from '../../engine/app/G';
import { DATState } from '../scene/DATState';
import { HBox } from '../../engine/ui/HBox';
import { VBox } from '../../engine/ui/VBox';
import { XJustify } from '../../engine/ui/XJustify';
import { Spacer } from '../../engine/ui/Spacer';
import { FlockLeader } from '../test/FlockLeader';
import { MessagingManager } from '../sfs/MessagingManager';
import { MessagingSubManager } from '../sfs/MessagingSubManager';
import { UserList } from '../components/UserList';

//------------------------------------------------------------------------------------------
export class CreateRoom extends DATState {
	public m_createRoomButton:XTextSpriteButton;
	public script:XTask;
	public m_createRoomLayout:HBox;
	public m_waitJoinLayout:HBox;
	public m_joinedUsersLayout:UserList;

	public static NUM_PLAYERS:number = 6;
	
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

		this.createStatusMessage ();

		this.setupCreateRoomUI ();

		this.Idle_Script ();

		SFSManager.instance ().addEventListener (SFS2X.SFSEvent.USER_ENTER_ROOM, (e:SFS2X.SFSEvent) => {
			console.log (": userEnteredRoom: ", e);
		});

		return this;
	}

//------------------------------------------------------------------------------------------
	public cleanup ():void {
		super.cleanup ();
		
		this.m_messagingSubManager.cleanup ();
	}
	
//------------------------------------------------------------------------------------------
	public showRoomID (__roomID:string):void {
		this.setStatusMessage ("Room ID: ");

		var __hbox:HBox = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
		__hbox.afterSetup ([400, 100, XJustify.CENTER, -1]);

		var __roomIDText:any = new TextInput (
			{
				input: {
					fontSize: '40px'
				}, 
				box: {fill: 0xc0c0c0},
			}
		);

		__roomIDText.text = __roomID;

		__hbox.addItem (__roomIDText);
		__hbox.addSortableChild (__roomIDText, 0, 0.0, false);

		this.horizontalPercent (__hbox, 0.50);
		this.verticalPercent (__hbox, 0.25);
	}

//------------------------------------------------------------------------------------------
	public setupCreateRoomUI ():void {
		this.setStatusMessage ("Create Room");

		var __ypercent:number = 0.50;

		var __hbox:HBox = this.m_createRoomLayout = this.addGameObjectAsChild (HBox, 0, 0.0, false) as HBox;
		__hbox.afterSetup ([400, 100, XJustify.SPACE_BETWEEN, -1]);

		var __vbox:VBox = __hbox.addGameObjectAsChild (VBox, 0, 0.0, false) as VBox;
		__vbox.afterSetup ([250, 60, XJustify.CENTER, -1]);

		var __roomLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Create a new Room",
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

		var __createButton:XTextSpriteButton = this.m_createRoomButton = __hbox.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__createButton.afterSetup ([
			"StandardButton",
			true, 10, 150, 60,
			"CREATE",
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
		__hbox.addItem (__createButton);

		this.horizontalPercent (__hbox, 0.50);
		this.verticalPercent (__hbox, __ypercent);

		this.m_createRoomButton.addMouseUpListener (() => {
			console.log (": mouse up: ");

			this.m_createRoomButton.setDisabled (true);

			this.createRoom ();
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
	public createRoom ():void {
		var __roomID:string = GUID.create ().substring (1, 18);

		var __settings:SFS2X.RoomSettings = new SFS2X.RoomSettings (__roomID);
		__settings.maxUsers = CreateRoom.NUM_PLAYERS + 1; // + Moderator
		__settings.groupId = "default";

		SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_ADD, (e:SFS2X.SFSEvent) => {
			console.log (": onRoomAdded: ", e);

			this.m_createRoomLayout.nukeLater ();

			this.showRoomID (__roomID);

			ConnectionManager.instance ().JoinRoom_Script (__roomID);

			this.WaitForAllToJoin_Script ();
		});

		SFSManager.instance ().once (SFS2X.SFSEvent.ROOM_CREATION_ERROR, (e:SFS2X.SFSEvent) => {
			console.log (": onRoomCreationError: ", e);
		});

		SFSManager.instance ().send (new SFS2X.CreateRoomRequest (__settings));
	}

	//------------------------------------------------------------------------------------------
	public setupWaitForAllToJoinUI ():void {
		var __waitJoinLayout:VBox = this.m_waitJoinLayout = this.addGameObjectAsChild (VBox, 0, 0.0, false) as VBox;
		__waitJoinLayout.afterSetup ([1000, 300, XJustify.CENTER, -1]);

		this.horizontalPercent (__waitJoinLayout, 0.50);
		this.verticalPercent (__waitJoinLayout, 0.50);

		var __titleLabel:XTextSprite = this.createXTextSprite (
			-1,
			-1,
			"Joined Users:",
			"Nunito",
			50,
			0x000000,
			true,
			"center", "center"
		);

		__waitJoinLayout.addItem (__titleLabel);
		__waitJoinLayout.addSortableChild (__titleLabel, 0, 0.0, false);

		__waitJoinLayout.horizontalPercent (__titleLabel, 0.50);

		var __spacer:Spacer = __waitJoinLayout.addGameObjectAsChild (Spacer, 0, 0.0, false) as Spacer;
		__spacer.afterSetup ([100, 50]);
		__waitJoinLayout.addItem (__spacer);

		var __joinedUsers:UserList = this.m_joinedUsersLayout = __waitJoinLayout.addGameObjectAsChild (UserList, 0, 0.0, false) as UserList;
		__joinedUsers.afterSetup ([
			1000, 200, XJustify.START, -1,
			ConnectionManager.instance ().getSFSUserManager ().getUserList (),
			"Nunito",
			25,
			0x000000,
			"center",
			0.50,
			0
		]);

		__waitJoinLayout.addItem (__joinedUsers);

		__waitJoinLayout.horizontalPercent (__joinedUsers, 0.50);
	}

	//------------------------------------------------------------------------------------------
	public collectUsers (__userMap:Map<SFS2X.SFSUser, number>, __userList:Array<SFS2X.SFSUser>):void {
		var __user:SFS2X.SFSUser;

		for (__user of __userList) {
			__userMap.set (__user, 0);
		}
	}

	//------------------------------------------------------------------------------------------
	public showJoinedUsers (__userMap:Map<SFS2X.SFSUser, number>):void {
		this.m_joinedUsersLayout.updateList ([
			1000, 200, XJustify.START, -1,
			Array.from (__userMap.keys ()),
			"Nunito",
			25,
			0x000000,
			"center",
			0.50,
			0
		]);
	}

	//------------------------------------------------------------------------------------------
	public WaitForAllToJoin_Script ():void {
		var __userList:Array<SFS2X.SFSUser>;
		var __userMap:Map<SFS2X.SFSUser, number> = new Map<SFS2X.SFSUser, number> ();

		this.setupWaitForAllToJoinUI ();

		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT1000, 1 * 1000,

						XTask.FLAGS, (__task:XTask) => {
							__userList = ConnectionManager.instance ().getPlayerUserList ();

							console.log (": users: ", __userMap, __userMap.size);

							this.collectUsers (__userMap, __userList);

							this.showJoinedUsers (__userMap);

							__task.ifTrue (__userMap.size == CreateRoom.NUM_PLAYERS);
						}, XTask.BNE, "loop",

						() => {
							this.WaitToStart_Script ();
						},

						XTask.GOTO, "loop",

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
	public WaitToStart_Script ():void {
		var __started:boolean = false;

		var __startButton:XTextSpriteButton = this.m_waitJoinLayout.addGameObjectAsChild (XTextSpriteButton, 0, 0.0, false) as XTextSpriteButton;
		__startButton.afterSetup ([
			"StandardButton",
			true, 10, 300, 60,
			"START GAME",
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

		this.m_waitJoinLayout.addItem (__startButton);
		this.m_waitJoinLayout.horizontalPercent (__startButton, 0.50);

		__startButton.addMouseUpListener (() => {
			__startButton.setDisabled (true);

			__started = true;
	
			MessagingManager.instance ().fireSceneChangeSignal (
				MessagingManager.ALL_PLAYERS,
				"",
				"<XMLBox>\n\t<VBox x=\"50%\" y=\"50%\" width=\"1000\" height=\"500\" depth+=\"500\" justify=\"space-between\" fill=\"0xffa0a0\">\n\t\t<TextSpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"StandardButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<TextButton\n\t\t\tx=\"50%\"\n\t\t\twidth=\"200\"\n\t\t\theight=\"50\"\n\t\t\ttext=\"hellew\"\n\t\t\tfontName=\"Nunito\"\n\t\t\tfontSize=\"30\"\n\t\t\tcolorNormal=\"0x000000\"\n\t\t\tcolorOver=\"0x00ff00\"\n\t\t\tcolorDown=\"0x0000ff\"\n\t\t\tcolorSelected=\"0xff0000\"\n\t\t\tcolorDisabled=\"0xc0c0c0\"\n\t\t\tbold=\"true\"\n\t\t\thorizontAlignment=\"center\"\n\t\t\tverticalAlignment=\"center\"\n\t\t/>\n\t\t<SpriteButton\n\t\t\tx=\"50%\"\n\t\t\tbuttonClassName=\"TestButton\"\n\t\t\t9slice=\"true\"\n\t\t\t9width=\"200\"\n\t\t\t9height=\"50\"\n\t\t/>\n\t</VBox>\n\t<AnimatedSprite\n\t\tx=\"25%\" y=\"25%\"\n\t\tclassName=\"TestImage\"\n\t/>\n</XMLBox>\n"
			);
		});

		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (__started);
						}, XTask.BNE, "loop",

						() => {
							this.WaitForAllPlayersReady_Script ();
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
	public WaitForAllPlayersReady_Script ():void {
		var __userList:Array<SFS2X.SFSUser> = ConnectionManager.instance ().getSFSUserManager ().getUserList ();

		var __readyUserCount:number = 0;
		var __totalUserCount:number = 0;

		var __user:SFS2X.SFSUser;

		for (__user of __userList) {
			if (!__user.isItMe) {
				this.m_messagingSubManager.addReadyListener (__user.id, () => {
					console.log (": user ready: ", __user);

					__readyUserCount++;
				});

				__totalUserCount++;
			}
		}

		//------------------------------------------------------------------------------------------
		this.script.gotoTask ([
				
			//------------------------------------------------------------------------------------------
			// control
			//------------------------------------------------------------------------------------------
			() => {
				this.script.addTask ([
					XTask.LABEL, "loop",
						XTask.WAIT, 0x0100,

						XTask.FLAGS, (__task:XTask) => {
							__task.ifTrue (__readyUserCount == __totalUserCount);
						}, XTask.BNE, "loop",

						() => {
							this.getGameInstance ().gotoState ("ModeratorCharacterSelect");
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